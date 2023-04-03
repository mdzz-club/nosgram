/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-27 22:29:44
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-04-03 19:12:24
 * @FilePath: /nosgram/src/store/modules/ws-new.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { VuexModule, Module, Mutation, Action } from "vuex-class-modules";
import store from "../index";
import type { Client_userInfo } from "@/common/js/nostr-tools/nostr-tools.d";
import type { Relay } from "@/common/js/relays/relays.d";
import relays from "@/common/js/relays";

export type UserInfoDetails = Record<
  string,
  string | number | Client_userInfo | Relay[]
>;

export interface UserInfo {
  privateKey?: string; // 私钥
  publicKey?: string;
  readOnly?: boolean;
  details?: UserInfoDetails;
}

@Module
class LoginModule extends VuexModule {
  show = false;
  userInfo: UserInfo = {};
  isLogin = false;
  loadUserInfo = false; // 获取用户真实资料
  userRelays: Relay[] = [];
  userFollow: Record<string, string[]> = {};

  // 能读的中继列表
  get readRelays() {
    const userRelays = this.userRelays;
    const result = userRelays.filter((e) => e.read).map((e) => e.url);
    return result;
  }

  // 能写的中继列表
  get writeRelays() {
    const userRelays = this.userRelays;
    const result = userRelays.filter((e) => e.write).map((e) => e.url);
    return result;
  }

  // 全部中继列表
  get allRelays() {
    const result = this.userRelays;
    return result.map((e) => e.url);
  }

  @Mutation
  setUserFollow(params: Record<string, string[]>) {
    this.userFollow = params;
  }

  @Mutation
  setUserRelays(params: Relay[], localStorage = true) {
    this.userRelays = params;
    if (localStorage) {
      const parse = JSON.parse(JSON.stringify(params));
      window.localforage.setItem("user_relays", parse);
    }
  }

  @Mutation
  setUserInfo(params: UserInfo | null, localStorage = true) {
    const userInfo = params
      ? {
          ...this.userInfo,
          ...params,
          readOnly: params.privateKey ? false : true,
        }
      : { publicKey: undefined };
    const isLogin = userInfo?.publicKey ? true : false;
    this.userInfo = userInfo;
    this.isLogin = isLogin;
    if (localStorage) {
      const parse = JSON.parse(JSON.stringify(userInfo));
      window.localforage.setItem("user_info", parse);
      window.localforage.setItem("is_login", isLogin);
    }
  }

  @Mutation
  setUserInfoLoad(status?: boolean) {
    this.loadUserInfo = status !== undefined ? status : !this.loadUserInfo;
  }

  @Mutation
  toggle(status?: boolean) {
    this.show = status !== undefined ? status : !this.show;
  }

  @Action
  login(params: UserInfo, localStorage = true) {
    this.setUserInfo(params, localStorage);
  }

  @Action
  async setRelays(params: Relay[]) {
    const userRelays: Relay[] =
      (await window.localforage.getItem("user_relays")) || [];
    let result = userRelays;
    if (result.length) {
      params.forEach((e) => {
        result.some((ele, i) => {
          if (ele.url === e.url) {
            result[i] = e;
            return true;
          } else return false;
        });
      });
    } else result = params;
    this.setUserRelays(result);
  }

  @Action
  logout() {
    this.setUserInfo(null);
    this.setUserRelays(relays);
  }
}

export const loginModule = new LoginModule({ store, name: "login" });
