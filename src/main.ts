/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-24 17:04:18
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-15 14:34:38
 * @FilePath: /nosgram/src/main.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import localforage from "localforage";
import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import VueDOMPurifyHTML from "vue-dompurify-html";
import { randomUUID } from "@/common/js/common";
import http from "@/common/js/http/index";

const app = createApp(App);

app.config.globalProperties.localforage = localforage;
app.config.globalProperties.randomEventId = randomUUID;
app.config.globalProperties.$http = http;

app.use(store).use(VueDOMPurifyHTML).use(router).mount("#app");
