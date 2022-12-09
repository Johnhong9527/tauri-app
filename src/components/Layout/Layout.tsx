import * as React from "react";
import {Routes, Route, Outlet, Link, useNavigate} from "react-router-dom";
import styles from './Layout.module.less'
// 监听 tauri 事件
import { listen, Event as TauriEvent, UnlistenFn } from "@tauri-apps/api/event";

export default function Layout() {
  let navigate = useNavigate();
  function handleErr(msg: string) {
    console.log(msg)
  }
  function handleSuc(msg: string) {
    console.log(msg)
  }
  React.useEffect(() => {
    const unListen: UnlistenFn[] = [];
    listen("routing", (e: TauriEvent<string>) => {
      navigate(e.payload)
      // history.push({
      //   pathname: e.payload,
      // });
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

  }, [])
  return (
    <div className={styles.box}>
      <Outlet />
    </div>
  )
}
