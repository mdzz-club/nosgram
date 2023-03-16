/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-14 15:37:53
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-14 16:14:43
 * @FilePath: /nosgram/src/components/ChatInputBox/cursor.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

export interface DOMElement extends HTMLElement {
  document: Record<string, unknown>;
}

/**
 * 获取光标位置
 * @param {DOMElement} element 输入框的dom节点
 * @return {Number} 光标位置
 */
export const getCursorPosition = (element: DOMElement) => {
  let caretOffset = 0;
  const doc = element.ownerDocument || element.document;
  const win = doc.defaultView || (doc as any).parentWindow;
  const sel = win.getSelection();
  if (sel.rangeCount > 0) {
    const range = win.getSelection().getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    caretOffset = preCaretRange.toString().length;
  }
  return caretOffset;
};

/**
 * 设置光标位置
 * @param {DOMElement} element 输入框的dom节点
 * @param {Number} cursorPosition 光标位置的值
 */
export const setCursorPosition = (
  element: HTMLElement,
  cursorPosition: number
) => {
  const range = document.createRange();
  range.setStart(element.firstChild as ChildNode, cursorPosition);
  range.setEnd(element.firstChild as ChildNode, cursorPosition);
  const sel = window.getSelection();
  (sel as Selection).removeAllRanges();
  (sel as Selection).addRange(range);
};
