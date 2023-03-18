<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-18 16:49:52
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-18 21:46:19
 * @FilePath: /nosgram/src/components/Base/ButtonGroup/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <el-button
    :class="{ [`margin-left-${spacing}-important`]: i !== 0 }"
    link
    v-for="(item, i) in button"
    :key="i"
    @click="emit(item)"
    ><el-icon :size="size">
      <icon-ion-heart-outline v-if="item === 'like' && !source.client_like" />
      <icon-ion-heart-sharp v-else-if="item === 'like' && source.client_like" />
      <icon-ion-chatbubble-ellipses-outline v-if="item === 'comment'" />
      <icon-ion-arrow-redo-outline v-else-if="item === 'forward'" />
      <icon-ion-duplicate-outline v-else-if="item === 'collect'" /> </el-icon
  ></el-button>
  <!-- <el-button link
    ><el-icon :size="size"><icon-ion-heart-outline /></el-icon
  ></el-button>
  <el-button link
    ><el-icon :size="size"><icon-ion-arrow-redo-outline /></el-icon
  ></el-button> -->
</template>

<script lang="ts">
import { mixins } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import NostrToolsMixins from "@/mixins/NostrToolsMixins";

interface Source {
  id: string;
  pubkey: string;
  client_like?: boolean;
  client_likeId?: string;
}

export default class ButtonGroup extends mixins(NostrToolsMixins) {
  @Prop({ default: ["comment", "like", "forward"] }) button!: string[];
  @Prop({ default: "20" }) size!: string;
  @Prop({ default: "5" }) spacing!: string;
  @Prop({ default: {} }) source!: Source;
  @Prop({ default: true }) autoLike!: boolean;
  like = false;
  mounted() {
    if (this.source.client_likeId) this.source.client_like = true;
  }
  async emit(type: string) {
    const { id, pubkey, client_like, client_likeId } = this.source;
    if (this.autoLike && type === "like") {
      this.source.client_like = !client_like;
      const res = await this._like(
        { id, pubkey, client_likeId },
        this.source.client_like
      );
      if (!res) this.source.client_like = !this.source.client_like;
    }
    this.$emit(`${type}-click`);
  }
}
</script>
