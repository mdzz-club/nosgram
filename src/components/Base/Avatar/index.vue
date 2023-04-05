<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-17 09:39:06
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-04-04 13:23:11
 * @FilePath: /nosgram/src/components/Base/avatar.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="avatar-container" :style="`align-self: ${alignSelf}`">
    <avatar
      class="avatar-icon"
      v-if="!author.icon"
      :size="width"
      :name="author.iconName"
      :color="['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']"
    />
    <img
      v-else
      :style="`width: ${width}px;height: ${height}px`"
      :src="(author.icon as string)"
      alt="icon"
    />
    <slot />
  </div>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import { getAuthor } from "@/common/js/nostr-tools/index";
import type { AvatarSource } from "./Avatar.d";
import Avatar from "vue-boring-avatars";
import { Author } from "@/common/js/nostr-tools/nostr-tools.d";

@Options({
  components: {
    Avatar,
  },
})
export default class AvatarComponent extends Vue {
  @Prop({ default: {} }) source!: AvatarSource;
  @Prop({ default: 35 }) width!: number | string;
  @Prop({ default: 35 }) height!: number | string;
  @Prop({ default: "middle" }) verticalAlign!: string;
  @Prop({ default: "client_userInfo" }) userInfoKey!: string;
  get author() {
    return getAuthor(this.source as Author, this.userInfoKey);
  }
  get alignSelf() {
    return { middle: "center", bottom: "self-end", top: "self-start" }[
      this.verticalAlign
    ];
  }
}
</script>

<style lang="scss" scoped>
.avatar {
  &-container {
    display: flex;
    justify-items: center;
    align-items: center;
    position: relative;
    svg,
    img {
      border-radius: 100%;
    }
  }
}
</style>
