<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-28 18:39:26
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-19 16:18:36
 * @FilePath: /nosgram/src/views/Home/components/ArticleForward/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <!-- 普通文本 -->
  <div
    v-if="!source?.client_richTextIndex"
    class="article-content"
    v-dompurify-html="articleContent"
    ref="article-content"
  ></div>
  <!-- 富文本内容输出 -->
  <div v-else class="article-content" ref="article-content">
    <template
      v-for="(item, index) in source.client_richTextContent"
      :key="index"
    >
      <div
        v-if="typeof item === 'string'"
        class="display-inline-block"
        v-dompurify-html="item"
      ></div>
      <template v-else>
        <a>
          {{ _getRichText(source, item) }}
        </a>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import type {
  Client_tags,
  Client_userInfo,
  mapOriginDataResult,
} from "@/common/js/nostr-tools/nostr-tools.d";
import { getAuthorIdName } from "@/common/js/nostr-tools/index";

interface Source extends mapOriginDataResult {
  created_at?: number;
  client_userInfo?: Client_userInfo;
}

export default class ArticleForward extends Vue {
  @Prop({ default: {} }) source!: Source;
  mounted() {
    setTimeout(() => {
      // 向上emit出innertext内容
      this.$emit("client-innerText", this.$refs["article-content"].innerText);
    }, 0);
  }
  _getRichText(source: Source, item: Record<string, string>) {
    if (!source.client_tags) return item.index;
    const { type, content, id, tagsIndex } = source.client_tags?.[
      item.index
    ] as Client_tags;
    let result = "";
    if (type === "user") {
      if (content)
        result = content.display_name || content.displayName || content.name;
      else result = getAuthorIdName(id);
      result = `@${result}`;
    } else if (type === "topic") {
      result = `#${
        (source.tags as string[][])[parseInt(tagsIndex as string)][1]
      }`;
    }
    return result;
  }
  get articleContent() {
    return this.source?.content ? this.source?.content : "";
  }
}
</script>

<style lang="scss" scoped>
.article {
  &-content {
    padding: 10px 10px 0px 10px;
    font-size: rgb(var(--article-size));
    word-break: break-all;
    overflow: hidden;
    line-height: 1.5em;
    a {
      cursor: pointer;
      color: rgb(var(--link-font-color));
    }
  }
}
</style>
