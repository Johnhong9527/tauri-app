import styles from "./DuplicateFile.module.less";
// import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { Col, Row, Button, message, Table, Select, Space } from "antd";
import { appDataDir } from "@tauri-apps/api/path";
import File from "@/plugins/tauri-plugin-file/file";
import { useEffect, useState } from "react";
// import { SQLite } from "@/plugins/tauri-plugin-sqlite";
// import {select_history_init} from '@/databases/index'
const { Option } = Select;
import {
  insertSeletedFileHistory,
  insertSearchFiles,
  get_info_by_path,
  get_all_history,
  get_list_by_sourceid,
} from "@/services";
import { insertSearchFilesPasamsType, historyListType } from "@/types/files";

export default function DuplicateFile() {
  const [usePath, setUsePath] = useState<string>(
    "/Users/sysadmin/code/rust_project/tauri-app/diff_source"
  );
  const [fileList, setFileList] = useState<insertSearchFilesPasamsType[]>([]);
  const [historyList, setHistoryList] = useState<historyListType[]>([]);

  const columns = [
    {
      title: "编号",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "路径",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "哈希值",
      dataIndex: "hash",
      key: "hash",
    },
  ];
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
    const res = await insertSeletedFileHistory(usePath);
    fileHistoryListInit();
    if (res) {
      // return message.error(`${res}`)
    }
    const [info, msg] = await get_info_by_path(`${usePath}`);
    if (!info) {
      return message.error(msg);
    }
    // 最多记录 100 条用户操作的历史数据
    const files = await File.getAllList(usePath);

    if (files.length) {
      files.forEach(async (elm) => {
        const [res, msg] = await insertSearchFiles({
          // 组装数据
          sourceId: (info as any).id,
          path: elm,
          type: await File.getType(elm),
          name: elm,
          hash: await File.getHash(elm),
        });
        // console.log(67, res, msg);
      });
    }
    getProcessedQueryData();
  }
  useEffect(() => {
    fileHistoryListInit();
    getProcessedQueryData();
  }, []);

  // 查询用户历史纪录
  async function fileHistoryListInit() {
    const res = await get_all_history();
    setHistoryList(res);
  }

  const historyHandleChange = (value: string) => {
    // console.log(`selected ${value}`);
    setUsePath(value);
  };

  // 获取处理好的查询数据数据，根据
  async function getProcessedQueryData() {
    console.log(102, usePath);
    let [info, msg1] = await get_info_by_path(`${usePath}`);
    if (!info) return;
    console.log(104, info);

    const [res, msg2] = await get_list_by_sourceid((info as any).id);
    console.log(109, res);
    if (!res) return;
    setFileList(res);

    // const res = await get_all_history();
    // setHistoryList(res);
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
      <Row>
        <Select style={{ width: "100%" }} onChange={historyHandleChange}>
          {historyList.length > 0 && historyList.map((elm, index) => (
            <Option key={index}>{elm.path}</Option>
          ))}
        </Select>
      </Row>
      {usePath && (
        <Row>
          <Button onClick={() => opens()}>开始</Button>
        </Row>
      )}
      {fileList.length > 0 && (
        <div>
          <br />
          <Row>
            <Space>
              <Button type="link">Link Button</Button>
              <Button type="link">Link Button</Button>
            </Space>
          </Row>
          <br />
          <Row>
            <Table rowKey={"id"} dataSource={fileList} columns={columns} />;
          </Row>
        </div>
      )}
    </div>
  );
}
