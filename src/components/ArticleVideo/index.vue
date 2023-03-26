<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-28 18:28:54
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-25 15:48:33
 * @FilePath: /nosgram/src/views/Home/components/ArticleVideo/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="video-container">
    <!-- <video-player
      preload="auto"
      controls
      fill
      muted
      :fullscreen="false"
      :disablePictureInPicture="true"
      class="video"
      :src="data"
    /> -->
    <video :src="data" controls class="video">
      您的浏览器不支持 video 标签。
    </video>
  </div>
</template>

<script lang="ts">
import { Vue, prop, Options } from "vue-class-component";
// import { VideoPlayer } from "@videojs-player/vue";
// import "video.js/dist/video-js.css";
class ArticleVideoProps {
  data = prop<string>({ required: true, default: "" });
}
@Options({
  components: {
    // VideoPlayer,
  },
})
export default class ArticleVideo extends Vue.with(ArticleVideoProps) {}
</script>

<style lang="scss" scoped>
.video {
  width: 100%;
  height: 100%;
  margin: auto;
  object-fit: cover;
  &-container {
    height: 100%;
    width: 100%;
  }
}
</style>
