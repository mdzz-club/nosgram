<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-28 13:30:59
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-01 13:17:04
 * @FilePath: /nosgram/src/views/Home/components/ArticleSkeleton/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="skeleton">
    <el-skeleton animated>
      <template #template>
        <el-skeleton-item
          variant="image"
          class="skeleton-header-image margin-bottom-20"
        />
        <el-skeleton :rows="2" />
        <el-skeleton>
          <template #template>
            <div class="display-flex skeleton-header margin-bottom-10">
              <el-skeleton-item class="skeleton-header-icon" variant="circle" />
              <el-skeleton class="skeleton-header-title" :rows="1" />
            </div>
          </template>
        </el-skeleton>
      </template>
    </el-skeleton>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";

export default class ArticleSkeleton extends Vue {}
</script>

<style lang="scss" scoped>
.skeleton {
  width: var(--content_width);

  &-header {
    padding-top: 20px;
    &-icon {
      --el-skeleton-circle-size: 42px;
      margin-right: 10px;
    }
    &-title {
      width: calc(100% - 100px);
    }
    &-image {
      width: 100%;
      height: 480px;
    }
  }
}
</style>
