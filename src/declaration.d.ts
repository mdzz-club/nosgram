/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-28 14:33:29
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-09 22:10:13
 * @FilePath: /nosgram/src/declaration.d.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
declare module "vue3-virtual-scroll-list" {
  const vis: any;
  export default vis;
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    localforage: any;
    randomEventId: any;
  }
}

declare interface Crypto {
  randomUUID(): string;
}
