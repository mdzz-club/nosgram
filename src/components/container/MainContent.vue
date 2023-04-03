<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-25 13:19:44
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-29 16:41:53
 * @FilePath: /nosgram/src/components/container/MainContent.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <section>
    <main>
      <slot />
    </main>
  </section>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";

export default class MainContent extends Vue {}
</script>

<style lang="scss" scoped>
section,
main {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
