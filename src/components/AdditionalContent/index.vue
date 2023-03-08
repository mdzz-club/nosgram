<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-27 19:47:53
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-08 09:23:04
 * @FilePath: /nosgram/src/views/Home/components/FollowerList/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="additional_content_list-container">
    <div class="additional_content-item display-flex">
      <div class="item-left display-flex">
        <div class="logo display-flex">
          <avatar
            :size="60"
            name="icon"
            :color="['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']"
          />
        </div>
        <div class="info display-flex">
          <p class="font-size-18 font-weight-600 default-font-color">unhum</p>
          <p class="font-size-14 second-font-color">一级徽章</p>
        </div>
      </div>
      <div class="item-right link-font-color font-weight-600">登出</div>
    </div>
    <div
      class="second-font-color font-weight-600 font-size-16 padding-top-10 padding-bottom-10"
    >
      他/她的动态
    </div>
    <div
      class="additional_content-item display-flex"
      v-for="(item, i) in data"
      :key="i"
    >
      <div class="item-left small display-flex">
        <div class="logo display-flex">
          <avatar
            v-if="!_author(item).icon"
            :size="38"
            :name="_author(item).iconName"
            :color="['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']"
          />
          <img v-else :src="(_author(item).icon as string)" alt="icon" />
        </div>
        <div class="info display-flex">
          <p class="font-size-18 font-weight-600 default-font-color">
            {{ _author(item).author }}
          </p>
          <p class="font-size-14 second-font-color">
            {{ _authorActivity(item.client_likes as Client_likes[]) }}
          </p>
        </div>
      </div>
      <div class="item-right link-font-color font-weight-600">围观</div>
    </div>
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

class FollowerListProps {
  data = prop<mapOriginDataResult[]>({ required: true, default: [] });
}

@Options({
  components: {
    Avatar,
    AdditionalContentSkeleton,
  },
})
export default class FollowerList extends Vue.with(FollowerListProps) {
  get isLogin() {
    return false;
  }
  _authorActivity(params: Client_likes[]) {
    // 刚刚点赞了一位AV女优的动态
    if (params[0].kind === 1) return "刚刚发布了一条动态";
    else if (params[0].kind === 7) return "刚刚点赞了一条动态";
  }
  _author(item: mapOriginDataResult) {
    const result: Record<string, string | undefined | number> = {};
    result.icon = item?.client_userInfo?.content?.picture;
    result.iconName = item?.pubkey;
    result.author = item?.client_userInfo
      ? item?.client_userInfo.content.display_name
      : `${item?.pubkey?.slice(0, 4)}...${item?.pubkey?.slice(-4)}`;
    return result;
  }
}
</script>

<style lang="scss" scoped>
.additional_content_list-container {
  width: var(--content-additional_width);
  .additional_content-item {
    justify-content: space-between;
    align-items: center;
    .item-left {
      align-items: center;
      .logo {
        width: 70px;
        height: 70px;
        margin-right: 12px;
        align-items: center;

        img {
          width: 38px;
          height: 38px;
          border-radius: 100%;
        }
      }
      .info {
        flex-direction: column;
        justify-content: space-between;
        padding: 15px 0;
      }
      &.small {
        .logo {
          width: 45px;
          height: 45px;
          margin-right: 5px;
        }
        .info {
          padding: 3px 0;
        }
      }
    }
    .item-right {
      cursor: pointer;
    }
    & + .additional_content-item {
      margin-top: 10px;
    }
  }
}
</style>
