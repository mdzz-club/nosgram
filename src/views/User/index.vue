<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-29 11:59:50
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-04-03 19:38:07
 * @FilePath: /nosgram/src/views/User/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <virtual-list
    ref="virtual"
    class="virtual-list"
    :data-key="'id'"
    :keeps="120"
    :data-sources="virtualData"
    :data-component="ArticleComponent"
    @tobottom="_handleToBottom"
  />
  <details-dialog :followFn="_resetFollowList" ref="details-dialog" />
  <release @success="_handleReleaseSuccess" ref="release-dialog" />
  <!-- 用于获取样式设置的高度，使用后隐藏 -->
  <div
    class="article-media-height"
    :class="{ 'display-none': articleMediaHeight }"
    ref="articleMediaRef"
  ></div>
  <edit-user-info
    @success="_handleSuccess"
    :source="userInfo"
    v-model:show="show"
  />
  <!-- <div
    class="media-height"
    :class="{ 'display-none': mediaHeight }"
    ref="mediaRef"
  ></div> -->
</template>

<script lang="ts">
import { mixins, Options } from "vue-class-component";
import NostrToolsMixins from "@/mixins/NostrToolsMixins";
import { mapOriginDataResult } from "@/common/js/nostr-tools/nostr-tools.d";
import AvatarComponent from "@/components/Base/Avatar/index.vue";
import { loginModule } from "@/store/modules/login";
import type { UserInfoDetails } from "@/store/modules/login";
import { nostrToolsModule } from "@/store/modules/nostr-tools";
import VirtualList from "vue3-virtual-scroll-list";
import Article from "@/components/Article/index.vue";
import { deDuplication } from "@/common/js/common";
import DetailsDialog from "@/views/Details/components/DetailsDialog/index.vue";
import Release from "@/components/Release/index.vue";
import EditUserInfo from "@/components/EditUserInfo/index.vue";
import type { Event } from "nostr-tools";

@Options({
  components: {
    AvatarComponent,
    VirtualList,
    DetailsDialog,
    Release,
    EditUserInfo,
  },
})
export default class User extends mixins(NostrToolsMixins) {
  show = false;
  // mediaHeight = 0;
  noMore = false;
  articleMediaHeight = 0;
  ArticleComponent = Article;
  listData: any = [];
  loading = false;
  userInfo = {};
  pageUntil = ~~(Date.now() / 1000);
  tab = 0;
  tabList = [
    { label: "动态", name: "article" },
    { label: "相册", name: "photos" },
  ];
  editLoading = true;
  mounted() {
    const { id } = this.$route?.params || {};
    this._getHeight();
    this._getUserInfo(id);
    this._getData(id);
  }
  _handleSuccess(params: unknown) {
    const { content: stringContent } = params as Event;
    const content = JSON.parse(stringContent);
    this.userInfo = { ...this.userInfo, content };
    loginModule.setUserInfo({
      details: { ...(params as UserInfoDetails), content },
    });
  }
  _filterMedia(data: mapOriginDataResult[]) {
    const videos = data.filter((e) => e.client_videos) || [];
    const photos = data.filter((e) => e.client_photos) || [];
    return videos
      .concat(photos)
      .map((e, i) => ({ ...e, client_itemType: "media", domIndex: i + 1 }));
  }
  get selected() {
    return this.tabList[this.tab].name;
  }
  // 组装loading项，用于加载更多显示loading
  get virtualData() {
    const { id } = this.$route?.params || {};
    let data = this.listData;
    if (this.selected === "photos") data = this._filterMedia(data);
    const result: Record<string, unknown>[] = [
      {
        id: "client_virtualList_banner",
        editLoading: this.editLoading,
        userInfo: this.userInfo,
        routeId: id,
        client_fn_catchEmit: this._bannerClick,
        client_banner_config: { defaultTab: this.tab, tabList: this.tabList },
      },
    ].concat(data);
    if (this.loading)
      return result.concat([{ id: "client_virtualList_loading" }]);
    else {
      if (data.length === 0) {
        return result.concat([
          {
            id: "client_virtualList_null",
          },
        ]);
      }
      return result;
    }
  }
  _bannerClick(param: Record<string, string | number>) {
    const { client_index, emitType } = param;
    if (emitType === "banner-tab-click") this.tab = client_index as number;
    else if (emitType === "banner-edit-user_info-click") {
      this.show = true;
    }
  }
  async _getUserInfo(pubkey: string) {
    this.editLoading = true;
    const res = await this._getUser([pubkey]);
    this.userInfo = res?.[0];
    this.editLoading = false;
  }
  _resetFollowList() {
    this._setUserFollow(this.listData);
  }
  _getHeight() {
    setTimeout(() => {
      // 获取css配置的媒体专用高度
      const articleMediaRef = this.$refs.articleMediaRef as HTMLDivElement;
      this.articleMediaHeight = articleMediaRef?.clientHeight;

      // const mediaRef = this.$refs.mediaRef as HTMLDivElement;
      // this.mediaHeight = mediaRef?.clientHeight;
    }, 0);
  }
  _detailsDialogToggle(params: mapOriginDataResult) {
    (this.$refs["details-dialog"] as DetailsDialog)._toggle(true, params);
  }
  _releaseDialogToggle(params: boolean | number) {
    (this.$refs["release-dialog"] as Release)._toggle(params);
  }
  _handleToBottom() {
    if (this.loading || this.noMore) return;
    const { id } = this.$route?.params || {};
    this._getData(id);
  }
  async _getActivity(id: string) {
    // 获取动态
    let activityData: mapOriginDataResult[] = await nostrToolsModule.ns_send({
      url: loginModule.readRelays,
      params: [
        "REQ",
        this.randomEventId("user-page-activity"),
        {
          kinds: [1],
          until: this.pageUntil,
          limit: 20,
          authors: [id],
        },
      ],
    });
    this._setUserFollow(activityData);
    // 去重新旧获取的文章列表
    const newActivityData = deDuplication(
      this.listData,
      activityData as { id: string }[]
    );
    // if(!this.listData.length && !newActivityData.length)
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
        client_mediaHeight: this.articleMediaHeight,
        // client_mediaSize: this.mediaHeight,
        client_fn_details: this._detailsDialogToggle,
        client_fn_reset_follow: this._resetFollowList,
      }));
    if (this.pageUntil === this.listData[this.listData.length - 1]?.created_at)
      this.noMore = true;
    this.pageUntil = this.listData[this.listData.length - 1]
      ?.created_at as number;
  }
  async _getData(id: string) {
    // 获取动态
    this.loading = true;
    await this._getActivity(id);
    this.loading = false;
  }
}
</script>

<style lang="scss" scoped>
.article-media-height {
  position: absolute;
  z-index: -10000;
  height: var(--article-media-height);
}
.media-height {
  position: absolute;
  z-index: -10000;
  height: var(--article-type-media-size);
}
.virtual-list {
  overflow-y: auto;
  height: 100%;
  width: 100%;
  :deep(.wrap) {
    & > div {
      padding: 0 var(--content-container-padding);
      &:first-of-type {
        padding: 0;
        width: 100%;
      }
    }
  }
}
</style>
