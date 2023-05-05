<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-04-04 09:02:15
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-04-24 22:33:40
 * @FilePath: /nosgram/src/components/NavBar/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="navbar">
    <phone-navbar class="phone" />
    <pc-navbar class="pc" />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import PhoneNavbar from "./components/Phone/index.vue";
import PcNavbar from "./components/Pc/index.vue";

@Options({
  components: {
    PhoneNavbar,
    PcNavbar,
  },
})
export default class NavBar extends Vue {}
</script>

<style lang="scss" scoped>
.navbar {
  .phone {
    display: none;
  }
  .pc {
    display: flex;
  }
}

@media screen and (max-width: 480px) {
  .navbar {
    .phone {
      display: flex;
    }
    .pc {
      display: none;
    }
  }
}
</style>
