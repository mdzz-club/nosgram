<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-07 11:18:04
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-26 21:31:07
 * @FilePath: /nosgram/src/views/Details/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <article
    v-loading="detailsLoading"
    class="details-container"
    ref="details-container"
    :class="{ page: !isComponent }"
  >
    <div
      class="details-left"
      ref="details-left"
      :class="{
        'all-rounded-corner no-media': !mediaTotal,
        media: mediaTotal,
        'hide-comment': showComment,
      }"
    >
      <div class="left-top display-flex">
        <author-info
          padding="0"
          :source="viewData"
          avatarWidth="48"
          avatarHeight="48"
          :isShowCreateTime="false"
        >
          <template #avatar>
            <div
              class="toggle-button"
              v-if="mediaTotal"
              @click="showComment = !showComment"
            >
              <el-icon size="25" v-show="showComment"
                ><icon-ion-chatbubble-ellipses-outline
              /></el-icon>
              <el-icon size="25" v-show="!showComment"
                ><icon-majesticons-chevron-double-down-line
              /></el-icon>
            </div>
          </template>
          <el-button class="margin-left-0-important" link type="primary">
            <span class="font-size-14">关注</span>
          </el-button>
        </author-info>
        <div class="left-top-back">
          <el-button link @click="_back"
            ><el-icon size="25"><icon-ion-arrow-back /></el-icon
          ></el-button>
        </div>
      </div>
      <div class="left-center">
        <!-- {{ source }} -->
        <!-- :class="{ loading }" -->
        <div class="comment-component-container">
          <div
            class="full-width display-flex justify-center padding-top-15"
            v-show="loading && loading !== 2"
          >
            <loading />
          </div>
          <div class="full-width full-height">
            <comment
              :reply="_handleReplyIndex"
              :emit="_emit"
              :source="commentData"
            />
            <div
              v-if="moreLoading"
              class="full-width display-flex justify-center align-items-bottom height-70"
            >
              <el-button
                v-show="commentData?.length && !loading"
                link
                @click="_getComment(undefined, 2)"
              >
                <el-icon class="margin-right-10" size="40">
                  <icon-ion-add-circle-outline />
                </el-icon>
                加载更多评论
              </el-button>
              <loading v-show="loading === 2" />
            </div>
          </div>
          <el-empty
            :image-size="200"
            description="暂无评论"
            v-show="!loading && !commentData?.length"
          />
        </div>
      </div>
      <div class="left-bottom">
        <div class="button-group">
          <div>
            <button-group
              ref="button-group"
              :source="viewData"
              size="25"
              :buttons="buttons"
            />
          </div>
          <div class="display-flex create-time">
            <p class="first-font-color font-size-14 margin-bottom-3">
              {{ createdDate }}
            </p>
            <p class="second-font-color font-size-14">{{ createdTime }}</p>
          </div>
        </div>
        <div
          class="full-width margin-bottom-10 padding-left-20 padding-right-20"
        >
          <chat-input-box
            ref="chat-input-box"
            @submit="_handleSubmit"
            @interaction-input="_handleInteractionInput"
          >
            <template #before-input>
              <el-tag closable type="info" v-show="reply" @close="reply = null">
                回复：{{ reply && _getAuthor(reply as Author) }}
              </el-tag>
            </template>
          </chat-input-box>
        </div>
      </div>
    </div>
    <div class="details-right" v-if="mediaTotal">
      <article-media
        v-if="mediaHeight"
        :mediaHeight="mediaHeight"
        imgHeight="initial"
        imgWidth="100%"
        :data="viewData"
        :arrow="isPhoneDevice ? 'always' : ''"
      />
    </div>
  </article>
</template>

<script lang="ts">
import Avatar from "vue-boring-avatars";
import { Options, mixins } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import NostrToolsMixins from "@/mixins/NostrToolsMixins";
import {
  Author,
  mapOriginDataResult,
} from "@/common/js/nostr-tools/nostr-tools.d";
import ArticleMedia from "@/components/ArticleMedia/index.vue";
import { getAuthor } from "@/common/js/nostr-tools/index";
import { deDuplication } from "@/common/js/common";
import { dayjs } from "element-plus";
import { Watch } from "vue-property-decorator";
import Comment from "@/components/Comment/index.vue";
import { nostrToolsModule } from "@/store/modules/nostr-tools";
import Loading from "@/components/loading/index.vue";
import { isPhone } from "@/common/js/common";
import ChatInputBox from "@/components/ChatInputBox/index.vue";
import { AuthorInfo } from "@/components/Base/index";
import { finishEvent } from "nostr-tools";
import { loginModule } from "@/store/modules/login";
import ChatInputBoxMixins from "@/mixins/ChatInputBoxMixins";

