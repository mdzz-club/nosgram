<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-15 16:49:18
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-30 22:02:53
 * @FilePath: /nosgram/src/components/Login/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="login-container">
    <div class="login-long_amplitude" :class="{ 'show-qrcode': create.show }">
      <!-- 登录tab -->
      <div class="login-column-container">
        <div>
          <div class="login-password">
            <div class="password-container">
              <el-input
                class="margin-bottom-10 font-size-14"
                v-model="password"
                placeholder="输入您的口令"
              />
              <el-button
                type="primary"
                :loading="loginLoading"
                @click="_submit"
                :disabled="!password"
              >
                <el-icon size="18" v-show="!loginLoading">
                  <icon-ion-logo-ionic />
                </el-icon>
                <div class="margin-left-5">登录</div>
              </el-button>
            </div>
            <p class="margin-bottom-20">
              用创建账号时得到的口令登录(提示：若你是别的平台游客，保存了他们的nsec、npub、nip-05、hex也是支持的噢)
            </p>
          </div>
          <div class="login-or margin-bottom-20">
            <span>or</span>
          </div>
          <div class="login-qrcode">
            <el-upload
              class="margin-bottom-10"
              accept=".jpg, .jpeg, .png"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="_handleChange"
              :disabled="uploadLoading"
            >
              <el-button :disabled="uploadLoading" type="primary" round>
                <el-icon size="18">
                  <icon-ion-qr-code />
                </el-icon>
                <div class="margin-left-5">上传二维码登录</div>
              </el-button>
            </el-upload>
            <p class="margin-bottom-10">用创建账号时得到的专属二维码识别登录</p>
          </div>
          <div class="login-or margin-bottom-20">
            <span>or</span>
          </div>
          <div class="login-create">
            <el-button
              class="margin-bottom-10"
              type="primary"
              round
              @click="_createCode"
            >
              <div class="login-create-button">
                <el-icon size="18">
                  <icon-ion-md-add-circle-outline />
                </el-icon>
                <div class="margin-left-5">创建并登录帐号</div>
              </div>
            </el-button>
            <p class="margin-bottom-10">
              创建并且登录您的帐号，同时自动生成一个专属于您的二维码和一串方便记忆的口令，下次登录时输入口令或使用二维码便可登录
            </p>
          </div>
        </div>
        <div class="cancle">
          <div>
            <el-button
              class="cancle-button"
              link
              @click="loginModule.toggle(false)"
            >
              <el-icon size="70">
                <icon-ion-ios-close-outline />
              </el-icon>
            </el-button>
            <div class="cancle-text">取消登录</div>
          </div>
        </div>
      </div>
      <!-- 注册tab -->
      <div class="login-column-container">
        <div>
          <el-button link @click="create.show = false"
            ><el-icon size="25"><icon-ion-arrow-back /></el-icon
          ></el-button>
          <div class="copy-input-container margin-bottom-15">
            <div class="display-flex align-items-center margin-bottom-10">
              <span
                class="font-size-12 display-inline-block width-50 font-second-color font-weight-600"
                >口令：</span
              >
              <el-input class="input" disabled v-model="create.code" />
            </div>
            <el-button-group>
              <el-button type="primary" @click="_createCode">
                <div class="margin-left-5">换一个口令</div>
              </el-button>
              <el-button
                type="primary"
                id="copy-button"
                :data-clipboard-text="create.code"
                @click="_copyContent"
              >
                <div class="margin-left-5">复制口令</div>
              </el-button>
            </el-button-group>
          </div>
          <div class="copy-tip margin-bottom-30 right-tip">
            一键复制到剪切板。无需账号密码，下次登录时输入以上口令，即可访问您的账户
          </div>
          <div class="qrcode-container">
            <div class="qrcode margin-bottom-10">
              <qrcode
                v-if="create.code"
                :value="create.code"
                :size="create.size"
                level="H"
              />
            </div>
            <div class="copy-tip">
              mac/windows右键保存，手机端长按保存。无需账号密码，下次登录时上传以上二维码，即可访问您的账户。
            </div>
          </div>
        </div>
        <div class="align-right">
          <el-button type="primary" link @click="_mnemonicLogin()">
            保存完毕，登录
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Clipboard from "clipboard";
import { Options, mixins } from "vue-class-component";
// import { Prop } from "vue-property-decorator";
import NostrToolsMixins from "@/mixins/NostrToolsMixins";
import Qrcode from "qrcode.vue";
import { nip06, getPublicKey, nip19 } from "nostr-tools";
import { loginModule } from "@/store/modules/login";
import type { UserInfo, UserInfoDetails } from "@/store/modules/login";
import QrcodeDecoder from "../../../node_modules/qrcode-decoder/dist/index";
import { getKeyType } from "@/common/js/nostr-tools/index";
import { nostrToolsModule } from "@/store/modules/nostr-tools";
import { ElMessage, UploadRawFile } from "element-plus";
import "element-plus/es/components/message/style/css";
import type { mapOriginDataResult } from "@/common/js/nostr-tools/nostr-tools.d";
import relays from "@/common/js/relays";
import type { Relay } from "@/common/js/relays/relays.d";
// nip06.generateSeedWords() 生成助记词
// nip06.privateKeyFromSeedWords(使用上面助记词) 生成密钥
// nip06.validateWords(助记词) 用于校验输入是否合规
// getPublicKey() 生成共钥

