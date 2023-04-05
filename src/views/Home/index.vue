<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-26 14:22:41
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-04-05 15:56:41
 * @FilePath: /nosgram/src/views/Home/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <section class="section full-height">
    <article-skeleton
      class="article-skeleton-container"
      v-show="!listData?.length"
    />
    <virtual-list
      v-show="listData?.length"
      ref="virtual"
      class="virtual-list"
      :data-key="'id'"
      :keeps="120"
      :data-sources="virtualList"
      :data-component="ArticleComponent"
      :estimate-size="600"
      @tobottom="_handleToBottom"
    />
    <additional-content :data="followerData" class="additional-content" />
  </section>
  <details-dialog :followFn="_resetFollowList" ref="details-dialog" />
  <release @success="_handleReleaseSuccess" ref="release-dialog" />
  <!-- 用于获取样式设置的高度，使用后隐藏 -->
  <div
    class="media-height"
    :class="{ 'display-none': mediaHeight }"
    ref="mediaRef"
  ></div>
</template>
<script lang="ts">
import { Options, mixins } from "vue-class-component";
import VirtualList from "vue3-virtual-scroll-list";
import AdditionalContent from "@/components/AdditionalContent/index.vue";
import Article from "@/components/Article/index.vue";
import ArticleSkeleton from "@/components/ArticleSkeleton/index.vue";
import DetailsDialog from "../Details/components/DetailsDialog/index.vue";
import Release from "@/components/Release/index.vue";

import NostrToolsMixins from "@/mixins/NostrToolsMixins";

import { deDuplication } from "@/common/js/common";
import type { mapOriginDataResult } from "@/common/js/nostr-tools/nostr-tools.d";
import { random } from "@/common/js/common";
import { nostrToolsModule } from "@/store/modules/nostr-tools";
import type { EventTemplate } from "nostr-tools";
import { loginModule } from "@/store/modules/login";

