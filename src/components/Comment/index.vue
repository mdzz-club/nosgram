<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-10 09:33:47
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-19 20:19:06
 * @FilePath: /nosgram/src/components/comment/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="comment" v-for="(item, sourceIndex) in source" :key="item.id">
    <author-info
      avatarVerticalAlign="top"
      padding="0"
      :source="item"
      avatarWidth="35"
      avatarHeight="35"
    >
      <div class="comment-content">
        <div class="position-relative padding-right-20">
          <article-html :source="item" />
          <el-button
            v-if="item.client_moreComment !== -1"
            :disabled="item.client_moreComment === 2"
            @click="_emit(item, sourceIndex)"
            class="comment-button"
            link
            >{{ _moreCommentButton(item) }}</el-button
          >
          <div class="like-container">
            <!-- <el-button link>
              <el-icon size="14"><icon-majesticons-thumb-up-line /></el-icon>
            </el-button> -->
            <button-group size="14px" :source="item" :buttons="['good']" />
          </div>
        </div>
        <div v-show="item.client_moreComment === 1">
          <Comment
            v-if="item.client_children"
            :emit="emit"
            :source="item.client_children"
            :indexComment="`${
              indexComment ? `${indexComment}-` : ''
            }${sourceIndex}`"
          />
        </div>
      </div>
    </author-info>
  </div>
</template>

<script lang="ts">
import Avatar from "vue-boring-avatars";
import { Vue, prop, Options } from "vue-class-component";
import ArticleHtml from "../ArticleHtml/index.vue";
import {
  mapOriginDataResult,
  Client_userInfo,
  Client_tags,
  Author,
} from "@/common/js/nostr-tools/nostr-tools.d";
import {
  getAuthor,
  resetTime,
  getAuthorIdName,
} from "@/common/js/nostr-tools/index";
import ButtonGroup from "../Base/ButtonGroup/index.vue";
import { AuthorInfo } from "@/components/Base/index";

enum Client_moreComment {
  remove = -1, // 移除查看回复按钮
  hide = 0, // 折叠回复
  undefined = 0, // 折叠回复
  expansion = 1, // 展开回复按钮
  loading = 2, // loading状态 disabled
}

interface Source extends mapOriginDataResult {
  created_at?: number;
  client_userInfo?: Client_userInfo;
  client_fn_details: (params: any) => void;
  client_moreComment: Client_moreComment;
  client_children?: Source[];
}

class CommentProps {
  indexComment = prop<number>({ required: false, default: null });
  source = prop<Source[]>({ required: false, default: [] });
  emit = prop<(params: Source, index: number | null) => void>({
    require: false,
    default: undefined,
  });
}
@Options({
  name: "Comment",
  components: {
    Avatar,
    ArticleHtml,
    AuthorInfo,
  },
})
export default class Comment extends Vue.with(CommentProps) {
  _moreCommentButton(item: Source) {
    if (
      item.client_moreComment === Client_moreComment.hide ||
      item.client_moreComment === undefined
    )
      return "查看回复";
    else if (item.client_moreComment === 2) return "加载中...";
    else return "隐藏回复";
  }
  _emit(params: Source, index: number) {
    if (params.client_moreComment === Client_moreComment.loading) return;
    else if (params.client_moreComment === Client_moreComment.expansion) {
      params.client_moreComment = Client_moreComment.hide;
      return;
    } else if (params.client_moreComment === Client_moreComment.hide) {
      params.client_moreComment = Client_moreComment.expansion;
      return;
    }
    params.client_moreComment = Client_moreComment.loading;
    this.emit(
      params,
      `${this.indexComment ? `${this.indexComment}-` : ""}${index}`
    );
  }
  _author(item: Author) {
    return getAuthor(item);
  }
  _createdTime(item: number) {
    return resetTime(item);
  }
  _articleContent(item: Source) {
    return item?.content ? item.content : "";
  }
  _getRichText(source: Source, item: Record<string, string>) {
    if (!source?.client_tags?.[item.index]) return item.index;
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
}
</script>

<style lang="scss" scoped>
.like-container {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.comment {
  padding-top: 20px;
  &-content {
    width: 100%;
    .article-content {
      padding: 10px 10px 0px 10px;
      font-size: rgb(var(--article-size));
      word-break: break-all;
      overflow: hidden;
      a {
        cursor: pointer;
        color: rgb(var(--link-font-color));
      }
    }
  }
  display: flex;
  .name,
  .logo {
    margin-right: 12px;
    & > img {
      width: 35px;
      height: 35px;
      border-radius: 100%;
    }
  }

  .name {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    line-height: 1em;
    width: 100%;
  }

  .logo {
    display: flex;
    justify-items: center;
  }

  &-button {
    margin-top: 20px;
    font-size: 12px;
    font-weight: bold;
    color: rgb(var(--second-color));
  }
}
</style>
