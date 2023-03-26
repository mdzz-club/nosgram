<!--
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-14 15:22:13
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-26 21:35:01
 * @FilePath: /nosgram/src/containers/ChatInputBox/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="chat-input-box-container">
    <div class="chat-input-box">
      <div
        class="input-container"
        :class="{ 'align-items-center': verticalCenter }"
      >
        <el-button v-if="emojiButton" class="emoji-button" link @click="toggle"
          ><el-icon size="30"><icon-ion-ios-happy /></el-icon
        ></el-button>
        <slot name="before-input" />
        <div
          class="input-box"
          :class="{
            'full-width-important': !sendButton,
            'align-items-center': verticalCenter,
          }"
          contenteditable
          ref="input"
          @keyup="handleKeyup"
          @keydown.enter.prevent="submit"
          @paste.prevent="onPaste"
          @click="getCursor"
        ></div>
        <slot name="after-input" />
        <el-button v-if="sendButton" @click="submit" class="send-button" link
          >发送</el-button
        >
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
        :height="emojiHeight"
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
  @Prop({ default: true }) emojiButton!: boolean;
  @Prop({ default: true }) sendButton!: boolean;
  @Prop({ default: true }) verticalCenter!: boolean;
  @Prop({ default: "" }) placeholder!: string;
  @Prop({ default: false }) allowedBlank!: boolean;
  @Prop({ default: "300px" }) emojiHeight!: string;
  editor: DOMElement | undefined = undefined;
  openEmoji = false;
  openInteraction = false;
  cursorPosition = 0;
  interactionData: Record<string, string | number>[] = [];
  interactionMatchText = "";
  interactionKeyPosition: null | number = null; // 用于记录是哪个位置的@或者#符号触发的这次互动，若at符号不在位置，则取消这次互动
  interactionType: "@" | "#" = "@";
  timeout: number | null = null;
  interactionForm: (string | Record<string, string>)[][] = [];
  mounted() {
    this.editor = this.$refs["input"];
  }
  getContent() {
    return this.$refs["input"].innerHTML;
  }
  submit() {
    const input = this.$refs["input"];
    const value = input.innerHTML.replace(/[\n\r]$/, "");
    if (!value && !this.allowedBlank) return;
    this.$emit("submit", {
      content: value,
      tags: this.interactionForm,
    });
    input.innerText = "";
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
  _clear() {
    const input = this.$refs["input"];
    input.innerText = "";
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
    this.$nextTick(() => {
      this.$refs["interaction"] && this.$refs["interaction"].setLoading(false);
    });
    this.interactionData = data;
  }
  handleInteraction(e: KeyupEvent) {
    if (e.key === "@" || e.key === "#") {
      this.interactionData = [];
      this.openInteraction = true;
      this.openEmoji = false;
      this.interactionType = e.key;
      this.interactionKeyPosition = this.cursorPosition - 1;
    }
  }
  interactionContentChange(e: any) {
    const value = e.target.innerHTML.replace(/[\n\r]$/, "");
    if (
      /\s/.test(e.key) ||
      value === "" ||
      this.interactionKeyPosition === null ||
      this.interactionKeyPosition === undefined ||
      (value.substr([this.interactionKeyPosition as number], 1) !== "@" &&
        value.substr([this.interactionKeyPosition as number], 1) !== "#")
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
    // 只有键盘输入\删除\粘贴字符需要emit
    const content = findContent(
      value,
      this.cursorPosition - 1,
      this.cursorPosition - 1,
      this.interactionType
    );
    const { text } = content as Record<string, string>;
    if (!text) return;
    this.$emit("interaction-input", {
      content: (content as Record<string, string>).text,
      type: this.interactionType,
    });
    this.interactionMatchIndex = content;
    if (content) this.$refs["interaction"].setLoading(true);
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
  setForm(data: Record<string, string | Record<string, string>>) {
    // const { key, value, type } = data;
    const { key, type, value, content } = data;
    const form = [
      type === "@" ? "p" : "t",
      type === "@" ? value : key,
      `${type}${key}`,
      content,
    ];
    this.interactionForm.push(form);
  }
  insertInteraction(params: Record<string, Record<string, string>>) {
    // 原字符串
    const { startIndex, endIndex } = this.interactionMatchIndex;
    // 用户点击的at对象
    const { key, value, type } = params.params;
    const { content } = params;

    const editor = this.editor as DOMElement;
    const editorText = editor.innerHTML;

    const startStr = editorText.slice(0, startIndex);
    const endStr = editorText.slice(endIndex + 1, editorText.length);
    editor.innerHTML = `${startStr}${this.interactionType}${key}&nbsp;${endStr}`;
    this.setForm({ key, value, type, content });
    setCursorPosition(editor, startIndex + key.length + 2);
    this.cursorPosition = getCursorPosition(editor);
  }
}
</script>

<style lang="scss" scoped>
.input-placeholder {
  position: absolute;
  font-size: 16px;
  padding: 5px;
  width: 100%;
  left: 0;
  top: 0;
  pointer-events: none;
  &.verticalCenter {
    bottom: 0;
    margin: auto;
  }
}
.interaction-conmponent,
.emoji-component {
  position: absolute;
  z-index: 2;
  left: 0px;
  top: 0;
  transform: translateY(calc(-100% - 10px));
}
.chat-input-box {
  position: relative;
  height: 55px;
  border: solid 1px rgb(var(--border-color));
  border-radius: 100px;
  width: 100%;
  &-container {
    display: flex;
    position: relative;
    flex-wrap: wrap;
  }
  .input-container {
    display: flex;
    height: 100%;
    .input-box {
      width: 85%;
      height: 90%;
      max-height: 55px;
      display: flex;
      border: none;
      box-sizing: border-box;
      overflow: scroll;
      word-break: break-all;
      overflow-wrap: break-word;
      padding: 5px;
      outline: none;
      transition: all 0.3s;
      font-size: 16px;
      line-height: 1.1em;
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
    bottom: 0px;
    left: 0;
    width: 100%;
    transform: translateY(0);
    :deep(.emoji-container),
    :deep(.interaction-container) {
      width: 100%;
      box-shadow: none;
    }
  }
}
</style>
