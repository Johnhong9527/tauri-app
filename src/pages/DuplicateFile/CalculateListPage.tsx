import {
  Avatar,
  List,
  message,
  Checkbox,
  Row,
  Col,
  Space,
  Button,
  Spin,
  Empty,
} from "antd";
import type { CheckboxProps } from "antd";
import { useEffect, useState } from "react";
import {
  del_file_by_id,
  get_fileInfo_by_id,
  searchDuplicateFile,
} from "@/services";
import {
  message as tauriMessage,
  save as dialogSave,
  open as dialogopen,
} from "@tauri-apps/api/dialog";
import { appDataDir, homeDir, join } from "@tauri-apps/api/path";
import styles from "./CalculateListPage.module.less";
import { useParams } from "react-router";
import { insertSearchFilesPasamsType } from "@/types/files";
import type { GetProp } from "antd";
import File from "@/plugins/tauri-plugin-file/file";
import { CopyText } from "@/components/Table/CopyText";
import { FolderOpenOutlined } from "@ant-design/icons";

export default function CalculateListPage() {
  let { fileId } = useParams();
  const [data, setData] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [tip, setTip] = useState<string>('');
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
    setLoading(true)
    setTip('正在统计中');
    const [isError, searchDuplicateFileRes] = await searchDuplicateFile({
      sourceId: `${fileId}`,
    });
    console.log(5151, isError)
    if (!isError) {
      typeof searchDuplicateFileRes === "string" &&
        (await tauriMessage(searchDuplicateFileRes, {
          title: "查询失败",
          type: "error",
        }));
    }

    if (Array.isArray(searchDuplicateFileRes)) {
      let index = -1
      const newData: any[] = [];
      await searchDuplicateFileRes.reduce(
        async (prevPromise: any, currentFile: any) => {
          // 等待上一个 Promise 完成
          await prevPromise;
          index++
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
                  setRemoveList([]);
                  return elm.value[0];
                }
                return false;
              })
              .filter((elm: any) => elm),
          });
          setTip(`正在统计中: ${Math.floor((index / searchDuplicateFileRes.length) * 100)}% : ${searchDuplicateFileRes.length - index}`);
          return Promise.resolve(0);
        },
        Promise.resolve(0)
      );
      setData(newData);
    }
    setLoading(false)
    setTip('')
  };

  useEffect(() => {
    appendData();
  }, []);

  const onChange = (checkedValues: string[]) => {
    if (Array.isArray(checkedValues)) {
      setRemoveList(checkedValues);
    }
  };
  const openFileShowInExplorer = async (path: string) => {
    const res = await File.showFileInExplorer(path);
  };

  const CheckboxContent = (item: insertSearchFilesPasamsType) => (
    <div className={styles.CheckboxContent}>
      <div>
        <FolderOpenOutlined onClick={() => openFileShowInExplorer(item.path)} />
      </div>
      <div className={styles.modified_time}>
        <CopyText
          width="300px"
          color="#333"
          ellipsisLine={0}
          name={item.name || ""}
        ></CopyText>
      </div>
      <div className={styles.path}>
        <CopyText
          width="300px"
          color="#333"
          ellipsisLine={1}
          name={item.path || ""}
        ></CopyText>
      </div>
      <div className={styles.modified_time}>
        {/* <CopyText
          width="100px"
          color="#333"
          name={item.modified_time || ""}
        ></CopyText> */}
        {item.modified_time}
      </div>
      <div className={styles.modified_time}>
        {/* <CopyText
          width="100px"
          color="#333"
          name={item.file_size || ""}
        ></CopyText> */}
        {item.file_size}
      </div>
    </div>
  );
  const waittime = (time = 100) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(0);
      }, time);
    });
  };
  async function removeFilesByDB() {
    setLoading(true);
    const filesRes = await Promise.allSettled(
      removeList.map((path) => File.rmFile(path))
    );
    if (removeList.length === 1) {
      if (
        filesRes[0].status === "fulfilled" &&
        filesRes[0].value.code === 200
      ) {
        setRemoveList([]);
        del_file_by_id(removeList[0], `${fileId}`);
        message.success(`${removeList[0]} 删除成功!`);
        appendData();
        return;
      }
      await tauriMessage(removeList[0], {
        title: "删除失败",
        type: "error",
      });
    }
    const rmSuccess = filesRes.filter((res) => {
      return res.status === "fulfilled" && res.value.code === 200;
    });
    if (rmSuccess.length) {
      await rmSuccess.reduce(async (prevPromise: any, item: any) => {
        await prevPromise;
        return del_file_by_id(item.value.data, `${fileId}`);
      }, Promise.resolve());
      message.success(
        `${rmSuccess.length}个文件删除成功! ${filesRes.length - rmSuccess.length}个文件删除失败!`
      );
      appendData();
      await waittime(1500);
      setLoading(false);
      return;
    }
    await waittime(1500);
    setLoading(false);
    await tauriMessage("当前操作异常，请重新尝试！", {
      title: "删除失败",
      type: "error",
    });
  }
  async function openDialogSave() {
    // const appDataDir = await File.getAppDataDir();
    // const appDataDirPath = await appDataDir();
    // console.log(190, appDataDirPath);
    // 打开本地的系统目录，暂时不支持多选
    const selected = await dialogopen({
      title: "请选择需要保存的目录",
      directory: true,
      multiple: false,
      defaultPath: await homeDir(),
    });
    console.log(213, selected);
    await File.moveSpecificFiles(['/Users/honghaitao/Downloads/Xnip2023-05-31_21-39-11_副本.png'], `${selected}`)
    return;
    // dialogSave
    const filePath = await dialogSave({
      filters: [
        {
          name: "Image",
          extensions: ["png", "jpeg"],
        },
      ],
    });
    console.log(186, filePath);
  }
  return (
    <div className={styles.CalculateListPage}>
      <Spin spinning={loading} tip={tip}>
        <div
          style={{
            padding: "24px",
            minHeight: '50vh'
          }}
        >
          <Space>
            <Button type="primary" danger onClick={() => removeFilesByDB()}>
              删除选中的文件
            </Button>
            <Button type="primary" onClick={() => openDialogSave()}>
              统一移动到指定目录
            </Button>
            <Button type="primary">导出</Button>
          </Space>
          <div style={{ marginBottom: "12px" }}></div>
          <Checkbox.Group
            onChange={onChange}
            style={{ width: "100%" }}
            value={removeList}
          >
            <div style={{ width: "100%" }}>
              {data.map((item: FileItem) => (
                <div
                  key={item.hash}
                  style={{
                    backgroundColor: "var(--color-2)",
                    marginBottom: "24px",
                  }}
                >
                  <div className={styles.CheckboxGroup}>
                    <Checkbox value={item.firstItem.path}>
                      {CheckboxContent(item.firstItem)}
                    </Checkbox>
                  </div>
                  <div
                    style={{
                      border: "1px solid var(--color-1)",
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
          {!data.length && !loading && (
            <div
              style={{
                padding: "48px 0",
                backgroundColor: "#fff",
              }}
            >
              <Empty description={"当前目录没有找到重复的文件"} />
            </div>
          )}
        </div>
      </Spin>
    </div>
  );
}
