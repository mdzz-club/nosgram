/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-01 16:33:37
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-05-05 22:14:20
 * @FilePath: /nosgram/src/common/js/nostr-tools/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { dayjs } from "element-plus";
import type {
  mapOriginDataResult,
  Author,
  Client_userInfo,
  ProcessingContent,
} from "./nostr-tools.d";
import * as secp from "@noble/secp256k1";

enum mapOriginDataType {
  metadata,
  note,
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const iterator = require("markdown-it-for-inline");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mdIt = require("markdown-it")({
  html: true,
  linkify: true,
  typographer: true,
});
// // 防止xss攻击，暂时禁用target属性
// mdIt.use(
//   iterator,
//   "url_new_win",
//   "link_open",
//   function (
//     tokens: Record<string, (params: string | string[]) => string>[],
//     idx: number
//   ) {
//     const hrefAttr = tokens[idx].attrGet("href");

//     if (/^https?/.test(hrefAttr)) {
//       tokens[idx].attrPush(["target", "_blank"]);
//       tokens[idx].attrPush(["rel", "noopener"]);
//     }
//   }
// );

const mapALabelLink = (e: string) => {
  const regExp = new RegExp('<a href="(.*?)">', "g");
  const matches = e.match(regExp);
  return matches?.[0]
    ? matches[0].replace('<a href="', "").replace('">', "")
    : "";
};

const getRichTextContent = (
  content: string,
  splitArray: string[],
  result: (string | Record<string, string>)[] = []
): (string | Record<string, string>)[] => {
  if (!content) return result;
  if (!splitArray.length) {
    result = result.concat(content);
    return result;
  }
  const jsonParse: string[] = JSON.parse(JSON.stringify(splitArray));
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const splitIndex = jsonParse.shift()!;
  const split = content.split(splitIndex);
  result.push(split[0]);
  result = result.concat({ index: splitIndex });
  return getRichTextContent(split[1], jsonParse, result);
};

/**
 * @method setInteraction 设置数据中用于显示互动(@/#/转发)数据逻辑
 * @param data 源数据
 * @returns 需要请求的用户信息列表
 */
export const setInteraction = (data: mapOriginDataResult[]): string[] => {
  const author: string[] = [];
  data.forEach((e) => {
    if (e?.client_richTextIndex?.length && e?.tags?.length) {
      const indexArr = e.client_richTextIndex;
      const tags = e.tags;
      const dic = (key: string) =>
        ({ e: "forward", p: "user", t: "topic" }[key] || "");
      indexArr.forEach((element: string) => {
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
          tags.some((e: string[], i: number) => {
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
  return author;
};

export const processingContent = (params: string) => {
  const result: ProcessingContent = {
    content: params,
    client_richTextContent: [],
  };
  let md = mdIt.render(result.content);
  const matchLinks = md.match(/<a.*?href="(.*?)".*?>(.*?)<\/a>/g);
  const videoRegExp = "mp4|avi|webm|flv|wmv";
  const picRegExp = "jpg|jpeg|png|gif|bmp|webp";
  // 过滤出at信息
  const client_richTextIndex: string[] | null = (
    result.content as string
  ).match(/#\[(\d+)\]/g);
  if (client_richTextIndex?.length) {
    result.client_richTextContent = getRichTextContent(
      (result.content as string)
        .replace(/\n/g, "<br/>")
        .replace(/\s/g, "&nbsp;"),
      client_richTextIndex,
      []
    );
    result.client_richTextIndex = client_richTextIndex;
  } else {
    // 处理话题特殊情况（不用#[数字]）
    const tags = result.tags?.filter((e) => e[0] === "t");
    if (tags?.length) {
      const clinet_tags = tags.map((e) => `#${e[1]}`);
      result.client_richTextContent = getRichTextContent(
        (result.content as string).replace(/\n/g, "<br/>"),
        clinet_tags,
        []
      );
      result.client_richTextIndex = clinet_tags;
    }
  }
  // 过滤出视频链接
  const videoLinks = matchLinks
    ? matchLinks.filter((e: string) => new RegExp(videoRegExp, "g").test(e))
    : [];
  // 过滤出图片链接
  const picLinks = matchLinks
    ? matchLinks.filter((e: string) => new RegExp(picRegExp, "g").test(e))
    : [];
  // 过滤出普通连接
  const links = matchLinks
    ? matchLinks.filter(
        (e: string) =>
          !new RegExp([videoRegExp, picRegExp].join("|"), "g").test(e)
      )
    : [];
  if (picLinks?.length) {
    picLinks.forEach((e: string) => {
      md = md.replace(e, "");
    });
    result.client_photos = picLinks.map((e: string) => mapALabelLink(e));
  }
  if (videoLinks?.length) {
    videoLinks.forEach((e: string) => {
      md = md.replace(e, "");
    });
    result.client_videos = videoLinks.map((e: string) => mapALabelLink(e));
  }
  if (links?.length)
    result.client_links = links.map((e: string) => mapALabelLink(e));
  // to do 有时候有图片链接不识别
  result.content = md;
  return result;
};

export const mapOriginData = (
  item: (string | number | Record<string, string> | [])[],
  type: mapOriginDataType
) => {
  if (type === mapOriginDataType.metadata || type === mapOriginDataType.note) {
    let result: mapOriginDataResult = {
      clinet_handleId: item[1] as string,
      client_messageType: item[0] as string,
    };
    if (item[2]) {
      result = { ...(item[2] as []), ...result };
      if (result?.content) {
        try {
          result.content = JSON.parse(result.content as string);
        } catch (e) {
          result = {
            ...result,
            ...processingContent(result.content as string),
          };
        }
      }
    }
    if (item[3])
      result.clinet_api = (item[3] as Record<string, string>).clinet_api;
    return result;
  }
};

export const deDuplication = (
  o: (string | Record<string, string>)[][],
  n: (string | Record<string, string>)[][]
): (string | Record<string, string>)[][] => {
  const result: (string | Record<string, string>)[][] = [];
  n.forEach((e) => {
    const nId = (e[2] as Record<string, string>)?.id;
    let isAdd = true;
    o.some((ele) => {
      const oId = (ele[2] as Record<string, string>)?.id;
      if (nId === oId) {
        isAdd = false;
        return true;
      } else return false;
    });
    if (isAdd) result.push(e);
  });
  return result;
};

// 用于合并由nostrtoolsmixins getdata产出来源于多个中继的数据对象方法
export const mergeOriginData = (data: Record<string, unknown>) => {
  const keys = Object.keys(data);
  let result: (string | Record<string, string>)[][] = [];
  keys.forEach((e) => {
    const concatData = deDuplication(
      result,
      data[e] as (string | Record<string, string>)[][]
    );
    result = result.concat(concatData);
  });
  return result;
};

export const getAuthorIdName = (id: string | undefined) => {
  if (!id) return "";
  return `${id.slice(0, 4)}...${id.slice(-4)}`;
};

export const resetTime = (time: number | undefined, nullText = "刚刚") => {
  if (!time) return nullText;
  const create = dayjs(dayjs(time * 1000).format("YYYY-MM-DD HH:mm:ss"));
  const now = dayjs(dayjs(+new Date()).format("YYYY-MM-DD HH:mm:ss"));

  // const diff = now.diff(create, "seconds");
  const diff = now.diff(create, "minute");
  if (diff < 1) return `${now.diff(create, "seconds")}秒前`;
  else if (diff >= 1 && diff < 30) return `${now.diff(create, "minute")}分钟前`;
  else if (diff >= 30 && diff < 60) return "半小时前";
  else if (diff >= 60 && diff < 60 * 24)
    return `${now.diff(create, "hour")}小时前`;
  else return `1天前`;
};

export const getAuthor = (
  obj: Author | Client_userInfo,
  key = "client_userInfo"
): Record<string, string | undefined | number> => {
  const result: Record<string, string | undefined | number> = {};
  if (obj) {
    result.iconName = (obj as Record<string, string>).pubkey;
    let icon = "";
    let author = "";
    const keyObj = key === "content" ? obj : (obj as Author)[key];
    if (keyObj && (keyObj as Client_userInfo).content) {
      const content = (keyObj as Client_userInfo).content;
      icon = content.picture as string;
      author =
        (content.display_name as string) ||
        (content.displayName as string) ||
        (content.name as string) ||
        getAuthorIdName((obj as Record<string, string>).pubkey);
    } else {
      icon = "";
      author = getAuthorIdName((obj as Record<string, string>).pubkey);
    }
    result.icon = icon;
    result.author = author;
  }
  return result;
};

/**
 * @method getKeyType 获取输入key的类型
 * @param {string} key key
 * @returns {string} 返回key的类型
 */
export const getKeyType = (key: string) => {
  const EmailRegex = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
  const MnemonicRegex = /^([^\s]+\s){11}[^\s]+$/;
  if (key.startsWith("nsec")) {
    return "nsec"; // 返回私钥-（bech32编码方式）
  } else if (key.startsWith("npub")) {
    return "npub"; // 返回共钥-（bech32编码方式）
  } else if (key.match(EmailRegex)) {
    return "nip05"; // 返回共钥匙-（需要调接口拿到公钥）
  } else if (key.match(MnemonicRegex)) {
    return "mnemonic"; // 返回助记词-（前端处理）
  } else if (secp.utils.isValidPrivateKey(key)) {
    return "privateKey"; // 返回私钥-（16进制编码）
  } else {
    // throw new Error("INVALID PRIVATE KEY");
    return "";
  }
  // nip07 浏览器插件注入
};
