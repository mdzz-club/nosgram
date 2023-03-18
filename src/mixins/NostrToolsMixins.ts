/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-01 13:53:11
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-18 21:59:50
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
import { finishEvent } from "nostr-tools";

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
    const res: mapOriginDataResult[] = await nostrToolsModule.ns_send({
      url: this.defaultRelays,
      params: [
        "REQ",
        this.randomEventId("interaction"),
        {
          kinds: [0],
          until: ~~(Date.now() / 1000),
          authors: [...new Set(author)],
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
          limit: 1,
          authors: [
            ...new Set(
              activityData
                .filter(
                  (e: mapOriginDataResult) => e.client_messageType !== "EOSE"
                )
                .map((e: mapOriginDataResult) => e.pubkey)
            ),
          ],
        },
      ],
    });
    this.listData.forEach((item: mapOriginDataResult) => {
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
    console.log("-------res", res);
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
    console.log("-------activityData", activityData);
  }
  // 点赞
  async _like(
    params: { id: string; pubkey: string; client_likeId?: string },
    type: boolean
  ) {
    if (!loginModule.isLogin) {
      loginModule.toggle();
      return;
    }
    const { privateKey } = loginModule.userInfo;
    const { id, pubkey, client_likeId } = params;
    const req = finishEvent(
      type
        ? {
            kind: 7,
            content: "+",
            created_at: ~~(Date.now() / 1000),
            tags: [
              ["e", id],
              ["p", pubkey],
            ],
          }
        : {
            kind: 5,
            content: "cancle",
            created_at: ~~(Date.now() / 1000),
            tags: [["e", client_likeId as string]],
          },
      privateKey as string
    );
    const res: mapOriginDataResult[] = await nostrToolsModule.ns_send({
      url: this.defaultRelays,
      params: ["EVENT", req],
    });
    console.log(res, "-------------------like");
    if (res) {
      let success = false;
      res.some((e) => {
        if (e.client_messageType) {
          success = true;
          return true;
        } else return false;
      });
      return success;
    } else return false;
  }
}
