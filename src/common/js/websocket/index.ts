import type { WS, Params } from "./websocket.d";

/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-26 19:11:13
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-07 10:38:59
 * @FilePath: /nosgram/src/common/js/websocket/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export default class ws {
  urls: string[];
  interval = 3;
  websocket: WS[] = [];
  open?: (ws: WebSocket, url: string) => void;
  message?: (res: unknown, ws: WebSocket, url: string) => void;
  disconnect?: (url?: string) => void;

  constructor(params: Params) {
    const { urls, open, message, disconnect } = params;
    this.urls = typeof urls === "string" ? [urls] : urls;
    if (open) this.open = open;
    if (message) this.message = message;
    if (disconnect) this.disconnect = disconnect;
  }

  _checkConnectStatus(ws: WebSocket, data: unknown) {
    if (ws?.readyState === ws?.OPEN) return true;
    else {
      // 若还没连接完成，等待1秒
      setTimeout(() => {
        this.send(data, ws);
      }, 1000);
      return false;
    }
  }

  send(data: unknown, ws?: string | WebSocket) {
    if (ws) {
      // 若传入url为索引
      if (typeof ws === "string") {
        let index: number | undefined = undefined;
        this.websocket.some((e, i) => {
          if (e.url === ws) {
            index = i;
            return true;
          } else return false;
        });
        if (index === undefined) return new Error("没有找到对应的会话");
        else {
          const status = this._checkConnectStatus(
            this.websocket[index].ws as WebSocket,
            data
          );
          if (status)
            (this.websocket[index].ws as WebSocket).send(JSON.stringify(data));
        }
      } else {
        const status = this._checkConnectStatus(ws, data);
        if (status) ws.send(JSON.stringify(data));
      }
    } else {
      this.websocket.forEach((e) => {
        const status = this._checkConnectStatus(e.ws as WebSocket, data);
        if (status) (e.ws as WebSocket).send(JSON.stringify(data));
      });
    }
  }

  _check() {
    if ("WebSocket" in window) return true;
    else return false;
  }

  _reConnect(url: string, index: number) {
    this.websocket[index].timeout &&
      clearTimeout(this.websocket[index].timeout);
    if (this.websocket[index].connected) {
      return;
    }
    this.websocket[index].timeout = setTimeout(() => {
      this._createWebSocket(url, index, true);
    }, this.interval * 1000);
  }

  /**
   *
   * @param url ws url
   * @param index websocket中对应索引
   * @param reConnect 是否为重连
   * @returns
   */
  _createWebSocket(url: string, index: number, reConnect = false) {
    const websocket = new WebSocket(url);

    websocket.onopen = () => {
      this.websocket[index].connected = true;
      this.open && this.open(websocket, url);
    };

    websocket.onmessage = (res) => {
      this.websocket[index].message &&
        this.websocket[index].message(res, websocket, url);
      // this.message && this.message(res, websocket, url);
    };

    websocket.onerror = () => {
      console.log("onerror");
      this.websocket[index].connected = false;
      this._reConnect(url, index);
    };

    websocket.onclose = () => {
      this.disconnect && this.disconnect(url);
    };

    if (reConnect) {
      this.websocket[index].ws = websocket;
    } else return websocket;
  }

  init() {
    if (!this._check) return new Error("init失败，Not support websocket");

    this.urls.forEach((e, i) => {
      const item: WS = {
        ws: this._createWebSocket(e, i) || null,
        url: e,
      };
      if (this.message) item.message = this.message;
      if (this.open) item.open = this.open;
      if (this.disconnect) item.disconnect = this.disconnect;
      this.websocket.push(item);
    });
  }

  close(index?: string) {
    if (!this.websocket?.length) return new Error("没有可以关闭的链接");
    if (index) {
      this.websocket.some((e, i) => {
        if (e.url === index) {
          e.ws && e.ws.close();
          this.websocket.splice(i, 1);
          return true;
        } else return false;
      });
    } else {
      this.websocket.forEach((e) => {
        e.ws && e.ws.close();
      });
      this.websocket = [];
    }
  }
}
