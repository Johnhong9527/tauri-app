import * as React from "react";
import { Routes, Route, Outlet, Link, createBrowserRouter } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
// import Home from "@/pages/Home/Home";
import About from "@/pages/About/About";
import Finder from "@/pages/Finder/Finder";
import Setting from "@/pages/Setting/Setting";
import FileSort from "@/pages/FileSort/FileSort";
import FileClear from "@/pages/FileClear/FileClear";
import DuplicateFileIndex from "@/pages/DuplicateFile/Index";
import DuplicateFile from "@/pages/DuplicateFile/DuplicateFile";
import CalculateDuplicateFiles from "@/pages/DuplicateFile/CalculateDuplicateFiles";
import DuplicateFileInfo from "@/pages/DuplicateFile/FileInfo";
/* export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DuplicateFileIndex />} />
        <Route path={"about"} element={<About />} />
        <Route path={"finder"} element={<Finder />} />
        <Route path={"setting"} element={<Setting />} />
        <Route path={"home"} element={<Home />} />
        <Route path={"file-sort"} element={<FileSort />} />
        <Route path={"file-clear"} element={<FileClear />} />
        <Route path={"duplicate-file"} element={<DuplicateFileIndex />} >
          <Route index element={<DuplicateFile />} />
          <Route path={"info"} element={<DuplicateFileInfo />} />
        </Route>
      </Route>
    </Routes>
  );
} */

const router = createBrowserRouter([
  {
    path: "/",
    id: "root",
    element: <Layout />,
    /* 
    // loader: rootLoader,
    每个路由都可以定义一个“加载器”函数，以便在路由元素呈现之前向路由元素提供数据。
      loader: async () => {
        return fakeDb.from("teams").select("*");
      },
    */
    children: [
      {
        path: "",
        element: <DuplicateFileIndex />,
        children: [
          {
            path: "",
            element: <DuplicateFile />,
          },
          {
            path: "info/:fileId",
            element: <DuplicateFileInfo />,
          },
          {
            path: "calculate/:fileId",
            element: <CalculateDuplicateFiles />,
          }
        ]
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "finder",
        element: <Finder />,
      },
      {
        path: "setting",
        element: <Setting />,
      },
      {
        path: "file-sort",
        element: <FileSort />,
      },
      {
        path: "file-clear",
        element: <FileClear />,
      }
      // {
      //   path: "duplicate-file",
      //   element: <DuplicateFileIndex />,
      //   children: [
      //     {
      //       path: "",
      //       element: <DuplicateFile />,
      //     },
      //     {
      //       path: "info/:fileId",
      //       element: <DuplicateFileInfo />,
      //     }
      //   ]
      // },
    ],
  },
], {
  future: {
    // Normalize `useNavigation()`/`useFetcher()` `formMethod` to uppercase
    v7_normalizeFormMethod: true,
  },
});

export default router