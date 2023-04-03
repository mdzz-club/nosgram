/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-24 17:04:18
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-29 12:02:31
 * @FilePath: /nosgram/src/router/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "home",
  },
  {
    path: "/follower",
    name: "follower",
    component: () =>
      import(/* webpackChunkName: "follower" */ "@/views/Follower/index.vue"),
  },
  {
    path: "/home",
    name: "home",
    component: () =>
      import(/* webpackChunkName: "home" */ "@/views/Home/index.vue"),
  },
  {
    path: "/setting",
    name: "setting",
    component: () =>
      import(/* webpackChunkName: "setting" */ "@/views/Setting/index.vue"),
  },
  {
    path: "/details/:id",
    name: "details",
    component: () =>
      import(/* webpackChunkName: "Details" */ "@/views/Details/index.vue"),
  },
  {
    path: "/user/:id",
    name: "user",
    component: () =>
      import(/* webpackChunkName: "User" */ "@/views/User/index.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
