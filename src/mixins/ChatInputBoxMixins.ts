/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-24 15:22:31
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-26 13:32:59
 * @FilePath: /nosgram/src/mixins/ChatInputBoxMixins.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Vue } from "vue-class-component";
import type { Relay } from "@/common/js/relays/relays.d";
import relays from "@/common/js/relays";
import type { mapOriginDataResult } from "@/common/js/nostr-tools/nostr-tools.d";
import { nostrToolsModule } from "@/store/modules/nostr-tools";
import { getAuthor } from "@/common/js/nostr-tools/index";
import type { EventTemplate } from "nostr-tools";

export default class ChatInputBoxMixins extends Vue {
  defaultRelays = JSON.parse(JSON.stringify(relays)).map((e: Relay) => e.url);
  timeout: undefined | number = undefined;
  // 获取at的人列表
  async _getAtUser(params: string) {
    const res: mapOriginDataResult[] = await nostrToolsModule.ns_send({
      url: this.defaultRelays,
      params: [
        "REQ",
        this.randomEventId("interaction-input"),
        {
          kinds: [0],
          authors: [params],
          until: ~~(Date.now() / 1000),
          limit: 10,
        },
      ],
    });
    return res;
  }
  async _handleInteractionInput(params: Record<string, string>) {
    if (this.timeout) clearTimeout(this.timeout);
    const { type, content } = params;
    if (type === "@" && content.length < 32) {
      this.$refs["chat-input-box"].setInteractionData([]);
      return;
    }
    this.timeout = window.setTimeout(
      async () => {
        let result: Record<string, string>[] = [];
        if (type === "#") {
          const temp = [{ key: content, value: `[#${content}]` }];
          if (content?.length >= 2)
            temp.push({
              key: content.slice(0, -1),
              value: `[#${content.slice(0, -1)}]`,
            });
          if (content?.length >= 3)
            temp.push({
              key: content.slice(0, -2),
              value: `[#${content.slice(0, -2)}]`,
            });
          result = temp;
        } else {
          const res = await this._getAtUser(content);
          const temp: Record<string, string>[] = [];
          if (res?.length) {
            res.forEach((e) => {
              let exist = false;
              temp.some((ele) => {
                if (ele.value === e.pubkey) {
                  exist = true;
                  return true;
                } else return false;
              });
              if (!exist) {
                const authorParams = {
                  pubkey: e.pubkey as string,
                  client_userInfo: {
                    content: e.content as Record<string, string | number>,
                  },
                };
                const author = getAuthor(authorParams);
                const item: Record<string, string> = {
                  key: author.author as string,
                  value: e.pubkey as string,
                };
                if ((e?.content as Record<string, string>).picture)
                  item.picture = (e.content as Record<string, string>).picture;
                temp.push(item);
              }
            });
          }
          result = temp;
        }
        this.$refs["chat-input-box"].setInteractionData(
          result.map((e) => ({ ...e, type }))
        );
      },
      type === "@" ? 1000 : 0
    );
  }
  _getReleaseForm(
    params: Record<string, string[][] | string | Record<string, string>>
  ) {
    const { content, tags } = params;
    const rersult = {
      content: content as string,
      tags: [] as string[][],
    };
    (tags as string[][]).forEach((e, i) => {
      const [type, id, contentAt] = e;
      if (type === "p") {
        rersult.content = rersult.content.replace(contentAt, `#[${i}]`);
      }
      rersult.tags[i] = [type, id];
    });
    return rersult;
  }
  async _sendEvent(req: EventTemplate) {
    const res: mapOriginDataResult[] = await nostrToolsModule.ns_send({
      url: this.defaultRelays,
      params: ["EVENT", req],
    });
    if (res) {
      let success = false;
      res.some((e) => {
        if (e.client_messageType) {
          success = true;
          return true;
        } else return false;
      });
      return { type: success, id: res[0].clinet_handleId };
    } else return { type: false };
  }
}
