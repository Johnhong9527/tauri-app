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
import { CopyText } from "@/components/Table/CopyText";

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
                  setRemoveList()
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

  const onChange = (
    checkedValues: string[]
  ) => {
    console.log("checked = ", checkedValues);
    if (Array.isArray(checkedValues)) {
      // setRemoveList(checkedValues.filter(elm => typeof elm === 'string'));
      setRemoveList(checkedValues)
    }
    // value={removeList}
  };

  const CheckboxContent = (item: insertSearchFilesPasamsType) => (
    <div className={styles.CheckboxContent}>
      <div className={styles.path}>
        <CopyText width="300px" color="#333" ellipsisLine={1} name={item.path || ''}></CopyText>
      </div>
      <div className={styles.modified_time}>
        <CopyText width="100px" color="#333" name={item.modified_time || ''}></CopyText>
      </div>
      <div className={styles.modified_time}>
        <CopyText width="100px" color="#333" name={item.file_size || ''}></CopyText>
      </div>
      <div className={styles.modified_time}>
        <CopyText width="100px" color="#333" ellipsisLine={1} name={item.name || ''}></CopyText>
      </div>
    </div>
  );

  async function removeFilesByDB() {
    const filesRes = await Promise.allSettled(removeList.map(path => File.rmFile(path)))
    if(removeList.length === 1) {
      console.log(106, filesRes);
      if(filesRes[0].status === "fulfilled" && filesRes[0].value.code === 200) {
        setRemoveList([])
        del_file_by_id(
          removeList[0],
          `${fileId}`
        );
        message.success(`${removeList[0]} 删除成功!`)
        appendData();
        return
      } 
      await tauriMessage(removeList[0], {
        title: "删除失败",
        type: "error",
      });
    }
    const rmSuccess = filesRes.filter(res => {
      console.log(116, res);
      return res.status === 'fulfilled' && res.value.code === 200
    })
    if (rmSuccess.length) {
      await rmSuccess.reduce(async(prev: any, item: any)=> {
        await prev();
        console.log(119, item.value.data);
        
        return del_file_by_id(
          item.value.data,
          `${fileId}`
        );
      }, Promise.resolve(0));
      message.success( `${rmSuccess.length}个文件删除成功! ${filesRes.length - rmSuccess.length}个文件删除失败!`)
      appendData();
      return;
    }
    await tauriMessage('当前操作异常，请重新尝试！', {
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
        <Checkbox.Group onChange={onChange} style={{ width: "100%" }} value={removeList}>
          <div style={{ width: "100%" }}>
            {data.map((item: FileItem) => (
              <div
                key={item.hash}
                style={{
                  backgroundColor: 'var(--color-2)',
                  marginBottom: '24px'
                }}
              >
                <div className={styles.CheckboxGroup}>
                  <Checkbox value={item.firstItem.path}>
                    {CheckboxContent(item.firstItem)}
                  </Checkbox>
                </div>
                <div
                  style={{
                    border: '1px solid var(--color-1)',
                    padding: "12px 3px",
                  }}
                  className={styles.CheckboxGroup}
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
