/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-27 22:29:44
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-18 11:42:45
 * @FilePath: /nosgram/src/store/modules/ws-new.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { VuexModule, Module, Mutation, Action } from "vuex-class-modules";
import ws from "@/common/js/websocket/index";
import store from "../index";
import type { Client_userInfo } from "@/common/js/nostr-tools/nostr-tools.d";

export type UserInfoDetails = Record<string, string | number | Client_userInfo>;

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

  @Mutation
  setUserInfo(params: UserInfo | null, localStorage = true) {
    const userInfo = params ? { ...this.userInfo, ...params } : {};
    const isLogin = params?.publicKey ? true : false;
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
  logout() {
    this.setUserInfo(null);
  }
}

export const loginModule = new LoginModule({ store, name: "login" });
