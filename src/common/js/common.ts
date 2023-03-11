/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-06 10:49:52
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-09 20:20:04
 * @FilePath: /nosgram/src/common/js/common.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export const random = (min: number, max: number): number => {
  const difference = max - min;
  return parseInt(`${Math.random() * (difference + 1) + min}`, 10);
};

export const randomUUID = (join: string): string => {
  return `${join ? `${join}:` : ""}${crypto.randomUUID()}`;
};
