<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-07 11:18:04
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-16 20:18:44
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
        <div class="left-top-info display-flex">
          <div class="logo">
            <avatar
              v-if="!author.icon"
              :size="48"
              :name="author.iconName"
              :color="['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']"
            />
            <img v-else :src="(author.icon as string)" alt="icon" />
            <div
              class="button-container"
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
          </div>
          <div class="name">
            <el-button link>
              <span class="font-weight-600 font-size-16 default-font-color">{{
                author.author
              }}</span>
            </el-button>
            <el-button link type="primary">
              <span class="font-size-14">关注</span>
            </el-button>
          </div>
        </div>
        <div class="left-top-button_group">
          <el-button link @click="_back"
            ><el-icon size="25"><icon-ion-arrow-back /></el-icon
          ></el-button>
        </div>
      </div>
      <div class="left-center">
        <!-- {{ source }} -->
        <div class="comment-component-container" :class="{ loading }">
          <div class="full-width full-height" v-show="!loading">
            <comment :emit="_emit" :source="commentData" />
          </div>
          <loading v-show="loading" />
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
            <el-tooltip effect="dark" content="评论">
              <el-button link
                ><el-icon size="25"
                  ><icon-ion-chatbubble-ellipses-outline /></el-icon
              ></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="点赞">
              <el-button link
                ><el-icon size="25"><icon-ion-heart-outline /></el-icon
              ></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="转发">
              <el-button link
                ><el-icon size="25"><icon-ion-arrow-redo-outline /></el-icon
              ></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="收藏">
              <el-button link
                ><el-icon size="25"><icon-ion-duplicate-outline /></el-icon
              ></el-button>
            </el-tooltip>
          </div>
          <div class="display-flex create-time">
            <p class="first-font-color font-size-14 margin-bottom-3">
              {{ createdDate }}
            </p>
            <p class="second-font-color font-size-14">{{ createdTime }}</p>
          </div>
        </div>
        <div class="full-width">
          <chat-input-box
            ref="chat-input-box"
            @interaction-input="handleInteractionInput"
          />
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
import { mapOriginDataResult } from "@/common/js/nostr-tools/nostr-tools.d";
import ArticleMedia from "@/components/ArticleMedia/index.vue";
import { getAuthor } from "@/common/js/nostr-tools/index";
import { dayjs } from "element-plus";
import { Watch } from "vue-property-decorator";
import Comment from "@/components/Comment/index.vue";
import { nostrToolsModule } from "@/store/modules/nostr-tools";
import Loading from "@/components/loading/index.vue";
import { isPhone } from "@/common/js/common";
import ChatInputBox from "@/components/ChatInputBox/index.vue";

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
  },
})
export default class Details extends mixins(NostrToolsMixins) {
  @Prop({ default: false }) isComponent!: boolean;
  @Prop({ default: {} }) source!: Source;
  @Prop({ default: null }) closeDialog!: null | ((params: boolean) => void);
  mediaHeight = 0;
  commentData: mapOriginDataResult[] = [];
  detailsSource: Source = {};
  loading = false;
  detailsLoading = false;
  showComment = false;
  @Watch("source")
  onSourceChanged() {
    this._getComment();
  }
  async mounted() {
    if (!this.isComponent) await this.getSource();
    await this._getComment();
    setTimeout(() => this._setMediaHeight(), 0);
  }
  async handleInteractionInput(params: Record<string, string>) {
    setTimeout(
      () =>
        this.$refs["chat-input-box"].setInteractionData(
          Array(10)
            .fill({})
            .map((e, i) => ({ key: `测试他吞吞吐吐-${i}`, value: `test-${i}` }))
        ),
      3000
    );
    // const res: mapOriginDataResult[] = await nostrToolsModule.ns_send({
    //   url: this.defaultRelays,
    //   params: [
    //     "REQ",
    //     this.randomEventId("interaction-input"),
    //     {
    //       ids: [id],
    //     },
    //   ],
    // });
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
  async _getComment(params?: Record<string, string>) {
    const { id, index } = params || {};
    const item = index
      ? this._findItem(this.commentData, index.split("-"))
      : {};
    // const detailsRandom = this.randomEventId("activity-comment");
    if (!id) {
      this.loading = true;
    } else if (id && (item as Source).client_children) {
      (item as Source).client_moreComment = 1;
      return;
    }
    const commentData: mapOriginDataResult[] = await nostrToolsModule.ns_send({
      url: this.defaultRelays,
      params: [
        "REQ",
        this.randomEventId("activity-comment"),
        {
          kinds: [1],
          until: ~~(Date.now() / 1000),
          limit: 10,
          "#e": [id || this.viewData.id],
        },
      ],
    });
    // const commentData: mapOriginDataResult[] =
    //   await nostrToolsModule.ns_processingData(detailsRandom);
    // 获取动态的对应的互动
    await this._getInteraction(commentData);
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
      this.loading = false;
      this.commentData = commentData;
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
    return getAuthor(this.viewData);
  }
  get mediaTotal() {
    const photos = this.viewData?.client_photos?.length || 0;
    const videos = this.viewData?.client_videos?.length || 0;
    return photos + videos;
  }
}
</script>

<style lang="scss" scoped>
$author_height: 70px;
.comment-component-container {
  padding: 0 0 20px 0;
  &.loading {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
.details-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  overflow: hidden;
  .details {
    &-left,
    &-right {
      width: 50%;
      height: 100%;
    }
    &-left {
      display: flex;
      flex-direction: column;
      background: rgb(var(--details-bg));
      border-radius: 5px 0 0 5px;
      position: relative;
      &.all-rounded-corner {
        border-radius: 5px;
      }
      .left {
        &-top {
          padding-left: 20px;
          min-height: $author_height;
          border-bottom: solid 1px rgb(var(--border-color));
          &-info {
            .name,
            .logo {
              position: relative;
              margin-right: 12px;
              img {
                width: 48px;
                height: 48px;
                border-radius: 100%;
              }
            }
            .name {
              display: flex;
              align-items: flex-start;
              justify-content: center;
              flex-direction: column;
              line-height: 1em;
              .el-button {
                margin: 0;
                padding: 0;
                & + .el-button {
                  margin-top: 3px;
                }
              }
            }
            .logo {
              display: flex;
              justify-items: center;
              align-items: center;
              & > .button-container {
                // filter: blur(15px);
                width: 48px;
                height: 48px;
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
                top: 0;
                margin: auto;
                display: none;
                justify-content: center;
                align-items: center;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                &::after,
                &::before {
                  content: "";
                  display: block;
                  width: 25px;
                  height: 25px;
                  position: absolute;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  top: 0;
                  margin: auto;
                }
                &::after {
                  border: 1px solid white;
                  border-radius: 50%;
                  animation: border-animation-outside 1s ease-out infinite;
                }
                &::before {
                  border: 1px solid white;
                  border-radius: 50%;
                  animation: border-animation-inside 2s ease-out infinite;
                }
              }
            }
          }
          &-button_group {
            display: none;
          }
        }
        &-center {
          height: calc(100% - $author_height);
          padding: 0 10px 0 20px;
          overflow-y: scroll;
          margin-bottom: 120px;
        }
        &-bottom {
          position: absolute;
          background: white;
          width: 100%;
          left: 0;
          bottom: 0;
          border-top: solid 1px rgb(var(--border-color));
          line-height: 1em;
          // padding: 10px 20px;
          padding-top: 10px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          .button-group {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            padding: 0 20px;
            & + * {
              margin-top: 10px;
            }
          }
          .create-time {
            flex-direction: column;
            align-items: flex-end;
          }
        }
      }
    }
    &-right {
      background: rgb(var(--details-media-bg));
    }
  }
  &.page {
    .details {
      &-left,
      &-right {
        width: 50%;
        height: var(--details-height);
        max-width: calc(var(--details-max-width) / 2);
        max-height: var(--details-max-height);
      }
      &-left {
        border: solid 1px rgb(var(--border-color));
      }
      &-right {
      }
    }
  }
}

@keyframes border-animation-outside {
  0% {
    width: 25px;
    height: 25px;
    opacity: 0;
  }

  50% {
    opacity: 1;
  }

  100% {
    width: 48px;
    height: 48px;
    opacity: 0;
  }
}

@keyframes border-animation-inside {
  0% {
    width: 25px;
    height: 25px;
    opacity: 0;
  }

  50% {
    opacity: 1;
  }

  100% {
    width: 48px;
    height: 48px;
    opacity: 0;
  }
}

@media screen and (max-width: 480px) {
  :deep(.el-carousel__indicators--horizontal) {
    bottom: initial;
    top: 0;
  }

  .details {
    &-container {
      position: relative;
      width: 100%;
    }
    &-left,
    &-right {
      position: absolute;
      left: 0;
      top: 0;
      width: 100% !important;
      height: 100% !important;
      max-width: 100% !important;
      max-height: 100% !important;
      z-index: 1;
    }
    &-left {
      border-radius: 10px 10px 0 0 !important;
      z-index: 2;
      &.no-media {
        border-radius: 0 !important;
        top: 0;
      }
      &.media {
        top: $author_height;
        transition: all 0.3s;
        &.hide-comment {
          top: calc(100% - $author_height);
        }
        .left {
          &-center {
            margin-bottom: 200px;
          }
          &-bottom {
            transform: translateY(-$author_height);
          }
        }
      }
      .left {
        &-top {
          justify-content: space-between;
          flex-direction: row-reverse;
          &-info {
            justify-content: space-between;
            flex-direction: row-reverse;
            .name {
              align-items: flex-end !important;
            }
            .logo {
              .button-container {
                display: flex !important;
              }
            }
          }
          &-button_group {
            display: flex !important;
            align-items: center;
          }
        }
      }
    }
  }
}
</style>
