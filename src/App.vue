<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-24 17:04:18
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-02-28 14:51:08
 * @FilePath: /nosgram/src/App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <!-- <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </nav> -->
  <nav></nav>
  <div class="main-container">
    <sidebar />
    <main-content>
      <router-view v-slot="{ Component, route }">
        <keep-alive>
          <component :is="Component" :key="route.path" />
        </keep-alive>
      </router-view>
    </main-content>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Sidebar from "@/components/container/Sidebar/index.vue";

@Options({
  components: {
    Sidebar,
  },
})
export default class App extends Vue {}
</script>

<style lang="scss">
@import "~@/common/css/variable.css";
@import "~@/common/css/base.css";
@import "~@/common/css/cover-element.css";
@import "~@/common/css/common.scss";
</style>

<style lang="scss" scoped>
.main-container {
  display: flex;
  height: 100%;
}
</style>
