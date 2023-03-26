/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-06 10:49:52
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-26 21:31:15
 * @FilePath: /nosgram/src/common/js/common.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export const random = (min: number, max: number): number => {
  const difference = max - min;
  return parseInt(`${Math.random() * (difference + 1) + min}`, 10);
};

export const randomUUID = (join: string): string => {
  const randomNumber = crypto ? crypto.randomUUID() : random(100000, 999999);
  return `${join ? `${join}:` : ""}${randomNumber}`;
};

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

export const isPhone = () => {
  const userAgentInfo = navigator.userAgent;
  const Agents = [
    "Android",
    "iPhone",
    "SymbianOS",
    "Windows Phone",
    // "iPad",
    "iPod",
  ];
  const getArr = Agents.filter((i) => userAgentInfo.includes(i));
  return getArr.length ? true : false;
};
