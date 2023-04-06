<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-27 19:47:57
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-04-06 21:25:29
 * @FilePath: /nosgram/src/views/Home/components/Article/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <!-- banner类型 -->
  <ArticleBanner
    @banner-click="_handleComponentClick"
    :tabList="bannerConfig.tabList"
    :defaultTab="bannerConfig.defaultTab"
    :source="source"
    v-if="isBanner"
  />
  <!-- 发布按钮类型 -->
  <article-release @open-release="_handleOpenRelease" v-if="isReleaseItem" />
  <article
    v-if="isArticle"
    v-show="itemType === 'article'"
    class="article full-width"
  >
    <div class="article-top">
      <article-media :data="source" />
    </div>
    <div class="article-bottom">
      <article-html :source="source" />
      <!-- 转发 -->
      <template v-if="forward.length">
        <article-forward :key="i" v-for="(f, i) in forward" :source="f" />
      </template>
      <!-- 用户信息 -->
      <author-info :source="source">
        <el-button
          @click="_follow(source)"
          class="margin-left-0-important"
          link
          type="primary"
        >
          <span class="font-size-14">{{
            source.client_follow ? "已关注" : "关注"
          }}</span>
        </el-button>
        <template #right>
          <button-group
            :source="source"
            @forward-click="_handleForwardClick"
            @comment-click="_emit('details-dialog', source)"
          />
        </template>
      </author-info>
    </div>
  </article>
  <article
    v-if="isArticle"
    v-show="itemType !== 'article'"
    class="article-media"
  >
    <article-media-abbreviation
      @media-click="(params: Source) => _emit('', params)"
      :data="source"
    />
  </article>
  <div class="null-container" v-if="isNoData">
    <el-empty :image-size="200" description="暂无相关内容" />
  </div>
  <div class="loading-container" v-if="isLoadingItem">
    <loading />
  </div>
</template>

<script lang="ts">
import { Options, mixins } from "vue-class-component";
import { Prop } from "vue-property-decorator";
// import ArticleVideo from "../ArticleVideo/index.vue";
// import ArticlePhotos from "../ArticlePhotos/index.vue";
import ArticleMediaAbbreviation from "../ArticleMediaAbbreviation/index.vue";
import ArticleMedia from "../ArticleMedia/index.vue";
import ArticleForward from "../ArticleForward/index.vue";
import ArticleHtml from "../ArticleHtml/index.vue";
import Loading from "@/components/loading/index.vue";
import { AuthorInfo } from "@/components/Base/index";
import ButtonGroup from "@/components/Base/ButtonGroup/index.vue";
import type {
  Client_tags,
  mapOriginDataResult,
} from "@/common/js/nostr-tools/nostr-tools.d";
import { isPhone } from "@/common/js/common";
import ArticleRelease from "@/components/Release/index.vue";
import NostrToolsMixins from "@/mixins/NostrToolsMixins";
import ArticleBanner from "@/components/ArticleBanner/index.vue";
import type { EventTemplate } from "nostr-tools";

interface Source extends mapOriginDataResult {
  client_itemType?: string;
  client_fn_details: (params: any) => void;
  client_fn_release_dialog: (params: boolean | number) => void;
  client_fn_reset_follow: () => void;
  client_fn_release_success: (params: EventTemplate) => void;
  client_fn_catchEmit: (
    params: ComponentClick & Record<string, string>
  ) => void;
  client_banner_config?: Record<
    string,
    number | string | Record<string, string>[]
  >;
}

interface ComponentClick {
  emitType: string;
}

@Options({
  components: {
    // ArticleVideo,
    ArticleMedia,
    Loading,
    ArticleHtml,
    ArticleForward,
    AuthorInfo,
    ButtonGroup,
    ArticleBanner,
    ArticleRelease,
    ArticleMediaAbbreviation,
    // ArticlePhotos,
  },
})
export default class Article extends mixins(NostrToolsMixins) {
  @Prop({ default: {} }) source!: Source;
  _handleComponentClick(param: ComponentClick & Record<string, string>) {
    this.source.client_fn_catchEmit(param);
  }
  _follow(params: mapOriginDataResult) {
    this._setFollow(params);
    this.source.client_fn_reset_follow();
  }
  _handleForwardClick(params: EventTemplate) {
    this.source.client_fn_release_success(params);
  }
  _emit(type: string, data: Source) {
    if (isPhone()) {
      this.$router.push({
        name: "details",
        params: {
          id: data.id,
        },
      });
      return;
    }
    this.source.client_fn_details(data);
  }
  _handleOpenRelease(params: boolean | number) {
    this.source.client_fn_release_dialog(params);
  }
  get bannerConfig() {
    const config = {
      tabList: [
        { label: "动态", name: "article" },
        { label: "相册", name: "photos" },
      ] as Record<string, string>[],
      defaultTab: 0,
    };
    const { tabList, defaultTab } = this.source.client_banner_config || {};
    if (tabList) config.tabList = tabList as Record<string, string>[];
    if (defaultTab) config.defaultTab = defaultTab as number;
    return config;
  }
  get forward() {
    const result: Client_tags[] = [];
    const { client_tags } = this.source;
    if (!client_tags) return result;
    const keys = Object.keys(client_tags);
    keys.forEach((ele) => {
      if ((client_tags[ele] as Client_tags).type === "forward")
        result.push(client_tags[ele] as Client_tags);
    });
    return result;
  }
  get isLoadingItem() {
    return this.source.id === "client_virtualList_loading";
  }
  get isReleaseItem() {
    return this.source.id === "client_virtualList_release";
  }
  get isBanner() {
    return this.source.id === "client_virtualList_banner";
  }
  get isNoData() {
    return this.source.id === "client_virtualList_null";
  }
  get isArticle() {
    return (
      !this.isLoadingItem &&
      !this.isReleaseItem &&
      !this.isBanner &&
      !this.isNoData
    );
  }
  // 使用的显示风格
  get itemType() {
    const result = this.source.client_itemType;
    return result || "article";
  }
}
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
