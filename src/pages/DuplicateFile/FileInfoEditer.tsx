import { useEffect, useState } from "react";
import {
  Col,
  Row,
  Button,
  message,
  Table,
  Select,
  Space,
  Modal,
  Input,
  Checkbox,
  GetProp,
  Progress,
  Pagination,
} from "antd";

import { PlusCircleOutlined, RedoOutlined } from "@ant-design/icons";
import styles from "./FileInfoEditer.module.less";

import { open } from "@tauri-apps/api/dialog";
import { appDataDir } from "@tauri-apps/api/path";

/* 导入类型 */
import { FileInfoEditerType, FileInfoType } from "@/types/files";
import { fileTypeList, fileSizeList } from "./config";

export default function FileInfoEditer({
  title,
  showModal = false,
  fileInfoSource = {},
  onClickOk,
  onClickCancel,
}: FileInfoEditerType) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(showModal);
  const [fileInfo, setFileInfo] = useState<FileInfoType>({});
  const { TextArea } = Input;
  useEffect(() => {
    setIsModalOpen(showModal);
    console.log(4040, fileInfoSource)
    if (JSON.stringify(fileInfoSource) !== "{}" && showModal) {
      setFileInfo(fileInfoSource);
    }
    if(!showModal) {
        setFileInfo({});
    }
  }, [showModal, fileInfoSource]);

  async function getDir() {
    // 打开本地的系统目录，暂时不支持多选
    const selected = await open({
      directory: true,
      multiple: false,
      defaultPath: await appDataDir(),
    });
    console.log(55, selected);

    if (selected && selected.length) {
      setFileInfo({
        ...fileInfo,
        path: `${selected}`,
      });
      // setUsePath(`${selected}`);
      // 最多记录 100 条用户操作的历史数据
      // const files = await File.getAllList(`${selected}`);
    }
    // await invoke("file_sort", { path: selected });
    // setFile([...fileStr, await invoke("file_sort", { path: selected })]);
  }

  function handleOk() {
    if (!fileInfo?.path) {
      message.error("请选择文件路径");
    }
    console.log(180, fileInfo);
    onClickOk && onClickOk(fileInfo);
  }

  function handleCancel() {
    setFileInfo({});
    setIsModalOpen(false);
    onClickCancel && onClickCancel();
  }
  const checkboxAll = () => {
    const otherTypes = [
      "其他所有带扩展名的类型",
      "其他所有无扩展名的类型",
      // "指定",
      // "排除",
    ];
    const checkedValues = fileTypeList.map((typeInfo) => typeInfo.name);
    setFileInfo({
      ...fileInfo,
      checkboxAll: !fileInfo.checkboxAll,
      checkedTypeValues: fileInfo.checkboxAll
        ? []
        : [...checkedValues, ...otherTypes],
    });
  };

  const checkboxSizeAll = () => {
    const checkedSizeValues = fileSizeList.map((typeInfo) => typeInfo.name);
    setFileInfo({
      ...fileInfo,
      checkboxSizeAll: !fileInfo.checkboxSizeAll,
      checkedSizeValues: fileInfo.checkboxSizeAll ? [] : checkedSizeValues,
    });
  };

  const onTypesChange: GetProp<typeof Checkbox.Group, "onChange"> = (
    checkedValues
  ) => {
    console.log("checked = ", checkedValues);
    // TODO 全选、全不选的交互 等主体功能完善之后, 再开发
    setFileInfo({
      ...fileInfo,
      checkedTypeValues: checkedValues,
    });
  };

  const onAddTypeChange = (types: string) => {
    setFileInfo({
      ...fileInfo,
      addType: types,
    });
  };
  const onPassTypeChange = (types: string) => {
    setFileInfo({
      ...fileInfo,
      passType: types,
    });
  };
  const onSizesChange: GetProp<typeof Checkbox.Group, "onChange"> = (
    checkedValues
  ) => {
    console.log("checkedSizeValues = ", checkedValues);
    setFileInfo({
      ...fileInfo,
      checkedSizeValues: checkedValues,
    });
  };

  return (
    <Modal
      title={title}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Row align="middle">
        <span>
          <span style={{ color: "red" }}>*</span>文件路径:
        </span>
        <Row justify="space-around" align="middle">
          <span className={styles.filePath}>{fileInfo.path || ""}</span>
          <Col>
            {fileInfo.path ? (
              <RedoOutlined
                className={styles.iconHover}
                onClick={() => getDir()}
              />
            ) : (
              <PlusCircleOutlined
                className={styles.iconHover}
                onClick={() => getDir()}
              />
            )}
          </Col>
        </Row>
      </Row>
      <Row align="top">
        <span>
          <span style={{ color: "transparent" }}>*</span>文件类型:
        </span>
        <Row
          style={{
            flex: 1,
            padding: "2px 12px",
          }}
        >
          <Row style={{ flex: 1 }}>
            <Checkbox
              checked={fileInfo.checkboxAll}
              onChange={() => checkboxAll()}
              value={"全选/不选"}
            >
              全选/不选
            </Checkbox>
          </Row>
          <Checkbox.Group
            onChange={onTypesChange}
            value={fileInfo.checkedTypeValues}
          >
            {fileTypeList.map((typeInfo) => (
              <Col span={7} key={typeInfo.name}>
                <Checkbox value={typeInfo.name}>{typeInfo.name}</Checkbox>
              </Col>
            ))}
            <Col span={24}>
              <Checkbox value={"其他所有带扩展名的类型"}>
                其他所有带扩展名的类型
              </Checkbox>
            </Col>
            <Col span={24}>
              <Checkbox value={"其他所有无扩展名的类型"}>
                其他所有无扩展名的类型
              </Checkbox>
            </Col>
            <Col span={24}>
              <Row style={{ flex: 1, marginTop: "8px" }}>
                <Col span={4}>
                  <Checkbox value={"指定"}>指定</Checkbox>
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
              <Row style={{ flex: 1, marginTop: "8px" }}>
                <Col span={4}>
                  <Checkbox value={"排除"}>排除</Checkbox>
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
      <Row align="top">
        <span>
          <span style={{ color: "transparent" }}>*</span>文件大小:
        </span>
        <Row
          style={{
            flex: 1,
            padding: "2px 12px",
          }}
        >
          <Col span={11} key={"全选/不选"}>
            <Checkbox
              checked={fileInfo.checkboxSizeAll}
              onChange={() => checkboxSizeAll()}
            >
              全选/不选
            </Checkbox>
          </Col>
          <Checkbox.Group
            onChange={onSizesChange}
            value={fileInfo.checkedSizeValues}
          >
            {fileSizeList.map((typeInfo) => (
              <Col span={11} key={typeInfo.name}>
                <Checkbox value={typeInfo.name}>{typeInfo.name}</Checkbox>
              </Col>
            ))}
          </Checkbox.Group>
        </Row>
      </Row>
    </Modal>
  );
}
