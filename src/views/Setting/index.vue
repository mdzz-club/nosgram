<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-04 15:00:27
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-04-12 22:37:30
 * @FilePath: /nosgram/src/views/Setting/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="setting-container">
    <div class="setting">
      <div class="setting-title">
        <el-button class="back-button" link @click="$router.back()"
          ><el-icon size="30"><icon-ion-arrow-back /></el-icon
        ></el-button>
        <h2 class="align-left">设置</h2>
      </div>
      <div class="setting-left">
        <div class="list hover pointer">
          <div
            class="list-item"
            v-for="(item, index) in settingData"
            :key="index"
            @click="_handLeftClick(item)"
          >
            <div>
              <el-icon v-if="item.icon === 'userInfo'" size="20"
                ><icon-majesticons-user-line
              /></el-icon>
              <el-icon v-if="item.icon === 'logout'" size="20"
                ><icon-ion-md-log-out
              /></el-icon>
              <el-icon v-else-if="item.icon === 'server'" size="20"
                ><icon-ion-server-outline
              /></el-icon>
              <span>{{ item.name }}</span>
            </div>
            <el-icon size="20"><icon-ion-ios-arrow-forward /></el-icon>
          </div>
        </div>
      </div>
      <div class="setting-right" v-show="settingIndex">
        <div v-show="settingIndex === 'relays'">
          <div class="server-list">
            <div class="list phone">
              <div
                class="list-item"
                v-for="(relay, index) in relays"
                :key="index"
              >
                <div>{{ relay.url }}</div>
                <div>
                  <div class="display-flex align-items-center">
                    读：<el-switch
                      class="margin-right-10"
                      v-model="relay.read"
                      inline-prompt
                      active-text="是"
                      inactive-text="否"
                    />
                    写：<el-switch
                      v-model="relay.write"
                      inline-prompt
                      active-text="是"
                      inactive-text="否"
                    />
                    <el-button
                      link
                      @click="relays.splice(index, 1)"
                      class="margin-left-10"
                    >
                      <el-icon
                        size="30"
                        class="margin-right-5 server-icon close"
                      >
                        <icon-ion-md-add-circle-outline />
                      </el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="server-form"
              :class="{
                'justify-center': create === 0,
                'justify-between': create === 1,
              }"
            >
              <div class="width-300" v-show="create === 1">
                <el-input
                  v-model="form.url"
                  :placeholder="`请输入服务器地址，如：${relays?.[0]?.url}`"
                  clearable
                />
              </div>
              <div
                class="display-flex align-items-center"
                :class="{
                  'justify-bottom': create === 1,
                  'justify-center': create === 0,
                }"
              >
                <div
                  class="display-flex align-items-center"
                  v-show="create === 1"
                >
                  读：<el-switch
                    class="margin-right-10"
                    v-model="form.read"
                    inline-prompt
                    active-text="是"
                    inactive-text="否"
                  />
                  写：<el-switch
                    v-model="form.write"
                    inline-prompt
                    active-text="是"
                    inactive-text="否"
                  />
                </div>
                <el-button
                  type="primary"
                  class="margin-left-20"
                  v-show="create === 1"
                  @click="_createServer"
                  >新增</el-button
                >
                <el-button v-if="isLogin" link @click="_serverIconClick">
                  <el-icon
                    size="30"
                    class="margin-right-5 server-icon"
                    :class="{ close: create === 1 }"
                  >
                    <icon-ion-md-add-circle-outline />
                  </el-icon>
                  <span v-show="create === 0">新增收发信息服务器</span>
                </el-button>
              </div>
            </div>
          </div>
          <el-button @click="_sendRelays" class="full-width" type="primary"
            >保存以上收发信息服务器变更</el-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mixins } from "vue-class-component";
import { loginModule } from "@/store/modules/login";
import { ElMessageBox, ElMessage } from "element-plus";
import "element-plus/es/components/message-box/style/css";
import "element-plus/es/components/message/style/css";
import type { Relay } from "@/common/js/relays/relays.d";
import { finishEvent } from "nostr-tools";
import NostrToolsMixins from "@/mixins/NostrToolsMixins";
import relays from "@/common/js/relays";
import loginMixins from "@/mixins/loginMixins";

enum Create {
  button,
  create,
}

interface Form {
  url: "";
  write: boolean;
  read: boolean;
}

