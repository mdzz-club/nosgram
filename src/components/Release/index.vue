<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-17 09:39:06
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-04-15 23:11:14
 * @FilePath: /nosgram/src/components/Base/avatar.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <el-dialog
    class="release-dialog"
    close-on-click-modal
    close-on-press-escape
    align-center
    @close="_reset"
    v-model="show"
    append-to-body
  >
    <div class="release-dialog-content">
      <h3 class="release-dialog-title align-center">
        {{ forwardData ? "转发" : "发布" }}内容
      </h3>
      <el-upload
        v-show="media"
        class="release-dialog-upload margin-bottom-10"
        :class="{ 'hide-upload': file?.length > 4 }"
        v-model:file-list="file"
        :http-request="_uploadFile"
        list-type="picture-card"
        accept="video/*, image/*"
        :limit="5"
        :before-upload="_handleBeforeUpload"
        :on-preview="_handlePictureCardPreview"
        :on-remove="_handleRemove"
      >
        <div class="align-center">
          <el-icon size="30">
            <icon-ion-md-add-circle-outline />
          </el-icon>
          <p class="release-dialog-upload-p">新增相片/视频</p>
        </div>
        <template #file="{ file }">
          <article-video
            v-if="/mp4|avi|mov|wmv|webm/.test(file.name)"
            :data="file.url"
          />
          <article-photos
            v-if="/jpeg|png|jpg|webp|gif/.test(file.name)"
            :data="file.url"
          />
          <span class="el-upload-list__item-actions">
            <span
              class="el-upload-list__item-preview"
              @click="_handlePictureCardPreview(file)"
            >
              <el-icon><icon-majesticons-zoom-in-line /></el-icon>
            </span>
            <span
              v-if="!disabled"
              class="el-upload-list__item-delete"
              @click="_handleRemove(file)"
            >
              <el-icon><icon-majesticons-trash-line /></el-icon>
            </span>
          </span>
        </template>
      </el-upload>

      <div class="full-width margin-bottom-10">
        <chat-input-box
          emojiHeight="200px"
          :allowedBlank="true"
          :sendButton="false"
          :emojiButton="false"
          :verticalCenter="false"
          ref="chat-input-box"
          placeholder="说点什么吧..."
          @submit="_hanldeSubmit"
          @interaction-input="_handleInteractionInput"
        />
      </div>
      <div class="forward-container" v-if="forwardData">
        <el-icon size="30"><icon-ion-return-down-forward /></el-icon>
        <article-forward
          :noClick="true"
          class="forward-component"
          :source="forwardDataSource"
        />
      </div>
      <div
        class="position-relative full-width display-flex justify-between align-items-center"
      >
        <div class="display-flex align-items-center">
          <el-button link @click="$refs['chat-input-box'].toggle()"
            ><el-icon size="30"><icon-ion-happy-outline /></el-icon
          ></el-button>
          <el-button link @click="media = !media"
            ><el-icon size="30"><icon-ion-md-photos /></el-icon
          ></el-button>
        </div>
        <div>
          <el-button
            type="primary"
            :disabled="_disabled"
            @click="_toggle(false)"
            >取消</el-button
          >
          <el-button type="primary" :disabled="_disabled" @click="_release"
            >发布</el-button
          >
        </div>
      </div>
    </div>
  </el-dialog>

  <!-- <el-dialog v-model="detailsVisible" align-center>
    <div
      class="display-flex justify-center align-items-center release-dialog-details"
    >
      <article-video v-if="detailsType === 'video'" :data="detailsUrl" />
      <article-photos v-if="detailsType === 'photo'" :data="detailsUrl" />
    </div>
  </el-dialog> -->
</template>

