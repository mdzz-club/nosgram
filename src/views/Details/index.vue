<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-07 11:18:04
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-08 20:40:08
 * @FilePath: /nosgram/src/views/Details/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <article class="details-container" :class="{ page: !isComponent }">
    <div class="details-left" :class="{ 'all-rounded-corner': !mediaTotal }">
      <div class="left-top display-flex">
        <div class="logo">
          <avatar
            v-if="!author.icon"
            :size="48"
            :name="author.iconName"
            :color="['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']"
          />
          <img v-else :src="(author.icon as string)" alt="icon" />
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
      <div class="left-center"></div>
      <div class="left-bottom display-flex">
        <div class="button-group">
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
          <p class="first-font-color font-size-14 margin-bottom-4">
            {{ createdDate }}
          </p>
          <p class="second-font-color font-size-14">{{ createdTime }}</p>
        </div>
      </div>
    </div>
    <div class="details-right" ref="details-right" v-if="mediaTotal">
      <article-media
        v-if="mediaHeight"
        :mediaHeight="mediaHeight"
        imgHeight="initial"
        imgWidth="100%"
        :data="source"
      />
    </div>
  </article>
</template>

<script lang="ts">
import Avatar from "vue-boring-avatars";
import { Vue, Options, prop } from "vue-class-component";
import NostrToolsMixins from "@/mixins/NostrToolsMixins";
import { mapOriginDataResult } from "@/common/js/nostr-tools/nostr-tools.d";
import ArticleMedia from "@/components/ArticleMedia/index.vue";
import { getAuthor } from "@/common/js/nostr-tools/index";
import { dayjs } from "element-plus";

interface Source extends mapOriginDataResult {
  created_at?: number;
}

class DetailsProps {
  isComponent = prop<boolean>({ required: true, default: false });
  source = prop<Source>({ required: false, default: {} });
}

@Options({
  mixins: [NostrToolsMixins],
  components: {
    Avatar,
    ArticleMedia,
  },
})
export default class Details extends Vue.with(DetailsProps) {
  mediaHeight = 0;
  mounted() {
    setTimeout(() => this._setMediaHeight(), 0);
  }
  _setMediaHeight() {
    this.mediaHeight = (
      this.$refs["details-right"] as HTMLDivElement
    ).offsetHeight;
    console.log(this.mediaHeight);
  }
  // 创建时间，后面使用
  get createdDate() {
    if (this.isComponent)
      return dayjs((this.source?.created_at as number) * 1000).format("M月D日");
    return ""; // 暂时写死，需要后续请求
  }

  get createdTime() {
    if (this.isComponent)
      return dayjs((this.source?.created_at as number) * 1000).format(
        "HH:mm:ss"
      );
    return ""; // 暂时写死，需要后续请求
  }

  get author() {
    return getAuthor(this.source);
  }
  get mediaTotal() {
    const photos = this.source?.client_photos?.length || 0;
    const videos = this.source.client_videos?.length || 0;
    if (this.isComponent) return photos + videos;
    return 0; // 暂时写死，需要后续请求
  }
}
</script>

<style lang="scss" scoped>
.details-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  .details {
    &-left,
    &-right {
      width: 50%;
      height: 100%;
    }
    &-left {
      background: rgb(var(--details-bg));
      border-radius: 5px 0 0 5px;
      &.all-rounded-corner {
        border-radius: 5px;
      }
      .left {
        &-top {
          padding-left: 20px;
          height: 70px;
          border-bottom: solid 1px rgb(var(--border-color));
          .name,
          .logo {
            margin-right: 12px;
            img {
              width: 35px;
              height: 35px;
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
          }
        }
        &-center {
          height: calc(100% - 140px);
        }
        &-bottom {
          justify-content: space-between;
          border-top: solid 1px rgb(var(--border-color));
          align-items: center;
          line-height: 1em;
          padding: 0 20px;
          height: 70px;
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
      }
      &-right {
      }
    }
  }
}
</style>