export default class Setting extends mixins(NostrToolsMixins, loginMixins) {
  settingIndex = "";
  relays: Relay[] = [];
  create = Create.button;
  loading = false;
  form: Form = {
    url: "",
    write: true,
    read: true,
  };
  // settingData = [
  //   {
  //     name: "收发信息服务器",
  //     alias: "中继列表",
  //     key: "relays",
  //     icon: "server",
  //   },
  //   { name: "登出", key: "logout", icon: "logout" },
  // ];
  get isLogin() {
    return loginModule.isLogin;
  }
  get settingData() {
    const result: Record<string, string | Record<string, string>>[] = [
      {
        name: "收发信息服务器",
        alias: "中继列表",
        key: "relays",
        icon: "server",
      },
    ];
    if (loginModule.isLogin) {
      result.unshift({
        name: "个人中心",
        key: "userInfo",
        icon: "userInfo",
        params: { name: "user" },
      });
      result.push({ name: "登出", key: "logout", icon: "logout", alias: "" });
    }
    return result;
  }
  async _sendRelays() {
    if (this.loading) return;
    const params: Record<string, Record<string, boolean>> = {};
    this.relays.forEach((e) => {
      params[e.url] = { write: e.write, read: e.read };
    });
    const { privateKey } = loginModule.userInfo;
    this.loading = true;
    const form = finishEvent(
      {
        kind: 2,
        content: JSON.stringify(params),
        created_at: ~~(Date.now() / 1000),
        tags: [],
      },
      privateKey as string
    );
    await this._sendEvent(form);
    loginModule.setUserRelays(this.relays);
    this.loading = false;
  }
  _clearForm() {
    this.form = {
      url: "",
      write: true,
      read: true,
    };
  }
  _createServer() {
    if (!this.form.url) return ElMessage.warning("请输入新增中继url");
    this.relays.push({ ...this.form, alias: "" });
    this._clearForm();
  }
  _serverIconClick() {
    this.create = { 0: 1, 1: 0 }[this.create];
    if (this.create === 0) this._clearForm();
  }
  async _logout() {
    const res = await ElMessageBox.confirm("确认登出您的账号吗?", "Warning", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    });
    if (res) this.logout();
    this.relays = relays;
    // to do 登出后需要重写写中继逻辑
  }
  _handLeftClick(
    item: Record<string, string | undefined | Record<string, string>>
  ) {
    const { key, params } = item;
    if (key === "logout") {
      this._logout();
      return;
    } else if (key === "userInfo") {
      const { name } = params as Record<string, string>;
      const { userInfo } = loginModule;
      this.$router.push({ name, params: { id: userInfo.publicKey } });
    } else if (key === "relays") {
      this.relays = JSON.parse(
        JSON.stringify(
          loginModule.userRelays.filter((e) => !e.delete) as Relay[]
        )
      );
    }
    this.settingIndex = key as string;
  }
}
</script>

<style lang="scss" scoped>
.server {
  &-form {
    padding-top: 30px;
    display: flex;
    align-items: center;
  }
  &-icon {
    &.close {
      transform: rotate(45deg);
    }
  }
}
.setting {
  width: calc(
    var(--content_width) + var(--content-right-spacing_width) +
      var(--content-additional_width)
  );
  &-title {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    .back-button {
      display: none;
      color: rgb(var(--first-color));
    }
  }
  &-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 20px;
  }
  &-left {
    width: 100%;
    // border: solid 1px rgb(var(--border-color));
    border-radius: 5px;
    background: rgb(var(--container-color));
    box-shadow: 0 1px 10px var(--container-box_shadow-clor);
  }
  &-left {
    margin-bottom: 20px;
  }
  &-right {
    & > div {
      .server-list {
        border-radius: 5px;
        // border: solid 1px rgb(var(--border-color));
        box-shadow: 0 1px 10px var(--container-box_shadow-clor);
        background: rgb(var(--container-color));
        padding: 20px;
        margin-bottom: 10px;
      }
    }
  }
}

.list {
  padding: 0 20px;
  &-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 50px;
    & > div {
      display: flex;
      align-items: center;
      & > span {
        padding-left: 10px;
      }
    }
    & + .list-item {
      border-top: solid 1px rgb(var(--border-color));
    }
  }
  &.pointer {
    .list-item {
      cursor: pointer;
    }
  }
  &.hover {
    .list-item {
      &:hover {
        opacity: 0.5;
      }
    }
  }
}

@media screen and (max-width: 998px) {
  .setting {
    &-left {
      margin-bottom: 10px;
    }
    &-container {
      padding: 10px;
    }
  }

  .setting {
    width: 100%;
  }
  .server {
    &-list {
      padding: 10px 5px !important;
    }
    &-form {
      display: block;
      & > div {
        width: 100%;
        margin-bottom: 10px;
      }
    }
  }
  .phone.list {
    height: 200px;
    overflow-y: auto;
    .list-item {
      display: block;
      height: initial;
      & > div:last-of-type {
        display: flex;
        justify-content: flex-end;
      }
      & + .list-item {
        padding-top: 10px;
      }
    }
  }
}

@media screen and (max-width: 480px) {
  .setting {
    &-title {
      width: 100%;
      justify-content: space-between;
      .back-button {
        display: block;
      }
    }
  }
}
</style>
