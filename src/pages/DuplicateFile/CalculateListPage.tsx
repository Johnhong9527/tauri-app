import { Avatar, List, message, Checkbox, Row, Col, Space, Button } from "antd";
import type { CheckboxProps } from "antd";
import { useEffect, useState } from "react";
import {
  del_file_by_id,
  get_fileInfo_by_id,
  searchDuplicateFile,
} from "@/services";
import { message as tauriMessage } from "@tauri-apps/api/dialog";
import styles from "./CalculateListPage.module.less";
import { useParams } from "react-router";
import { insertSearchFilesPasamsType } from "@/types/files";
import type { GetProp } from "antd";
import File from "@/plugins/tauri-plugin-file/file";

export default function CalculateListPage() {
  let { fileId } = useParams();
  const [data, setData] = useState<FileItem[]>([]);
  const [removeList, setRemoveList] = useState<string[]>([]);
  interface FileItem {
    sourceId: number;
    ids: string;
    hash: string;
    count: number;
    firstItem: insertSearchFilesPasamsType;
    otherItems: insertSearchFilesPasamsType[];
  }
  const appendData = async () => {
    const [isError, searchDuplicateFileRes] = await searchDuplicateFile({
      sourceId: `${fileId}`,
    });
    if (!isError) {
      typeof searchDuplicateFileRes === "string" &&
        (await tauriMessage(searchDuplicateFileRes, {
          title: "查询失败",
          type: "error",
        }));
      console.log(searchDuplicateFileRes);
    }

    if (Array.isArray(searchDuplicateFileRes)) {
      const newData: any[] = [];
      await searchDuplicateFileRes.reduce(
        async (prevPromise: any, currentFile: any) => {
          // 等待上一个 Promise 完成
          await prevPromise;
          const ids = currentFile.ids.split(",");
          const firstItem = await get_fileInfo_by_id(ids[0], `${fileId}`);
          const otherItems = await Promise.allSettled(
            ids
              .map((id: string) => {
                if (id === ids[0]) {
                  return false;
                }
                return get_fileInfo_by_id(id, `${fileId}`);
              })
              .filter((elm: any) => elm)
          );

          newData.push({
            ...currentFile,
            firstItem: firstItem[0],
            otherItems: otherItems
              .map((elm) => {
                if (elm.status === "fulfilled" && !elm.value[1]) {
                  return elm.value[0];
                }
                return false;
              })
              .filter((elm: any) => elm),
          });
          return Promise.resolve(0);
        },
        Promise.resolve(0)
      );
      setData(newData);
    }
  };

  useEffect(() => {
    appendData();
  }, []);

  const onChange: GetProp<typeof Checkbox.Group, "onChange"> = (
    checkedValues
  ) => {
    console.log("checked = ", checkedValues);
    if (Array.isArray(checkedValues)) {
      // setRemoveList(checkedValues.filter(elm => typeof elm === 'string'));
      // setRemoveList(checkedValues)
    }
    // value={removeList}
  };

  const CheckboxContent = (item: insertSearchFilesPasamsType) => (
    <div>{item.path}</div>
  );

  async function removeFilesByDB() {
    const filesRes = await File.rmFile(
      "/Users/sysadmin/Pictures/test/欧洲4_副本5.jpeg"
    );
    console.log(9797, filesRes);
    if (filesRes.code === 200) {
      await del_file_by_id(
        "/Users/sysadmin/Pictures/test/欧洲4_副本5.jpeg",
        "24"
      );
      message.success('删除成功!')
      return;
    }
    await tauriMessage(filesRes.msg, {
      title: "删除失败",
      type: "error",
    });
  }

  return (
    <div className={styles.CalculateListPage}>
      <div
        style={{
          padding: "24px",
        }}
      >
        <Space>
          <Button type="primary" danger onClick={() => removeFilesByDB()}>
            删除选中的文件
          </Button>
          <Button type="primary">统一移动到指定目录</Button>
          <Button type="primary">导出</Button>
        </Space>
        <div style={{ marginBottom: "12px" }}></div>
        <Checkbox.Group onChange={onChange} style={{ width: "100%" }}>
          <div style={{ width: "100%" }}>
            {data.map((item: FileItem) => (
              <div
                key={item.hash}
                style={{
                  marginBottom: "12px",
                }}
              >
                <div>
                  <Checkbox value={item.firstItem.path}>
                    {CheckboxContent(item.firstItem)}
                  </Checkbox>
                </div>
                <div
                  style={{
                    backgroundColor: "var(--color-1)",
                    padding: "12px 3px",
                  }}
                >
                  {item.otherItems.map((otherItem) => (
                    <div key={otherItem.path}>
                      <Checkbox value={otherItem.path}>
                        {CheckboxContent(otherItem)}
                      </Checkbox>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Checkbox.Group>
      </div>
    </div>
  );
}
