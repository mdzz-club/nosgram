/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-01 13:53:11
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-06 16:56:57
 * @FilePath: /nosgram/src/mixins/nostrToolsMixins.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Vue } from "vue-class-component";
import { wsModule } from "@/store/modules/ws";
import { mapOriginData, mergeOriginData } from "@/common/js/nostr-tools/index";
import type { mapOriginDataResult } from "@/common/js/nostr-tools/nostr-tools.d";

/**
 * 注意该mixins不会缓存上一次请求的数据，固ns_send方法请使用async await
 */
export default class nostrToolsMixins extends Vue {
  ns_data: Record<string, unknown[]> = {};
  ns_loading: Record<string, boolean> = {};
  ns_timeout: Record<string, number | undefined> = {};
  ns_wait_timeout: Record<string, number | undefined> = { all: undefined };

  /**
   * @method ns_init 新建ws连接
   * @param {Array} urls 新建ws连接地址数组
   */
  ns_init(urls: string[]) {
    wsModule.loadWs({
      urls,
      callback: this.ns_saveData,
    });
  }

  ns_repeat(param: unknown) {
    console.log(param);
  }

  ns_close(url: string, closeId: string) {
    wsModule.send({
      urlIndex: url,
      params: ["CLOSE", closeId],
    });
  }

  // 取消订阅
  ns_unsubscribe(url: string, closeId: string) {
    this.ns_loading[url] = false;
    clearTimeout(this.ns_timeout[url]);
    this.ns_close(url, closeId);
  }

  ns_saveData(params: unknown) {
    const { origin, data } = params as Record<string, string>;
    const resData = JSON.parse(data as string).concat([{ clinet_api: origin }]);
    if (!this.ns_loading[origin]) this.ns_loading[origin] = true;
    if (this.ns_data[origin]) this.ns_data[origin].push(resData);
    else this.ns_data[origin] = [resData];
    // 若服务端返回标识EOSE，则视为该次请求的结果都返回完毕，取消订阅
    if ((params as Record<string, string>)?.data?.[0] === "EOSE")
      this.ns_unsubscribe(origin, resData[1]);
    // 若超过100毫秒没有数据返回，则视为该次请求的结果都返回完毕，取消订阅
    clearTimeout(this.ns_timeout[origin]);
    this.ns_timeout[origin] = setTimeout(
      () => this.ns_unsubscribe(origin, resData[1]),
      100
    );
  }

  ns_wait(
    resolve: (value: unknown[] | unknown) => void,
    urlIndex: string | undefined
  ) {
    clearTimeout(this.ns_wait_timeout[urlIndex || "all"]);
    if (urlIndex && !this.ns_loading[urlIndex])
      return resolve(this.ns_data[urlIndex]);
    else {
      let hasLoading = false;
      const keys = Object.keys(this.ns_loading);
      keys.some((e) => {
        if (this.ns_loading[e]) {
          hasLoading = true;
          return true;
        } else return false;
      });
      if (!hasLoading) return resolve(this.ns_data);
    }
    this.ns_wait_timeout[urlIndex || "all"] = setTimeout(
      () => this.ns_wait(resolve, urlIndex),
      1000
    );
  }

  resetNostrToolsMixinsVariable() {
    this.ns_data = {};
    this.ns_loading = {};
    this.ns_timeout = {};
    this.ns_wait_timeout = { all: undefined };
  }

  /**
   * @method ns_send 发送请求消息
   * @param url 请求地址
   * @param params 请求参数
   * @return {Promise} 若url传入为数组，因为多个地址结果，所以不会一起返回。获取多个结果请使用getData获取
   */
  ns_send(url: string | string[], params: unknown) {
    this.resetNostrToolsMixinsVariable();
    const urlList = typeof url === "string" ? [url] : url;
    urlList.forEach((e) => {
      this.ns_loading[e] = true;
      wsModule.send({
        urlIndex: e,
        params,
      });
    });
    return new Promise((resolve) => {
      if (typeof url === "string") this.ns_wait(resolve, url);
      else resolve(false);
    });
  }

  ns_getData(url?: string) {
    return new Promise((resolve) => {
      return this.ns_wait(resolve, url);
    });
  }

  // 调用ns_getData后，直接调用该方法，处理目前该mixins数据池的数据
  async ns_processingData(): Promise<mapOriginDataResult[]> {
    const result = await this.ns_getData();
    const resultOriginData = mergeOriginData(result as Record<string, string>);
    const resultData: mapOriginDataResult[] = resultOriginData.map(
      (e) => mapOriginData(e as [], 1) as mapOriginDataResult
    );
    return resultData.filter((e) => e.client_messageType !== "EOSE");
  }
}
