<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-17 09:39:06
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-20 20:05:40
 * @FilePath: /nosgram/src/components/Base/avatar.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="release-container">123</div>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";

@Options({})
export default class Release extends Vue {}
</script>

<style lang="scss" scoped>
.release-container {
  border-radius: 5px;
  padding: 10px;
  border: solid 1px rgb(var(--border-color));
  background: rgb(var(--article-bg-color));
  margin-bottom: 15px;
  box-shadow: 0 1px 2px var(--article-box_shadow-clor);
}
</style>
