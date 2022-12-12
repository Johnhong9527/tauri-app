import styles from "./FileSort.module.less";
import { Button } from "antd";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
export default function FileSort() {
  async function sort() {

    const selected = await open({
      directory: false,
        multiple: false,
      //   defaultPath: await appDataDir(),
    });
    await invoke("file_sort", {path: selected});
  }
  return (
    <div className={styles.FileSortBox}>
      {/* <div style={{ backgroundColor: "green", height: "200vh" }}>FileClear</div> */}
      <div>
        <Button onClick={() => sort()}>Sort</Button>
      </div>
    </div>
  );
}
