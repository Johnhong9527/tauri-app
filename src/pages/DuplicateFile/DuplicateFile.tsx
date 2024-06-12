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
import type { PopconfirmProps } from 'antd';
import { useEffect, useState } from "react";
const { Option } = Select;
import { historyListType, insertSearchFilesPasamsType } from "@/types/files";
import { CopyText } from "@/components/Table/CopyText";
import type { FixedType } from "rc-table/lib/interface";
import FileInfoEditer from "./FileInfoEditer";
import { FileInfoType } from "@/types/files";
import {
  delSelectedFileHistory,
  get_all_history,
  get_info_by_path,
  insertSeletedFileHistory,
  updateSelectedFileHistory
} from "@/services";
import dayjs from "dayjs";
import { DEFAULT_TIME_FORMAT } from "@/config";

import Database from "tauri-plugin-sql-api";
import { createSql } from "@/databases/createTableSql";
const db = await Database.load("sqlite:test.db");
const filesDB = await Database.load("sqlite:files.db");

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

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 30,
      render: (text: string, record: { id?: number }) => (
        <CopyText width="30px" color="#333" name={record.id || ''}></CopyText>
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
          name={record.path || ''}
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
          name={record.time || ''}
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
          <Button onClick={() => openModal(record)} type="default">
            修改
          </Button>
          <Button type="primary">运行</Button>

          <Popconfirm
              title="Delete the task"
              description="Are you sure to delete this task?"
              onConfirm={() => delRow(record)}
              okText="Yes"
              cancelText="No"
          >
            <Button type="primary" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    getFileList()
  }, [current])

  async function handleOk(newFileInfo: FileInfoType, callback?: Function) {
    try {
      let method = insertSeletedFileHistory
      if(fileInfoSource && JSON.stringify(fileInfoSource) !== '{}') {
        method = updateSelectedFileHistory
      }
      const res = await method(newFileInfo.path, newFileInfo);
      if(res) {
        message.error(`${res}`)
        return
      }
      setIsModalOpen(false);
      setFileInfoSource({})
      setFileList([])
      await getFileList();
      callback && callback();
    } catch (err) {
    }

  }
  function handleCancel() {
    setFileInfo({});
    setIsModalOpen(false);
  }

  async function delRow(row: FileInfoType) {
    const res = await delSelectedFileHistory(row.path)
    if(!res) {
      setFileInfoSource({})
      setFileList([])
      await getFileList();
    } else {
      message.error(`${res}`)
    }
  }

  async function openModal(info?: FileInfoType) {
    setIsModalOpen(true);
    if(info) {
      setFileInfoSource({
        ...info,
        checkedSizeValues: info && info?.checkedSizeValues ? `${info.checkedSizeValues}`.split(',') : [],
        checkedTypeValues: info && info?.checkedTypeValues ? `${info.checkedTypeValues}`.split(',') : []
      })
    }
  }
  async function getFileList() {
    const {data, total: localeTotal} = await get_all_history(current - 1, 10);
    const newFileList = data.map(item => {
      return {
        ...item,
        time: dayjs(item.time).format(DEFAULT_TIME_FORMAT)
      }
    })
    setFileList(newFileList)
    setTotal(localeTotal)
  }

  const onPaginationChange: PaginationProps['onChange'] = (page) => {
    setCurrent(page);
  };
  
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
        <Pagination current={current} total={total} onChange={onPaginationChange} />
      </Row>
    </div>
  );
}
