<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-17 10:34:08
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-04-06 19:08:09
 * @FilePath: /nosgram/src/components/Base/AuthorInfo/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="author-info-container" :style="`padding: ${padding};`">
    <div class="author-info-left">
      <avatar-component
        class="margin-right-10"
        :width="avatarWidth"
        :height="avatarHeight"
        :source="source"
        :verticalAlign="avatarVerticalAlign"
        :userInfoKey="userInfoKey"
      >
        <slot name="avatar" />
      </avatar-component>
      <div class="name">
        <div class="display-flex align-items-center">
          <el-button
            :class="{ 'cursor-default-important': nameNoClick }"
            @click="toUserPage"
            link
            v-if="showName"
          >
            <span
              class="font-weight-600 font-size-16 default-font-color name-omit"
              :style="`max-width: ${nameWidth};${
                nameColor ? `color: ${nameColor}` : ''
              }`"
              >{{ name || author.author }}</span
            >
          </el-button>
          <p
            class="second-font-color font-weight-600 font-size-12 margin-left-5"
            v-if="isShowCreateTime"
          >
            {{ createdTime }}
          </p>
          <slot name="name" />
        </div>
        <slot />
      </div>
    </div>
    <div class="author-info-right" v-if="slot.right">
      <slot name="right" />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Options, prop } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import { getAuthor, resetTime } from "@/common/js/nostr-tools/index";
import type { AuthorInfoSource } from "./AuthorInfo.d";
import AvatarComponent from "../Avatar/index.vue";
import { Author } from "@/common/js/nostr-tools/nostr-tools.d";

@Options({
  components: {
    AvatarComponent,
  },
})
export default class AuthorInfo extends Vue {
  @Prop({ default: {} }) source!: AuthorInfoSource;
  @Prop({ default: 35 }) avatarWidth!: number | string;
  @Prop({ default: 35 }) avatarHeight!: number | string;
  @Prop({ default: "middle" }) avatarVerticalAlign!: string;
  @Prop({ default: true }) isShowCreateTime!: boolean;
  @Prop({ default: "10px" }) padding!: string;
  @Prop({ default: "" }) name!: string;
  @Prop({ default: "" }) nameColor!: string;
  @Prop({ default: "80px" }) nameWidth!: string;
  @Prop({ default: false }) nameNoClick!: boolean;
  @Prop({ default: true }) showName!: boolean;
  @Prop({ default: "client_userInfo" }) userInfoKey!: string;
  slot: Record<string, unknown> = {};
  mounted() {
    this.slot = this.$slots;
  }
  toUserPage() {
    if (this.nameNoClick) return;
    this.$router.push({ name: "user", params: { id: this.source.pubkey } });
  }
  get author() {
    return getAuthor(this.source as Author, this.userInfoKey);
  }
  get createdTime() {
    return resetTime(this.source?.created_at);
  }
}
</script>

<style lang="scss" scoped>
.name-omit {
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: rgb(var(--first-color));
}
.author-info {
  &-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  &-right,
  &-left {
    display: flex;
    align-items: center;
  }
  &-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex: 1;
  }
  &-left {
    flex: 2;
    .name {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      flex-direction: column;
      line-height: 1em;
      width: 100%;
      img {
        width: 35px;
        height: 35px;
        border-radius: 100%;
      }
      .el-button {
        margin: 0;
        padding: 0;
      }
    }
  }
}
</style>
