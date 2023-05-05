<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-04-04 09:02:15
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-04-30 21:39:06
 * @FilePath: /nosgram/src/components/NavBar/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <nav class="phone-navbar">
    <header>
      <el-button link @click="$router.replace({ name: 'home' })">
        <h1 class="logo">nosgram</h1>
      </el-button>
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
      <div class="page-tab">
        <ul>
          <li
            @click="_handleTabClick(tab)"
            :class="{ active: tab.url === active }"
            :key="index"
            v-for="(tab, index) in pageTabs"
          >
            {{ tab.name }}
          </li>
        </ul>
      </div>
    </header>
  </nav>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { loginModule } from "@/store/modules/login";
import AvatarComponent from "@/components/Base/Avatar/index.vue";
// import { getAuthor } from "@/common/js/nostr-tools/index";
// import { Author } from "@/common/js/nostr-tools/nostr-tools.d";

@Options({
  components: {
    AvatarComponent,
  },
})
export default class PhoneNavbar extends Vue {
  pageTabs = [
    { name: "首页", url: "home" },
    { name: "关注", url: "follow" },
  ];
  _handleTabClick(params: Record<string, string>) {
    this.$router.push({ name: params.url });
  }
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
  get active() {
    return this.$route.name;
  }
}
</script>

<style lang="scss" scoped>
@import "../../index.scss";
.page-tab {
  width: 100%;
  padding-top: 10px;
  ul {
    display: flex;
    li {
      font-weight: bold;
      padding: 5px 10px;
      border-radius: 5px;
      & + li {
        margin-left: 12px;
      }
      &.active {
        background: rgba(0, 0, 0, 0.05);
      }
    }
  }
}

.phone-navbar {
  display: flex;
  padding: var(--content-container-padding);
  background: rgb(var(--container-color));
  box-shadow: 0 1px 10px var(--container-box_shadow-clor);
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    width: 100%;
    h1 {
      font-size: 26px;
      line-height: 1em;
    }
  }
}
</style>
