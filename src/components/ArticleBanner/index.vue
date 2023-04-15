<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-17 09:39:06
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-04-15 22:13:02
 * @FilePath: /nosgram/src/components/Base/avatar.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="banner-container">
    <el-button class="back-button" link @click="$router.back()"
      ><el-icon size="30"><icon-ion-arrow-back /></el-icon
    ></el-button>
    <viewer :options="options" :images="banner">
      <img class="banner-img" :src="banner" alt="banner" />
    </viewer>
    <div class="user-info">
      <avatar-component
        class="avatar"
        :width="avatarSize"
        :height="avatarSize"
        :source="userInfoObj"
      />
      <div class="user-info-bar">
        <h3>{{ author.author }}</h3>
        <div
          @click="editEmit"
          class="edit-button"
          v-if="!editLoading && oneself"
        >
          <el-icon size="16"><icon-majesticons-edit-pen-4 /></el-icon
          ><span class="font-weight-600 font-size-14">编辑个人信息</span>
        </div>
      </div>
    </div>
    <div class="tab">
      <div
        :class="{ active: tab === item.name }"
        class="tab-item"
        v-for="(item, index) in tabList"
        :key="item.name"
        @click="_handleTabClick(item, index)"
      >
        <span>{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import { getAuthor } from "@/common/js/nostr-tools/index";
import { Author } from "@/common/js/nostr-tools/nostr-tools.d";
import { mapOriginDataResult } from "@/common/js/nostr-tools/nostr-tools.d";
import { loginModule } from "@/store/modules/login";
import AvatarComponent from "@/components/Base/Avatar/index.vue";
import { isPhone } from "@/common/js/common";
import "viewerjs/dist/viewer.css";
import { component as Viewer } from "v-viewer";

interface Source {
  userInfo: mapOriginDataResult;
  routeId: string;
  editLoading: boolean;
}

@Options({
  components: {
    AvatarComponent,
    Viewer,
  },
})
export default class ArticleBanner extends Vue {
  @Prop({ default: {} }) source!: Source;
  @Prop({
    default: [
      { label: "动态", name: "article" },
      { label: "相册", name: "photos" },
    ],
  })
  tabList!: Record<string, string>[];
  @Prop({ default: 0 }) defaultTab!: number;
  tab = "";
  options = {
    toolbar: false,
    navbar: false,
    zIndex: 2040,
  };
  mounted() {
    this.tab = this.tabList[this.defaultTab].name;
  }
  get editLoading() {
    return this.source.editLoading;
  }
  get banner() {
    const { content } = (this.source.userInfo as mapOriginDataResult) || {};
    const { banner } = (content as Record<string, string>) || {};
    return banner || require("@/assets/img/default-banner.jpg");
  }
  editEmit() {
    this.$emit("banner-click", {
      ...this.userInfoObj,
      emitType: "banner-edit-user_info-click",
    });
  }
  _handleTabClick(params: Record<string, string>, index: number) {
    this.tab = params.name;
    this.$emit("banner-click", {
      ...params,
      emitType: "banner-tab-click",
      client_index: index,
    });
  }
  get avatarSize() {
    const size = isPhone() ? 60 : 120;
    return size;
  }
  get oneself() {
    const id = this.source.routeId;
    const { publicKey } = loginModule?.userInfo || {};
    return id === publicKey;
  }
  get userInfoObj() {
    const id = this.source.routeId;
    const userInfo = this.source.userInfo || { pubkey: id };
    return {
      ...(userInfo as Author),
      client_userInfo: {
        content: (this.source.userInfo as mapOriginDataResult)
          ?.content as Record<string, string | number>,
      },
    };
  }
  get author() {
    const result = getAuthor(this.userInfoObj);
    return result;
  }
}
</script>

<style lang="scss" scoped>
.tab {
  --border-height: 3px;
  --span-bottom: 30px;

  display: flex;
  justify-content: center;
  padding: 0 30px;
  margin-bottom: 20px;
  background: rgb(var(--container-color));
  border-bottom: solid 1px var(--content-border);
  box-shadow: 0 1px 2px var(--article-box_shadow-clor);
  &-item {
    width: 120px;
    text-align: center;
    & > span {
      cursor: pointer;
      font-weight: 600;
      color: rgb(var(--second-color));
      display: inline-block;
      padding-bottom: var(--span-bottom);
      border-bottom: solid var(--border-height) rgb(var(--container-color));
    }
    &.active {
      & > span {
        color: rgb(var(--first-color));
        border-bottom: solid var(--border-height) rgb(var(--first-color));
      }
    }
  }
}
.banner {
  &-container {
    position: relative;
    background: rgb(var(--container-color));
    .back-button {
      display: none;
      position: absolute;
      left: 5px;
      top: 5px;
      color: #fff;
    }
    .user-info {
      display: flex;
      padding: 20px 30px 40px 30px;
      position: relative;
      .avatar {
        position: absolute;
        left: 30px;
        top: 0;
        border: solid 5px rgb(var(--container-color));
        transform: translateY(-50%);
        border-radius: 100%;
      }
      &-bar {
        width: 100%;
        padding-left: 140px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .edit-button {
          min-height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: solid 1px rgb(var(--border-color));
          padding: 5px 10px;
          border-radius: 5px;
          span {
            margin-left: 5px;
          }
        }
        & > h3 {
          font-size: 24px;
        }
      }
    }
  }
  &-img {
    width: 100%;
    height: 250px;
    object-fit: cover;
    display: block;
  }
}

@media screen and (max-width: 480px) {
  .tab {
    --span-bottom: 10px;
  }

  .banner {
    &-container {
      .back-button {
        display: block;
      }
      .user-info {
        padding: 0;
        padding-top: 5px;
        padding-bottom: 20px;
        .avatar {
          // position: relative;
          left: 10px;
        }
        &-bar {
          padding-left: 90px;
          padding-right: 10px;
          & > h3 {
            font-size: 16px;
            width: 100px;
            word-break: break-all;
            text-overflow: -o-ellipsis-lastline;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            line-clamp: 1;
            -webkit-box-orient: vertical;
          }
          .edit-button {
            padding: 5px;
            .el-icon {
              padding: 5px;
              display: none;
            }
          }
        }
      }
    }
    &-img {
      height: 150px;
    }
  }
}
</style>
