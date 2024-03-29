/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-26 19:18:09
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-27 16:03:06
 * @FilePath: /nosgram/src/common/js/relays/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * 预设的中继列表
 */
export default [
  {
    alias: "relay-roli-social",
    url: "wss://relay.roli.social",
    read: true,
    write: true,
  },
  {
    alias: "nostr-wine",
    url: "wss://nostr.wine",
    read: true,
    write: true,
  },
  {
    alias: "relay-nostr-band",
    url: "wss://relay.nostr.band",
    read: true,
    write: true,
  },
  {
    alias: "nostring-deno-dev",
    url: "wss://nostring.deno.dev",
    read: true,
    write: true,
  },
  {
    alias: "relay-damus-io",
    url: "wss://relay.damus.io",
    read: true,
    write: true,
  },
];
