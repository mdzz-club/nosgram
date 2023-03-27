<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-24 17:04:18
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-27 16:51:20
 * @FilePath: /nosgram/src/App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <!-- <nav></nav> -->
  <div class="main-container">
    <sidebar />
    <main-content>
      <router-view v-slot="{ Component, route }" v-if="ws.length">
        <keep-alive>
          <component :is="Component" :key="route.path" />
        </keep-alive>
      </router-view>
    </main-content>
    <transition name="slide-fade">
      <login v-show="isShowLogin" />
    </transition>
  </div>
</template>

<script lang="ts">
import { Options, mixins } from "vue-class-component";
import Sidebar from "@/components/container/Sidebar/index.vue";
import NostrToolsMixins from "@/mixins/NostrToolsMixins";
import { nostrToolsModule } from "@/store/modules/nostr-tools";
import Login from "@/components/Login/index.vue";
import { loginModule } from "@/store/modules/login";
import { wsModule } from "@/store/modules/ws";
import relays from "@/common/js/relays";

@Options({
  components: {
    Sidebar,
    Login,
  },
})
export default class App extends mixins(NostrToolsMixins) {
  get ws() {
    return wsModule.ws;
  }
  async mounted() {
    await this._initRelays();
    await this._initLogin();
    nostrToolsModule.ns_init(loginModule.readRelays);
  }
  async _initRelays() {
    const userRelays = (await window.localforage.getItem("user_relays")) || [];
    if (!userRelays.length) loginModule.setRelays(relays);
    else loginModule.setUserRelays(userRelays, false);
  }
  async _initLogin() {
    const isLogin = await window.localforage.getItem("is_login");
    if (isLogin) {
      const user_info = await window.localforage.getItem("user_info");
      loginModule.login(user_info, false);
    }
  }
  get isShowLogin() {
    return loginModule.show;
  }
}
</script>

<style lang="scss">
@import "~@/common/css/variable.scss";
@import "~@/common/css/base.css";
@import "~@/common/css/cover-element.scss";
@import "~@/common/css/common.scss";
</style>

<style lang="scss" scoped>
.main-container {
  display: flex;
  height: 100%;
}

.slide-fade {
  &-enter-active {
    transition: all 0.3s ease-out;
  }

  &-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
  }

  &-enter-from,
  &-leave-to {
    transform: translateY(50px);
    opacity: 0;
  }
}
</style>
