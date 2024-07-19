import * as React from "react";
import {
  Routes,
  Route,
  Outlet,
  Link,
  useNavigate,
  useResolvedPath,
  useLocation,
} from "react-router-dom";
import styles from "./Layout.module.less";
// 监听 tauri 事件
import { listen, Event as TauriEvent, UnlistenFn } from "@tauri-apps/api/event";
import Menu from "../Menu/Menu";
import { Affix, Breadcrumb } from "antd";
import userRouter from "@/Router";
import { useState } from "react";
import breadcrumbManage from "./breadcrumbManage";

export default function Layout() {
  let navigate = useNavigate();
  let location = useLocation();
  const [placeholder, setPlaceholder] = useState<any[]>([]);

  function handleErr(msg: string) {
    console.log(msg);
  }

  function handleSuc(msg: string) {
    console.log(msg);
  }

  React.useEffect(() => {
    const unListen: UnlistenFn[] = [];
    listen("routing", (e: TauriEvent<string>) => {
      navigate(e.payload);
    })
      .then((ulf) => {
        unListen.push(ulf);
      })
      .catch((err) => handleErr(err.message));

    listen("success", (e: TauriEvent<Response>) => {
      handleSuc((e.payload as any).message);
    })
      .then((ulf) => {
        unListen.push(ulf);
      })
      .catch((err) => handleErr(err.message));

    listen("fail", (e: TauriEvent<Response>) => {
      handleErr((e.payload as any).message);
    })
      .then((ulf) => {
        unListen.push(ulf);
      })
      .catch(() => {});
    return () => {
      for (const ulf of unListen) ulf();
    };
  }, []);

  React.useEffect(() => {
    // 处理所有面包屑的事件和状态
    breadcrumbManage({
      setPlaceholder,
      navigate,
      location,
    });
  }, [location]);

  return (
    <div className={styles.box}>
      <div className={styles.menuBox}>
        <Menu></Menu>
      </div>
      <div className={styles.content}>
        <div className={styles.placeholder}>
          <Breadcrumb items={placeholder} />
        </div>
        <div className={styles.scrollY}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
