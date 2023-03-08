<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-28 18:39:12
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-02 16:56:21
 * @FilePath: /nosgram/src/views/Home/components/ArticleLink/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <a :href="data" target="_blank">
    <div class="padding-10 link-container display-flex">
      <div class="link-left">
        <el-skeleton>
          <template #template>
            <el-skeleton-item
              variant="image"
              style="width: 100%; height: 80px"
            />
          </template>
        </el-skeleton>
      </div>
      <div class="link-right display-flex">
        <p>震惊！龙狗这么干颠覆锅100年，就因为。。。</p>
        <p class="describe">
          2023年2月28日，清晨。龙狗像往常一样前往日狗，当他..
        </p>
      </div>
    </div>
  </a>
</template>

<script lang="ts">
import { Vue, prop } from "vue-class-component";

class ArticleLinkProps {
  data = prop<string>({ required: true, default: "" });
}

export default class ArticleLink extends Vue.with(ArticleLinkProps) {}
</script>

<style lang="scss" scoped>
.link {
  &-container {
    padding: 10px;
    border: solid 1px rgb(var(--border-color));
    background: rgb(250, 250, 250);
    cursor: pointer;
    & + .link-container {
      margin-top: 10px;
    }
  }
  &-left {
    width: 80px;
    height: 80px;
    margin-right: 12px;
  }
  &-right {
    padding-top: 3px;
    padding-bottom: 5px;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
    color: rgb(var(--first-color));
    font-size: var(--first-font-size);

    .describe {
      color: rgb(var(--second-color));
    }
  }
}
</style>
