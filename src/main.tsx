import React from "react";
import ReactDOM from "react-dom/client";
import zhCN from 'antd/locale/zh_CN';
// for date-picker i18n
import 'dayjs/locale/zh-cn';
import { BrowserRouter, RouterProvider } from "react-router-dom";
import Router from "./Router";
import "./style.css";
import { ConfigProvider } from "antd";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <ConfigProvider locale={zhCN}>
    <React.StrictMode>
      <RouterProvider router={Router} />
    </React.StrictMode>
  </ConfigProvider>
  
);
