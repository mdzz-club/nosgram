<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-28 18:39:47
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-05-05 22:33:24
 * @FilePath: /nosgram/src/views/Home/components/ArticlePhotos/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="img-container">
    <viewer
      class="viewer-container"
      :options="options"
      v-if="!damaged && imgUrl"
      :images="imgUrl"
    >
      <img
        :style="`width: ${imgWidth};height: ${imgHeight};object-fit: ${objectFit}`"
        :src="imgUrl"
        alt="img"
      />
    </viewer>
    <el-skeleton class="full-height" v-else>
      <template #template>
        <el-skeleton-item class="full-height-important" variant="image" />
      </template>
    </el-skeleton>
  </div>
</template>

<script lang="ts">
import { Vue, prop, Options } from "vue-class-component";
import { Watch } from "vue-property-decorator";
import "viewerjs/dist/viewer.css";
import { component as Viewer } from "v-viewer";

class ArticlePhotosProps {
  data = prop<string>({ required: true, default: "" });
  imgWidth = prop<string>({ required: false, default: "initial" });
  imgHeight = prop<string>({ required: false, default: "100%" });
  objectFit = prop<string>({ required: false, default: "contain" });
}
// @Options({
//   watch: {
//     data() {
//       this.damaged = false;
//       this.imgUrl = "";
//       this._setImg();
//     },
//   },
// })
@Options({
  components: {
    Viewer,
  },
})
export default class ArticlePhotos extends Vue.with(ArticlePhotosProps) {
  damaged = true;
  imgUrl = "";
  options = {
    toolbar: false,
    navbar: false,
    zIndex: 2040,
  };
  @Watch("data")
  onDataChanged() {
    this.damaged = false;
    this.imgUrl = "";
    this._setImg();
  }
  mounted() {
    this._setImg();
  }
  _setImg() {
    const img = new Image(); // 生成一个Image对象
    img.src = this.data;
    img.onload = () => {
      this.damaged = false;
      this.imgUrl = this.data;
    };
  }
}
</script>

<style lang="scss" scoped>
.viewer-container {
  width: 100%;
  height: 100%;
}
.img-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
}
</style>