@Options({
  components: {
    Qrcode,
  },
})
export default class Login extends mixins(NostrToolsMixins) {
  loginModule = loginModule;
  password = "";
  create = {
    code: "",
    size: 160,
    show: false,
  };
  uploadLoading = false;
  loginLoading = false;
  _reset() {
    this.password = "";
    this.create = {
      code: "",
      size: 160,
      show: false,
    };
    this.uploadLoading = false;
    this.loginLoading = false;
  }
  async _handleChange(params: Record<string, UploadRawFile | number | string>) {
    const { raw } = params as { raw: UploadRawFile };
    if (
      raw.type !== "image/png" &&
      raw.type !== "image/jpeg" &&
      raw.type !== "image/jpg"
    )
      return ElMessage.warning("请上传类型为jpg、png或者jpeg的文件");
    this.uploadLoading = true;
    const url = window.webkitURL.createObjectURL(raw as UploadRawFile);
    const qr = new QrcodeDecoder();
    const result = await qr.decodeFromImage(url);
    this.uploadLoading = false;
    if (result) {
      const { data } = result;
      this.password = data;
      this._submit();
    } else ElMessage.warning("识别失败请检查专属二维码");
  }
  async _getUserInfo(author: string) {
    loginModule.setUserInfoLoad(true);
    const res = await this._getUser([author]);
    loginModule.setUserInfoLoad(false);
    this._reset();
    if (res) {
      loginModule.setUserInfo({
        ...loginModule.userInfo,
        details: res[0] as UserInfoDetails,
      });
    }
  }
  _mnemonicLogin(code?: string) {
    this.loginLoading = true;
    const { privateKeyFromSeedWords } = nip06;
    const privateKey = privateKeyFromSeedWords(code || this.create.code);
    const publicKey = getPublicKey(privateKey);
    this._login({
      privateKey,
      publicKey,
      readOnly: false,
    });
  }
  async _getUserRelays(publicKey: string) {
    const res = await nostrToolsModule.ns_send({
      url: loginModule.readRelays,
      params: [
        "REQ",
        this.randomEventId("relays"),
        {
          kinds: [2],
          until: ~~(Date.now() / 1000),
          authors: [publicKey],
          limit: 1,
        },
      ],
    });

    let item: mapOriginDataResult = {};
    res.forEach((e: mapOriginDataResult) => {
      if (!item?.created_at || item.created_at < (e.created_at as number))
        item = e;
    });
    if (item?.content) {
      const keys = Object.keys(item.content);
      const result: Relay[] = [];
      keys.forEach((e) => {
        const { write, read } = (
          item.content as Record<string, Record<string, boolean>>
        )[e];

        result.push({ url: e, write, read });
      });
      loginModule.setRelays(result);
    } else loginModule.setRelays(relays);
  }
  async getNip05PublicKey(params: string) {
    const [name, api] = params.split("@");
    let res = null;
    try {
      res = await this.$http.get(
        `https://${api}/.well-known/nostr.json?name=${name}`
      );
    } catch (e) {
      return "";
    }
    if (res) {
      const { names } = res.data;
      if (names) {
        const keys = Object.keys(names);
        let result = "";
        keys.some((e) => {
          if (e === name) {
            result = names[e];
            return true;
          }
        });
        return result;
      }
    }
    return "";
  }
  _login(loginParams: UserInfo) {
    loginModule.login(loginParams);

    this.loginLoading = false;
    loginModule.toggle(false);

    this._getUserInfo(loginParams.publicKey as string);
    this._getUserRelays(loginParams.publicKey as string);
  }
  async _submit() {
    this.loginLoading = true;
    const type = getKeyType(this.password);
    const { decode } = nip19; // 把bech32编码方式转为16进制编码
    let privateKey = "";
    let publicKey = "";
    const loginParams: UserInfo = { readOnly: false };
    if (!type) {
      this.loginLoading = false;
      return ElMessage({
        type: "error",
        message: "您输入的口令/nsec/npub/nip-05/hex有误",
      });
    }
    if (type === "mnemonic") {
      this.loginLoading = false;
      return this._mnemonicLogin(this.password);
    } else if (type === "nsec") {
      const { data } = decode(this.password) as { data: string };
      privateKey = data;
      publicKey = getPublicKey(data);
    } else if (type === "npub") {
      const { data } = decode(this.password) as { data: string };
      publicKey = data;
      loginParams.readOnly = true;
    } else if (type === "privateKey") {
      privateKey = this.password;
      publicKey = getPublicKey(this.password);
    } else if (type === "nip05") {
      publicKey = await this.getNip05PublicKey(this.password);
      if (publicKey === "") {
        this.loginLoading = false;
        return ElMessage({
          type: "error",
          message: "您输入nip05有误",
        });
      }
      loginParams.readOnly = true;
    }
    loginParams.privateKey = privateKey;
    loginParams.publicKey = publicKey;
    this._login(loginParams);
  }
  _createCode() {
    this.create.show = true;
    // 生成助记词的二维码
    this.create.code = nip06.generateSeedWords();
  }
  _copyContent(id: number, link: string) {
    const clipboard = new Clipboard("#copy-button"); // 获取dom
    clipboard.on("success", () => {
      // 成功回调
      ElMessage({
        type: "success",
        message: "复制成功",
      });
      clipboard.destroy(); // 销毁多余的clipboard定义 否则会重复提示成功
    });
    clipboard.on("error", () => {
      // 失败回调
      ElMessage.confirm(`请手动复制:\n${link}`, {
        confirmButtonText: "确定",
        showCancelButton: false,
        type: "info",
      });
      clipboard.destroy();
    });
  }
}
</script>

