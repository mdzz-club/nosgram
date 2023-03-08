<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-07 13:36:11
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-08 09:22:00
 * @FilePath: /nosgram/src/views/Home/components/AdditionalContentSkeleton/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="skeleton">
    <el-skeleton animated>
      <template #template>
        <el-skeleton>
          <template #template>
            <div class="display-flex skeleton-header margin-bottom-5">
              <el-skeleton-item class="skeleton-header-icon" variant="circle" />
              <el-skeleton class="skeleton-header-title" :rows="1" />
            </div>
            <div class="display-flex skeleton-header margin-bottom-5">
              <el-skeleton-item class="skeleton-header-icon" variant="circle" />
              <el-skeleton class="skeleton-header-title" :rows="1" />
            </div>
            <div class="display-flex skeleton-header margin-bottom-5">
              <el-skeleton-item class="skeleton-header-icon" variant="circle" />
              <el-skeleton class="skeleton-header-title" :rows="1" />
            </div>
            <div class="display-flex skeleton-header margin-bottom-5">
              <el-skeleton-item class="skeleton-header-icon" variant="circle" />
              <el-skeleton class="skeleton-header-title" :rows="1" />
            </div>
            <div class="display-flex skeleton-header margin-bottom-5">
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

export default class AdditionalContentSkeleton extends Vue {}
</script>

<style lang="scss" scoped>
.skeleton {
  width: 100%;

  &-header {
    width: 100%;
    padding-top: 20px;
    align-items: center;
    &-icon {
      --el-skeleton-circle-size: 42px;
      margin-right: 12px;
      width: 42px;
    }
    &-title {
      width: calc(100% - 42px);
    }
  }
}
</style>
