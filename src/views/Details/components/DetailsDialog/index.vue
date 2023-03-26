<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-07 11:50:15
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-21 21:39:56
 * @FilePath: /nosgram/src/views/Details/components/DetailsDialog/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <!-- 必须挂一个div :deep()才生效 -->
  <div class="details-dialog">
    <el-dialog
      close-on-click-modal
      close-on-press-escape
      align-center
      v-model="show"
    >
      <details-page
        :closeDialog="_toggle"
        :source="itemData"
        :isComponent="true"
      />
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import DetailsPage from "../../index.vue";
import type { mapOriginDataResult } from "@/common/js/nostr-tools/nostr-tools.d";

class DetailsDialogProps {}

@Options({
  components: {
    DetailsPage,
  },
})
export default class DetailsDialog extends Vue.with(DetailsDialogProps) {
  show = false;
  itemData: mapOriginDataResult | undefined = {};
  _toggle(status: boolean, params?: mapOriginDataResult) {
    if (status && params) this.itemData = params;
    this.show = status;
  }
}
</script>

<style lang="scss" scoped>
.details-dialog {
  :deep(.el-dialog) {
    width: var(--details-width);
    height: var(--details-height);
    max-width: var(--details-max-width);
    max-height: var(--details-max-height);
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
  .details-dialog {
    :deep(.el-dialog) {
      width: 100%;
      height: 100%;
      max-height: 100%;
      max-width: 100%;
    }
  }
}
</style>
