import {
  get_info_by_id,
  insertSearchFiles,
  updateSelectedFileHistoryFiles,
} from "@/services";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FileInfoType,
  insertSearchFilesPasamsType,
  stepsStatusType,
} from "@/types/files";
import { message } from "@tauri-apps/api/dialog";
import styles from "./CalculateDuplicateFiles.module.less";
import File from "@/plugins/tauri-plugin-file/file";
import { Button, Col, Row, Steps } from "antd";
import { fileTypeList } from "./config";
import get_progress_by_sourceId, {
  get_fileInfo_by_path,
  get_list_by_sourceid,
  updateFileHsah,
} from "@/services/file-service";

export default function CalculateDuplicateFiles() {
  let { fileId } = useParams();
  let navigate = useNavigate();
  const [fileInfo, setFileInfo] = useState<FileInfoType>({});
  const [current, setCurrent] = useState(1);
  const [percent, setPercent] = useState(85);
  const [stepsStatus, setStepsStatus] = useState<stepsStatusType>({
    // 'wait' | 'process' | 'finish' | 'error';
    scanDir: "wait",
    fileOptions: "wait",
    duplicateFiles: "wait",
    done: "wait",
  });
  useEffect(() => {
    pageInit();
  }, []);

  const waittime = (time = 100) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(0);
      }, time);
    });
  };

  async function pageInit() {
    if (fileId) {
      const [data, errorMsg] = await get_info_by_id(Number.parseInt(fileId));
      if (data && typeof data === "object") {
        setFileInfo(data);
      } else {
        await message(errorMsg, { title: "查询失败", type: "error" });
      }
    }
  }

  async function getFiles() {
    if (fileInfo.path) {
      setStepsStatus({
        ...stepsStatus,
        fileOptions: "process",
      });
    }
  }
  async function scanDirAll() {
    if (fileInfo.path) {
      // 扫描目录文件

      console.log("扫描目录文件 结束");
      const files = await scanAllFilesInDir();

      // 计算文件属性
      console.log("计算文件属性 开始");
      await computeFileMetadata(files);
      console.log("计算文件属性 结束");

      // 计算文件具体内容
      console.log("计算每一个文件的hash 开始");
      await computeFileChecksums();
      console.log("计算每一个文件的hash 结束");

      setStepsStatus({
        ...stepsStatus,
        scanDir: "finish",
        fileOptions: "finish",
        duplicateFiles: "finish",
        done: "process",
      });
      setPercent(0);
      // 分析重复文件
      await waittime(300);
      setPercent(50);
      await waittime(300);
      setPercent(100);
      await waittime(300);
      setStepsStatus({
        scanDir: "finish",
        fileOptions: "finish",
        duplicateFiles: "finish",
        done: "finish",
      });
      navigate("/calculate-list/" + fileId);
    }
  }

  // 扫描目录文件
  async function scanAllFilesInDir(): Promise<string[]> {
    const [progressRes] = await get_progress_by_sourceId(`${fileId}`);
    if (progressRes.total_entries !== fileInfo.files || !fileInfo.files) {
      console.log("扫描目录文件 开始");
      setStepsStatus({
        ...stepsStatus,
        scanDir: "process",
      });
      setCurrent(1);
      setPercent(0);
      // 排除指定的文件类型、或者筛选所有的文件类型
      const types = await getTypeValuesByCheckedTypeValues(); // 全部为空

      const files = await File.getAllList({
        path: fileInfo.path,
        types,
      });
      setPercent(100);
      console.log("扫描目录文件 结束");
      return Promise.resolve(files);
    }
    setPercent(100);
    return Promise.resolve([]);
  }

  // 计算文件属性
  async function computeFileMetadata(files: string[]) {
    if(!files.length) {
      setStepsStatus({
        ...stepsStatus,
        scanDir: "finish",
        fileOptions: "finish",
      });
      setPercent(100);
      return Promise.resolve(0)
    }
    /* 如果文件数目为0 ,查询数据库进行 */
    // 更新当前查询目录的总文件数目
    await updateSelectedFileHistoryFiles(`${fileInfo.path}`, files.length);
    setStepsStatus({
      ...stepsStatus,
      scanDir: "finish",
      fileOptions: "process",
    });
    setPercent(0);
    let fileIndex = -1;
    let allFilesLength = files.length;
    await files.reduce(
      async (prevPromise: any, currentFile: any) => {
        // 等待上一个 Promise 完成
        await prevPromise;
        // ishaveFile: true 表示文件数据已经存在; false 表示文件数据不存在xuy;
        const [ishaveFile, fileinfo] = await get_fileInfo_by_path(
          currentFile,
          `${fileId}`
        );
        if (!ishaveFile) {
          // 获取文件类型和哈希
          const fileInfo = await File.getInfo(currentFile);
          fileIndex++;
          setPercent(Math.floor((fileIndex / allFilesLength) * 100));
          return insertSearchFiles({
            // 组装数据
            sourceId: `${fileId}`,
            path: currentFile,
            name: fileInfo.file_name,
            creation_time: fileInfo.creation_time,
            modified_time: fileInfo.modified_time,
            file_size: fileInfo.file_size,
            type: fileInfo.file_type,
            // 由于 计算单个文件的hash 时间较长,所以单独起一个事件,专门做这个事情
            hash: "",
          });
        }
        return Promise.resolve(0);
      },
      Promise.resolve(0)
    );
    setPercent(100);
    return waittime(300);
  }

  // 计算每一个文件的hash
  async function computeFileChecksums() {
    const [allList, allListMsg] = await get_list_by_sourceid(`${fileId}`);
    console.log(195, allList, allListMsg);
    if (allList && Array.isArray(allList)) {
      let fileIndex = -1;
      let allFilesLength = allList.length;
      setStepsStatus({
        ...stepsStatus,
        scanDir: "finish",
        fileOptions: "finish",
        duplicateFiles: "process",
      });
      setPercent(0);
      await allList
        .filter((currentFile: insertSearchFilesPasamsType) => !currentFile.hash)
        .reduce(
          async (
            prevPromise: any,
            currentFile: insertSearchFilesPasamsType
          ) => {
            console.log(213, '获取文件类型和哈希');
            // 等待上一个 Promise 完成
            await prevPromise;
            // 获取文件类型和哈希
            const hash = await File.getHash(currentFile.path);
            fileIndex++;
            await waittime();
            setPercent(Math.floor((fileIndex / allFilesLength) * 100));
            return updateFileHsah(currentFile.path, hash, `${fileId}`);
          },
          Promise.resolve(0)
        );

      setStepsStatus({
        ...stepsStatus,
        scanDir: "finish",
        fileOptions: "finish",
        duplicateFiles: "finish",
      });
    } else {
      setStepsStatus({
        ...stepsStatus,
        scanDir: "finish",
        fileOptions: "finish",
        duplicateFiles: "finish",
      });
    }
    setPercent(100);
    return waittime(1000);
  }

  async function getTypeValuesByCheckedTypeValues() {
    let types: any[] = [];
    if (!fileInfo.checkedTypeValues?.length || !fileInfo.checkedTypeValues)
      return [];
    const checkedTypeValues = `${fileInfo.checkedTypeValues}`?.split(",");
    fileTypeList.map((elm) => {
      if (checkedTypeValues.indexOf(elm.name) > -1) {
        types = types.concat(elm.valus);
      }
    });
    return types;
  }

  return (
    <div className={styles.CalculateDuplicateFiles}>
      <Row justify="start" align="middle">
        <Col>
          <div className={styles.pageTitle} onClick={() => getFiles()}>
            路径: {fileInfo.path}
          </div>
        </Col>
        <Col>
          <Button type="primary" onClick={() => scanDirAll()}>
            开始
          </Button>
        </Col>
      </Row>

      <div className={styles.stepsBox}>
        <Steps
          current={current}
          percent={percent}
          labelPlacement="horizontal"
          direction="vertical"
          items={[
            {
              title: "扫描目录文件",
              status: stepsStatus.scanDir,
            },
            {
              title: "计算文件属性",
              status: stepsStatus.fileOptions,
            },
            {
              title: "分析重复文件",
              status: stepsStatus.duplicateFiles,
            },
            {
              title: "完成",
              status: stepsStatus.done,
            },
          ]}
        />
      </div>
    </div>
  );
}
