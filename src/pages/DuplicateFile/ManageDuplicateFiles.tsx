import { useParams } from "react-router";
import styles from "./ManageDuplicateFiles.module.less";
import { useEffect } from "react";
import { searchDuplicateFile } from "@/services";
import { message } from "@tauri-apps/api/dialog";
import { Button, Col, Row, Steps, Table } from "antd";

export default function ManageDuplicateFiles() {
  let { fileId } = useParams();

  useEffect(() => {
    initPage();
  }, []);
  async function initPage() {
    const [searchDuplicateFileRes, isError] = await searchDuplicateFile({
      sourceId: fileId || "",
    });
    if (!isError) {
      typeof searchDuplicateFileRes === "string" &&
        (await message(searchDuplicateFileRes, {
          title: "查询失败",
          type: "error",
        }));
      console.log(searchDuplicateFileRes);
    }
    console.log(1515151515, searchDuplicateFileRes);
  }
  return (
    <div className={styles.ManageDuplicateFilesBox}>ManageDuplicateFiles
    
    <Row>
    {/* <Table
        columns={columns}
        expandable={{ expandedRowRender, defaultExpandedRowKeys: ['0'] }}
        dataSource={data}
      /> */}
    </Row>
    </div>
  );
}
