<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-27 19:47:53
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-20 20:06:32
 * @FilePath: /nosgram/src/views/Home/components/FollowerList/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="additional-container">
    <!-- v-if="loginModule.isLogin" -->
    <div class="position-relative">
      <!-- :name="userName" -->
      <div :class="{ 'filter-blur-10': !loginModule.isLogin }">
        <author-info
          avatarWidth="60"
          avatarHeight="60"
          :source="userSource"
          userInfoKey="details"
          :isShowCreateTime="false"
          padding="10px 0"
        >
          <p class="font-size-14 second-font-color margin-top-10">
            稀有内侧徽章/一级徽章
          </p>
          <template #right>
            <el-button
              link
              class="font-size-16 font-weight-600"
              @click="loginModule.logout"
            >
              登出
            </el-button>
          </template>
          <template #name v-if="loginModule.loadUserInfo">
            <el-tooltip content="为您加载详细资料中" placement="bottom-end">
              <loading class="margin-left-10" size="15px" />
            </el-tooltip>
          </template>
        </author-info>
      </div>
      <el-button
        v-show="!loginModule.isLogin"
        class="left-0 right-0 bottom-0 top-0 margin-auto position-absolute width-100"
        type="primary"
        @click="loginModule.toggle(true)"
        >登录/注册</el-button
      >
    </div>

    <div
      class="second-font-color font-weight-600 font-size-16 padding-top-10 padding-bottom-10"
    >
      他/她的动态
    </div>
    <author-info
      avatarWidth="38"
      avatarHeight="38"
      :source="item"
      :isShowCreateTime="false"
      padding="10px 0"
      v-for="(item, i) in data"
      :key="i"
    >
      <p class="font-size-14 second-font-color">
        {{ _authorActivity(item.client_likes as Client_likes[]) }}
      </p>
      <template #right>
        <el-button link @click="_to(item.id)">
          <div class="cursor-poniter link-font-color font-weight-600">围观</div>
        </el-button>
      </template>
    </author-info>
    <additional-content-skeleton v-show="!data?.length" />
  </div>
</template>

<script lang="ts">
import { Vue, Options, prop } from "vue-class-component";
import Avatar from "vue-boring-avatars";
import type {
  Client_likes,
  mapOriginDataResult,
} from "@/common/js/nostr-tools/nostr-tools.d";
import AdditionalContentSkeleton from "../AdditionalContentSkeleton/index.vue";
import { AuthorInfo } from "@/components/Base/index";
import { loginModule } from "@/store/modules/login";
import Loading from "../loading/index.vue";

class FollowerListProps {
  data = prop<mapOriginDataResult[]>({ required: true, default: [] });
}

@Options({
  components: {
    Avatar,
    AuthorInfo,
    AdditionalContentSkeleton,
    Loading,
  },
})
export default class FollowerList extends Vue.with(FollowerListProps) {
  loginModule = loginModule;
  get isLogin() {
    return false;
  }
  _to(id: string) {
    this.$router.push({ name: "details", params: { id } });
  }
  _authorActivity(params: Client_likes[]) {
    if (params[0].kind === 1) return "刚刚发布了一条动态";
    else if (params[0].kind === 7) return "刚刚点赞了一条动态";
  }
  get userSource() {
    const { publicKey } = loginModule.userInfo;
    const result = { ...loginModule.userInfo, pubkey: publicKey };
    return result;
  }
}
</script>

<style lang="scss" scoped>
.additional-container {
  width: var(--content-additional_width);
  background: rgb(var(--additional-bg-clor));
  padding: 10px 15px 10px 15px;
  border-radius: 5px;
  border: solid 1px rgb(var(--border-color));
  box-shadow: 0 1px 2px var(--article-box_shadow-clor);
}
</style>
