/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-14 15:56:58
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-14 16:00:59
 * @FilePath: /nosgram/src/components/ChatInputBox/paste.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const onPaste = (e: any) => {
  if (!(e.clipboardData && e.clipboardData.items)) {
    return;
  }
  return new Promise((resolve, reject) => {
    for (let i = 0, len = e.clipboardData.items.length; i < len; i++) {
      const item = e.clipboardData.items[i];
      if (item.kind === "string") {
        item.getAsString((str: string) => {
          resolve(str);
        });
      }
      // else if (item.kind === "file") {
      //   const pasteFile = item.getAsFile();
      //   const imgEvent = {
      //     target: {
      //       files: [pasteFile],
      //     },
      //   };
      //   chooseImg(imgEvent, (url) => {
      //     resolve(url);
      //   });
      // }
      else {
        reject(new Error("Not allow to paste this type!"));
      }
    }
  });
};

export default onPaste;
