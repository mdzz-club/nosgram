<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-04-22 21:58:32
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-05-07 20:20:59
 * @FilePath: /nosgram/src/components/container/NavBar/components/Pc/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <nav class="pc-navbar">
    <div class="navbar-container">
      <div class="display-flex align-items-center">
        <el-button link @click="$router.replace({ name: 'home' })">
          <h1 class="logo">nosgram</h1>
        </el-button>
        <el-button circle color="rgb(40, 40, 40)">
          <el-icon color="#fff" size="14"><icon-ion-home-sharp /></el-icon>
        </el-button>
        <el-button
          link
          v-if="isLogin"
          @click="$router.replace({ name: 'follow' })"
        >
          我关注的
        </el-button>
      </div>
      <div class="display-flex align-items-center">
        <Search class="margin-right-12" />
        <!-- <div class="display-flex align-items-center">
          <avatar-component
            v-show="isLogin"
            userInfoKey="content"
            :source="userAvatar"
          />
          <span class="font-size-14 margin-left-5">{{ author.author }}</span>
        </div> -->
        <el-button link v-show="!isLogin" @click="_login">
          <el-icon size="38"> <icon-majesticons-user-circle /> </el-icon>
          <span>登录</span>
        </el-button>
        <el-dropdown v-show="isLogin">
          <div class="display-flex align-items-center cursor-pointer">
            <avatar-component userInfoKey="content" :source="userAvatar" />
            <span class="font-size-14 margin-left-5">{{ author.author }}</span>
            <el-icon class="margin-left-5" size="15"
              ><icon-ion-chevron-down-outline
            /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                @click="$router.push({ name: 'user', params: { id: routeId } })"
              >
                个人中心
              </el-dropdown-item>
              <el-dropdown-item @click="$router.push({ name: 'setting' })">
                设置
              </el-dropdown-item>
              <el-dropdown-item @click="_logout"> 登出 </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { mixins } from "vue-class-component";
import { Options } from "vue-class-component";
import { loginModule } from "@/store/modules/login";
import type { UserInfo } from "@/store/modules/login";
import Search from "../Search/index.vue";
import AvatarComponent from "@/components/Base/Avatar/index.vue";
import { getAuthor } from "@/common/js/nostr-tools";
import type { Author } from "@/common/js/nostr-tools/nostr-tools.d";
import loginMixins from "@/mixins/loginMixins";
import { ElMessageBox } from "element-plus";
import "element-plus/es/components/message-box/style/css";

@Options({
  components: {
    Search,
    AvatarComponent,
  },
})
export default class PcNavbar extends mixins(loginMixins) {
  get routeId() {
    return loginModule.userInfo.publicKey;
  }
  get author() {
    const { userInfo } = loginModule;
    if (!userInfo.details)
      (userInfo as UserInfo & { pubkey: string }).pubkey =
        userInfo.publicKey as string;
    console.log(getAuthor(userInfo as Author, "details"));
    return getAuthor(userInfo as Author, "details");
  }
  get isLogin() {
    return loginModule.isLogin;
  }
  get userAvatar() {
    const { userInfo } = loginModule;
    return userInfo.details;
  }
  _login() {
    loginModule.toggle(true);
  }
  async _logout() {
    const res = await ElMessageBox.confirm("确认登出您的账号吗?", "Warning", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    });
    if (res) this.logout();
  }
}
</script>

<style lang="scss" scoped>
@import "../../index.scss";
.pc-navbar {
  background: white;
  height: 45px;
  box-shadow: 0 1px 10px var(--container-box_shadow-clor);
  display: flex;
  justify-content: center;
  padding: 0 5px;
}
.navbar-container {
  height: 100%;
  width: 80%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
