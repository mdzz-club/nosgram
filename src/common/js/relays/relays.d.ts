/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-26 19:18:34
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-27 17:42:33
 * @FilePath: /nosgram/src/common/js/relays/relays.d.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export interface Relay {
  alias?: string;
  url: string;
  read: boolean;
  write: boolean;
  delete?: boolean;
}
