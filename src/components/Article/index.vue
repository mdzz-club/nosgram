<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-27 19:47:57
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-26 14:17:04
 * @FilePath: /nosgram/src/views/Home/components/Article/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="release-component" v-if="isReleaseItem">
    <article-release @open-release="_handleOpenRelease" />
  </div>
  <article v-if="!isLoadingItem && !isReleaseItem" class="article full-width">
    <div class="article-top">
      <article-media :data="source" />
    </div>
    <div class="article-bottom">
      <article-html :source="source" />
      <!-- 转发 -->
      <template v-if="forward.length">
        <article-forward :key="i" v-for="(f, i) in forward" :source="f" />
      </template>
      <!-- 用户信息 -->
      <author-info :source="source">
        <el-button class="margin-left-0-important" link type="primary">
          <span class="font-size-14">关注</span>
        </el-button>
        <template #right>
          <button-group
            :source="source"
            @comment-click="_emit('details-dialog', source)"
          />
        </template>
      </author-info>
    </div>
  </article>
  <div class="loading-container" v-if="isLoadingItem">
    <loading />
  </div>
</template>

<script lang="ts">
import { Vue, Options, prop } from "vue-class-component";
import ArticleVideo from "../ArticleVideo/index.vue";
import ArticleMedia from "../ArticleMedia/index.vue";
import ArticleForward from "../ArticleForward/index.vue";
import ArticleHtml from "../ArticleHtml/index.vue";
import Loading from "@/components/loading/index.vue";
import { AuthorInfo } from "@/components/Base/index";
import ButtonGroup from "@/components/Base/ButtonGroup/index.vue";
import type {
  Client_tags,
  mapOriginDataResult,
} from "@/common/js/nostr-tools/nostr-tools.d";
import { isPhone } from "@/common/js/common";
import ArticleRelease from "@/components/Release/index.vue";

interface Source extends mapOriginDataResult {
  client_fn_details: (params: any) => void;
  client_fn_release_dialog: (params: boolean | number) => void;
}

class ArticleProps {
  source = prop<Source>({ required: true, default: {} });
}

@Options({
  components: {
    ArticleVideo,
    ArticleMedia,
    Loading,
    ArticleHtml,
    ArticleForward,
    AuthorInfo,
    ButtonGroup,
    ArticleRelease,
  },
})
export default class Article extends Vue.with(ArticleProps) {
  _emit(type: string, data: Source) {
    if (isPhone()) {
      this.$router.push({
        name: "details",
        params: {
          id: data.id,
        },
      });
      return;
    }
    this.source.client_fn_details(data);
  }
  _handleOpenRelease(params: boolean | number) {
    this.source.client_fn_release_dialog(params);
  }
  get forward() {
    const result: Client_tags[] = [];
    const { client_tags } = this.source;
    if (!client_tags) return result;
    const keys = Object.keys(client_tags);
    keys.forEach((ele) => {
      if (client_tags[ele].type === "forward") result.push(client_tags[ele]);
    });
    return result;
  }
  get isLoadingItem() {
    return this.source.id === "client_virtualList_loading";
  }
  get isReleaseItem() {
    return this.source.id === "client_virtualList_release";
  }
}
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
