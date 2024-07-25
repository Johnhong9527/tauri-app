

// 列出本地模型

import axios, {AxiosInstance, AxiosRequestConfig} from "axios";

export const createAxiosByinterceptors = (
    config?: AxiosRequestConfig
): AxiosInstance => {
    return axios.create({
        timeout: 10000000,    //超时配置
        // withCredentials: true,  //跨域携带cookie
        ...config,   // 自定义配置覆盖基本配置
    });
};

