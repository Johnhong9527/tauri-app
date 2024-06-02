import styles from "./DuplicateFile.module.less";
import { Col, Row, Button, message, Table, Select, Space, Modal, Input } from "antd";
import { useEffect, useState } from "react";
const { Option } = Select;
import {  historyListType, insertSearchFilesPasamsType } from "@/types/files";
import { CopyText } from "@/components/Table/CopyText";
import { PlusCircleOutlined } from '@ant-design/icons';

const { Search } = Input;

export default function DuplicateFile() {
  const [usePath, setUsePath] = useState<string>(
  );
  const [historyList, setHistoryList] = useState<historyListType[]>([]);
  const [fileList, setFileList] = useState<insertSearchFilesPasamsType[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileInfo, setFileInfo] = useState<any>({})

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text: string, record: { id: number }) => (
        <CopyText width="30px" color="#333"  name={record.id}></CopyText>
      ),
    },
    {
      title: "路径",
      dataIndex: "name",
      width: 300,
      key: "name",
      render: (text: string, record: { name: string }) => (
        <CopyText width="300px" ellipsisLine={1} color="#333" name={record.name}></CopyText>
      ),
    },
    {
      title: "时间",
      dataIndex: "name",
      width: 300,
      key: "name",
      render: (text: string, record: { name: string }) => (
        <CopyText width="300px" ellipsisLine={1} color="#333" name={record.name}></CopyText>
      ),
    },
    {
      title: "操作",
      dataIndex: "actions",
      key: "actions",
      render: (text: string, record: { name: string }) => (
        <Space size="middle">
          <Button type="link">配置规则</Button>
          <Button type="link">删除记录</Button>
        </Space>
      ),
    },
  ];


  function sort()  {

  }

  function historyHandleChange() {

  }

  function opens() {}
  function handleOk() {}
  function handleCancel() {}

  return (
    <div className={styles.DuplicateFileBox}>
     
      <Modal title="添加目录" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Row align="middle">
          <span>文件路径:</span>
          <Row justify="space-around" align="middle">
            <span>{fileInfo.path || ''}</span>
            <Col><PlusCircleOutlined /></Col>
          </Row>
        </Row>
      </Modal>
      <Row className={styles.searchBox}>
        <Col span={8}><Search placeholder="请输入" allowClear /></Col>
        <Col offset={8} span={8} style={{textAlign: 'right'}}><Button type="primary" onClick={() => setIsModalOpen(true)}>新增</Button></Col>
      </Row>
      <br />
      <Row>
        <Table rowKey={"id"} dataSource={fileList} columns={columns} />
      </Row>
    </div>
  );
}
