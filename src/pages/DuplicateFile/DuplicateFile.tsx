import styles from "./DuplicateFile.module.less";
import { Col, Row, Button, message, Table, Select, Space, Modal, Input, Checkbox, GetProp } from "antd";
import { useEffect, useState } from "react";
const { Option } = Select;
import { open } from "@tauri-apps/api/dialog";
import File from "@/plugins/tauri-plugin-file/file";
import {  historyListType, insertSearchFilesPasamsType } from "@/types/files";
import { CopyText } from "@/components/Table/CopyText";
import { PlusCircleOutlined, RedoOutlined } from '@ant-design/icons';
import { appDataDir } from "@tauri-apps/api/path";
import { File_APPLICATION_TYPE, File_AUDIO_TYPE, File_COMPRESSED_TYPE, File_DOCUMENT_TYPE, File_IMAGE_TYPE, File_VIDEO_TYPE } from "@/config";

const { Search } = Input;
const { TextArea } = Input;

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
  const fileTypeList = [
    {
      name: '音频',
      valus: File_AUDIO_TYPE
    },
    {
      name: '视频',
      valus: File_VIDEO_TYPE
    },
    {
      name: '文档',
      valus: File_DOCUMENT_TYPE
    },
    {
      name: '图片',
      valus: File_IMAGE_TYPE
    },
    {
      name: '应用程序',
      valus: File_APPLICATION_TYPE
    },
    {
      name: '压缩包',
      valus: File_COMPRESSED_TYPE
    }
  ]


  async function getDir()  {
    // 打开本地的系统目录，暂时不支持多选
    const selected = await open({
      directory: true,
      multiple: false,
      defaultPath: await appDataDir(),
    });

    if (selected && selected.length) {
      setFileInfo({
        ...fileInfo,
        path: selected
      })
      // setUsePath(`${selected}`);
      // 最多记录 100 条用户操作的历史数据
      // const files = await File.getAllList(`${selected}`);
    }
    // await invoke("file_sort", { path: selected });
    // setFile([...fileStr, await invoke("file_sort", { path: selected })]);
  }

  function historyHandleChange() {

  }

  function opens() {}
  function handleOk() {}
  function handleCancel() {
    setFileInfo({});
    setIsModalOpen(false);
  }

  const onTypesChange: GetProp<typeof Checkbox.Group, 'onChange'> = (checkedValues) => {
    console.log('checked = ', checkedValues);
    setFileInfo({
      ...fileInfo,
      checkedTypeValues: checkedValues
    })
  };


  const onAddTypeChange = (types: string) => {
    setFileInfo({
      ...fileInfo,
      addType: types
    })
  };
  const onPassTypeChange = (types: string) => {
    setFileInfo({
      ...fileInfo,
      passType: types
    })
  };

  const checkboxAll = () => {
    const otherTypes = ['其他所有带扩展名的类型', '其他所有无扩展名的类型', '指定', '排除'];
    const checkedValues = fileTypeList.map(typeInfo => typeInfo.name)
    setFileInfo({
      ...fileInfo,
      checkboxAll: !fileInfo.checkboxAll,
      checkedTypeValues: fileInfo.checkboxAll ? []: [...checkedValues, ...otherTypes]
    })
  }

  return (
    <div className={styles.DuplicateFileBox}>
      <Modal title="添加目录" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Row align="middle">
          <span>文件路径:</span>
          <Row justify="space-around" align="middle">
            <span className={styles.filePath}>{fileInfo.path || ''}</span>
            <Col>
             {
              fileInfo.path ?  <RedoOutlined className={styles.iconHover} onClick={() => getDir()}/> : <PlusCircleOutlined className={styles.iconHover} onClick={() => getDir()}/>
             }
            </Col>
          </Row>
        </Row>
        <Row align="top">
          <span>文件类型:</span>
          <Row style={{
            flex: 1,
            padding: '2px 12px'
          }}>
            <Row style={{flex: 1}}><Checkbox onChange={() => checkboxAll() } value={'全选/不选'}>全选/不选</Checkbox></Row>
             <Checkbox.Group onChange={onTypesChange} value={fileInfo.checkedTypeValues}>
              {
                fileTypeList.map((typeInfo) => (
                  <Col span={7} >
                    <Checkbox value={typeInfo.name}>{typeInfo.name}</Checkbox>
                  </Col>
                ))
              }
              <Col span={24} >
                <Checkbox value={'其他所有带扩展名的类型'}>其他所有带扩展名的类型</Checkbox>
              </Col>
              <Col span={24} >
                <Checkbox value={'其他所有无扩展名的类型'}>其他所有无扩展名的类型</Checkbox>
              </Col>
              <Col span={24}>
                <Row style={{flex: 1, marginTop: '8px'}}>
                  <Col span={4}>
                    <Checkbox value={'指定'}>指定</Checkbox>
                  </Col>
                  <Col span={20}>
                    <TextArea
                      value={fileInfo.addType}
                      onChange={(e) => onAddTypeChange(e.target.value)}
                      placeholder="格式：.扩展名1.扩展名2…"
                      autoSize={{ minRows: 3, maxRows: 5 }}
                    />
                  </Col>
                </Row>
              </Col>
              <Col span={24}>
                <Row style={{flex: 1, marginTop: '8px'}}>
                  <Col span={4}>
                    <Checkbox value={'排除'}>排除</Checkbox>
                  </Col>
                  <Col span={20}>
                    <TextArea
                      value={fileInfo.passType}
                      onChange={(e) => onPassTypeChange(e.target.value)}
                      placeholder="格式：.扩展名1.扩展名2…"
                      autoSize={{ minRows: 3, maxRows: 5 }}
                    />
                  </Col>
                </Row>
              </Col>
             </Checkbox.Group>
            
          </Row>
        </Row>
        <Row align="middle">
          <span>文件大小:</span>
          <Row justify="space-around" align="middle">
            <span className={styles.filePath}>{fileInfo.path || ''}</span>
            <Col>
             {
              fileInfo.path ?  <RedoOutlined className={styles.iconHover} onClick={() => getDir()}/> : <PlusCircleOutlined className={styles.iconHover} onClick={() => getDir()}/>
             }
            </Col>
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
