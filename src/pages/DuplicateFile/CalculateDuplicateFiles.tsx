import {
  get_info_by_id,
  getFirstEmptyHashBySourceId,
  insertSearchFiles,
  updateSelectedFileHistoryFiles,
} from "@/services";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  backFileInfoType,
  FileInfoType,
  insertSearchFilesPasamsType,
  stepsStatusType,
} from "@/types/files";
import { message } from "@tauri-apps/api/dialog";
import styles from "./CalculateDuplicateFiles.module.less";
import File from "@/plugins/tauri-plugin-file/file";
import { Button, Col, Row, Steps, Space } from "antd";
import { fileTypeList } from "./config";
import get_progress_by_sourceId, {
  get_fileInfo_by_path,
  get_list_by_sourceid,
  updateFileHsah,
} from "@/services/file-service";

export default function CalculateDuplicateFiles() {
  let { fileId } = useParams();
  let navigate = useNavigate();
  const location = useLocation();

  const [fileInfo, setFileInfo] = useState<FileInfoType>({});
  const [current, setCurrent] = useState(1);
  const [percent, setPercent] = useState(85);
  const [duplicateFilesStep, setDuplicateFilesStep] = useState("");
  const [stepsStatus, setStepsStatus] = useState<stepsStatusType>({
    // 'wait' | 'process' | 'finish' | 'error';
    scanDir: "wait",
    fileOptions: "wait",
    duplicateFiles: "wait",
    done: "wait",
  });
  const [isCancelled, setIsCancelled] = useState(false); // 离开页面时终止正在执行的逻辑
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    pageInit().then((r) => console.log(r));
  }, []);

  useEffect(() => {
    // 这段代码只会在组件首次挂载时执行一次
    console.log("组件已挂载");

    console.log(location); // 当前路由路径
    console.log(location.pathname); // 当前路由路径

    setTimeout(() => {
      // 设置一个状态标志，表示组件已经挂载
      setHasMounted(true);
    }, 300);
    // 如果你需要在组件卸载时进行清理，可以在这里返回一个函数
    // 当组件加载时，不做特殊操作
    // 只在组件卸载时设置isCancelled为true
    return () => {
      if (hasMounted) {
        console.log(47, " 当组件卸载时，设置isCancelled为true");
        setIsCancelled(true);
      }
    };
  }, [hasMounted]);

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
      await computeFileMetadata_v2(files);
      console.log("计算文件属性 结束");

      // 计算文件具体内容
      console.log("计算每一个文件的hash 开始");
      try {
        await computeFileChecksums_2();
      } catch (error) {
        console.log(107, error);
        if (error == "提前终止") {
          return;
        }
      }
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
  async function scanAllFilesInDir(): Promise<backFileInfoType[]> {
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

  /*
   * 处理获取到的文件属性
   * */
  async function computeFileMetadata_v2(files: backFileInfoType[]) {
    const [progressRes] = await get_progress_by_sourceId(`${fileId}`);
    if (!files.length || !progressRes.total_entries) {
      setStepsStatus({
        ...stepsStatus,
        scanDir: "finish",
        fileOptions: "finish",
      });
      setPercent(100);
      return Promise.resolve(0);
    }
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
    await files.reduce(async (prevPromise: any, currentFile: any) => {
      // 等待上一个 Promise 完成
      await prevPromise;
      fileIndex++;
      const file_info = files[fileIndex];
      setPercent(Math.floor((fileIndex / allFilesLength) * 100));
      return insertSearchFiles({
        // 组装数据
        sourceId: `${fileId}`,
        path: `${file_info.file_path}`,
        name: file_info.file_name,
        creation_time: file_info.creation_time,
        modified_time: file_info.modified_time,
        file_size: file_info.file_size,
        type: file_info.file_type,
        hash: "",
      });
    }, Promise.resolve(0));
    setPercent(100);
    return waittime(300);
  }

  // 计算每一个文件的hash
  async function computeFileChecksums_2() {
    const [progressRes] = await get_progress_by_sourceId(`${fileId}`);
    // console.log(178, progressRes)

    // 已经存在的数据中，计算过的 hash 总量跟 文件总数不是一样的，并且存在有记录的文件
    if (progressRes.hash_null_count && progressRes.total_entries) {
      let fileIndex = -1;
      let allFilesLength = progressRes.hash_null_count;
      const allList = [...Array(allFilesLength).keys()];
      setStepsStatus({
        ...stepsStatus,
        scanDir: "finish",
        fileOptions: "finish",
        duplicateFiles: "process",
      });
      setPercent(0);
      await allList.reduce(async (prevPromise: any, index: number) => {
        // 等待上一个 Promise 完成
        await prevPromise;
        if (
          isCancelled ||
          window.location.href.indexOf(location.pathname) < 0
        ) {
          // @ts-ignore
          throw "提前终止";
          return Promise.resolve(0);
        } // 如果设置了取消标志，则提前终止
        const [fileinfo, error] = await getFirstEmptyHashBySourceId(
          `${fileId}`,
        );
        if (fileinfo) {
          // 获取文件类型和哈希
          const hash = await File.getHash(fileinfo.path);
          await updateFileHsah(fileinfo.path, hash, `${fileId}`);
        }
        // console.clear();  // 清除控制台
        // console.log(223, window.location.href, location.pathname, fileinfo);
        // console.log(223, window.location.href.indexOf(location.pathname), location.pathname);
        fileIndex++;
        // await waittime();
        const [newProgressRes] = await get_progress_by_sourceId(`${fileId}`);
        setPercent(
          Math.floor((fileIndex / newProgressRes.hash_null_count) * 100),
        );
        setDuplicateFilesStep(
          `: ${fileIndex} / ${newProgressRes.hash_null_count}`,
        );
        return Promise.resolve(0);
      }, Promise.resolve(0));

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

  function toNextPage() {
    navigate("/calculate-list/" + fileId);
  }

  function toFilesManage() {
    navigate("/files-manage/" + fileId);
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
          <Space>
            <Button type="primary" onClick={() => scanDirAll()}>
              开始
            </Button>
            <Button type="primary" onClick={() => toFilesManage()}>
              管理
            </Button>
            <Button type="primary" onClick={() => toNextPage()}>
              预览重复数据
            </Button>
          </Space>
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
              title: "分析重复文件" + duplicateFilesStep,
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
