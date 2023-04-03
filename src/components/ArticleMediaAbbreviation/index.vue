<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-30 16:55:11
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-31 10:11:10
 * @FilePath: /nosgram/src/components/ArticleMediaAbbreviation/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="article-media-abbreviation" @click="_emit">
    <article-photos
      v-if="mediaSource.type === 'p' || mediaSource.type === 'pv'"
      :data="mediaSource.url"
      objectFit="cover"
    />
    <article-video
      v-else-if="mediaSource.type === 'v'"
      :data="mediaSource.url"
    />
    <div class="time">{{ createdDate }}</div>
  </div>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import ArticleVideo from "../ArticleVideo/index.vue";
import ArticlePhotos from "../ArticlePhotos/index.vue";
import { mapOriginDataResult } from "@/common/js/nostr-tools/nostr-tools.d";
import { dayjs } from "element-plus";

interface Source extends mapOriginDataResult {
  client_photos?: string[];
  client_videos?: string[];
  client_mediaSize?: number;
}

@Options({
  components: {
    ArticleVideo,
    ArticlePhotos,
  },
})
export default class ArticleMediaAbbreviation extends Vue {
  @Prop({ default: {} }) data!: Source;
  _emit() {
    this.$emit("media-click", this.data);
  }
  get mediaSource() {
    const { client_photos, client_videos } = this.data || {};
    const result = { url: "", type: "", size: "" };
    if (client_photos?.length) {
      result.type += "p";
      result.url = client_photos[0];
    } else if (client_videos?.length) {
      result.type += "v";
      if (!result.url) result.url = client_videos[0];
    }
    return result;
  }
  get createdDate() {
    if (!this.data?.created_at) return "";
    return dayjs((this.data?.created_at as number) * 1000).format("D/M/YYYY");
  }
}
</script>

<style lang="scss" scoped>
.article-media-abbreviation {
  position: relative;
  width: var(--content_width);
  margin: auto auto 20px auto;
  background: rgb(var(--container-color));
  padding: 15px 15px 0 15px;
  box-shadow: 0 1px 10px var(--container-box_shadow-clor);
  border-radius: 5px;
  cursor: pointer;
  .time {
    // background: rgb(var(--container-color));
    // width: var(--content_width);
    // margin: auto auto 10px auto;
    text-align: right;
    padding: 10px 0px;
    font-size: 14px;
    color: rgb(var(--second-color));
  }
  :deep(.img-container) {
    img {
      width: 100% !important;
      height: 100%;
      max-height: var(--article-type-media-size);
    }
  }
}
</style>
