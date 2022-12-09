import * as React from "react";
import {Routes, Route, Outlet, Link} from "react-router-dom";
import Layout from '@/components/Layout/Layout'
import Home from '@/pages/Home/Home';
import About from "@/pages/About/About";
export default function Router() {
  return <Routes>
    <Route path="/" element={<Layout/>}>
      <Route index element={<Home />} />
      <Route path={"about"} element={<About />} />
    </Route>
  </Routes>
}
