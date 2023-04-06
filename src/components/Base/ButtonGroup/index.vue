<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-18 16:49:52
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-04-06 21:18:55
 * @FilePath: /nosgram/src/components/Base/ButtonGroup/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <el-button
    class="position-relative"
    :class="{ [`margin-left-${spacing}-important`]: i !== 0 }"
    link
    v-for="(item, i) in buttonsViewData"
    :key="i"
    :disabled="item.disabled || item.loading"
    @click="emit(item.type as string)"
  >
    <loading :size="`${size}px`" class="loading" v-if="item.loading" />
    <el-icon :size="size" :class="{ hide: item.loading }">
      <icon-majesticons-thumb-up-line
        v-if="item.type === 'good' && !source.client_like"
      />
      <icon-majesticons-thumb-up
        v-else-if="item.type === 'good' && source.client_like"
      />
      <icon-ion-heart-outline
        v-if="item.type === 'like' && !source.client_like"
      />
      <icon-ion-heart-sharp
        v-else-if="item.type === 'like' && source.client_like"
      />
      <icon-ion-chatbubble-ellipses-outline v-if="item.type === 'comment'" />
      <icon-ion-arrow-redo-outline v-else-if="item.type === 'forward'" />
      <icon-ion-duplicate-outline
        v-else-if="item.type === 'collect'"
      /> </el-icon
  ></el-button>
  <release
    :forwardData="source"
    @success="_handleReleaseSuccess"
    ref="release-dialog"
  />
</template>

<script lang="ts">
import { mixins, Options } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import NostrToolsMixins from "@/mixins/NostrToolsMixins";
import Loading from "@/components/loading/index.vue";
import { finishEvent } from "nostr-tools";
import type { EventTemplate } from "nostr-tools";
import { loginModule } from "@/store/modules/login";
import Release from "@/components/Release/index.vue";

interface Source {
  id: string;
  pubkey: string;
  client_like?: boolean;
  client_likeId?: string;
}

@Options({
  components: {
    Loading,
    Release,
  },
})
export default class ButtonGroup extends mixins(NostrToolsMixins) {
  // buttons：comment/like/good/forward/collect
  @Prop({ default: ["comment", "like", "forward"] }) buttons!:
    | string[]
    | Record<string, string | boolean>[];
  @Prop({ default: "20" }) size!: string;
  @Prop({ default: "5" }) spacing!: string;
  @Prop({ default: {} }) source!: Source;
  @Prop({ default: true }) autoLike!: boolean;
  show = false;
  like = false;
  timeout: Record<string, undefined | number> = {};
  loading: Record<string, boolean> = {};
  mounted() {
    this.setLike();
  }
  setLike() {
    if (this.source.client_likeId) this.source.client_like = true;
    else this.source.client_like = false;
  }
  getLikeReq(params: {
    id: string;
    pubkey: string;
    client_likeId?: string;
    privateKey?: string;
  }): EventTemplate & {
    id: string;
    sig: string;
  } {
    const { id, pubkey, client_likeId, privateKey } = params;
    return finishEvent(
      this.source.client_like
        ? {
            kind: 7,
            content: "+",
            created_at: ~~(Date.now() / 1000),
            tags: [
              ["e", id],
              ["p", pubkey],
            ],
          }
        : {
            kind: 5,
            content: "cancel",
            created_at: ~~(Date.now() / 1000),
            tags: [["e", client_likeId as string]],
          },
      privateKey as string
    );
  }
  _handleReleaseSuccess(params: EventTemplate) {
    this.$emit("forward-click", params);
  }
  async handleLike(type: string) {
    const { id, pubkey, client_likeId, client_like } = this.source;
    this.source.client_like = !client_like;
    const { privateKey } = loginModule.userInfo;
    const req = this.getLikeReq({ id, pubkey, client_likeId, privateKey });
    // 回填新增的点赞事件
    if (this.source.client_like) this.source.client_likeId = req.id;
    await this._sendEvent(req);
    this.$emit(`${type}-click`);
  }
  async emit(type: string) {
    if (
      (type === "like" ||
        type === "good" ||
        type === "forward" ||
        type === "collect") &&
      !loginModule.isLogin
    ) {
      loginModule.toggle();
      return;
    }
    // const { id, pubkey, client_like, client_likeId } = this.source;
    if (this.autoLike && (type === "like" || type === "good"))
      return this.handleLike(type);
    else if (type === "forward")
      return this.$refs["release-dialog"]._toggle(true);
    this.$emit(`${type}-click`);
  }
  get buttonsViewData() {
    const result = this.buttons.map((e) => {
      if (typeof e === "string") {
        return { type: e, disabled: false };
      } else {
        return e;
      }
    });
    return result;
  }
}
</script>

<style lang="scss" scoped>
.hide {
  // visibility: hidden;
  opacity: 0.5;
}

.loading {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
}
</style>
