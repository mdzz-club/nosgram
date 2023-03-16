<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-14 15:22:13
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-16 21:04:38
 * @FilePath: /nosgram/src/containers/ChatInputBox/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="chat-input-box-container">
    <div class="chat-input-box">
      <div class="input-container">
        <el-button open-emoji class="emoji-button" link @click="toggle"
          ><el-icon size="40"><icon-ion-ios-happy /></el-icon
        ></el-button>
        <div
          class="input-box"
          contenteditable
          ref="input"
          @keyup="handleKeyup"
          @keydown.enter.prevent="submit"
          @paste.prevent="onPaste"
          @click="getCursor"
        ></div>
        <el-button @click="submit" class="send-button" link>发送</el-button>
      </div>
    </div>
    <div class="interaction-conmponent" v-if="openInteraction">
      <interaction
        @interaction-click-external="handleInteractionClickExternal"
        @item-click="interactionClick"
        :data="interactionData"
        ref="interaction"
      />
    </div>
    <div class="emoji-component" v-if="openEmoji">
      <emoji
        @emoji-click-external="handleEmojiClickExternal"
        @emoji-click="emojiClick"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import { getCursorPosition, setCursorPosition } from "./cursor";
// import emoji from "./emoji";
import paste from "./paste";
import type { DOMElement } from "./cursor";
import Emoji from "./Emoji/index.vue";

interface KeyupEvent extends Event {
  key: string;
}

@Options({
  components: {
    Emoji,
  },
})
export default class ChatInputBox extends Vue {
  @Prop({ default: true }) isInteraction!: boolean;
  @Prop({ default: "150px" }) interactionHeight!: string;
  @Prop({ default: "300px" }) emojiHeight!: string;
  editor: DOMElement | undefined = undefined;
  openEmoji = false;
  openInteraction = false;
  cursorPosition = 0;
  interactionData: Record<string, string | number>[] = [];
  interactionMatchText = "";
  interactionPosition: null | number = null; // 用于记录是哪个位置的@或者#符号触发的这次互动，若at符号不在位置，则取消这次互动
  interactionType: "@" | "#" = "@";
  timeout: number | null = null;
  mounted() {
    this.editor = this.$refs["input"];
  }
  submit(e: any) {
    const input = this.$refs.input;
    const value = input.innerHTML.replace(/[\n\r]$/, "");
    if (value) {
      console.info("Submit text", { value });
      input.innerText = "";
    }
  }
  async onPaste(e: unknown) {
    const result = await paste(e);
    // const imgRegx = /^data:image\/png;base64,/;
    // if (imgRegx.test(result as string)) {
    //   document.execCommand("insertImage", false, result as string);
    // } else {
    document.execCommand("insertText", false, result as string);
    // }
  }
  emojiClick(item: string) {
    this.insertEmoji(item);
  }
  interactionClick(item: Record<string, Record<string, string>>) {
    this.insertInteraction(item);
    this.openInteraction = false;
  }
  handleEmojiClickExternal() {
    this.openEmoji = false;
  }
  handleInteractionClickExternal() {
    this.openInteraction = false;
  }
  toggle() {
    this.openEmoji = !this.openEmoji;
    if (this.openEmoji) this.openInteraction = false;
  }
  getCursor() {
    this.cursorPosition = getCursorPosition(this.editor as DOMElement);
  }
  setInteractionData(data: Record<string, string | number>[]) {
    this.$refs["interaction"] && this.$refs["interaction"].setLoading(false);
    this.interactionData = data;
  }
  handleInteraction(e: KeyupEvent) {
    if (e.key === "@" || e.key === "#") {
      this.interactionData = [];
      this.openInteraction = true;
      this.openEmoji = false;
      this.interactionType = e.key;
      this.interactionPosition = this.cursorPosition - 1;
    }
  }
  interactionContentChange(e: any) {
    const value = e.target.innerHTML.replace(/[\n\r]$/, "");
    if (
      /\s/.test(e.key) ||
      value === "" ||
      this.interactionPosition === null ||
      this.interactionPosition === undefined ||
      (value.substr([this.interactionPosition as number], 1) !== "@" &&
        value.substr([this.interactionPosition as number], 1) !== "#")
    ) {
      this.openInteraction = false;
      return;
    }
    const findContent = (
      params: string,
      startIndex: number,
      endIndex: number,
      endKey = "@",
      result = ""
    ): string | Record<string, string | number> => {
      if (startIndex === -1) return "";
      const slice = params.slice(startIndex, startIndex + 1);
      if (slice === endKey)
        return {
          text: result,
          startIndex,
          endIndex,
        };
      return findContent(
        params,
        startIndex - 1,
        endIndex,
        endKey,
        `${slice}${result}`
      );
    };
    // 只有键盘输入或者删除字符需要emit
    if (e.key === "Backspace" || e.key.length === 1) {
      const content = findContent(
        value,
        this.cursorPosition - 1,
        this.cursorPosition - 1,
        this.interactionType
      );
      this.$emit("interaction-input", (content as Record<string, string>).text);
      this.interactionMatchIndex = content;
      if (content) this.$refs["interaction"].setLoading(true);
    }
  }
  handleKeyup(e: KeyupEvent) {
    this.getCursor();
    // 处理at相关逻辑
    if (this.isInteraction && !this.openInteraction)
      this.handleInteraction(e); // 开启互动窗口
    else if (this.isInteraction && this.openInteraction) {
      if (this.timeout) clearTimeout(this.timeout);
      this.timeout = window.setTimeout(() => {
        this.interactionContentChange(e); // 处理输入信息
      }, 200);
    }
  }
  insertEmoji(emoji: string) {
    const editor = this.editor as DOMElement;
    const text = editor.innerHTML;
    // 检查是否在nbsp;中
    const isNbsp =
      `${text.slice(
        this.cursorPosition - 2 < 0 ? 0 : this.cursorPosition - 1,
        this.cursorPosition
      )}${text.slice(this.cursorPosition, this.cursorPosition + 5)}` ===
      "&nbsp;";
    const startStr = text.slice(0, this.cursorPosition - (isNbsp ? 1 : 0));
    const endStr = text.slice(
      this.cursorPosition + (isNbsp ? 5 : 0),
      text.length
    );
    editor.innerHTML = `${startStr}${isNbsp ? ` ${emoji}` : emoji}${endStr}`;
    setCursorPosition(editor, this.cursorPosition + 1);
    this.cursorPosition = getCursorPosition(editor) + 1;
  }
  insertInteraction(params: Record<string, Record<string, string>>) {
    // 原字符串
    const { startIndex, endIndex } = this.interactionMatchIndex;
    // 用户点击的at对象
    const { key } = params.params;

    const editor = this.editor as DOMElement;
    const editorText = editor.innerHTML;

    const startStr = editorText.slice(0, startIndex);
    const endStr = editorText.slice(endIndex + 1, editorText.length);
    editor.innerHTML = `${startStr}${this.interactionType}${key}&nbsp;${endStr}`;
    setCursorPosition(editor, startIndex + key.length + 2);
    this.cursorPosition = getCursorPosition(editor);
  }
}
</script>

