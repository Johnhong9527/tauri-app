import { useEffect, useState } from "react";
import {
  message,
  Row,
  Col,
  Space,
  Button,
  Empty,
  Table,
  Input,
  InputRef,
  Spin,
  Menu,
  MenuProps,
} from "antd";
import { useRoutes } from "react-router";
import { useNavigate } from "react-router-dom";
import { open as dialogOpen, save as dialogSave } from "@tauri-apps/api/dialog";
import {
  readTextFile,
  writeTextFile,
  writeBinaryFile,
  BaseDirectory,
} from "@tauri-apps/api/fs";

import MindMap from "simple-mind-map";
import Drag from "simple-mind-map/src/plugins/Drag.js";
import Demonstrate from "simple-mind-map/src/plugins/Demonstrate.js";
import KeyboardNavigation from "simple-mind-map/src/plugins/KeyboardNavigation.js";
import MiniMap from "simple-mind-map/src/plugins/MiniMap.js";
import xmind from "simple-mind-map/src/parse/xmind.js";
// MindMap.usePlugin(Drag);
// MindMap.usePlugin(Demonstrate);
// MindMap.usePlugin(KeyboardNavigation);
// MindMap.usePlugin(MiniMap);

import { v4 as uuidv4 } from "uuid";

// import bookmarkHtmlText from "./bookmark";
import bookmarkHtmlText from "./bookmark-kerry";
import styles from "./List.module.less";
import {
  AppstoreOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  MailOutlined,
  SwapOutlined,
} from "@ant-design/icons";

