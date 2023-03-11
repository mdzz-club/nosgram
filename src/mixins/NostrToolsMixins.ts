/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-01 13:53:11
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-10 12:41:49
 * @FilePath: /nosgram/src/mixins/nostrToolsMixins.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Vue } from "vue-class-component";
import type {
  mapOriginDataResult,
  Client_tags,
} from "@/common/js/nostr-tools/nostr-tools.d";
import type { Relay } from "@/common/js/relays/relays.d";
import relays from "@/common/js/relays";
import { nostrToolsModule } from "@/store/modules/nostr-tools";

export default class nostrToolsMixins extends Vue {
  defaultRelays = JSON.parse(JSON.stringify(relays)).map((e: Relay) => e.url);
  // 获取动态中存在at的情况的真实用户信息
  async _getInteraction(activityData: mapOriginDataResult[]) {
    const author: string[] = [];
    activityData.forEach((e) => {
      if (e?.client_richTextIndex?.length && e?.tags?.length) {
        const indexArr = e.client_richTextIndex;
        const tags = e.tags;
        const dic = (key: string) =>
          ({ e: "forward", p: "user", t: "topic" }[key] || "");
        indexArr.forEach((element) => {
          const match = element.match(/#\[(\d+)\]/);
          const index = match && match[1];
          // #[数字]匹配方式
          if (index !== null) {
            if (!tags?.[parseInt(index)]) return;
            const [key, value] = tags?.[parseInt(index)];
            const obj = {
              id: value,
              type: dic(key),
              tagsIndex: match?.[1],
            };
            // 给原数组添加索引
            if (!e.client_tags) {
              e.client_tags = {
                [element]: obj,
              };
            } else e.client_tags[element] = obj;
            // 添加到要请求的用户信息列表
            author.push(value);
          } else {
            let index = null;
            tags.some((e, i) => {
              if (e[0] === "t" && e[1] === element.replace("#", "")) {
                index = i;
                return true;
              } else return false;
            });
            const obj = {
              id: element,
              type: "topic",
              tagsIndex: `${index}`,
            };
            if (!e.client_tags) {
              e.client_tags = {
                [element]: obj,
              };
            } else e.client_tags[element] = obj;
          }
        });
      }
    });
    const interactionRandom = this.randomEventId("interaction");
    await nostrToolsModule.ns_send({
      url: this.defaultRelays,
      params: [
        "REQ",
        interactionRandom,
        {
          kinds: [0],
          until: ~~(Date.now() / 1000),
          authors: [...new Set(author)],
        },
      ],
    });
    const res: mapOriginDataResult[] = await nostrToolsModule.ns_processingData(
      interactionRandom
    );
    activityData.forEach((e) => {
      if (e.client_tags) {
        const keys = Object.keys(e.client_tags);
        keys.forEach((ele) => {
          res.some((author) => {
            const obj = (e.client_tags as Record<string, Client_tags>)[ele];
            if (author.pubkey === obj.id) {
              obj.content = author.content as Record<string, string>;
            }
          });
        });
      }
    });
  }
}
