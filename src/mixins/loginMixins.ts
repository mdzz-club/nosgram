/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-01 13:53:11
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-04-08 11:03:51
 * @FilePath: /nosgram/src/mixins/nostrToolsMixins.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Vue } from "vue-class-component";
// import type {
//   mapOriginDataResult,
//   Client_tags,
//   Client_userInfo,
// } from "@/common/js/nostr-tools/nostr-tools.d";
// import type { Relay } from "@/common/js/relays/relays.d";
// import relays from "@/common/js/relays";
import { nostrToolsModule } from "@/store/modules/nostr-tools";
import { loginModule } from "@/store/modules/login";
// import type { EventTemplate } from "nostr-tools";
// import { setInteraction } from "@/common/js/nostr-tools";
// import { finishEvent } from "nostr-tools";

export default class loginMixins extends Vue {
  logout() {
    loginModule.logout();
    nostrToolsModule.ns_resetPool();
    nostrToolsModule.ns_init(loginModule.readRelays);
  }
}
