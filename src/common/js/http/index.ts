/*
 * @Author: un-hum 383418809@qq.com
 * @Date: 2023-03-15 14:28:15
 * @LastEditors: un-hum 383418809@qq.com
 * @LastEditTime: 2023-03-15 14:33:49
 * @FilePath: /nosgram/src/common/js/http/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import axios from "axios";
import { TIMEOUT_TIMES } from "./config";

const service = axios.create();
service.defaults.timeout = TIMEOUT_TIMES;

export default service;
