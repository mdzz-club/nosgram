<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-27 19:47:57
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-16 21:29:22
 * @FilePath: /nosgram/src/views/Home/components/Article/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <article v-if="!isLoadingItem" class="article full-width">
    <div class="article-top">
      <article-media :data="source" />
    </div>
    <div class="article-bottom">
      <article-html :source="source" />
      <!-- 转发 -->
      <template v-if="forward.length">
        <article-forward :key="i" v-for="(f, i) in forward" :source="f" />
      </template>
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
import ArticleForward from "../ArticleForward/index.vue";
import ArticleHtml from "../ArticleHtml/index.vue";
import Avatar from "vue-boring-avatars";
import Loading from "@/components/loading/index.vue";
import { getAuthor, resetTime } from "@/common/js/nostr-tools/index";
import type {
  Client_userInfo,
  Client_tags,
  mapOriginDataResult,
} from "@/common/js/nostr-tools/nostr-tools.d";
import { isPhone } from "@/common/js/common";

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
    ArticleHtml,
    ArticleForward,
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
  overflow: hidden;
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
    overflow: hidden;
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
