/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-07 10:53:45
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-04-03 16:06:37
 * @FilePath: /nosgram/src/common/js/nostr-tools/nostr-tools.d.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export interface Client_tags {
  id: string;
  content?: Record<string, string>;
  type?: string;
  tagsIndex?: string;
  client_forward?: mapOriginDataResult;
}

export interface Client_userInfo {
  content: Record<string, string | number>;
}

export interface Client_likes {
  kind: number;
}

export interface mapOriginDataResult {
  id?: string;
  clinet_handleId?: string;
  client_messageType?: string;
  clinet_api?: string;
  client_activity?: unknown;
  client_userInfo?: unknown;
  client_follow?: boolean;
  client_photos?: string[];
  client_videos?: string[];
  client_links?: string[];
  client_likeId?: string;
  client_richTextContent?: (string | Record<string, string>)[];
  client_richTextIndex?: string[];
  client_likes?: unknown;
  client_tags?: Record<string, Client_tags | string>;
  content?: string | Record<string, unknown>;
  pubkey?: string;
  tags?: string[][];
  created_at?: number;
}

// export interface Author {
//   client_userInfo?: Client_userInfo;
//   pubkey?: string;
// }

export type Author = Record<string, string | Client_userInfo>;

export interface ProcessingContent {
  content: string;
  client_richTextContent?: (string | Record<string, string>)[];
  client_richTextIndex?: string[] | undefined;
  client_photos?: string[];
  client_videos?: string[];
  client_links?: string[];
  tags?: string[][];
}
