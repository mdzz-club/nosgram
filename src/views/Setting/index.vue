<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-04 15:00:27
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-20 16:56:08
 * @FilePath: /nosgram/src/views/Setting/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="setting-container">
    <div class="setting">
      <h2 class="align-left margin-bottom-20">设置</h2>
      <div class="setting-left">
        <div class="list">
          <div
            class="list-item"
            v-for="(item, index) in settingData"
            :key="index"
            @click="_handLeftClick(item.key)"
          >
            <div>
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
      <div class="setting-right" v-show="settingIndex">2</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";

export default class Setting extends Vue {
  settingIndex = "";
  settingData = [
    {
      name: "收发信息服务器",
      alias: "中继列表",
      key: "relays",
      icon: "server",
    },
    { name: "登出", key: "logout", icon: "logout" },
  ];
  _handLeftClick(item: string) {
    this.settingIndex = item;
  }
}
</script>

<style lang="scss" scoped>
.setting {
  width: calc(
    var(--content_width) + var(--content-right-spacing_width) +
      var(--content-additional_width)
  );
  &-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  &-left,
  &-right {
    width: 100%;
    border: solid 1px rgb(var(--border-color));
    border-radius: 5px;
  }
  &-left {
    margin-bottom: 20px;
  }
  &-right {
    padding: 20px;
  }
}

.list {
  padding: 0 20px;
  &-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 50px;
    cursor: pointer;
    &:hover {
      opacity: 0.5;
    }
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
}
</style>