<script lang="ts">
import { Options, mixins } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import ChatInputBoxMixins from "@/mixins/ChatInputBoxMixins";
import type { UploadRawFile, UploadProps, UploadUserFile } from "element-plus";
import { ElMessage } from "element-plus";
import "element-plus/es/components/message/style/css";
import ArticleVideo from "@/components/ArticleVideo/index.vue";
import ArticlePhotos from "@/components/ArticlePhotos/index.vue";
import ArticleForward from "@/components/ArticleForward/index.vue";
import { loginModule } from "@/store/modules/login";
// import type { UserInfo } from "@/store/modules/login";
import { finishEvent } from "nostr-tools";
import { processingContent } from "@/common/js/nostr-tools/index";
import { setInteraction } from "@/common/js/nostr-tools";
import type {
  Client_tags,
  // Client_userInfo,
  mapOriginDataResult,
} from "@/common/js/nostr-tools/nostr-tools.d";
import "viewerjs/dist/viewer.css";
import { api as viewerApi } from "v-viewer";

interface Client_forward extends mapOriginDataResult {
  client_forward?: mapOriginDataResult;
  // client_userInfo?: UserInfo;
}

@Options({
  components: {
    ArticleVideo,
    ArticlePhotos,
    ArticleForward,
  },
})
export default class Release extends mixins(ChatInputBoxMixins) {
  @Prop({ default: null }) forwardData!: mapOriginDataResult;
  show = false;
  media = false;
  file: (UploadUserFile & { client_url: string; loading?: boolean })[] = [];
  // detailsVisible = false;
  // detailsUrl = "";
  // detailsType = "";
  get _disabled() {
    let result = false;
    this.file.some((e) => {
      if (e.loading) {
        result = true;
        return true;
      } else return false;
    });
    return result;
  }
  get forwardDataSource() {
    const source = this.forwardData || {};
    return { client_forward: source };
  }
  _reset() {
    this.file = [];
    // this.detailsVisible = false;
    // this.detailsUrl = "";
    // this.detailsType = "";
    this.$refs["chat-input-box"]._clear();
  }
  _isNull() {
    const content = this.$refs["chat-input-box"].getContent();
    return !this.file.length && !content.length && !this.forwardData;
  }
  _release() {
    this.$refs["chat-input-box"].submit();
  }
  async _hanldeSubmit(
    params: Record<string, string | (string | Record<string, string>)[][]>
  ) {
    const { tags } = params;
    if (this._isNull()) return ElMessage.warning("说点什么吧...");
    const { privateKey } = loginModule.userInfo;
    const temp = this._getReleaseForm(params);
    if (this.file.length && this.media)
      temp.content += ` ${this.file.map((e) => e.client_url).join("/n")}`;
    // 添加转发内容
    if (this.forwardData) {
      const { id } = this.forwardData;
      const { tags } = temp;
      const forwardIndex = tags.length;
      temp.content += `#[${forwardIndex}]`;
      temp.tags.push(["e", id]);
    }
    const form = finishEvent(
      {
        kind: 1,
        ...temp,
        created_at: ~~(Date.now() / 1000),
      },
      privateKey as string
    );
    const emitForm = [
      {
        ...form,
        ...processingContent(temp.content),
        client_tags: {} as Record<string, Client_tags | string>,
        client_userInfo: {},
      },
    ];
    setInteraction(emitForm); // 设置互动信息
    // client_userInfo: loginModule.userInfo
    const { details } = loginModule.userInfo || {};
    if (details) emitForm[0].client_userInfo = details;
    // 返显前端at信息
    const item = emitForm[0].client_tags;
    const keys = Object.keys(item);
    if (this.forwardData)
      (emitForm[0].client_tags[keys[0]] as Client_forward).client_forward =
        this.forwardData;
    keys.forEach((key) => {
      (tags as (string | Record<string, string>)[][]).some((element) => {
        if (element[1] === (item[key] as Client_tags).id && element[3]) {
          const obj = element[3] as Record<string, string>;
          (item[key] as Client_tags).content = {
            ...obj,
            name: obj.key,
          };
          return true;
        } else return false;
      });
    });
    this.$emit("success", emitForm[0]);
    await this._sendEvent(form);
    this._reset();
    this.show = false;
    this.media = false;
  }
  async _uploadFile(params: UploadProps) {
    const { file } = params;
    const { name, type, uid } = file;
    let res: null | Record<string, string> = null;
    const fileName = `file.${name.split(".")[1]}`;
    this.file.some((e) => {
      if (e.uid === uid) {
        e.loading = true;
        return true;
      } else return false;
    });
    try {
      res = await this.$http({
        method: "post",
        url: `https://media-uploader.orzv.workers.dev/${fileName}`,
        data: file,
        headers: {
          "x-filename": fileName,
          "x-mimetype": type,
        },
      });
    } catch (e) {
      console.log("catch：", e);
    }
    this.file.some((e) => {
      if (e.uid === uid) {
        if (res) e.client_url = res.data;
        e.loading = false;
        return true;
      } else return false;
    });
    if (!res) {
      ElMessage.error(`文件：${name}上传失败，请稍后重试`);
      this._handleRemove(file);
    }
  }
  _handlePictureCardPreview(file: Record<string, string>) {
    // if (/mp4|avi|mov|wmv|webm/.test(file.name)) this.detailsType = "video";
    // else if (/jpeg|png|jpg|webp|gif/.test(file.name))
    //   this.detailsType = "photo";
    // this.detailsVisible = true;
    // this.detailsUrl = file.url;
    viewerApi({
      images: [file.url],
      options: {
        toolbar: false,
        navbar: false,
        zIndex: 2100,
      },
    });
    // to do需要单独做视频的预览
  }
  _handleRemove(file: UploadRawFile) {
    const { uid } = file;
    this.file.some((e, i) => {
      if (e.uid === uid) {
        this.file.splice(i, 1);
        return true;
      } else return false;
    });
  }
  _handleBeforeUpload(params: UploadRawFile & { loading: boolean }) {
    const { size } = params;
    if (size / 1024 / 1024 > 10) {
      ElMessage.warning("请上传少于10M的文件");
      return false;
    }
    params.loading = true;
  }
  _toggle(params: boolean | number) {
    if (typeof params === "boolean") {
      this.show = params;
      this.media = false;
    } else {
      this.show = true;
      this.media = true;
    }
  }
}
</script>
<style lang="scss" scoped>
.forward {
  &-container {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    .el-icon {
      color: rgb(var(--second-color));
      border: solid 2px rgb(var(--second-color));
      border-radius: 100%;
      width: 40px;
      height: 40px;
      margin-right: 20px;
    }
  }
  &-component {
    width: calc(100% - 60px);
  }
}
</style>
<style lang="scss">
.release-dialog {
  .input-box,
  .chat-input-box {
    border-radius: 0 !important;
  }
  .chat-input-box {
    height: 150px;
    .input-box {
      font-size: 18px !important;
      height: 100% !important;
      max-height: 100% !important;
      &:focus {
        max-height: 100% !important;
      }
    }
  }
  // &-details {
  //   height: var(--release-dialog-details-height);
  // }
  &-upload {
    --release-dialog-upload-picture-card-size: 110px;
    .el-upload-list__item,
    .el-upload--picture-card {
      width: var(--release-dialog-upload-picture-card-size);
      height: var(--release-dialog-upload-picture-card-size);
    }
    &-p {
      font-size: 14px;
    }
    &.hide-upload {
      .el-upload {
        display: none;
      }
    }
  }
  &-title {
    font-size: 26px;
    margin-bottom: 10px;
    padding: 0 0 30px 0;
    line-height: 1em;
    // border-bottom: solid 1px rgb(var(--border-color));
  }
  &-content {
    width: 100%;
    height: 100%;
    background: white;
    border-radius: 5px;
    padding: 20px;
  }
  &.el-dialog {
    width: var(--release-dialog-width);
    // height: var(--release-dialog-height);
    background: transparent;
    box-shadow: none;
    .el-dialog__header,
    .el-dialog__headerbtn {
      display: none;
    }
    .el-dialog__body {
      padding: 0;
      height: 100%;
      width: 100%;
    }
  }
}
@media screen and (max-width: 480px) {
  .release-dialog {
    .chat-input-box {
      height: 100px;
    }
    &-upload {
      --release-dialog-upload-picture-card-size: 80px;
      &-p {
        font-size: 12px;
      }
    }
    &-title {
      padding: 0 0 5px 0;
    }
    &-content {
      border-radius: 0px;
      padding: 10px;
    }
    &.el-dialog {
      width: 100%;
      height: 100%;
      max-height: 100%;
      max-width: 100%;
    }
  }
}
</style>
