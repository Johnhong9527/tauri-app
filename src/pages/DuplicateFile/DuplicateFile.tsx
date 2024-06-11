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
} from "antd";
import { useEffect, useState } from "react";
const { Option } = Select;
import { historyListType, insertSearchFilesPasamsType } from "@/types/files";
import { CopyText } from "@/components/Table/CopyText";
import type { FixedType } from "rc-table/lib/interface";
import FileInfoEditer from "./FileInfoEditer";
import { FileInfoType } from "@/types/files";
import {get_all_history, get_info_by_path, insertSeletedFileHistory, updateSelectedFileHistory} from "@/services";
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
  const [fileList, setFileList] = useState<FileInfoType[]>([
    /*{
      id: 1,
      path: "D:/code/wb_project/bar_association_app",
      time: "2024-01-23",
      progress: 80,
    },
    {
      id: 2,
      path: "D:/code/wb_project/bar_association_app",
      time: "2024-01-23",
      progress: 20,
    },
    {
      id: 3,
      path: "D:/code/wb_project/bar_association_app",
      time: "2024-01-23",
      progress: 90,
    },*/
  ]);
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
          <Button type="primary" danger>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    getFileList()
  }, [current])

  async function handleOk(newFileInfo: FileInfoType, callback?: Function) {
    try {
      console.log(180, newFileInfo);
      let method = insertSeletedFileHistory
      if(fileInfoSource && JSON.stringify(fileInfoSource) !== '{}') {
        method = updateSelectedFileHistory
      }
      const res = await method(newFileInfo.path, newFileInfo);
      console.log(133, res);
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

  async function openModal(info?: FileInfoType) {
    // initDB()
    setIsModalOpen(true);
    if(info) {
      console.log(165, info)
      setFileInfoSource({
        ...info,
        checkedSizeValues: info && info?.checkedSizeValues ? `${info.checkedSizeValues}`.split(',') : [],
        checkedTypeValues: info && info?.checkedTypeValues ? `${info.checkedTypeValues}`.split(',') : []
      })
    }
    // const [fileInfo, msg] = await get_info_by_path('/Users/honghaitao/Downloads')
    // console.log(161, fileInfo);
    // const res = await insertSeletedFileHistory('/Users/sysadmin/Downloads');
    // console.log(133, res);
    // const res = await get_info_by_path('/Users/sysadmin/Downloads')
    // console.log(135, res)
    /* setIsModalOpen(true);
    setFileInfoSource({
      path: "/Users/sysadmin/Downloads",
      checkedTypeValues: ["音频", "图片"],
      checkedSizeValues: ["巨大（4GB+）", "大（128MB ~ 1GB-）"],
      addType: "2131231231231"
    }); */
    /*

    {path: "/Users/sysadmin/Downloads", checkedTypeValues: ["音频", "图片"], checkedSizeValues: ["巨大（4GB+）", "大（128MB ~ 1GB-）"]}


    [Log] 180 (FileInfoEditer.tsx, line 69)
Object

addType: "2131231231231"

checkedSizeValues: ["巨大（4GB+）", "大（128MB ~ 1GB-）", "中（1MB ~ 128MB-）"] (3)

checkedTypeValues: ["音频", "图片"] (2)

path: "/Users/sysadmin/Downloads"

Object Prototype


    */
  }
  async function getFileList() {
    console.log(183, current, total);
    const {data, total: localeTotal} = await get_all_history(current - 1, 10);
    console.log(173, data);
    const newFileList = data.map(item => {
      return {
        ...item,
        time: dayjs(item.time).format(DEFAULT_TIME_FORMAT)
      }
    })
    setFileList(newFileList)
    console.log(192, localeTotal);
    setTotal(localeTotal)
  }


  async function initDB() {
    try {
      const result = await filesDB.execute(createSql.search_files);
      console.log(179, result);
    } catch (error) {
      console.log(182, error);
    }
  }

  const onPaginationChange: PaginationProps['onChange'] = (page) => {
    console.log(page);
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
