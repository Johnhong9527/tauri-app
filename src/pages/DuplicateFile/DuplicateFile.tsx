import styles from "./DuplicateFile.module.less";
import {
  Col,
  Row,
  Button,
  message,
  Table,
  Select,
  Space,
  Input,
  Progress,
  Pagination,
  PaginationProps,
  Popconfirm,
} from "antd";
import type { PopconfirmProps } from "antd";
import { useEffect, useState } from "react";
const { Option } = Select;
import { historyListType, insertSearchFilesPasamsType } from "@/types/files";
import { CopyText } from "@/components/Table/CopyText";
import type { FixedType } from "rc-table/lib/interface";
import FileInfoEditer from "./FileInfoEditer";
import { FileInfoType } from "@/types/files";
import {
  closeDB,
  delSelectedFileHistory,
  get_all_history,
  get_info_by_path,
  insertSeletedFileHistory,
  updateSelectedFileHistory,
} from "@/services";
import dayjs from "dayjs";
import { DEFAULT_TIME_FORMAT } from "@/config";

import Database from "tauri-plugin-sql-api";
import { createSql } from "@/databases/createTableSql";
import { useRoutes } from "react-router";
import { useNavigate } from "react-router-dom";
import { appDataDir } from "@tauri-apps/api/path";
import File from "@/plugins/tauri-plugin-file/file";

const { Search } = Input;
const { TextArea } = Input;

export default function DuplicateFile() {
  const [total, setTotal] = useState(20); // 页数
  const [current, setCurrent] = useState(1); // 页码
  const [usePath, setUsePath] = useState<string>();
  const [historyList, setHistoryList] = useState<historyListType[]>([]);
  const [fileList, setFileList] = useState<FileInfoType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileInfo, setFileInfo] = useState<any>({});
  const [fileInfoSource, setFileInfoSource] = useState<FileInfoType>({});
  const navigate = useNavigate();

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 30,
      render: (text: string, record: { id?: number }) => (
        <Button onClick={() => openModal(record)} type={"link"}>
          {record.id}
        </Button>
        // <CopyText width="30px" color="#333" name={record.id || ""}></CopyText>
      ),
    },
    {
      title: "路径",
      dataIndex: "path",
      key: "path",
      width: 300,
      render: (text: string, record: { path?: string }) => (
        <CopyText
          width="300px"
          ellipsisLine={1}
          color="#333"
          name={record.path || ""}
        ></CopyText>
      ),
    },
    {
      title: "时间",
      dataIndex: "time",
      key: "time",
      width: 100,
      render: (text: string, record: { time?: string }) => (
        <CopyText
          width="100px"
          ellipsisLine={1}
          color="#333"
          name={record.time || ""}
        ></CopyText>
      ),
    },
    {
      title: "进度",
      dataIndex: "time",
      key: "time",
      with: 200,
      render: (text: string, record: { progress?: number }) => (
        <div style={{ width: "200px" }}>
          <Progress percent={record.progress} />
        </div>
      ),
    },
    {
      title: "操作",
      dataIndex: "actions",
      key: "actions",
      fixed: "right" as FixedType,
      width: 220,
      render: (text: string, record: FileInfoType) => (
        <Space size="middle" style={{ width: "220px" }} align="baseline">
          <Button
            type="primary"
            onClick={() => calculateDuplicateFiles(record)}
          >
            管理
          </Button>
          <Popconfirm
            title="Delete the task"
            description="Are you sure to delete this task?"
            onConfirm={() => delRow(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger>
              移除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    getFileList();
  }, [current]);

  async function handleOk(newFileInfo: FileInfoType, callback?: Function) {
    try {
      let method = insertSeletedFileHistory;
      if (fileInfoSource && JSON.stringify(fileInfoSource) !== "{}") {
        method = updateSelectedFileHistory;
      }
      const res = await method(newFileInfo.path, newFileInfo);
      if (res) {
        message.error(`${res}`);
        return;
      }
      setIsModalOpen(false);
      setFileInfoSource({});
      setFileList([]);
      await getFileList();
      callback && callback();
    } catch (err) {}
  }
  function handleCancel() {
    setFileInfo({});
    setIsModalOpen(false);
  }

  async function delRow(row: FileInfoType) {
    // 删除对应的查询数据库的文件
    const appDataDirPath = await appDataDir();
    await closeDB(`${row.id}`);
    const dbPath = `${appDataDirPath}/files_${row.id}.db`;
    const dbShmPath = `${appDataDirPath}/files_${row.id}.db-shm`;
    const dbWalPath = `${appDataDirPath}/files_${row.id}.db-wal`;
    await File.rmFile(dbPath);
    await File.rmFile(dbShmPath);
    await File.rmFile(dbWalPath);
    const res = await delSelectedFileHistory(row.path);
    if (!res) {
      setFileInfoSource({});
      setFileList([]);
      await getFileList();
    } else {
      message.error(`${res}`);
    }
  }

  async function openModal(info?: FileInfoType) {
    setIsModalOpen(true);
    if (info) {
      setFileInfoSource({
        ...info,
        checkedSizeValues:
          info && info?.checkedSizeValues
            ? `${info.checkedSizeValues}`.split(",")
            : [],
        checkedTypeValues:
          info && info?.checkedTypeValues
            ? `${info.checkedTypeValues}`.split(",")
            : [],
      });
    }
  }
  async function getFileList() {
    const { data, total: localeTotal } = await get_all_history(current - 1, 10);
    const newFileList = data.map((item) => {
      return {
        ...item,
        time: dayjs(item.time).format(DEFAULT_TIME_FORMAT),
      };
    });
    setFileList(newFileList);
    setTotal(localeTotal);
  }

  const onPaginationChange: PaginationProps["onChange"] = (page) => {
    setCurrent(page);
  };

  function calculateDuplicateFiles(record: FileInfoType) {
    navigate("calculate/" + record.id);
  }
  return (
    <div className={styles.DuplicateFileBox}>
      <FileInfoEditer
        title="添加目录"
        showModal={isModalOpen}
        fileInfoSource={fileInfoSource}
        onClickOk={handleOk}
        onClickCancel={handleCancel}
      ></FileInfoEditer>
      <Row className={styles.searchBox}>
        <Col span={8}>
          <Search placeholder="请输入" allowClear />
        </Col>
        <Col offset={8} span={8} style={{ textAlign: "right" }}>
          <Button type="primary" onClick={() => openModal()}>
            新增
          </Button>
        </Col>
      </Row>
      <br />
      <Row
        style={{
          width: "100%",
          overflow: "scroll",
        }}
      >
        <Table
          style={{
            width: "100%",
          }}
          rowKey={"id"}
          dataSource={fileList}
          columns={columns}
          pagination={false}
        />
      </Row>
      <Row justify="end" style={{ width: "100%", marginTop: "12px" }}>
        <Pagination
          current={current}
          total={total}
          onChange={onPaginationChange}
        />
      </Row>
    </div>
  );
}
