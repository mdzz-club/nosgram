<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-10 09:33:47
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-14 14:47:58
 * @FilePath: /nosgram/src/components/comment/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="comment" v-for="(item, sourceIndex) in source" :key="item.id">
    <div class="logo">
      <avatar
        v-if="!_author(item).icon"
        :size="35"
        :name="_author(item).iconName"
        :color="['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']"
      />
      <img v-else :src="(_author(item).icon as string)" alt="icon" />
    </div>
    <div class="full-width">
      <div class="name margin-bottom-5">
        <div>
          <el-button link>
            <span
              class="font-weight-600 margin-right-10 font-size-16 default-font-color"
              >{{ _author(item).author }}</span
            >
          </el-button>
          <span class="second-font-color font-weight-600 font-size-12">
            {{ _createdTime(item) }}
          </span>
        </div>
        <el-button link>
          <el-icon size="14"><icon-majesticons-thumb-up-line /></el-icon>
        </el-button>
      </div>
      <div class="comment-content">
        <article-html :source="item" />
        <!-- 查看更多评论按钮 -->
        <el-button
          v-if="item.client_moreComment !== -1"
          :disabled="item.client_moreComment === 2"
          @click="_emit(item, sourceIndex)"
          class="comment-button"
          link
          >{{ _moreCommentButton(item) }}</el-button
        >
        <!-- 回复的评论 -->
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
    </div>
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
} from "@/common/js/nostr-tools/nostr-tools.d";
import {
  getAuthor,
  resetTime,
  getAuthorIdName,
} from "@/common/js/nostr-tools/index";

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
  _author(item: Source) {
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
.comment {
  padding-top: 20px;
  &-content {
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
