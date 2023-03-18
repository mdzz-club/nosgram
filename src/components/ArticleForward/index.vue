<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-28 18:39:26
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-16 21:52:12
 * @FilePath: /nosgram/src/views/Home/components/ArticleForward/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="forward-container" title="查看原文章" @click="_handleClick">
    <div class="video-container" v-if="videos?.length">
      <article-video :data="videos[0]" />
    </div>
    <article-photos v-if="photos?.length" :data="photos[0]" />
    <div class="author-info">
      <el-icon size="25"><icon-ion-ios-open /></el-icon>
      <avatar
        v-if="!author.icon"
        :size="35"
        :name="author.iconName"
        :color="['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']"
      />
      <img v-else :src="(author.icon as string)" alt="icon" />
      <p class="font-size-18">{{ author.author }}</p>
    </div>
    <div
      class="introduction-container"
      :class="{ hide: !hasText }"
      v-if="content"
    >
      <article-html @client-innerText="_handleInnerText" :source="content" />
    </div>
  </div>
</template>

<script lang="ts">
import Avatar from "vue-boring-avatars";
import { Vue, Options } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import type {
  Author,
  Client_tags,
} from "@/common/js/nostr-tools/nostr-tools.d";
import ArticleVideo from "../ArticleVideo/index.vue";
import ArticlePhotos from "../ArticleVideo/index.vue";
import ArticleHtml from "../ArticleHtml/index.vue";
import { getAuthor } from "@/common/js/nostr-tools/index";

interface Source extends Client_tags {
  client_innerText?: string;
}

@Options({
  components: {
    Avatar,
    ArticleHtml,
    ArticlePhotos,
    ArticleVideo,
  },
})
export default class ArticleForward extends Vue {
  @Prop({ default: {} }) source!: Source;
  @Prop({ default: [] }) "open-class": string[];
  hasText = false; // 判断转发的文章是否有内容
  _handleInnerText(params: string) {
    if (params && params.length) this.hasText = true;
  }
  _handleClick() {
    const { id } = this.source;
    this.$router.push({
      name: "details",
      params: {
        id: id,
      },
    });
  }
  get photos() {
    const { client_photos } = this.source?.client_forward || {};
    return client_photos || [];
  }
  get videos() {
    const { client_videos } = this.source?.client_forward || {};
    return client_videos || [];
  }
  get author() {
    const params = this.source?.client_forward || {};
    return getAuthor(params as Author);
  }
  get content() {
    return this.source?.client_forward || null;
  }
}
</script>

<style lang="scss" scoped>
.video-container {
  height: 300px;
}

.forward {
  &-container {
    width: 90%;
    min-height: 140px;
    max-height: 400px;
    margin: 10px auto auto auto;
    border-radius: 25px;
    border: solid 1px rgb(var(--border-color));
    overflow: hidden;
    position: relative;
    cursor: pointer;
    .introduction-container {
      position: absolute;
      bottom: 0;
      left: 0;
      // height: 95px;
      width: 100%;
      background: rgba(255, 255, 255, 0.9);
      padding: 0 10px 15px 10px;
      display: flex;
      align-items: flex-end;
      &.hide {
        display: none !important;
      }

      :deep(.article-content) {
        text-overflow: -o-ellipsis-lastline;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }
    .author-info {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 60px;
      display: flex;
      align-items: center;
      padding-left: 20px;
      background: rgb(0, 0, 0, 0.5);
      z-index: 3;
      .el-icon {
        color: white;
        margin-right: 20px;
      }
      p {
        color: white;
        padding-left: 10px;
      }
    }
  }
}
</style>
