import { open as dialogOpen, save as dialogSave } from "@tauri-apps/api/dialog";
import {
  readTextFile,
  writeTextFile,
  writeBinaryFile,
  BaseDirectory,
} from "@tauri-apps/api/fs";
import { v4 as uuidv4 } from "uuid";

export async function importBookmarks() {
  // 打开本地的系统目录，暂时不支持多选
  const selected = await dialogOpen({
    title: "请选择需要导入的数据",
    directory: false,
    multiple: false,
  });
  const bookmarkHtml = await readTextFile(`${selected}`);
  const bookmarkHtmlArray = bookmarkHtml.split(/\n/);
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
        docObj.key = docObj.nodeId;
        nodeDom = doc.getElementsByTagName(isBookmark ? "a" : "h3")[0];

        docObj.label = nodeDom.innerText;
        docObj.title = nodeDom.innerText;
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
              title: docObj.label,
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
  return Promise.resolve({treeData: tree, bookmarkHtml});
}

export async function formatTreeData(useTreeData: any) {
  // TODO 从数据中读取到了数据
  const treeObj = [] as any;

  function arrToTree(arrTree: any) {
    function getParentPush(parentId: any, newNode: any, arr: any) {
      for (let i = 0; i < arr.length; i++) {
        const elm = arr[i];
        if (elm.key === parentId) {
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
        element: element,
        title: `${element.label}`,
        key: element.nodeId,
        children: [],
      };
      if (!treeObj.length) {
        treeObj.push(newNode);
      } else {
        getParentPush(element.parentId, newNode, treeObj);
      }
    });
  }
  arrToTree(useTreeData);
  return treeObj;
}
