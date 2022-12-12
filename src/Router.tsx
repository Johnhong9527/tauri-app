import * as React from "react";
import { Routes, Route, Outlet, Link } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
import Home from "@/pages/Home/Home";
import About from "@/pages/About/About";
import Finder from "@/pages/Finder/Finder";
import Setting from "@/pages/Setting/Setting";
export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Finder />} />
        <Route path={"about"} element={<About />} />
        <Route path={"finder"} element={<Finder />} />
        <Route path={"setting"} element={<Setting />} />
        <Route path={"home"} element={<Home />} />
        {/*<Route index element={<Home />} />*/}
      </Route>
    </Routes>
  );
}
