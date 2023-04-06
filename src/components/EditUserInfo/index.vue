<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-29 11:59:50
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-04-05 19:05:48
 * @FilePath: /nosgram/src/views/User/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="user_info-dialog">
    <el-dialog
      close-on-click-modal
      close-on-press-escape
      align-center
      v-model="dialogShow"
      @open="handleOpen"
      @close="handleClose"
    >
      <div class="user_info-form">
        <el-tooltip
          :disabled="tipDisabled"
          content="更换banner"
          placement="bottom-end"
        >
          <el-upload
            class="banner-upload"
            accept="image/*"
            :show-file-list="false"
            :http-request="(file: UploadProps) => _uploadFile(file, 'banner')"
            :before-upload="(file: UploadRawFile) => _handleBeforeUpload(file)"
          >
            <!-- 点击任何图片类地址需要支持点击弹窗放大，支持拖拽 -->
            <img class="banner-img" :src="formBanner" alt="banner" />
            <el-icon class="banner-upload-icon" size="32">
              <icon-ion-settings-sharp />
            </el-icon>
          </el-upload>
        </el-tooltip>
        <el-tooltip
          :disabled="tipDisabled"
          content="更换头像"
          placement="right"
        >
          <el-upload
            class="avatar-upload"
            accept="image/*"
            :show-file-list="false"
            :http-request="(file: UploadProps) => _uploadFile(file, 'picture')"
            :before-upload="(file: UploadRawFile) => _handleBeforeUpload(file)"
          >
            <avatar-component
              class="avatar-upload-component"
              :width="70"
              :height="70"
              :source="formAvatar"
              :userInfoKey="form.picture ? 'content' : null"
            />
            <el-icon class="avatar-upload-icon" size="20">
              <icon-ion-settings-sharp />
            </el-icon>
          </el-upload>
        </el-tooltip>
        <div class="form-container">
          <el-form
            :label-position="formLabelPosition"
            label-width="100px"
            :model="form"
            style="max-width: 460px"
          >
            <el-form-item
              :label="formConfig[formView].label"
              :key="index"
              v-for="(formView, index) in formViewData"
            >
              <el-input
                :placeholder="formConfig[formView].placeholder"
                v-model="form[formView]"
              />
            </el-form-item>
          </el-form>
          <div class="align-center form-button-group">
            <el-button
              @click="$emit('update:show', false)"
              class="full-width"
              type="primary"
              >取消</el-button
            >
            <el-button
              :disabled="loading"
              class="full-width"
              type="primary"
              @click="_submit"
              >保存</el-button
            >
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { mixins, Options } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import NostrToolsMixins from "@/mixins/NostrToolsMixins";
import { mapOriginDataResult } from "@/common/js/nostr-tools/nostr-tools.d";
import AvatarComponent from "@/components/Base/Avatar/index.vue";
import { isPhone } from "@/common/js/common";
import type { UploadRawFile, UploadProps } from "element-plus";
import { ElMessage } from "element-plus";
import "element-plus/es/components/message/style/css";
import { getAuthorIdName } from "@/common/js/nostr-tools";
import { finishEvent } from "nostr-tools";
import { loginModule } from "@/store/modules/login";

interface FormConfig {
  label: string;
  placeholder?: string;
  valueType?: "string" | "number"; // 字段value类型
  valueKeys?: string[]; // 后端返回值回填的字段，默认用对象的form的属性名
  hide?: boolean; // 是否隐藏该字段的组件
}

