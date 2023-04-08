/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-01 13:53:11
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-04-08 10:23:13
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
import { finishEvent } from "nostr-tools";

export default class nostrToolsMixins extends Vue {
  defaultRelays = JSON.parse(JSON.stringify(relays)).map((e: Relay) => e.url);
  // 获取动态中存在at的情况的真实用户信息
  async _getInteraction(activityData: mapOriginDataResult[]) {
    const authors: string[] = [...new Set(setInteraction(activityData))];
    if (!authors?.length) return;
    const res: mapOriginDataResult[] = await nostrToolsModule.ns_send({
      url: loginModule.readRelays,
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
  async _setUser(data: mapOriginDataResult[]) {
    const userList = data
      .filter((e: mapOriginDataResult) => e.client_messageType !== "EOSE")
      .map((e: mapOriginDataResult) => e.pubkey);
    const userData: mapOriginDataResult[] = await this._getUser(
      userList as string[]
    );
    data.forEach((item) => {
      userData.some((user) => {
        if (item.pubkey === user.pubkey) {
          (item as Record<string, Client_userInfo>)["client_userInfo"] =
            user as Client_userInfo;
          return true;
        } else return false;
      });
    });
  }
  /**
   * @method _getUser 获取用户信息
   * @param data {Array} 需要获取信息的数组
   * @param cover {Boolean} 是否需要全部远程拉取数据
   * @returns 用户列表
   */
  async _getUser(
    data: string[],
    cover = false
  ): Promise<mapOriginDataResult[]> {
    let userData: mapOriginDataResult[] = [];
    const authors = [...new Set(data)]; // 调用方法需要获取到的用户列表
    let reqList: string[] = []; // 需要远程请求的用户列表
    const localUserData: mapOriginDataResult[] = []; // 本地缓存下来对应需要使用的用户列表
    // 覆盖模式
    const coverMode = cover || data.length === 1;
    // 本地存储获取缓存的用户列表
    const localforage_userData =
      (await window.localforage.getItem("user_list")) || [];
    if (localforage_userData?.length) {
      // 过滤出需要请求的列表
      authors.forEach((e) => {
        let item = null;
        localforage_userData.some((user: mapOriginDataResult) => {
          if (e === user.pubkey) {
            localUserData.push(user);
            item = user;
            return true;
          } else return false;
        });
        if (!item) reqList.push(e as string);
      });
    } else reqList = authors as string[];
    // 如果携带cover参数或者长度唯一的查询用户信息则表示这一条/批数据需要覆写
    if (coverMode) reqList = data;
    if (reqList.length) {
      // 获取动态对应用户的信息
      userData = await nostrToolsModule.ns_send({
        url: loginModule.readRelays,
        params: [
          "REQ",
          this.randomEventId("user"),
          {
            kinds: [0],
            until: ~~(Date.now() / 1000),
            limit: reqList.length,
            authors: reqList,
          },
        ],
      });
      let userList: mapOriginDataResult[] = localforage_userData;
      if (coverMode) {
        userData.forEach((newData: mapOriginDataResult) => {
          userList.some((oldData: mapOriginDataResult, index: number) => {
            if (newData.id === oldData.id) {
              userList[index] = newData;
              return true;
            } else return false;
          });
        });
      } else userList = userList.concat(userData);
      const parse = JSON.parse(JSON.stringify(userList));
      window.localforage.setItem("user_list", parse);
    }
    return (userData || []).concat(localUserData);

    // data.forEach((item) => {
    //   const someData = (userData || []).concat(localUserData);
    //   someData.some((user) => {
    //     if (item.pubkey === user.pubkey) {
    //       (item as Record<string, Client_userInfo>)[key] =
    //         user as Client_userInfo;
    //       return true;
    //     } else return false;
    //   });
    // });
    // return data;
  }
  // 获取关注列表
  async _getFollow() {
    if (!loginModule.isLogin) return;
    const res: mapOriginDataResult[] = await nostrToolsModule.ns_send({
      url: loginModule.readRelays,
      params: [
        "REQ",
        this.randomEventId("follow-list"),
        {
          kinds: [3],
          authors: [loginModule.userInfo.publicKey],
          until: ~~(Date.now() / 1000),
        },
      ],
    });
    let item: mapOriginDataResult = {};
    res.forEach((e) => {
      if (
        !item?.id ||
        (item.id && (item.created_at as number) < (e.created_at as number))
      )
        item = e;
    });
    const result: Record<string, string[]> = {};
    if (item?.id) {
      item.tags?.forEach((e) => {
        result[e[1]] = e;
      });
    }
    loginModule.setUserFollow(result);
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
    if (!ids?.length) return;
    const forward: mapOriginDataResult[] = await nostrToolsModule.ns_send({
      url: loginModule.readRelays,
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
    await this._setUser(forward);
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
    if (!ids?.length) return;
    const res: mapOriginDataResult[] = await nostrToolsModule.ns_send({
      url: loginModule.readRelays,
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
      url: loginModule.writeRelays,
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
      return { type: success, id: success ? res[0].clinet_handleId : "" };
    } else return { type: false };
  }
  // 设置用户是否关注
  _setUserFollow(activityData: mapOriginDataResult[]) {
    const { userFollow } = loginModule;
    activityData.forEach((e) => {
      if (userFollow[e.pubkey as string]) e.client_follow = true;
      else e.client_follow = false;
    });
  }
  // 关注/取消关注
  async _setFollow(params: mapOriginDataResult) {
    const { pubkey } = params;
    const { userFollow } = loginModule;
    const reqParams = userFollow || {};
    if (!reqParams[pubkey as string])
      reqParams[pubkey as string] = ["p", pubkey as string];
    else delete reqParams[pubkey as string];
    loginModule.setUserFollow(reqParams);
    const tags: string[][] = Object.keys(reqParams).map((e) => reqParams[e]);
    const { privateKey } = loginModule.userInfo;
    const form = finishEvent(
      {
        kind: 3,
        content: "",
        created_at: ~~(Date.now() / 1000),
        tags,
      },
      privateKey as string
    );
    await this._sendEvent(form);
  }
}
