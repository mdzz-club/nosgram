/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-27 22:29:44
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-27 17:45:25
 * @FilePath: /nosgram/src/store/modules/ws-new.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { VuexModule, Module, Mutation, Action } from "vuex-class-modules";
import store from "../index";
import { wsModule } from "@/store/modules/ws";
import type { mapOriginDataResult } from "@/common/js/nostr-tools/nostr-tools.d";
import { mapOriginData, mergeOriginData } from "@/common/js/nostr-tools/index";
import { TIMEOUT_TIMES } from "@/common/js/http/config";

// interface SendParams {
//   kinds?: number[];
//   until?: number;
//   limit?: number;
//   tags: (string | number | [])[];
// }

interface Pool {
  ns_data: Record<string, unknown[]>;
  ns_loading: Record<string, boolean>;
  ns_timeout: Record<string, number | undefined>; // 轮询取消订阅
  ns_wait_timeout: Record<string, number | undefined>; // 轮询timeout
}

type ProcessingDataRes = Record<string, string | Record<string, string[][]>>;

@Module
class NostrToolsModule extends VuexModule {
  pools: Record<string, Pool> = {};
  clearInterval: number | undefined = undefined; // 定时清理链接池资源

  @Mutation
  ns_initPool(data: { eventId: string; api: string }) {
    const { eventId, api } = data;
    this.pools[eventId] = {
      ns_data: {},
      ns_loading: { [api]: true },
      ns_timeout: {},
      ns_wait_timeout: { all: undefined },
    };
  }

  @Mutation
  ns_close(data: { url: string; closeId: string }) {
    const { url, closeId } = data;
    if (closeId.indexOf(":") === -1) return;
    wsModule.send({
      urlIndex: url,
      params: ["CLOSE", closeId],
    });
  }

  clearPool(closeId: string) {
    const { ns_wait_timeout, ns_timeout, ns_loading } = this.pools[closeId];
    // 收集loading情况
    const loadingKeys = Object.keys(ns_loading);
    const loadingItems = loadingKeys.filter(
      (e) => this.pools[closeId].ns_loading[e]
    );
    // 收集timeout情况
    const isTimeout = Object.keys(ns_timeout);
    const isWaitTimeout = Object.keys(ns_wait_timeout);
    const timeoutItems = isTimeout.filter(
      (e) => this.pools[closeId].ns_timeout[e]
    );
    const waitTimeoutItems = isWaitTimeout.filter(
      (e) => this.pools[closeId].ns_wait_timeout[e]
    );

    if (
      !loadingItems.length &&
      !timeoutItems.length &&
      !waitTimeoutItems.length
    )
      delete this.pools[closeId];
  }

  @Mutation
  ns_clearPoolsInterval() {
    if (this.clearInterval) return;
    this.clearInterval = window.setInterval(() => {
      const keys = Object.keys(this.pools);
      keys.forEach((e) => this.clearPool(e));
    }, TIMEOUT_TIMES);
  }

  @Action
  ns_unsubscribe(data: { url: string; closeId: string }) {
    const { url, closeId } = data;
    // 取消订阅
    clearTimeout(this.pools[closeId].ns_timeout[url]);
    this.pools[closeId].ns_timeout[url] = undefined;

    this.pools[closeId].ns_loading[url] = false;
    this.ns_close({ url, closeId });
  }

  @Action
  ns_saveData(params: unknown) {
    const { origin, data } = params as Record<string, string>;
    const parseData = JSON.parse(data as string);
    const [eventType, eventId] = parseData;
    const resData = parseData.concat([{ clinet_api: origin }]);
    // 若后端返回通知，则不做任何操作
    if (eventType === "NOTICE") return;
    // 若超过时间没有数据返回，则视为该次请求的结果都返回完毕，取消订阅
    clearTimeout(this.pools[eventId].ns_timeout[origin]);
    if (this.pools[eventId].ns_data[origin])
      this.pools[eventId].ns_data[origin].push(resData);
    else this.pools[eventId].ns_data[origin] = [resData];
    // 若服务端返回标识EOSE，则视为该次请求的结果都返回完毕，取消订阅
    if ((params as Record<string, string>)?.data?.[0] === "EOSE") {
      this.ns_unsubscribe({ url: origin, closeId: eventId });
    }
    this.pools[eventId].ns_timeout[origin] = window.setTimeout(
      () => this.ns_unsubscribe({ url: origin, closeId: eventId }),
      1000
    );
  }

