<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-04-04 09:02:15
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-04-04 10:42:08
 * @FilePath: /nosgram/src/components/NavBar/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <nav class="navbar">
    <header>
      <div>
        <h1 class="logo">nosgram</h1>
      </div>
      <div class="display-flex align-items-center" @click="_handleClick">
        <avatar-component
          v-show="isLogin"
          userInfoKey="content"
          :source="userAvatar"
        />
        <el-button link v-show="!isLogin">
          <el-icon size="35">
            <icon-majesticons-user-circle />
          </el-icon>
        </el-button>
        <el-icon size="20" v-show="isLogin">
          <icon-majesticons-chevron-down-line />
        </el-icon>
      </div>
    </header>
  </nav>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { loginModule } from "@/store/modules/login";
import AvatarComponent from "@/components/Base/Avatar/index.vue";
import { getAuthor } from "@/common/js/nostr-tools/index";
import { Author } from "@/common/js/nostr-tools/nostr-tools.d";

@Options({
  components: {
    AvatarComponent,
  },
})
export default class NavBar extends Vue {
  _handleClick() {
    if (!this.isLogin) {
      loginModule.toggle(true);
    } else {
      this.$router.push({ name: "setting" });
    }
  }
  get isLogin() {
    return loginModule.isLogin;
  }
  get userAvatar() {
    const { userInfo } = loginModule;
    return userInfo.details;
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  display: var(--navbar-display);
  padding: var(--content-container-padding);
  background: rgb(var(--container-color));
  box-shadow: 0 1px 10px var(--container-box_shadow-clor);
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    h1 {
      font-size: 26px;
      line-height: 1em;
    }
  }
}
</style>