interface Source extends mapOriginDataResult {
  created_at?: number;
  client_children?: Source[];
  client_moreComment?: number;
}

@Options({
  components: {
    Avatar,
    ArticleMedia,
    Comment,
    Loading,
    ChatInputBox,
    AuthorInfo,
  },
})
export default class Details extends mixins(
  NostrToolsMixins,
  ChatInputBoxMixins
) {
  @Prop({ default: false }) isComponent!: boolean;
  @Prop({ default: {} }) source!: Source;
  @Prop({ default: null }) closeDialog!: null | ((params: boolean) => void);
  mediaHeight = 0;
  commentData: mapOriginDataResult[] = [];
  detailsSource: Source = {};
  loading: boolean | number = false; // false隐藏 1:顶部loading 2:底部loading
  detailsLoading = false;
  showComment = false;
  likesLoading = true;
  moreLoading = true; // 是否还有更多数据
  // 表单信息
  pageUntil = ~~(Date.now() / 1000);
  reply: Author | null = null;
  replyIndex: null | string = null;
  @Watch("source")
  _getAuthor(params: Author) {
    const result = getAuthor(params as Author).author as string;
    return result && result.length > 4 ? `${result.slice(0, 4)}...` : result;
  }
  onSourceChanged() {
    this._getComment();
  }
  async mounted() {
    if (!this.isComponent) await this.getSource();
    await this.initLike();
    await this._getComment();
    setTimeout(() => this._setMediaHeight(), 0);
  }
  async initLike() {
    this.likesLoading = true;
    await this._getLikes([this.viewData]);
    this.$refs["button-group"].setLike();
    this.likesLoading = false;
  }
  async _handleSubmit(
    params: Record<string, string[][] | string | Record<string, string>>
  ) {
    // const { content, tags } = params;
    const { privateKey } = loginModule.userInfo;
    const { id: articleId, pubkey: userId } = this.viewData;
    const { id: replyArticleId, pubkey: replyUserId } = this.reply || {};
    const replyParams: Record<string, string> | undefined = this.replyIndex
      ? {
          id: replyArticleId as string,
          index: this.replyIndex as string,
        }
      : undefined;
    this._clearReply();
    this._setLoading(replyParams);
    // const temp = {
    //   content: content as string,
    //   tags: [] as string[][],
    // };
    // (tags as string[][]).forEach((e, i) => {
    //   const [type, id, contentAt] = e;
    //   if (type === "p") {
    //     temp.content = temp.content.replace(contentAt, `#[${i}]`);
    //   }
    //   temp.tags[i] = [type, id];
    // });
    const temp = this._getReleaseForm(params);
    if (replyUserId && replyArticleId) {
      temp.tags = temp.tags.concat([
        ["e", replyArticleId as string, "", "reply"],
        ["p", replyUserId as string],
      ]);
    } else {
      temp.tags = temp.tags.concat([
        ["e", articleId as string, "", "root"],
        ["p", userId as string],
      ]);
    }
    const form = finishEvent(
      {
        kind: 1,
        ...temp,
        created_at: ~~(Date.now() / 1000),
      },
      privateKey as string
    );
    await this._sendEvent(form);
    this.pageUntil = ~~(Date.now() / 1000);
    await this._getComment(replyParams);
  }
  /**
   *
   * @param params
   * @param loading 用于设置loading出现位置 false隐藏 1:顶部loading 2:底部loading
   */
  _setLoading(params?: Record<string, string>, loading = 1) {
    const { id, index } = params || {};
    const item = index
      ? this._findItem(this.commentData, index.split("-"))
      : {};
    if (!id) {
      this.loading = loading;
    } else if (id && (item as Source).client_children) {
      (item as Source).client_moreComment = 2;
      return;
    }
  }
  _clearReply() {
    this.reply = null;
    this.replyIndex = null;
  }
  _handleReplyIndex(index: string) {
    const item = index
      ? this._findItem(this.commentData, index.split("-"))
      : {};
    this.reply = item as Author;
    this.replyIndex = index;
  }
  async getSource() {
    const { params } = this.$route;
    const { id } = params;
    // 获取动态
    this.detailsLoading = true;
    // const activityDetailsRandom = this.randomEventId("activity-details");
    const activityDetailsData: mapOriginDataResult[] =
      await nostrToolsModule.ns_send({
        url: this.defaultRelays,
        params: [
          "REQ",
          this.randomEventId("activity-details"),
          {
            ids: [id],
          },
        ],
      });
    // const activityDetailsData: mapOriginDataResult[] =
    //   await nostrToolsModule.ns_processingData(activityDetailsRandom);
    this.detailsSource = activityDetailsData[0];
    this.detailsLoading = false;
  }
  _findItem(data: Source[], fineIndex: string[]): Source[] | Source {
    const index = fineIndex.shift();
    if (!index) return data;
    if (fineIndex.length)
      return this._findItem(
        data[parseInt(index)].client_children as Source[],
        fineIndex
      );
    else return data[parseInt(index)];
  }
  async _getComment(params?: Record<string, string>, loading = 1) {
    const { id, index } = params || {};
    const item = index
      ? this._findItem(this.commentData, index.split("-"))
      : {};
    // const detailsRandom = this.randomEventId("activity-comment");
    this._setLoading(params, loading);
    const commentData: mapOriginDataResult[] = await nostrToolsModule.ns_send({
      url: this.defaultRelays,
      params: [
        "REQ",
        this.randomEventId("activity-comment"),
        {
          kinds: [1],
          until: id ? ~~(Date.now() / 1000) : this.pageUntil,
          limit: 10,
          "#e": [id || this.viewData.id],
        },
      ],
    });
    // 获取用户信息
    await this._getUser(commentData);
    // 获取点赞信息
    await this._getLikes(commentData);
    // 获取动态的对应的互动
    await this._getInteraction(commentData);
    // 记录最后一条数据的时间
    !id &&
      (this.pageUntil = commentData[commentData.length - 1]
        ?.created_at as number);
    if (id) {
      if (Object.prototype.toString.call(item) !== "[object Array]") {
        if (commentData?.length) {
          (item as Source).client_moreComment = 1;
          (item as Source).client_children = commentData;
        } else {
          (item as Source).client_moreComment = -1;
        }
      }
    } else {
      const newData = deDuplication(
        this.commentData as { id: string }[],
        commentData as { id: string }[]
      );
      if (this.commentData.length && !newData.length) this.moreLoading = false;
      this.commentData = [...this.commentData, ...newData];
      this.loading = false;
    }
  }
  _setMediaHeight() {
    this.mediaHeight = (
      this.$refs[
        this.isComponent ? "details-container" : "details-left"
      ] as HTMLDivElement
    ).offsetHeight;
  }
  _back() {
    if (this.closeDialog) return this.closeDialog(false);
    else this.$router.back();
  }
  _emit(params: mapOriginDataResult, index: string) {
    this._getComment({ id: params.id as string, index });
  }
  get buttons() {
    return [{ type: "like", loading: this.likesLoading }, "forward", "collect"];
  }
  get isPhoneDevice() {
    return isPhone();
  }
  get viewData() {
    const { name, params } = this.$route;
    const { id } = params;
    let result: Source = {};
    if (name === "details" && id) {
      result = this.detailsSource;
    } else {
      result = this.source;
    }
    return result;
  }
  get createdDate() {
    if (!this.viewData?.created_at) return "";
    return dayjs((this.viewData?.created_at as number) * 1000).format("M月D日");
  }
  get createdTime() {
    if (!this.viewData?.created_at) return "";
    return dayjs((this.viewData?.created_at as number) * 1000).format(
      "HH:mm:ss"
    );
  }
  get author() {
    return getAuthor(this.viewData as Author);
  }
  get mediaTotal() {
    const photos = this.viewData?.client_photos?.length || 0;
    const videos = this.viewData?.client_videos?.length || 0;
    return photos + videos;
  }
}
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>
