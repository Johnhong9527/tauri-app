import { useEffect, useState } from "react";
import {
  message,
  Row,
  Col,
  Space,
  Button,
  Empty,
  Table,
  Input,
  InputRef,
  Spin,
  Menu,
  MenuProps,
  Tree,
  TreeProps,
  TreeDataNode,
  Pagination,
  PaginationProps,
  Modal,
} from "antd";
import { useRoutes } from "react-router";
import { useNavigate } from "react-router-dom";
import { open as dialogOpen, save as dialogSave } from "@tauri-apps/api/dialog";
import {
  readTextFile,
  writeTextFile,
  writeBinaryFile,
  BaseDirectory,
} from "@tauri-apps/api/fs";

import xmind from "simple-mind-map/src/parse/xmind.js";

// import bookmarkHtmlText from "./bookmark";
import bookmarkHtmlText from "./bookmark-kerry";
import styles from "./List.module.less";
import { useTableScroll } from "./useTableScroll";
import { importBookmarks, formatTreeData } from "./utils";
import { DownOutlined } from "@ant-design/icons";
import { addRowData, getAllRow } from "@/services/bookmark-service";
import { generateRandomChineseString } from "@/utils";

export default function List() {
  let navigate = useNavigate();
  let mindMapEvent = null as any;
  const [bookmarkList, setBookmarkList] = useState([]);
  const [total, setTotal] = useState(0); // 页数
  const [current, setCurrent] = useState(1); // 页码
  /* tree */
  const [treeData, setTreeData] = useState([]);
  const [bookmarkHtml, setBookmarkHtml] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getBookmarkList();
  }, []);

  async function getBookmarkList() {
    const res = await getAllRow();
    setBookmarkList(res);
  }

  async function importXMLFile() {
    const {treeData, bookmarkHtml} = await importBookmarks();
    setBookmarkHtml(bookmarkHtml);
    setTreeData(await formatTreeData(treeData));
    setIsModalOpen(true);
  }

  async function exportXMLFile() {
    if (mindMapEvent) {
      const xmindData = (mindMapEvent as any).getData();
      const xmindZip = await xmind.transformToXmind(xmindData);
      const filePath = await dialogSave({});
      await writeBinaryFile(`${filePath}`, await xmindZip.arrayBuffer());
    }
  }
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 30,
    },

    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    // {
    //   title: "类型",
    //   dataIndex: "type",
    //   key: "type",
    //   width: 200,
    // },
    {
      title: "创建时间",
      dataIndex: "create_time",
      key: "create_time",
      width: 200,
    },
    {
      title: "更新时间",
      dataIndex: "last_modified",
      key: "last_modified",
      width: 200,
    },
  ];
  const onPaginationChange: PaginationProps["onChange"] = (page) => {
    setCurrent(page);
  };
  const tableSrcollHeight = useTableScroll({ extraHeight: 200 });

  const handlePreviewCancel = () => {
    setIsModalOpen(false);
  };
  const handlePreviewOk = async () => {
    // 写入数据到数据库
    console.log(8787, "handlePreviewOk");

    await addRowData(generateRandomChineseString(), "type", bookmarkHtml);
    setBookmarkHtml('');
    setTreeData([])
    setIsModalOpen(false)
    await getBookmarkList();
  };
  return (
    <div className={styles.ListPage}>
      <Row>
        <Space>
          {/*导入文件*/}
          <Button onClick={() => importXMLFile()}>导入</Button>
          <Button onClick={() => exportXMLFile()}>导出为xmind</Button>
          {/* <div>
            {nodeContextMenuLeft} - {nodeContextMenuTop}
          </div> */}
        </Space>
      </Row>
      <Row
        style={{
          width: "100%",
          marginTop: "12px",
          overflow: "scroll",
        }}
      >
        <Table
          scroll={{ y: 600, x: "100%" }}
          rowKey={"id"}
          dataSource={bookmarkList}
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
      <Modal
        title="预览数据"
        open={isModalOpen}
        onOk={handlePreviewOk}
        onCancel={handlePreviewCancel}
      >
        <Tree
          showLine
          switcherIcon={<DownOutlined />}
          blockNode
          height={333}
          defaultExpandAll
          treeData={treeData}
        />
      </Modal>
      {/* 展示导入的数据 */}
    </div>
  );
}
