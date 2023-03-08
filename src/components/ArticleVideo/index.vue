<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-28 18:28:54
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-02-28 20:33:05
 * @FilePath: /nosgram/src/views/Home/components/ArticleVideo/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="video-container">
    <video-player
      preload="auto"
      controls
      fill
      muted
      :fullscreen="false"
      :disablePictureInPicture="true"
      class="video"
      :src="src"
    />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { VideoPlayer } from "@videojs-player/vue";
import "video.js/dist/video-js.css";

@Options({
  components: {
    VideoPlayer,
  },
})
export default class ArticleVideo extends Vue {
  src =
    "https://nostr.build/av/nostr.build_86f006761b4b2d5295dcde34439d7a7423fce66dc9029bc5bfe158ca3f6706df.mp4";
}
</script>

<style lang="scss" scoped>
.video {
  height: 100%;
  margin: auto;
  &-container {
    height: 100%;
    width: 100%;
  }
}
</style>
