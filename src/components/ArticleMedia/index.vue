<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-28 18:39:26
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-04-03 21:19:47
 * @FilePath: /nosgram/src/views/Home/components/ArticleMedia/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div
    class="media-container"
    :class="{ 'padding-20 border-bottom-1': links?.length }"
  >
    <ArticleLink :data="link" v-for="(link, index) in links" :key="index" />
    <el-carousel
      v-if="videos?.length || photos?.length"
      :height="`${mediaHeight || data.client_mediaHeight}px`"
      class="media"
      :indicator-position="mediaTotal < 2 ? 'none' : ''"
      :arrow="arrowConfig"
      :autoplay="false"
      trigger="click"
    >
      <el-carousel-item
        class="full-height"
        v-for="(video, index) in videos"
        :key="index"
      >
        <article-video :data="video" />
      </el-carousel-item>
      <el-carousel-item
        class="full-height"
        v-for="(photo, index) in photos"
        :key="index"
      >
        <article-photos
          :imgWidth="imgWidth"
          :imgHeight="imgHeight"
          :data="photo"
          :objectFit="imgObjectFit"
        />
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script lang="ts">
import { Vue, Options, prop } from "vue-class-component";
import ArticleLink from "../ArticleLink/index.vue";
import ArticlePhotos from "../ArticlePhotos/index.vue";
import ArticleVideo from "../ArticleVideo/index.vue";
import { isPhone } from "@/common/js/common";

interface Data {
  client_photos?: string[];
  client_videos?: string[];
  client_links?: string[];
  client_mediaHeight?: number;
}

class ArticleMediaProps {
  data = prop<Data>({ required: true, default: {} });
  mediaHeight = prop<number>({ required: false, default: 0 });
  imgWidth = prop<string>({ required: false, default: "initial" });
  imgHeight = prop<string>({ required: false, default: "100%" });
  arrow = prop<string>({ required: false, default: "" });
  imgObjectFit = prop<string>({ required: false, default: "contain" });
}

@Options({
  components: {
    ArticleLink,
    ArticlePhotos,
    ArticleVideo,
  },
})
export default class ArticleMedia extends Vue.with(ArticleMediaProps) {
  get arrowConfig() {
    const result = isPhone()
      ? "never"
      : this.mediaTotal > 1
      ? "hover"
      : "never";
    return this.arrow || result;
  }
  get links() {
    // <!-- tip：由于需要后端配合，暂时不调用 -->
    return [];
    // 当存在图片或视频资源就不显示
    // if (this.photos?.length || this.videos?.length) return [];
    // return this.data.client_links;
  }
  get photos() {
    return this.data.client_photos;
  }
  get videos() {
    return this.data.client_videos;
  }
  get mediaTotal() {
    const photos = this.data?.client_photos?.length || 0;
    const videos = this.data.client_videos?.length || 0;
    return photos + videos;
  }
}
</script>

<style lang="scss" scoped>
.media {
  &-container {
    width: 100%;
  }
}
</style>