<style lang="scss" scoped>
.cancle {
  &-text {
    position: absolute;
    left: 0;
    right: 0;
    text-align: center;
    bottom: 50px;
    margin: auto;
    font-size: 14px;
    font-weight: bold;
    opacity: 0;
    transition: all 0.3s;
    color: rgb(var(--second-color));
  }
  & > div {
    position: relative;
    display: flex;
    &:hover {
      text-align: center;
      .cancle-text {
        opacity: 1;
        bottom: 70px;
      }
    }
  }
  .el-icon {
    cursor: pointer;
    color: rgb(var(--second-color));
  }
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.qrcode {
  &-container {
    background-image: url("~@/assets/img/save-qrcode-zh.jpg");
    background-repeat: no-repeat;
    background-size: 110px auto;
    background-position: 100px 20px;
    transition: all 0.3s;
    .copy-tip {
      &::before {
        left: 0;
        right: 0;
        margin: auto;
      }
    }
    .qrcode {
      canvas {
        transition: all 0.3s;
        position: relative;
        left: calc((100% - 160px) / 2);
      }
    }
    &:hover {
      background-position: 250px 40px;
      .qrcode {
        canvas {
          left: calc((100% - 160px) / 2 - 20px);
        }
      }
      .copy-tip {
        &::before {
          transform: translateX(-20px);
          transform: translate(-20px, calc(-50% - 1px)) rotate(45deg);
        }
      }
    }
  }
}

.copy {
  &-tip {
    position: relative;
    z-index: 1;
    font-size: 14px;
    padding: 5px 10px;
    // box-shadow: rgb(var(--dialog-box-shadow));
    box-shadow: 0 1px 10px var(--container-box_shadow-clor);
    // border: solid 1px rgb(var(--border-color));
    border-radius: 5px;
    &::before {
      content: "";
      display: block;
      position: absolute;
      background: white;
      top: 0;
      width: 10px;
      height: 10px;
      border-top: solid 1px rgb(var(--border-color));
      border-left: solid 1px rgb(var(--border-color));
      transition: all 0.3s;
      transform: translate(0px, calc(-50% - 1px)) rotate(45deg);
    }
    &.right-tip {
      &::before {
        right: 30px;
      }
    }
  }
  &-input-container {
    .input {
      cursor: copy;
      :deep(.el-input__wrapper) {
        background: white;
      }
    }
    .el-button-group {
      display: flex;
      justify-content: flex-end;
    }
  }
}
.login {
  &-column-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  &-long_amplitude {
    width: 200%;
    height: 100%;
    display: flex;
    position: absolute;
    left: 0;
    top: 0;
    transition: all 0.3s;
    & > div {
      padding: 20px;
      width: 50%;
      height: 100%;
    }
    &.show-qrcode {
      left: -100%;
    }
  }
  &-password,
  &-qrcode,
  &-create {
    width: 100%;
    & > p {
      font-size: 14px;
      color: rgb(var(--second-color));
    }
  }
  &-password {
    .password-container {
      display: flex;
      .el-button {
        margin-left: 10px;
      }
    }
  }
  &-qrcode {
    margin-bottom: 20px;
  }
  &-container {
    width: 400px;
    height: 550px;
    background: white;
    overflow: hidden;
    box-shadow: var(--dialog-box-shadow);
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    border-radius: 0 25px 0 25px;
    display: flex;
    justify-items: center;
    align-items: center;
    flex-direction: column;
    z-index: 10;
  }
  &-create {
    &-button {
      display: flex;
      align-items: center;
    }
  }
  &-or {
    width: 100%;
    height: 1px;
    border-top: solid 1px rgb(var(--border-color));
    position: relative;
    display: flex;
    justify-content: center;
    span {
      position: relative;
      display: inline-block;
      top: -10px;
      color: rgb(var(--second-color));
      font-size: 14px;
      text-align: center;
      background: white;
      padding: 0 10px;
      height: 16px;
    }
  }
}

@media screen and (max-width: 480px) {
  .login-container {
    height: 100%;
    width: 100%;
    border-radius: 0;
  }
  .cancle {
    & > div {
      .cancle-text {
        opacity: 1;
        bottom: 70px;
      }
    }
  }
}
</style>
