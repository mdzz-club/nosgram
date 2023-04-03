<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-28 18:39:47
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-30 15:47:04
 * @FilePath: /nosgram/src/views/Home/components/ArticlePhotos/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="img-container">
    <img
      v-if="!damaged && imgUrl"
      :style="`width: ${imgWidth};height: ${imgHeight};object-fit: ${objectFit}`"
      :src="imgUrl"
      alt="img"
    />
    <el-skeleton class="full-height" v-else>
      <template #template>
        <el-skeleton-item class="full-height-important" variant="image" />
      </template>
    </el-skeleton>
  </div>
</template>

<script lang="ts">
import { Vue, prop } from "vue-class-component";
import { Watch } from "vue-property-decorator";

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
export default class ArticlePhotos extends Vue.with(ArticlePhotosProps) {
  damaged = true;
  imgUrl = "";
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
.img-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
}
</style>
