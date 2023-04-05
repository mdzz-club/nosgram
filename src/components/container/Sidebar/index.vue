<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-25 17:40:47
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-04-05 15:56:54
 * @FilePath: /nosgram/src/components/container/Sidebar/Index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <el-menu
    v-show="!hide"
    :collapse="!collapse"
    :default-active="active"
    class="el-menu-vertical-demo"
    @select="_handleSelect"
  >
    <el-menu-item index="1" @click="_to({ name: 'home' })">
      <el-icon size="18"><icon-ion-home-outline /></el-icon>
      <span>首页</span>
    </el-menu-item>
    <el-menu-item index="2" @click="_to({ name: 'follow' })">
      <el-icon size="18"><icon-ion-heart-outline /></el-icon>
      <span>关注</span>
    </el-menu-item>
    <el-menu-item index="3" @click="_to({ name: 'setting' })">
      <el-icon size="18"><icon-ion-settings-outline /></el-icon>
      <span>设置</span>
    </el-menu-item>
    <!-- <el-menu-item
      v-for="(item, index) in menuItem"
      :key="`${item.icon}-${index}`"
      :index="`${index}`"
    >
      <el-icon size="18">
        <component :is="item.icon" />
      </el-icon>
      <span>{{ item.name }}</span>
    </el-menu-item> -->
  </el-menu>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";

export default class Sidebar extends Vue {
  screenWidth: number | string = window.innerWidth;
  active = "1";
  // 若使用component is=xxx的方式循环icon，会不显示svg，因为icon是动态导入的。解析出来会是直接的组件，等待后期官方解决
  // menuItem: MenuItem[] = [
  //   { name: "首页", icon: "icon-ion-home-outline" },
  //   { name: "关注", icon: "icon-ion-heart-outline" },
  //   { name: "设置", icon: "icon-ion-settings-outline" },
  // ];
  get hide() {
    return this.screenWidth < 680;
  }
  get collapse() {
    return this.screenWidth > 1170;
  }

  mounted() {
    window.addEventListener("resize", this._getScreenWidth);
  }
  destroyed() {
    window.removeEventListener("resize", this._getScreenWidth);
  }

  _to(path: Record<string, string> | string) {
    this.$router.replace(path);
  }

  _handleSelect(index: string) {
    this.active = index;
  }

  _getScreenWidth() {
    this.screenWidth = window.innerWidth;
  }
}
</script>
