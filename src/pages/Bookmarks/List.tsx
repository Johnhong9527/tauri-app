import { useRoutes } from "react-router";
import { useNavigate } from "react-router-dom";
import { open as dialogOpen } from "@tauri-apps/api/dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/api/fs";

import styles from "./List.module.less";

export default function List() {
  let navigate = useNavigate();
  /*


	const bookmarkHtml = await readTextFile("/Users/sysadmin/code/rust_project/tauri-app/docs/favorites_2024_6_28_kerrty.html");
	    // const bookmarkHtml = await readTextFile("/Users/sysadmin/code/rust_project/tauri-app/docs/favorites_2024_6_28.html");


	    */
  async function importXMLFile() {
    const bookmarkHtml = await readTextFile(
      "/Users/sysadmin/code/rust_project/tauri-app/docs/favorites_2024_6_28_kerrty.html",
    );
    const bookmarkHtmlArray = bookmarkHtml.split(/\n/);
    const spaceReg = /^\s+/;
    let isStart = false;
    let spaceLen = 0;
    let parentArray: any = [];
    let currentParent = null;
    const tree = [] as any;

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
            if(lineStrMatch) {
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
          nodeDom = doc.getElementsByTagName(isBookmark ? "a" : "h3")[0];

          docObj.label = nodeDom.innerText;
          nodeDom.getAttributeNames().forEach((key: string) => {
            docObj[key] = nodeDom.getAttribute(key);
          });

          // 层级为 1 时，意味着是顶层节点
          if (docObj.level === 1) {
            parentArray = [{ level: docObj.level, label: docObj.label }];
            docObj.parentLabel = '';
            docObj.parentLevel = '';
          } else {
            // 管理父子层级关系
            while (parentArray.length > docObj.level) {
              parentArray.pop(); // 退回到正确的层级
            }

            // 设置当前父节点
            currentParent = [...parentArray].pop();
            if (currentParent.level === docObj.level) {
              currentParent = parentArray.pop(2);
            }
            docObj.parentLabel = currentParent.label;
            docObj.parentLevel = currentParent.level;

            // 如果当前是目录，入栈
            if (isDir) {
              parentArray.push({ level: docObj.level, label: docObj.label });
            }
          }
          // tree.push(docObj);
          console.log(docObj);
        }
      }
    });
    /* writeTextFile('Users/sysadmin/code/rust_project/tauri-app/docs/tree.text', (tree as any).toString('\n'), {
            append: true
        }) */
    //    console.log(1000, tree);
  }
  async function exportXMLFile() {}
  return (
    <div className={styles.ListPage}>
      {/*导入文件*/}
      <div onClick={() => importXMLFile()}>导入</div>
      <div onClick={() => exportXMLFile()}>导出</div>
      {/*<div onClick={() => navigate('/bookmarksManage')}>to</div>*/}
    </div>
  );
}
