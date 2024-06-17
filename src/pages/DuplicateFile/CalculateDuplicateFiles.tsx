import {
  delSelectedFileHistory,
  get_all_history,
  get_info_by_id,
  get_info_by_path,
  insertSeletedFileHistory,
  updateSelectedFileHistory,
  insertSearchFiles,
  searchDuplicateFile,
} from "@/services";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FileInfoType, stepsStatusType } from "@/types/files";
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

export default function CalculateDuplicateFiles() {
  let { fileId } = useParams();
  let navigate = useNavigate();
  const [fileInfo, setFileInfo] = useState<FileInfoType>({});
  const [current, setCurrent] = useState(1);
  const [percent, setPercent] = useState(85);
  const [stepsStatus, setStepsStatus] = useState<stepsStatusType>({
    scanDir: "finish",
    fileOptions: "process",
    duplicateFiles: "wait",
    done: "wait",
  });
  useEffect(() => {
    pageInit();
  }, []);

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
    const searchDuplicateFileRes =  await searchDuplicateFile({
        sourceId: fileId || ''
    })
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
    console.log(747474, searchDuplicateFileRes);
    return
    // navigate('/calculate-list/' + fileId)
    if (fileInfo.path) {
      // 扫描目录文件

      // 排除指定的文件大小、或者筛选所有体量的文件
      const size = []; // 全部为空

      // 排除指定的文件类型、或者筛选所有的文件类型
      const types = await getTypeValuesByCheckedTypeValues(); // 全部为空

      const files = await File.getAllList({
        path: fileInfo.path,
        types,
      });

      console.log(636363, files);

      // 计算文件属性
      if (files.length) {
        // await files.reduce(async ())

        const result = await files.reduce(
          async (prevPromise: any, currentFile: any) => {
            // 等待上一个 Promise 完成
            await prevPromise;
            console.log(95, currentFile);
            // 获取文件类型和哈希
            const type = await File.getType(currentFile);
            const hash = await File.getHash(currentFile);
            return insertSearchFiles({
              // 组装数据
              sourceId: `${fileId}`,
              path: currentFile,
              // type: await File.getType(elm),
              name: currentFile,
              hash,
              type,
            });
          },
          Promise.resolve(0)
        );

        console.log(result); // 顺序处理每个项，然后输出最终结果


        // 分析重复文件
      }
    }
  }

  async function getTypeValuesByCheckedTypeValues() {
    let types: any[] = [];
    if (!fileInfo.checkedTypeValues?.length || !fileInfo.checkedTypeValues)
      return [];
    const checkedTypeValues = `${fileInfo.checkedTypeValues}`?.split(",");
    console.log(84884, checkedTypeValues);
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