<style lang="scss" scoped>
.emoji-component {
  position: absolute;
  z-index: 2;
  left: 0;
  bottom: 65px;
  width: 80%;
}
.interaction-conmponent {
  position: absolute;
  left: 0;
  bottom: 65px;
}
.chat-input-box {
  position: relative;
  height: 55px;
  border: solid 1px rgb(var(--border-color));
  border-radius: 100px;
  width: calc(100% - 40px);
  margin: auto auto 10px auto;
  &-container {
    display: flex;
    position: relative;
    flex-wrap: wrap;
  }
  .input-container {
    display: flex;
    align-items: center;
    height: 100%;
    .input-box {
      width: 85%;
      height: 90%;
      max-height: 55px;
      display: flex;
      align-items: center;
      border: none;
      box-sizing: border-box;
      overflow: scroll;
      word-break: break-all;
      overflow-wrap: break-word;
      padding: 5px;
      outline: none;
      transition: all 0.3s;
      font-size: 16px;
      line-height: 16px;
      &:focus {
        max-height: 90px;
      }
    }
  }
}
.send-button {
  width: 50px;
  font-weight: bold;
  font-size: 16px;
}

@media screen and (max-width: 480px) {
  .chat-input-box {
    flex-wrap: wrap;
  }
  .emoji-component,
  .interaction-conmponent {
    position: relative !important;
    box-shadow: none;
    bottom: 0px;
    width: 100%;
    :deep(.emoji-container),
    :deep(.interaction-container) {
      width: 100%;
    }
  }
}
</style>
