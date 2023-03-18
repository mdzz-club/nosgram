<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-03 21:31:17
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-17 19:37:10
 * @FilePath: /nosgram/src/components/loading/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="loading" :style="`width: ${size};height: ${size}`">
    <div class="loading-dot"></div>
    <div class="loading-dot"></div>
    <div class="loading-dot"></div>
    <div class="loading-dot"></div>
    <div class="loading-dot"></div>
    <div class="loading-dot"></div>
  </div>
</template>

<script lang="ts">
import { Vue, prop } from "vue-class-component";
class LoadingProp {
  size = prop<string>({ required: true, default: "40px" });
}
export default class Loading extends Vue.with(LoadingProp) {}
</script>

<style lang="css" scoped>
.loading {
  position: relative;
  animation: loading 2.5s infinite linear both;
}

.loading-dot {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  animation: loading-dot 2s infinite ease-in-out both;
}

.loading-dot:before {
  content: "";
  display: block;
  width: 25%;
  height: 25%;
  background-color: rgb(var(--loading-color));
  border-radius: 100%;
  animation: loading-dot-before 2s infinite ease-in-out both;
}

.loading-dot:nth-child(1) {
  animation-delay: -1.1s;
}
.loading-dot:nth-child(2) {
  animation-delay: -1s;
}
.loading-dot:nth-child(3) {
  animation-delay: -0.9s;
}
.loading-dot:nth-child(4) {
  animation-delay: -0.8s;
}
.loading-dot:nth-child(5) {
  animation-delay: -0.7s;
}
.loading-dot:nth-child(6) {
  animation-delay: -0.6s;
}
.loading-dot:nth-child(1):before {
  animation-delay: -1.1s;
}
.loading-dot:nth-child(2):before {
  animation-delay: -1s;
}
.loading-dot:nth-child(3):before {
  animation-delay: -0.9s;
}
.loading-dot:nth-child(4):before {
  animation-delay: -0.8s;
}
.loading-dot:nth-child(5):before {
  animation-delay: -0.7s;
}
.loading-dot:nth-child(6):before {
  animation-delay: -0.6s;
}

@keyframes loading {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes loading-dot {
  80%,
  100% {
    transform: rotate(360deg);
  }
}

@keyframes loading-dot-before {
  50% {
    transform: scale(0.4);
  }
  100%,
  0% {
    transform: scale(1);
  }
}
</style>
