<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-04-29 19:55:41
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-04-30 22:13:06
 * @FilePath: /nosgram/src/components/container/NavBar/components/Search/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="search-container">
    <div
      class="search-input-container"
      @click="_switchMode(1)"
      :class="{ active: mode === 1 }"
    >
      <input
        ref="input"
        v-show="mode === 1"
        class="search-input"
        type="text"
        :placeholder="placeholder"
      />
      <el-icon size="18" color="rgb(150, 150, 150)">
        <icon-ion-search />
      </el-icon>
    </div>
    <div class="search-result"></div>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";

enum ModeEnum {
  "button",
  "inputting",
}

export default class Search extends Vue {
  @Prop({ default: "请输入" }) placeholder!: string;
  mode = ModeEnum.button;
  _switchMode(type: number) {
    this.mode = type;
    this.$nextTick(() => {
      if (type === 1) this.$refs.input.focus();
    });
  }
}
</script>

<style lang="scss" scoped>
.search {
  &-container {
  }
  &-input {
    width: 85%;
    margin-left: 10px;
    height: 95%;
    border: none;
    &-container {
      height: 32px;
      width: 32px;
      padding: 0 5px;
      border-radius: 100px;
      border: solid 1px rgb(150, 150, 150);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
      &.active {
        justify-content: space-between;
        border-radius: 25px;
        width: 220px;
      }
    }
  }
}
</style>
