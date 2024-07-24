import React from "react";
import { NavigateFunction } from "react-router";
import type { Location } from "@remix-run/router";
export default ({
  setPlaceholder,
  navigate,
  location,
}: {
  setPlaceholder: React.Dispatch<React.SetStateAction<any>>;
  navigate: NavigateFunction;
  location: Location;
}) => {
  const calculateFn = ({ title = "", path = "", isCallBack = true }) => {
    if (isCallBack) {
      return {
        title: title,
        path,
        onClick: () => {
          navigate(path, {
            replace: true,
          });
        },
      };
    }
    return {
      title: title,
    };
  };
  // 文件管理 的面包屑配置
  if (location.pathname === "/") {
    setPlaceholder([
      calculateFn({
        title: "文件管理",
        isCallBack: false,
      }),
    ]);
  }

  // 文件详情 的面包屑配置
  if (/^\/calculate\/[0-9]?$/.test(location.pathname)) {
    setPlaceholder([
      calculateFn({
        title: "文件管理",
      }),
      calculateFn({ title: "文件详情", isCallBack: false }),
    ]);
  }
  // 重复文件 的面包屑配置
  if (/^\/calculate-list\/[0-9]?$/.test(location.pathname)) {
    setPlaceholder([
      calculateFn({
        title: "文件管理",
      }),
      calculateFn({
        title: "文件详情",
        path: `${location.pathname}`.replace(/-list/g, ""),
      }),
      calculateFn({ title: "重复文件", isCallBack: false }),
    ]);
  }
  // 管理文件 的面包屑配置
  if (/^\/files-manage\/[0-9]?$/.test(location.pathname)) {
    setPlaceholder([
      calculateFn({
        title: "文件管理",
      }),
      calculateFn({
        title: "文件详情",
        path: `${location.pathname}`.replace(/files-manage/g, "calculate"),
      }),
      calculateFn({ title: "管理文件", isCallBack: false }),
    ]);
  }
  // 聊天 的面包屑配置
  if (/^\/chat/.test(location.pathname)) {
    setPlaceholder([
      calculateFn({ title: "chat", isCallBack: false }),
    ]);
  }
};
