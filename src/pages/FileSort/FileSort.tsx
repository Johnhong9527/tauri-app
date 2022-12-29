import styles from "./FileSort.module.less";
import { Button, Card } from "antd";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { useState } from "react";
export default function FileSort() {
  const [fileStr, setFile] = useState<string[]>([]);
  async function sort() {
    const selected = await open({
      directory: false,
      multiple: false,
      //   defaultPath: await appDataDir(),
    });
    await invoke("file_sort", { path: selected });
    // setFile([...fileStr, await invoke("file_sort", { path: selected })]);
  }
  return (
    <div className={styles.FileSortBox}>
      {/* <div style={{ backgroundColor: "green", height: "200vh" }}>FileClear</div> */}
      <div>
        <Button onClick={() => sort()}>Sort</Button>
        <div>
          {fileStr.map((item) => (
            <Card key={item}>{item}</Card>
          ))}
        </div>
      </div>
    </div>
  );
}
