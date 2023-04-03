<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-17 09:39:06
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-30 22:02:38
 * @FilePath: /nosgram/src/components/Base/avatar.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="release-container">
    <div class="release-input" @click="_emit(true)">
      {{ author.author }}，说点什么吧...
    </div>
    <div class="release-button-group">
      <div class="release-button" @click="_emit(1)">
        <el-icon size="24"><icon-ion-md-photos /></el-icon>相片/影片
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";
import { loginModule } from "@/store/modules/login";
import { getAuthor } from "@/common/js/nostr-tools/index";

@Options({})
export default class ArticleRelease extends Vue {
  _emit(params: boolean | number) {
    this.$emit("open-release", params);
  }
  get author() {
    const { userInfo } = loginModule;
    const obj = {
      ...(userInfo as Record<string, string>),
      pubkey: userInfo.publicKey as string,
    };
    return getAuthor(obj, "details");
  }
}
</script>
<style lang="scss" scoped>
.release {
  &-container {
    width: var(--content_width);
    transform: var(--content-transform);
    margin: auto auto 15px auto;
    border-radius: 5px;
    padding: 20px;
    // border: solid 1px rgb(var(--border-color));
    background: rgb(var(--article-bg-color));
    // margin-bottom: 15px;
    box-shadow: 0 1px 10px var(--container-box_shadow-clor);
  }
  &-button {
    width: 40%;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
    cursor: pointer;
    color: rgb(var(--first-color));
    font-size: 16px;
    .el-icon {
      margin-right: 10px;
    }
    &:hover {
      background: rgb(var(--bg-color));
    }
    &-group {
      display: flex;
    }
  }
  &-input {
    height: 40px;
    width: 100%;
    padding-left: 20px;
    border-radius: 25px;
    margin-bottom: 10px;
    display: flex;
    cursor: pointer;
    color: rgb(var(--second-color));
    font-size: 20px;
    align-items: center;
    background: rgb(var(--bg-color));
  }
}
</style>
