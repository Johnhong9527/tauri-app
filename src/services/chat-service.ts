import {createAxiosByinterceptors} from '@/utils/request'

// 列出本地模型
const request = createAxiosByinterceptors({
    baseURL: "http://localhost:11434/api",
    headers: {
        'Content-Type': 'application/json'
    }
});


// 列出本地模型
export const getTags = () => request.get("/tags");
export const getChat = (params: any) => request.post("/chat", params);


