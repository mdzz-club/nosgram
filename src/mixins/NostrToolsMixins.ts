/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-01 13:53:11
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-26 22:28:51
 * @FilePath: /nosgram/src/mixins/nostrToolsMixins.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Vue } from "vue-class-component";
import type {
  mapOriginDataResult,
  Client_tags,
  Client_userInfo,
} from "@/common/js/nostr-tools/nostr-tools.d";
import type { Relay } from "@/common/js/relays/relays.d";
import relays from "@/common/js/relays";
import { nostrToolsModule } from "@/store/modules/nostr-tools";
import { loginModule } from "@/store/modules/login";
import type { EventTemplate } from "nostr-tools";
import { setInteraction } from "@/common/js/nostr-tools";

export default class nostrToolsMixins extends Vue {
  defaultRelays = JSON.parse(JSON.stringify(relays)).map((e: Relay) => e.url);
  // 获取动态中存在at的情况的真实用户信息
  async _getInteraction(activityData: mapOriginDataResult[]) {
    const authors: string[] = [...new Set(setInteraction(activityData))];
    const res: mapOriginDataResult[] = await nostrToolsModule.ns_send({
      url: this.defaultRelays,
      params: [
        "REQ",
        this.randomEventId("interaction"),
        {
          kinds: [0],
          until: ~~(Date.now() / 1000),
          limit: authors.length,
          authors,
        },
      ],
    });
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
  async _getUser(activityData: mapOriginDataResult[]) {
    const userList = activityData
      .filter((e: mapOriginDataResult) => e.client_messageType !== "EOSE")
      .map((e: mapOriginDataResult) => e.pubkey);
    const authors = [...new Set(userList)];
    // 获取动态对应用户的信息
    // const userRandom = this.randomEventId("user");
    const userData: mapOriginDataResult[] = await nostrToolsModule.ns_send({
      url: this.defaultRelays,
      params: [
        "REQ",
        this.randomEventId("user"),
        {
          kinds: [0],
          until: ~~(Date.now() / 1000),
          limit: authors.length,
          authors,
        },
      ],
    });
    activityData.forEach((item: mapOriginDataResult) => {
      userData.some((user) => {
        if (item.pubkey === user.pubkey) {
          item.client_userInfo = user as Client_userInfo;
          return true;
        } else return false;
      });
    });
  }
  // 获取转发内容
  async _getForward(activityData: mapOriginDataResult[]) {
    const ids: string[] = [];
    activityData.forEach((e) => {
      if (e.client_tags) {
        const keys = Object.keys(e.client_tags);
        keys.forEach((ele) => {
          const { type, id } = (e.client_tags as Record<string, Client_tags>)[
            ele
          ];
          if (type === "forward") ids.push(id);
        });
      }
    });
    // 获取转发的具体文章信息
    const forward: mapOriginDataResult[] = await nostrToolsModule.ns_send({
      url: this.defaultRelays,
      params: [
        "REQ",
        this.randomEventId("forward"),
        {
          ids: [...new Set(ids)],
        },
      ],
    });
    // 获取动态对应的互动
    await this._getInteraction(forward);
    // 获取转发的具体用户信息
    await this._getUser(forward);
    if (forward?.length) {
      activityData.forEach((e) => {
        if (e.client_tags) {
          const keys = Object.keys(e.client_tags);
          keys.forEach((ele) => {
            const clinetTag = (e.client_tags as Record<string, Client_tags>)[
              ele
            ];
            const { type, id } = clinetTag;
            if (type !== "forward") return;
            forward.some((item) => {
              if (id === item.id) {
                clinetTag.client_forward = item;
                return true;
              } else return false;
            });
          });
        }
      });
    }
  }
  // 获取文章点赞信息
  async _getLikes(activityData: mapOriginDataResult[]) {
    if (!loginModule.isLogin) return;
    const ids = activityData.map((e) => e.id);
    const res: mapOriginDataResult[] = await nostrToolsModule.ns_send({
      url: this.defaultRelays,
      params: [
        "REQ",
        this.randomEventId("user-likes"),
        {
          kinds: [7],
          "#e": ids,
          authors: [loginModule.userInfo.publicKey],
        },
      ],
    });
    activityData.forEach((ele) => {
      res.some((e) => {
        const { tags, id } = e as Record<string, string[] | string>;
        const [activityId] = (tags as string[])
          .filter((f) => f[0] === "e")
          .map((m) => m[1]);
        if (activityId === ele.id) {
          ele.client_likeId = id as string;
          return true;
        } else return false;
      });
    });
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
