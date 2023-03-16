<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-14 21:07:02
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-15 16:55:23
 * @FilePath: /nosgram/src/components/ChatInputBox/Interaction/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div
    class="interaction-container"
    ref="interaction-container"
    :style="`height: ${height}`"
  >
    <div class="list">
      <div
        class="list-item"
        @click="emit(item, i)"
        :key="i"
        v-for="(item, i) in data"
      >
        <avatar
          :size="30"
          :name="item[props.value as string]"
          :color="['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']"
        />
        <span>{{ item[props.key as string] }}</span>
      </div>
    </div>
    <div class="empty" v-show="!data.length && loading !== true">
      {{ empty }}
    </div>
    <div class="loading-container" v-show="loading">
      <loading />
    </div>
  </div>
</template>

<script lang="ts">
import Avatar from "vue-boring-avatars";
import { Vue, Options } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import Loading from "@/components/loading/index.vue";
@Options({
  components: {
    Loading,
    Avatar,
  },
})
export default class Interaction extends Vue {
  @Prop({ default: "150px" }) height!: string;
  @Prop({ default: "暂无数据" }) empty!: string;
  @Prop({ default: [] }) data!: Record<string, string | number>[];
  @Prop({ default: { key: "key", value: "value" } }) props!: Record<
    string,
    string
  >;
  loading = false;
  mounted() {
    setTimeout(() => {
      document.addEventListener("click", this.clickExternal);
    }, 0);
  }
  setLoading(status: boolean) {
    this.loading = status;
  }
  clickExternal(e: Event) {
    if (!this.$refs["interaction-container"].contains(e.target)) {
      this.$emit("interaction-click-external", e);
    }
  }
  emit(params: Record<string, string | number>, index: number) {
    this.$emit("item-click", { params, index });
  }
  unmounted() {
    document.removeEventListener("click", this.clickExternal);
  }
}
</script>

<style lang="scss" scoped>
.interaction-container {
  width: 200px;
  background: white;
  box-shadow: var(--dialog-box-shadow);
  overflow-y: scroll;
  .empty,
  .loading-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .list {
    width: 100%;
    &-item {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 10px;
      & > span {
        display: inline-block;
        font-size: 14px;
        font-weight: bold;
        padding-left: 10px;
        width: calc(100% - 30px);
      }
      &:hover {
        background: rgba(0, 0, 0, 0.05);
      }
    }
  }
}
</style>
