<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-27 19:47:57
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-08 15:13:44
 * @FilePath: /nosgram/src/views/Home/components/Article/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <article v-if="!isLoadingItem" class="article full-width">
    <div class="article-top">
      <article-media :data="source" />
    </div>
    <div class="article-bottom">
      <!-- 普通文本输出 -->
      <div
        v-if="!source?.client_richTextIndex"
        class="article-content"
        v-dompurify-html="articleContent"
      ></div>
      <!-- 富文本内容输出 -->
      <div v-else class="article-content">
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
      <div class="article-button_Group">
        <div class="article-button_Group-left">
          <div class="logo">
            <avatar
              v-if="!author.icon"
              :size="35"
              :name="author.iconName"
              :color="['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']"
            />
            <img v-else :src="(author.icon as string)" alt="icon" />
          </div>
          <div class="name">
            <el-button link>
              <span class="font-weight-600 font-size-16 default-font-color">{{
                author.author
              }}</span>
            </el-button>
            <el-button link type="primary">
              <span class="font-size-14">关注</span>
            </el-button>
          </div>
          <p class="second-font-color font-weight-600 font-size-12">
            {{ createdTime }}
          </p>
        </div>
        <div class="article-button_Group-right">
          <el-button link @click="_emit('details-dialog', source)"
            ><el-icon size="20"
              ><icon-ion-chatbubble-ellipses-outline /></el-icon
          ></el-button>
          <el-button link
            ><el-icon size="20"><icon-ion-heart-outline /></el-icon
          ></el-button>
          <el-button link
            ><el-icon size="20"><icon-ion-arrow-redo-outline /></el-icon
          ></el-button>
        </div>
      </div>
    </div>
  </article>
  <div class="loading-container" v-else>
    <loading />
  </div>
</template>

<script lang="ts">
import { Vue, Options, prop } from "vue-class-component";
import ArticleVideo from "../ArticleVideo/index.vue";
import ArticleMedia from "../ArticleMedia/index.vue";
import Avatar from "vue-boring-avatars";
import Loading from "@/components/loading/index.vue";
import {
  getAuthor,
  getAuthorIdName,
  resetTime,
} from "@/common/js/nostr-tools/index";
import type {
  Client_userInfo,
  Client_tags,
  mapOriginDataResult,
} from "@/common/js/nostr-tools/nostr-tools.d";

interface Source extends mapOriginDataResult {
  created_at?: number;
  client_userInfo?: Client_userInfo;
  client_fn_details: (params: any) => void;
}

class ArticleProps {
  source = prop<Source>({ required: true, default: {} });
}

@Options({
  components: {
    Avatar,
    ArticleVideo,
    ArticleMedia,
    Loading,
  },
})
export default class Article extends Vue.with(ArticleProps) {
  _emit(type: string, data: Source) {
    this.source.client_fn_details(data);
  }
  _getRichText(source: Source, item: Record<string, string>) {
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

  get isLoadingItem() {
    return this.source.id === "client_virtualList_loading";
  }

  get articleContent() {
    return this.source?.content ? this.source?.content : "";
  }

  get createdTime() {
    return resetTime(this.source?.created_at);
  }

  get author() {
    return getAuthor(this.source);
  }
}
</script>

<style scoped lang="scss">
.loading-container {
  width: var(--content_width);
  transform: var(--content-transform);
  margin: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.article {
  border: var(--content-border);
  border-radius: 3px;
  margin: auto auto 10px auto;
  width: var(--content_width);
  transform: var(--content-transform);
  &-top {
  }
  &-bottom {
  }
  &-content {
    padding: 10px 10px 0px 10px;
    font-size: rgb(var(--article-size));
    word-break: break-all;
    a {
      cursor: pointer;
      color: rgb(var(--link-font-color));
    }
  }
  &-button_Group {
    display: flex;
    justify-content: space-between;
    padding: 20px 10px 10px 10px;

    &-right,
    &-left {
      display: flex;
      align-items: center;
    }

    &-right {
      & > button + button {
        margin-left: 0px;
      }
    }

    &-left {
      .name,
      .logo {
        margin-right: 12px;
        img {
          width: 35px;
          height: 35px;
          border-radius: 100%;
        }
      }

      .name {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        flex-direction: column;
        line-height: 1em;
        .el-button {
          margin-left: 0;
        }
      }

      .logo {
        display: flex;
        justify-items: center;
        align-items: center;
      }
    }
  }
}
</style>
