import styles from "./DuplicateFile.module.less";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { Col, Row, Button } from "antd";
import { appDataDir } from "@tauri-apps/api/path";
import File from "@/plugins/tauri-plugin-file/file";
import { useState } from "react";
import {SQLite} from '@/plugins/tauri-plugin-sqlite'

export default function DuplicateFile() {
  const [usePath, setUsePath] = useState<string>("111111111111111");
  async function sort() {
    // 打开本地的系统目录，暂时不支持多选
    const selected = await open({
      directory: true,
      multiple: false,
      defaultPath: await appDataDir(),
    });

    if (selected && selected.length) {
      setUsePath(`${selected}`);
      // 最多记录 100 条用户操作的历史数据
      const files = await File.getAllList(`${selected}`);
      console.log(20202020, files);
    }
    // await invoke("file_sort", { path: selected });
    // setFile([...fileStr, await invoke("file_sort", { path: selected })]);
  }

  // 存储用户的历史选择记录
  async function opens() {
    const sql = await SQLite.open('./files.db3')
    // console.log(sql.execute);

    // SQLite.execute
  }

  return (
    <div className={styles.DuplicateFileBox}>
      <Row>
        <Col>
          <Button onClick={() => sort()}>选择文件路径</Button>
        </Col>

        <Col>设置文件路径</Col>
      </Row>
      <Row>已选择路径：{usePath}</Row>
      {usePath && <Row><Button onClick={() => opens()}>开始</Button></Row>}
    </div>
  );
}
