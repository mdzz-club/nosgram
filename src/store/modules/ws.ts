/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-27 22:29:44
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-01 22:54:18
 * @FilePath: /nosgram/src/store/modules/ws-new.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { VuexModule, Module, Mutation, Action } from "vuex-class-modules";
import ws from "@/common/js/websocket/index";
import store from "../index";

interface LoadWsParams {
  urls: string | string[];
  callback: (params: unknown) => void;
}

interface SendParams {
  urlIndex: string;
  params: unknown;
}

@Module
class WsModule extends VuexModule {
  ws: ws[] = [];

  @Mutation
  setWs(ws: ws) {
    this.ws.push(ws);
    ws.init();
  }

  @Mutation
  send(data: SendParams) {
    const { urlIndex, params } = data;
    let index: number | null = null;
    this.ws.some((e, i) => {
      if (e.urls.indexOf(urlIndex) !== -1) {
        index = i;
        return true;
      } else return false;
    });
    if (index !== null) this.ws[index].send(params, urlIndex);
    else new Error("没有找到该索引");
  }

  @Action
  loadWs(data: LoadWsParams) {
    const { urls, callback } = data;
    this.setWs(
      new ws({
        urls,
        message: callback,
      })
    );
  }
}

export const wsModule = new WsModule({ store, name: "ws" });