@Options({
  components: {
    AvatarComponent,
  },
})
export default class EditUserInfo extends mixins(NostrToolsMixins) {
  @Prop({ default: false, required: true }) show!: boolean;
  @Prop({ default: {} }) source!: unknown;
  loading = false;
  dialogShow = false;
  formLabelPosition = isPhone() ? "top" : "right";
  isInitForm = false;
  bannerFile = [];
  avatarFile = [];
  form: Record<string, string | number> = {
    // name: "",
    // displayName: "",
    // aboutMe: "",
    // nip05: "",
    // lud16: "",
  };
  // form: Record<string, number | string> = {};
  get tipDisabled() {
    return isPhone();
  }
  get formConfig() {
    const { pubkey } = (this.source as mapOriginDataResult) || {};
    const { id } = this.$route?.params || {};
    const idName = getAuthorIdName(pubkey || id);
    // const { about, lud06, lud16 } = (content as Record<string, string>) || {};
    const result: Record<string, FormConfig> = {
      name: {
        label: "名称",
        placeholder: `您的名称，默认为您的公钥前+后四位（${idName}）`,
      },
      display_name: {
        label: "昵称",
        placeholder: `您的昵称，默认为您的公钥前+后四位（${idName}）`,
      },
      nip05: {
        label: "NIP-05",
        placeholder: "一个有效的NIP-05应为一个email格式",
      },
      lud16: {
        label: "闪电小费",
        placeholder: "闪电地址或LNURL",
        valueKeys: ["lud16", "lud06"],
      },
      about: { label: "关于我", placeholder: "写一句话认识我" },
      banner: { label: "banner", hide: true },
      picture: { label: "picture", hide: true },
    };
    return result;
  }
  get formBanner() {
    return this.form.banner || this.historyUserBanner;
  }
  get formAvatar() {
    const { pubkey: pkId } = (this.source as mapOriginDataResult) || {};
    const { id } = this.$route?.params || {};
    const pubkey = pkId || id;
    const result = this.form.picture
      ? { content: { picture: this.form.picture }, pubkey }
      : (this.source as mapOriginDataResult).id
      ? this.source
      : { pubkey };
    return result;
  }
  get formViewData() {
    const keys = Object.keys(this.formConfig);
    return keys.filter((e) => !this.formConfig[e].hide);
  }
  @Watch("show")
  onShowChanged(params: boolean) {
    if (params) this.initForm(true);
    this.dialogShow = params;
  }
  mounted() {
    this.dialogShow = this.show;
  }
  async _submit() {
    const keys = Object.keys(this.form);
    const isNull = keys?.filter((e: string) => this.form[e])?.length <= 0;
    const { privateKey } = loginModule.userInfo;
    if (isNull) return ElMessage.warning("至少修改一项个人资料");
    this.loading = true;
    const form = finishEvent(
      {
        kind: 0,
        content: JSON.stringify(this.form),
        created_at: ~~(Date.now() / 1000),
        tags: [],
      },
      privateKey as string
    );
    await this._sendEvent(form);
    this.$emit("success", form);
    this.loading = false;
    // this.dialogShow = this.show;
    this.$emit("update:show", false);
    // console.log(this.form);
  }
  async _uploadFile(params: UploadProps, uploadType: string) {
    const { file } = params;
    const { name, type } = file;
    let res: null | Record<string, string> = null;
    const fileName = `${uploadType}.${name.split(".")[1]}`;
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
    if (res) this.form[uploadType] = res.data;
    else ElMessage.error(`文件：${name}上传失败，请稍后重试`);
  }
  _handleBeforeUpload(params: UploadRawFile) {
    const { size } = params;
    if (size / 1024 / 1024 > 10) {
      ElMessage.warning("请上传少于10M的文件");
      return false;
    }
  }
  /**
   * 初始化form的值
   */
  initForm(history = false) {
    const keys = Object.keys(this.formConfig);
    const { content } = (this.source as mapOriginDataResult) || {};
    keys.forEach((e) => {
      const { valueType, valueKeys } = this.formConfig[e];
      const defaultValue = valueType && valueType === "number" ? 0 : "";
      const contentValue = content as Record<string, unknown>;
      let historyValue = (contentValue?.[e] as string | number) || defaultValue;
      if (valueKeys?.length) {
        valueKeys.some((ele) => {
          const tempValue = contentValue?.[ele] as string | number;
          if (tempValue) {
            historyValue = tempValue;
            return true;
          } else return false;
        });
      }
      this.form[e] = history ? historyValue : defaultValue;
    });
  }
  handleOpen() {
    this.$emit("update:show", true);
  }
  handleClose() {
    this.$emit("update:show", false);
  }
  get historyUserBanner() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    let defaultBanner = require("@/assets/img/default-banner.jpg");
    const { content } = (this.source as mapOriginDataResult) || {};
    const { banner } = (content as Record<string, unknown>) || {};
    return banner || defaultBanner;
  }
}
</script>

<style lang="scss" scoped>
.form-container {
  width: 90%;
  min-height: 400px;
  margin-top: 40px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-left: auto;
  margin-right: auto;
  .form-button-group {
    display: flex;
  }
}
.user_info {
  &-form {
    background: rgb(var(--container-color));
    width: 100%;
    height: 100%;
    border-radius: 5px;
    overflow: hidden;
    .banner-upload {
      position: relative;
      &-icon {
        position: absolute;
        bottom: 15px;
        right: 10px;
        color: rgb(var(--container-color));
      }
      :deep(.el-upload) {
        width: 100%;
        .banner-img {
          width: 100%;
          height: 150px;
          display: block;
          object-fit: cover;
        }
      }
    }
    .avatar-upload {
      position: absolute;
      border-radius: 100%;
      width: 80px;
      height: 80px;
      left: 0;
      right: 0;
      transform: translateY(calc(-50% - 15px));
      margin: auto;
      border: solid 5px rgb(var(--container-color));
      :deep(.el-upload) {
        width: 100%;
        height: 100%;
        border-radius: 100%;
      }
      &-component {
        width: 100%;
        height: 100%;
        :deep(img) {
          width: 100% !important;
          height: 100% !important;
        }
      }
      &-icon {
        color: rgb(var(--container-color));
        position: absolute;
        bottom: 5px;
        left: 0;
        right: 0;
        margin: auto;
      }
    }
  }
  &-dialog {
    :deep(.el-dialog) {
      width: var(--edit-user_info-dialog-width);
      // min-height: var(--edit-user_info-dialog-height);
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
}
@media screen and (max-width: 480px) {
  .form-container {
    width: 90%;
    min-height: initial;
    margin-top: 10px;
    margin-bottom: 10px;
    .form-button-group {
      width: 90%;
      left: 5%;
      position: absolute;
      bottom: 20px;
    }
    :deep(.el-form) {
      .el-form-item {
        margin-bottom: 10px;
        label {
          margin-bottom: 4px;
        }
      }
    }
  }

  .user_info {
    &-form {
      position: relative;
      .banner-upload {
        &-icon {
          bottom: 15px;
          right: 10px;
        }
        :deep(.el-upload) {
          width: 100%;
          .banner-img {
            width: 100%;
            height: 100px;
          }
        }
      }
      .avatar-upload {
        position: absolute;
        border-radius: 100%;
        width: 80px;
        height: 80px;
        &-icon {
          bottom: 5px;
        }
      }
    }
    &-dialog {
      :deep(.el-dialog) {
        width: var(--edit-user_info-dialog-width);
      }
    }
  }

  .user_info-dialog {
    :deep(.el-dialog) {
      width: 100%;
      height: 100%;
      max-height: 100%;
      max-width: 100%;
    }
  }
}
</style>
