<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-26 14:22:41
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-11 21:14:47
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
  <details-dialog ref="details-dialog" />
  <!-- 用于获取样式设置的高度，使用后隐藏 -->
  <div
    class="media-height"
    :class="{ 'display-none': mediaHeight }"
    ref="mediaRef"
  ></div>
</template>
<script lang="ts">
// import type { Relay } from "@/common/js/relays/relays.d";
import { Options, mixins } from "vue-class-component";
import VirtualList from "vue3-virtual-scroll-list";
// import relays from "@/common/js/relays";
import AdditionalContent from "@/components/AdditionalContent/index.vue";
import Article from "@/components/Article/index.vue";
import ArticleSkeleton from "@/components/ArticleSkeleton/index.vue";
import DetailsDialog from "../Details/components/DetailsDialog/index.vue";

import NostrToolsMixins from "@/mixins/NostrToolsMixins";

import { deDuplication } from "@/common/js/nostr-tools/index";
import type {
  mapOriginDataResult,
  Client_userInfo,
} from "@/common/js/nostr-tools/nostr-tools.d";
import { random } from "@/common/js/common";
import { nostrToolsModule } from "@/store/modules/nostr-tools";

@Options({
  components: {
    ArticleSkeleton,
    AdditionalContent,
    VirtualList,
    DetailsDialog,
  },
})
export default class Home extends mixins(NostrToolsMixins) {
  listData: any = [];
  ArticleComponent = Article;
  // defaultRelays = JSON.parse(JSON.stringify(relays)).map((e: Relay) => e.url);
  loading = false;
  mediaHeight = 0;
  followerData: mapOriginDataResult[] = [];
  pageUntil = ~~(Date.now() / 1000); // 上一次请求最后一条数据的时间
  async mounted() {
    this._getMediaHeight();

    this._getData();
  }
  // 组装loading项，用于加载更多显示loading
  get virtualList() {
    if (this.loading)
      return this.listData.concat([{ id: "client_virtualList_loading" }]);
    else return this.listData;
  }
  _init() {
    this._getData();
  }
  _dialogToggle(params: mapOriginDataResult) {
    (this.$refs["details-dialog"] as DetailsDialog)._toggle(true, params);
  }
  _getMediaHeight() {
    setTimeout(() => {
      const mediaRef = this.$refs.mediaRef as HTMLDivElement;
      this.mediaHeight = mediaRef?.clientHeight;
    }, 0);
  }
  _handleToBottom() {
    this._getData();
  }
  async _getActivity() {
    // 获取动态
    const userActivityRandom = this.randomEventId("user-activity");
    await nostrToolsModule.ns_send({
      url: this.defaultRelays,
      params: [
        "REQ",
        userActivityRandom,
        {
          kinds: [1],
          until: this.pageUntil,
          limit: 200,
        },
      ],
    });
    const activityData: mapOriginDataResult[] =
      await nostrToolsModule.ns_processingData(userActivityRandom);
    const newActivityData = deDuplication(
      this.listData,
      activityData as {
        id: string;
        client_messageType: string;
        created_at: number;
      }[]
    );
    // 获取动态的对应的互动
    await this._getInteraction(activityData);
    // 合并显示动态列表
    this.listData = this.listData
      .concat(newActivityData)
      .map((e: mapOriginDataResult) => ({
        ...e,
        client_mediaHeight: this.mediaHeight,
        client_fn_details: this._dialogToggle,
      }));
    this.pageUntil = this.listData[this.listData.length - 1]
      .created_at as number;
    return activityData;
  }
  async _getUser(activityData: mapOriginDataResult[]) {
    // 获取动态对应用户的信息
    const userRandom = this.randomEventId("user");
    await nostrToolsModule.ns_send({
      url: this.defaultRelays,
      params: [
        "REQ",
        userRandom,
        {
          kinds: [0],
          until: ~~(Date.now() / 1000),
          limit: 1,
          authors: [
            ...new Set(
              activityData
                .filter(
                  (e: mapOriginDataResult) => e.client_messageType !== "EOSE"
                )
                .map((e: mapOriginDataResult) => e.pubkey)
            ),
          ],
        },
      ],
    });
    const userData: mapOriginDataResult[] =
      await nostrToolsModule.ns_processingData(userRandom);
    this.listData.forEach((item: mapOriginDataResult) => {
      userData.some((user) => {
        if (item.pubkey === user.pubkey) {
          item.client_userInfo = user as Client_userInfo;
          return true;
        } else return false;
      });
    });
  }
  async _getLiks(author: string) {
    const userLikesRandom = this.randomEventId("user-likes");
    await nostrToolsModule.ns_send({
      url: this.defaultRelays,
      params: [
        "REQ",
        userLikesRandom,
        {
          until: ~~(Date.now() / 1000),
          kinds: [1, 7],
          limit: 1,
          authors: [author],
        },
      ],
    });
    const res: mapOriginDataResult[] = await nostrToolsModule.ns_processingData(
      userLikesRandom
    );
    const result = res.filter(
      (e: mapOriginDataResult) => e.client_messageType !== "EOSE"
    );
    return result;
  }
  async _getAdditionalContent(activityData: mapOriginDataResult[], size = 5) {
    // 获取动态中随机数量的人，然后去找对应人的发布信息/点赞等操作
    const getItem = async (
      origin: mapOriginDataResult[],
      result: mapOriginDataResult[] = []
    ): Promise<mapOriginDataResult[]> => {
      if (result.length === size) return result;
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
        item.client_likes = await this._getLiks(item.pubkey as string);
        result.push(item);
      }
      return getItem(origin, result);
    };
    const authors = await getItem(activityData, []);
    this.followerData = authors;
  }
  async _getData() {
    this.loading = true;
    // 获取用户动态
    const activityData = await this._getActivity();
    this.loading = false;
    // 设置动态中用户的信息！！！！这里还需要用本地存储把用户存储到本地，优化体验！！！！
    await this._getUser(activityData);
    console.log(this.listData);
    // 获取右侧额外内容
    await this._getAdditionalContent(activityData, 5);
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

.virtual-list {
  overflow-y: scroll;
  height: 100%;
  width: 100%;
  padding: var(--content-container-padding);
}
</style>