  /**
   * @method ns_init 新建ws连接
   * @param {Array} urls 新建ws连接地址数组
   */
  @Action
  ns_init(urls: string[]) {
    this.ns_clearPoolsInterval(); // 定时清理链接池
    wsModule.loadWs({
      urls,
      callback: this.ns_saveData,
    });
  }

  @Action
  ns_wait(data: {
    eventId: string;
    resolve: (value: unknown[] | unknown) => void;
    urlIndex: string | undefined;
    retryTimes?: number;
  }) {
    const { eventId, resolve, urlIndex, retryTimes } = data;
    const RetryTimes = retryTimes || 0;
    this.pools?.[eventId] &&
      clearTimeout(this.pools[eventId].ns_wait_timeout[urlIndex || "all"]);
    if (urlIndex && !this.pools[eventId].ns_loading[urlIndex]) {
      return resolve(this.pools[eventId].ns_data[urlIndex]);
    } else {
      let hasLoading = false;
      const keys = this.pools?.[eventId]
        ? Object.keys(this.pools[eventId].ns_loading)
        : [];
      keys.some((e) => {
        if (this.pools[eventId].ns_loading[e]) {
          hasLoading = true;
          return true;
        } else return false;
      });
      if (!hasLoading) {
        this.pools?.[eventId] &&
          (this.pools[eventId].ns_wait_timeout[urlIndex || "all"] = undefined);
        return resolve(
          this.pools?.[eventId] ? this.pools[eventId].ns_data : []
        );
      }
    }
    // 当重试次数超过20次～则释放请求
    if (RetryTimes > 20) {
      this.pools[eventId].ns_wait_timeout[urlIndex || "all"] = undefined;
      return resolve([]);
    }
    this.pools[eventId].ns_wait_timeout[urlIndex || "all"] = window.setTimeout(
      () =>
        this.ns_wait({
          eventId,
          resolve,
          urlIndex,
          retryTimes: RetryTimes + 1,
        }),
      1000
    );
  }

  @Action
  ns_getData(data: { eventId: string; url?: string }) {
    const { eventId, url } = data;
    return new Promise((resolve) => {
      return this.ns_wait({ eventId, resolve, urlIndex: url });
    });
  }

  // 获取指定eventId的数据池，使用时请注意数据时效【定期会清理线程池】
  @Action
  async ns_processingData(eventId: string): Promise<mapOriginDataResult[]> {
    const res = await this.ns_getData({ eventId });
    const keys = Object.keys(res as ProcessingDataRes);
    keys.forEach((e) => {
      (res as Record<string, string[][]>)[e] = (
        res as Record<string, string[][]>
      )[e].filter((e: string[]) => e[0] !== "EOSE");
    });
    const resultOriginData = mergeOriginData(res as Record<string, []>);
    const resultData: mapOriginDataResult[] = resultOriginData.map(
      (e) => mapOriginData(e as [], 1) as mapOriginDataResult
    );
    return resultData;
  }

  /**
   * @method ns_send 发送请求消息
   * @param url 请求地址
   * @param params 请求参数
   * @return {Promise} 若url传入为数组，因为多个地址结果，所以不会一起返回。获取多个结果请使用getData获取
   */
  @Action
  ns_send(data: {
    url: string | string[];
    params: unknown | Record<string, string>;
  }) {
    const { url, params } = data;
    const urlList = typeof url === "string" ? [url] : url;
    const [_, eventId] = params as string[];
    const clinet_eventId =
      typeof eventId === "string"
        ? eventId
        : (eventId as Record<string, string>).id;
    urlList.forEach((e) => {
      this.ns_initPool({ eventId: clinet_eventId, api: e });
      wsModule.send({
        urlIndex: e,
        params,
      });
    });
    return this.ns_processingData(clinet_eventId);
    // return new Promise((resolve) => {
    //   if (typeof url === "string")
    //     this.ns_wait({ eventId, resolve, urlIndex: url });
    //   else resolve(false);
    // });
  }
}

export const nostrToolsModule = new NostrToolsModule({
  store,
  name: "nostrToolsModule",
});
