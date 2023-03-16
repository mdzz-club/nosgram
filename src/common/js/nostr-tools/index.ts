/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-01 16:33:37
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-13 22:50:04
 * @FilePath: /nosgram/src/common/js/nostr-tools/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { dayjs } from "element-plus";
import type { mapOriginDataResult, Author } from "./nostr-tools.d";

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

export const deDuplication = <
  T extends { id: string },
  U extends { id: string }
>(
  o: T[],
  n: U[]
): U[] => {
  const result: U[] = [];
  n.forEach((e) => {
    let isAdd = true;
    o.some((ele) => {
      if (ele.id === e.id) {
        isAdd = false;
        return true;
      } else return false;
    });
    if (isAdd) result.push(e);
  });
  return result;
};

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
            ? matchLinks.filter((e: string) =>
                new RegExp(videoRegExp, "g").test(e)
              )
            : [];
          // 过滤出图片链接
          const picLinks = matchLinks
            ? matchLinks.filter((e: string) =>
                new RegExp(picRegExp, "g").test(e)
              )
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
            result.client_photos = picLinks.map((e: string) =>
              mapALabelLink(e)
            );
          }
          if (videoLinks?.length) {
            videoLinks.forEach((e: string) => {
              md = md.replace(e, "");
            });
            result.client_videos = videoLinks.map((e: string) =>
              mapALabelLink(e)
            );
          }
          if (links?.length)
            result.client_links = links.map((e: string) => mapALabelLink(e));
          // !!!!!需要定位2个问题，有时候有图片链接不识别
          result.content = md;
        }
      }
    }
    if (item[3])
      result.clinet_api = (item[3] as Record<string, string>).clinet_api;
    return result;
  }
};

// 用于合并由nostrtoolsmixins getdata产出来源于多个中继的数据对象方法
export const mergeOriginData = (data: Record<string, unknown>) => {
  const keys = Object.keys(data);
  let result: unknown[] = [];
  keys.forEach((e) => {
    const newData = deDuplication(
      result as { id: string }[],
      data[e] as { id: string }[]
    );
    result = result.concat(newData);
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
  obj: Author
): Record<string, string | undefined | number> => {
  const result: Record<string, string | undefined | number> = {};
  result.icon = obj?.client_userInfo?.content?.picture;
  result.iconName = obj?.pubkey;
  result.author = obj?.client_userInfo
    ? obj?.client_userInfo.content.display_name ||
      obj?.client_userInfo.content.displayName ||
      obj?.client_userInfo.content.name
    : getAuthorIdName(obj?.pubkey);
  return result;
};
