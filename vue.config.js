/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-02-24 17:04:18
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-10 14:18:58
 * @FilePath: /nosgram/vue.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const { defineConfig } = require("@vue/cli-service");
const Icons = require("unplugin-icons/webpack");
const AutoImport = require("unplugin-auto-import/webpack");
const Components = require("unplugin-vue-components/webpack");
const IconsResolver = require("unplugin-icons/resolver");
const { ElementPlusResolver } = require("unplugin-vue-components/resolvers");

// const path = require("path");
// const pathSrc = path.resolve(__dirname, "src");

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: (config) => {
    config.plugins = [
      ...config.plugins,
      AutoImport({
        imports: ["vue-router", "vuex"],
        resolvers: [ElementPlusResolver(), IconsResolver({ prefix: "Icon" })],
        dts: "src/auto-import.d.ts",
      }),
      Components({
        resolvers: [
          ElementPlusResolver(),
          IconsResolver({
            prefix: "icon",
            enabledCollections: ["ep", "ion", "majesticons"],
          }),
        ],
        dts: "src/components.d.ts",
      }),
      Icons({
        compiler: "vue3",
        // 自动安装
        autoInstall: true,
      }),
    ];
  },
});
