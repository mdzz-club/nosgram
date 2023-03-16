<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-14 18:17:45
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-15 10:46:32
 * @FilePath: /nosgram/src/components/ChatInputBox/Emoji/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div
    class="emoji-container"
    ref="emoji-container"
    :style="`height: ${height}`"
  >
    <div class="emoji-group" v-for="(item, index) in data" :key="index">
      <p class="title">{{ item.type }}</p>
      <div class="list">
        <div
          @click="emit(emojiItem)"
          v-for="(emojiItem, i) in item.data"
          :key="i"
          class="list-item"
        >
          {{ emojiItem }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import emoji from "./emoji";
export default class ChatInputBox extends Vue {
  @Prop({ default: "300px" }) height!: string;
  data = emoji;
  mounted() {
    setTimeout(() => {
      document.addEventListener("click", this.clickExternal);
    }, 0);
  }
  emit(item: string) {
    this.$emit("emoji-click", item);
  }
  clickExternal(e: Event) {
    if (!this.$refs["emoji-container"].contains(e.target)) {
      this.$emit("emoji-click-external", e);
    }
  }
  unmounted() {
    document.removeEventListener("click", this.clickExternal);
  }
}
</script>

<style lang="scss" scoped>
.emoji-container {
  width: 300px;
  overflow-y: scroll;
  padding: 10px;
  background: white;
  box-shadow: var(--dialog-box-shadow);
  .emoji-group {
    & + .emoji-group {
      margin-top: 10px;
    }
    .title {
      font-weight: bold;
      font-size: 16px;
      margin-bottom: 10px;
    }
    .list {
      display: flex;
      width: 100%;
      flex-wrap: wrap;
      &-item {
        width: calc(100% / 7);
        display: flex;
        justify-content: center;
        align-items: center;
        height: 42px;
        font-size: 32px;
        cursor: pointer;
        transition: all 0.3s;
        &:hover {
          // background: rgba(0, 0, 0, 0.1);
          transform: scale(1.2);
        }
      }
    }
  }
}
</style>