@Options({
  components: {
    ArticleSkeleton,
    AdditionalContent,
    VirtualList,
    DetailsDialog,
    Release,
  },
})
export default class Home extends mixins(NostrToolsMixins) {
  listData: any = [];
  ArticleComponent = Article;
  loading = false;
  mediaHeight = 0;
  followerData: mapOriginDataResult[] = [];
  pageUntil = ~~(Date.now() / 1000); // 上一次请求最后一条数据的时间
  firstActivation = true;
  get followPage() {
    const { name } = this.$route;
    return name === "follow";
  }
  // @Activated()
  activated() {
    if (this.firstActivation) {
      this.firstActivation = false;
      return;
    }
    this._resetFollowList();
  }
  async mounted() {
    this._getMediaHeight();

    await this._init();
  }
  // 组装loading项，用于加载更多显示loading
  get virtualList() {
    const result: Record<
      string,
      string | ((params: number | boolean) => void)
    >[] = [
      {
        id: "client_virtualList_release",
        client_fn_release_dialog: this._releaseDialogToggle,
      },
    ].concat(this.listData);
    if (this.loading)
      return result.concat([{ id: "client_virtualList_loading" }]);
    else return result;
  }
  _handleReleaseSuccess(params: EventTemplate) {
    this._insertArticle(params);
  }
  _insertArticle(params: any, index = 0) {
    this.listData.splice(index, 0, params);
  }
  async _init() {
    // 若登录获取关注的人，获取文章中关注状态
    await this._getFollow();

    await this._getData();
    // 获取右侧额外内容
    await this._getAdditionalContent(this.virtualList, 5);
  }
  _detailsDialogToggle(params: mapOriginDataResult) {
    (this.$refs["details-dialog"] as DetailsDialog)._toggle(true, params);
  }
  _releaseDialogToggle(params: boolean | number) {
    (this.$refs["release-dialog"] as Release)._toggle(params);
  }
  _resetFollowList() {
    this._setUserFollow(this.listData);
  }
  _getMediaHeight() {
    setTimeout(() => {
      const mediaRef = this.$refs.mediaRef as HTMLDivElement;
      this.mediaHeight = mediaRef?.clientHeight;
    }, 0);
  }
  _handleToBottom() {
    if (this.loading) return;
    this._getData();
  }
  async _getActivity() {
    const temp: Record<string, number | (number | string)[]> = {
      kinds: [1],
      until: this.pageUntil,
      limit: 5,
      // authors: this.followPage ? authors : [],
    };
    if (this.followPage)
      temp.authors = Object.keys(loginModule.userFollow) || [];
    // 获取动态
    let activityData: mapOriginDataResult[] = await nostrToolsModule.ns_send({
      url: loginModule.readRelays,
      params: ["REQ", this.randomEventId("user-activity"), temp],
    });
    this._setUserFollow(activityData);
    // 去重新旧获取的文章列表
    const newActivityData = deDuplication(
      this.listData,
      activityData as { id: string }[]
    );
    // 设置动态中用户的信息
    await this._setUser(activityData);
    // 获取文章中转发的内容
    await this._getForward(activityData);
    // 获取文章的点赞信息，id
    await this._getLikes(activityData);
    // 获取动态的对应的互动
    await this._getInteraction(activityData);
    // 合并显示动态列表
    this.listData = this.listData
      .concat(newActivityData)
      .map((e: mapOriginDataResult) => ({
        ...e,
        client_mediaHeight: this.mediaHeight,
        client_fn_details: this._detailsDialogToggle,
        client_fn_reset_follow: this._resetFollowList,
      }));
    this.pageUntil = this.listData[this.listData.length - 1]
      ?.created_at as number;

    console.log("-----this.listData", this.listData);
  }
  async _getoOperation(author: string) {
    if (!author?.length) return;
    const res: mapOriginDataResult[] = await nostrToolsModule.ns_send({
      url: loginModule.readRelays,
      params: [
        "REQ",
        this.randomEventId("user-operation"),
        {
          until: ~~(Date.now() / 1000),
          kinds: [1, 7],
          limit: 1,
          authors: [author],
        },
      ],
    });
    const result = res.filter(
      (e: mapOriginDataResult) => e.client_messageType !== "EOSE"
    );
    return result;
  }
  async _getAdditionalContent(activityData: mapOriginDataResult[], size = 5) {
    // 获取动态中随机数量的人，然后去找对应人的发布信息/点赞等操作
    const getItem = async (
      origin: mapOriginDataResult[],
      result: mapOriginDataResult[] = [],
      times = 0
    ): Promise<mapOriginDataResult[]> => {
      if (result.length === size || times > 20) return result;
      const index = random(0, origin.length - 1);
      const item = origin[index] as mapOriginDataResult;
      let exists = false;
      result.some((e) => {
        if (e.pubkey === item.pubkey) {
          exists = true;
          return true;
        } else return false;
      });
      if (!exists) {
        const operation = await this._getoOperation(item.pubkey as string);
        if (operation?.length) {
          item.client_likes = operation;
          result.push(item);
        }
      }
      return getItem(origin, result, times + 1);
    };
    const authors = await getItem(activityData, []);
    this.followerData = authors;
  }
  async _getData() {
    this.loading = true;
    await this._getActivity();
    this.loading = false;
  }
}
</script>

<style lang="scss" scoped>
.section {
  position: relative;
}

.media {
  &-height {
    position: absolute;
    z-index: -10000;
    height: var(--article-media-height);
  }
}

.additional-content {
  display: var(--content-additional_display);
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  margin: auto;
  transform: translateX(calc(50% + var(--content-right-spacing_width) / 2));
}

.article-skeleton-container {
  margin: auto auto 10px auto;
  width: var(--content_width);
  transform: var(--content-transform);
  padding: var(--content-container-padding);
}

:deep(.virtual-list) {
  overflow-y: auto;
  height: 100%;
  width: 100%;
  padding: var(--content-container-padding);
  .article,
  .loading-container {
    transform: var(--content-transform);
  }
}
</style>