export default function List() {
  let navigate = useNavigate();
  let mindMapEvent = null as any;
  const [treeData, setTreeData] = useState([]);
  const [mindMap, setMindMap] = useState(null);
  const [miniMapBoxScale, setMiniMapBoxScale] = useState(null);
  const [miniMapBoxLeft, setMiniMapBoxLeft] = useState(null);
  const [miniMapBoxTop, setMiniMapBoxTop] = useState(null);
  /* 右击菜单 */
  const [nodeContextMenuShow, setNodeContextMenuShow] = useState(false);
  const [nodeContextMenuLeft, setNodeContextMenuLeft] = useState(0);
  const [nodeContextMenuTop, setNodeContextMenuTop] = useState(0);

  useEffect(() => {
    // importXMLFile();
    window.addEventListener("resize", function () {
      if (mindMapEvent) {
        mindMapEvent.resize();
      }
    });

    // mindInit();
    return () => {
      window.removeEventListener("resize", () => {});
    };
  }, []);
  useEffect(() => {
    if (treeData.length) {
      mindInit();
    }
  }, [treeData]);
  async function importXMLFile() {
    /*
	    const bookmarkHtml = await readTextFile("/Users/sysadmin/code/rust_project/tauri-app/docs/favorites_2024_6_28_kerrty.html");
	    const bookmarkHtml = await readTextFile("/Users/sysadmin/code/rust_project/tauri-app/docs/favorites_2024_6_28.html");
	  */
    // 打开本地的系统目录，暂时不支持多选
    /* const selected = await dialogOpen({
      title: "请选择需要导入的数据",
      directory: false,
      multiple: false,
    });
    const bookmarkHtml = await readTextFile(`${selected}`); */
    /* const bookmarkHtml = await readTextFile("/Users/sysadmin/code/rust_project/tauri-app/docs/favorites_2024_6_28_kerrty.html");
    const bookmarkHtmlArray = bookmarkHtml.split(/\n/); */
    const bookmarkHtmlArray = bookmarkHtmlText.split(/\n/);
    const spaceReg = /^\s+/;
    let isStart = false;
    let spaceLen = 0;
    let parentArray: any = [];
    let currentParent = null;
    const tree = [] as any;
    console.time("bookmarkHtmlArray");
    bookmarkHtmlArray.forEach((lineStr) => {
      if (!isStart) {
        isStart = lineStr.indexOf("<DL") > -1; // 检查是否开始
      }
      if (isStart && lineStr) {
        let spaceStr = "";
        let isDir = lineStr.indexOf("<DT><H3") > -1;
        let isBookmark = lineStr.indexOf("<DT><A") > -1;
        const docObj = {} as any;

        // 判断缩进
        if (spaceReg.test(lineStr)) {
          const lineStrMatch = lineStr.match(spaceReg);
          if (lineStrMatch) {
            spaceStr = lineStrMatch[0];
          }
        }

        // 设置缩进的基准长度
        if (spaceStr.length && spaceLen === 0) {
          spaceLen = spaceStr.length;
        }

        // 计算书签层级
        docObj.level = spaceStr.length / spaceLen || 0;

        // 使用 DOMParser 解析 HTML 字符串
        let parser = new DOMParser();
        let doc = parser.parseFromString(lineStr, "text/html");
        let nodeDom = null as any;
        if (isBookmark || isDir) {
          nodeDom = doc.getElementsByTagName("h3")[0];
          docObj.type = isBookmark ? "bookmark" : "dir";
          docObj.nodeId = uuidv4();
          nodeDom = doc.getElementsByTagName(isBookmark ? "a" : "h3")[0];

          docObj.label = nodeDom.innerText;
          const attrs = {} as any;
          nodeDom.getAttributeNames().forEach((key: string) => {
            attrs[key] = nodeDom.getAttribute(key);
          });
          docObj.attrs = attrs;

          // 层级为 1 时，意味着是顶层节点
          if (docObj.level === 1) {
            parentArray = [
              {
                level: docObj.level,
                label: docObj.label,
                parentId: docObj.nodeId,
              },
            ];
            docObj.parentLabel = "";
            docObj.parentLevel = "";
            docObj.parentId = "";
          } else {
            // 管理父子层级关系
            while (parentArray.length >= docObj.level) {
              parentArray.pop(); // 退回到正确的层级
            }
            // 设置当前父节点
            currentParent = [...parentArray].pop();
            docObj.parentLabel = currentParent.label;
            docObj.parentLevel = currentParent.level;
            docObj.parentId = currentParent.parentId;

            // 如果当前是目录，入栈
            if (isDir) {
              parentArray.push({
                level: docObj.level,
                label: docObj.label,
                parentId: docObj.nodeId,
              });
            }
          }
          tree.push(docObj);
        }
      }
    });
    console.timeEnd("bookmarkHtmlArray");
    setTreeData(tree);
  }
  function getMindMapData() {
    // TODO 从数据中读取到了数据
    const treeObj = [] as any;

    function arrToTree(arrTree: any) {
      function getParentPush(parentId: any, newNode: any, arr: any) {
        for (let i = 0; i < arr.length; i++) {
          const elm = arr[i];
          if (elm.data.uid === parentId) {
            elm.children.push(newNode);
            return true; // 找到目标节点，结束递归
          }
          if (elm.children.length) {
            const found = getParentPush(parentId, newNode, elm.children);
            if (found) {
              return true; // 找到目标节点，结束递归
            }
          }
        }
        return false; // 未找到目标节点
      }

      arrTree.forEach((element: any) => {
        const newNode = {
          data: {
            element: element,
            text: `${element.label}`,
            uid: element.nodeId,
          },
          children: [],
        };
        if (!treeObj.length) {
          treeObj.push(newNode);
        } else {
          getParentPush(element.parentId, newNode, treeObj);
        }
      });
    }
    arrToTree(treeData);
    return {
      data: {
        text: "根节点",
      },
      children: treeObj,
    };
  }
  function mindInit() {
    console.time("getMindMapData");
    const mindMapData = getMindMapData();
    console.timeEnd("getMindMapData");
    if (mindMapEvent) {
      mindMapEvent.clearDraw();
    }
    console.time("mindMapEvent");
    mindMapEvent = new MindMap({
      el: document.getElementById("mindMapContainer"),
      data: mindMapData,
      readonly: false, // 开启只读模式
    } as any);
    console.timeEnd("mindMapEvent");
    mindMapEvent.on("node_active", (node: any, activeNodeList: any) => {
      console.log(194, activeNodeList);
    });

    // 右键菜单的显示和隐藏
    mindMapEvent.on("node_contextmenu", (e: any, node: any) => {
      setNodeContextMenuShow(true);
      setNodeContextMenuLeft(e.clientX + 10);
      setNodeContextMenuTop(e.clientY + 10);
    });
    // 监听节点激活事件
    // mindMapEvent.on("node_active", (node, nodeList) => {
    //   activeNodes.value = nodeList;
    // });
    // mindMapEvent.cha
    // setMindMap(mindMap as any);
  }
  async function exportXMLFile() {
    if (mindMapEvent) {
      const xmindData = (mindMapEvent as any).getData();
      const xmindZip = await xmind.transformToXmind(xmindData);
      const filePath = await dialogSave({});

      await writeBinaryFile(`${filePath}`, await xmindZip.arrayBuffer());
    }
  }
  function showData() {
    if (mindMapEvent) {
      // 获取思维导图树数据
      console.log((mindMapEvent as any).getData());
    }
  }

  type MenuItem = Required<MenuProps>["items"][number];
  const items: MenuItem[] = [
    {
      label: "移动到",
      key: "moveOther",
      icon: <SwapOutlined />,
    },
    {
      label: "上移",
      key: "moveUp",
      icon: <ArrowUpOutlined />,
    },
    {
      label: "下移",
      key: "moveDown",
      icon: <ArrowDownOutlined />,
    },
    {
      label: "向上新增",
      key: "addUp",
      icon: <ArrowDownOutlined />,
    },
    {
      label: "向下新增",
      key: "addDown",
      icon: <ArrowDownOutlined />,
    },
  ];
  const onNodeContextMenuClick: MenuProps["onClick"] = (e) => {
    console.log("click ", e);
    // setCurrent(e.key);
    switch (e.key) {
      case "moveOther":
        /* 移动到 */
        break;
      case "moveUp":
        /* 上移 */
        break;
      case "moveDown":
        /* 下移 */
        break;
      case "addUp":
        /* 向上新增 */
        break;
      case "addDown":
        /* 向下新增 */
        break;
    }
    setNodeContextMenuShow(false);
  };
  return (
    <div className={styles.ListPage}>
      {nodeContextMenuShow && (
        <div
          className={styles.nodeContextMenuDom}
          style={{
            left: `${nodeContextMenuLeft}px`,
            top: `${nodeContextMenuTop}px`,
          }}
        >
          <Menu
            onClick={onNodeContextMenuClick}
            items={items}
            mode="vertical"
          />
        </div>
      )}
      {/* 移动到别的目录下 */}
      <div className={styles.dirTreeList}>
      dirTreeList
      </div>
      <Row>
        <Space>
          {/*导入文件*/}
          <Button onClick={() => importXMLFile()}>导入</Button>
          <Button onClick={() => showData()}>mixd data</Button>
          <Button onClick={() => exportXMLFile()}>导出为xmind</Button>
          {/* <div>
            {nodeContextMenuLeft} - {nodeContextMenuTop}
          </div> */}
        </Space>
      </Row>

      {/*<div onClick={() => navigate('/bookmarksManage')}>to</div>*/}
      <div
        id="mindMapContainer"
        style={{
          padding: 0,
          width: "100%",
          height: "80vh",
          margin: 0,
          overflow: "hidden",
        }}
      ></div>
    </div>
  );
}
