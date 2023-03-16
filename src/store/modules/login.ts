/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-27 22:29:44
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-16 16:06:10
 * @FilePath: /nosgram/src/store/modules/ws-new.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { VuexModule, Module, Mutation, Action } from "vuex-class-modules";
import ws from "@/common/js/websocket/index";
import store from "../index";

interface UserInfo {
  privateKey?: string; // 私钥
  publicKey?: string;
}

@Module
class LoginModule extends VuexModule {
  show = false;
  userInfo = {};
  @Mutation
  setUserInfo(params: UserInfo) {
    this.userInfo = params;
  }

  @Mutation
  toggle(status?: boolean) {
    this.show = status !== undefined ? status : !this.show;
  }

  @Action
  login() {
    //
  }
}

export const loginModule = new LoginModule({ store, name: "login" });
