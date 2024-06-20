import {
  delSelectedFileHistory,
  get_all_history,
  get_info_by_id,
  get_info_by_path,
  insertSeletedFileHistory,
  updateSelectedFileHistory,
  insertSearchFiles,
  searchDuplicateFile,
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
import {
  LoadingOutlined,
  SolutionOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { readDir, BaseDirectory } from "@tauri-apps/api/fs";
import { fileTypeList } from "./config";
import get_progress_by_sourceId, {
  get_list_by_sourceid,
  updateFileHsah,
} from "@/services/file-service";
import { resolve } from "path";

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
      console.log(4545);
      setStepsStatus({
        ...stepsStatus,
        fileOptions: "process",
      });
      //
      // const files = await File.getAllList(fileInfo.path);
      // console.log(34, files)

      // /Users/honghaitao/Downloads/PDF Expert Installer.app

      // const hash = await File.getHash('/Users/honghaitao/Downloads/PDF Expert Installer.app')
      // console.log(39, hash)
    }
  }
  async function scanDirAll() {
    // const aabb = await get_progress_by_sourceId(`${fileId}`);
    // console.log(737373, aabb);
    // const progressRes = await get_progress_by_sourceId(fileId || '')
    // console.log(93, progressRes, fileInfo);
    
    // return

    // navigate('/calculate-list/' + fileId)
    if (fileInfo.path) {
      // 扫描目录文件
      console.log('扫描目录文件 开始');
      setStepsStatus({
        ...stepsStatus,
        scanDir: "process",
      });
      setCurrent(1);
      setPercent(0);
      // 排除指定的文件大小、或者筛选所有体量的文件
      const size = []; // 全部为空

      // 排除指定的文件类型、或者筛选所有的文件类型
      const types = await getTypeValuesByCheckedTypeValues(); // 全部为空

      const files = await File.getAllList({
        path: fileInfo.path,
        types,
      });
      setPercent(100);
      console.log('扫描目录文件 结束');

      

      console.log(118, files);

      // 计算文件属性
      console.log('计算文件属性 开始');
      if (files.length) {
        // 更新当前查询目录的总文件数目
        await updateSelectedFileHistoryFiles(fileInfo.path, files.length, )
        setStepsStatus({
          ...stepsStatus,
          scanDir: "finish",
          fileOptions: "process",
        });
        // setCurrent(1)
        setPercent(0);
        // await files.reduce(async ())
        let fileIndex = -1;
        let allFilesLength = files.length;
        const result = await files.reduce(
          async (prevPromise: any, currentFile: any) => {
            // 等待上一个 Promise 完成
            await prevPromise;
            // 获取文件类型和哈希
            const fileInfo = await File.getInfo(currentFile);
            // const hash = await File.getHash(currentFile);
            const hash = "";
            fileIndex++;
            setPercent(Math.floor((fileIndex / allFilesLength) * 100));
            // await waittime(300);
            return insertSearchFiles({
              // 组装数据
              sourceId: `${fileId}`,
              path: currentFile,
              // type: await File.getType(elm),
              name: fileInfo.file_name,
              creation_time: fileInfo.creation_time,
              modified_time: fileInfo.modified_time,
              file_size: fileInfo.file_size,
              type: fileInfo.file_type,
              hash,
            });
          },
          Promise.resolve(0)
        );
        console.log('计算文件属性 结束');
        setPercent(100);
        await waittime(1000);
        // 计算文件具体内容
        const [allList, allListMsg] = await get_list_by_sourceid(`${fileId}`);
        console.log({
          allList,
          allListMsg,
        });

        if (allList) {
          let fileIndex = -1;
          let allFilesLength = allList.length;
          setStepsStatus({
            ...stepsStatus,
            scanDir: "finish",
            fileOptions: "finish",
            duplicateFiles: "process",
          });
          setPercent(0);
          console.log(173, allFilesLength);

          const allListresult = await allList
            .filter(
              (currentFile: insertSearchFilesPasamsType) => !currentFile.hash
            )
            .reduce(
              async (
                prevPromise: any,
                currentFile: insertSearchFilesPasamsType
              ) => {
                // 等待上一个 Promise 完成
                await prevPromise;
                // 获取文件类型和哈希
                // const type = await File.getType(currentFile);
                const hash = await File.getHash(currentFile.path);
                fileIndex++;
                await waittime();
                setPercent(Math.floor((fileIndex / allFilesLength) * 100));
                return updateFileHsah(currentFile.path, hash, `${fileId}`);
              },
              Promise.resolve(0)
            );

          await waittime(1000);
          setStepsStatus({
            ...stepsStatus,
            scanDir: "finish",
            fileOptions: "finish",
            duplicateFiles: "finish",
          });
          setPercent(100);
        } else {
          setStepsStatus({
            ...stepsStatus,
            scanDir: "finish",
            fileOptions: "finish",
            duplicateFiles: "finish",
          });
          setPercent(100);
          await waittime(2000);
        }

        setStepsStatus({
          ...stepsStatus,
          scanDir: "finish",
          fileOptions: "finish",
          duplicateFiles: "finish",
          done: "process",
        });
        setPercent(0);
        // 分析重复文件
        /* const searchDuplicateFileRes = await searchDuplicateFile({
          sourceId: fileId || "",
        }); */
        /* 
            [
                {count: 6, hash: "3ba7bbfc03e3bed23bf066e2e9a6a5389dd33fd8637bc0220d9e6d642ccf5946", ids: "17,21,22,26,27,31", },
                {count: 6, hash: "75b7c31709e1529be7bec1c8a40ec98edbda146a09904a5ffad8685da966f90b", ids: "19,23,24,25,29,30", },
                {count: 3, hash: "7707b032ff2fea855a1bc22b7be536de13d3ad6d418cc7021893a97cf488e1a3", ids: "20,28,32", }
            ]
    
    
    
            [
                {
                    count: 6, 
                    hash: "3ba7bbfc03e3bed23bf066e2e9a6a5389dd33fd8637bc0220d9e6d642ccf5946", 
                    paths: "/Users/sysadmin/Pictures/test/欧洲4_副本.jpeg,/Users/s…4.jpeg,/Users/sysadmin/Pictures/test/欧洲4_副本5.jpeg", 
                    ids: "17,21,22,26,27,31", 
                    times: "1718613803964,1718613804035,1718613804041,1718613804070,1718613804080,1718613804112"
                },
                {
                    hash: "75b7c31709e1529be7bec1c8a40ec98edbda146a09904a5ffad8685da966f90b", 
                    times: "1718613804012,1718613804051,1718613804057,1718613804063,1718613804094,1718613804104", 
                    paths: "/Users/sysadmin/Pictures/test/欧洲2.jpeg,/Users/sysa…3.jpeg,/Users/sysadmin/Pictures/test/欧洲2_副本2.jpeg", 
                    ids: "19,23,24,25,29,30", 
                    count: 6
                }
                {
                    times: "1718613804018,1718613804086,1718613804118", 
                    ids: "20,28,32", 
                    paths: "/Users/sysadmin/Pictures/test/欧洲1_副本2.jpeg,/Users/…洲1.jpeg,/Users/sysadmin/Pictures/test/欧洲1_副本.jpeg", 
                    count: 3, 
                    hash: "7707b032ff2fea855a1bc22b7be536de13d3ad6d418cc7021893a97cf488e1a3"
                }
            ] 
    
        */
        /* console.log(747474, searchDuplicateFileRes);
        if (searchDuplicateFileRes[0]) {
        } */

        setStepsStatus({
          scanDir: "finish",
          fileOptions: "finish",
          duplicateFiles: "finish",
          done: "finish",
        });
        setPercent(100);
        await waittime(1000);
        navigate('/calculate-list/' + fileId)
      }
    }
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
