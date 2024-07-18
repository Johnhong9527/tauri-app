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
} from "antd";
import React, { useEffect, useState, useRef } from "react";
import { SearchOutlined, FolderOpenOutlined } from "@ant-design/icons";
import {
  message as tauriMessage,
  save as dialogSave,
  open as dialogopen,
} from "@tauri-apps/api/dialog";
import { insertSearchFilesPasamsType } from "@/types/files";
import dayjs from "dayjs";
import { useParams } from "react-router";
import { useLocation } from "react-router-dom";
import { homeDir } from "@tauri-apps/api/path";
import File from "@/plugins/tauri-plugin-file/file";
import { CopyText } from "@/components/Table/CopyText";
import { formatFileSize } from "@/utils";
import styles from "./CalculateListPage.module.less";
import {
  del_file_by_id,
  get_fileInfo_by_id,
  searchDuplicateFile,
  setDuplicateFile,
  getDuplicateFiles_v2,
} from "@/services";

type KeywordsType<T> = {
  [key: string]: T;
};

export default function CalculateListPage() {
  let { fileId } = useParams();
  const location = useLocation();
  const searchInput = useRef<InputRef>(null as any);
  const [data, setData] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  // const [tip, setTip] = useState<string>('');
  const [removeList, setRemoveList] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [userSelectedRowKeys, setUserSelectedRowKeys] = useState<string[]>([]);
  const [sorterOrder, setSorterOrder] = useState({});
  const [sorterColumnKey, setSorterColumnKey] = useState<any>({});
  const [searchText, setSearchText] = useState<any>({});
  const [isCancelled, setIsCancelled] = useState(false); // 离开页面时终止正在执行的逻辑
  const [hasMounted, setHasMounted] = useState(false);

  interface FileItem {
    sourceId: number;
    ids: string;
    hash: string;
    count: number;
    firstItem: insertSearchFilesPasamsType;
    otherItems: insertSearchFilesPasamsType[];
    children: insertSearchFilesPasamsType[];
  }

  async function getFileList() {
    setLoading(true);
    try {
      const sorters = Object.keys(sorterColumnKey).map((key) => ({
        column: key,
        order: sorterColumnKey[key],
      }));
      const keywords: KeywordsType<string> = {};

      if (searchText) {
        Object.keys(searchText).forEach((key) => {
          if (searchText[key]) {
            keywords[key] = searchText[key];
          }
        });
      }

      const res = await getDuplicateFiles_v2({
        searchParams: {
          sourceId: `${fileId}`,
          keywords: keywords,
          sorters: sorters,
        },
        page: page - 1,
        pageSize,
      });

      setTotal(res.total);

      const newData = await processFiles(res.data, fileId);

      setTimeout(() => {
        setData(newData);
        setLoading(false);
      }, 300);
    } catch (error) {
      console.error("Error loading file list:", error);
      setData([]);
      setLoading(false);
    }
  }

  async function processFiles(
    data: string | any[],
    fileId: string | undefined,
  ) {
    if (!Array.isArray(data) || !data.length) {
      return [];
    }
    const results = [];
    for (const file of data) {
      const otherItems = await Promise.allSettled(
        file.ids.split(",").map((id: string) => get_fileInfo_by_id(id, fileId)),
      );
      results.push({
        ...file,
        key: file.id,
        children: (otherItems as any[])
          .filter(
            (result: any) => result.status === "fulfilled" && !result.value[1],
          )
          .map((result) => ({
            id: `${file.id}_${result.value[0].id}`,
            key: `${file.id}_${result.value[0].id}`,
            ...result.value[0],
          })),
      });
    }
    return results;
  }

  const appendData = async () => {
    setLoading(true);
    setRemoveList([]);
    const [isError, searchDuplicateFileRes] = await searchDuplicateFile({
      sourceId: `${fileId}`,
    });
    if (!isError) {
      typeof searchDuplicateFileRes === "string" &&
        (await tauriMessage(searchDuplicateFileRes, {
          title: "查询失败",
          type: "error",
        }));
    }
    /**
     * count: 2
     * hash: "fdd8051fcf884d8cc9a095cd77a58694e13b066aea68dc1fc353767ab0ebfe01"
     * ids: "25494,26393"
     * sourceId: 6
     * */
    if (Array.isArray(searchDuplicateFileRes)) {
      let index = -1;
      await searchDuplicateFileRes.reduce(
        async (prevPromise: any, currentFile: any) => {
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
          index++;
          const ids = currentFile.ids.split(",");
          const firstItem = await get_fileInfo_by_id(ids[0], `${fileId}`);
          try {
            // 写到本地的数据库中
            await setDuplicateFile(`${fileId}`, {
              ...firstItem[0],
              ids: currentFile.ids,
            });
          } catch (err) {
            console.log(109, err);
          }
          // setTip(`正在统计中: ${Math.floor((index / searchDuplicateFileRes.length) * 100)}% : ${searchDuplicateFileRes.length - index}`);
          return Promise.resolve(0);
        },
        Promise.resolve(0),
      );
      // 执行可分页的接口数据请求
      await getFileList();
    } else {
      setLoading(false);
      // setTip('')
    }
  };

  useEffect(() => {
    appendData();
  }, []);

  useEffect(() => {
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

  const onChange = (checkedValues: string[]) => {
    if (Array.isArray(checkedValues)) {
      setRemoveList(checkedValues);
    }
  };
  const openFileShowInExplorer = async (path: string) => {
    const res = await File.showFileInExplorer(path);
  };

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
      removeList.map((path) => File.rmFile(path)),
    );
    if (removeList.length === 1) {
      if (
        filesRes[0].status === "fulfilled" &&
        (filesRes[0] as any).value.code === 200
      ) {
        setRemoveList([]);
        await del_file_by_id(removeList[0], `${fileId}`);
        message.success(`${removeList[0]} 删除成功!`);
        await appendData();
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
        if (
          isCancelled ||
          window.location.href.indexOf(location.pathname) < 0
        ) {
          // @ts-ignore
          throw "提前终止";
          return Promise.resolve(0);
        } // 如果设置了取消标志，则提前终止
        return del_file_by_id(item.value.data, `${fileId}`);
      }, Promise.resolve());
      message.success(
        `${rmSuccess.length}个文件删除成功! ${filesRes.length - rmSuccess.length}个文件删除失败!`,
      );
      await appendData();
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

    await File.moveSpecificFiles(
      ["/Users/honghaitao/Downloads/Xnip2023-05-31_21-39-11_副本.png"],
      `${selected}`,
    );
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
  }

  useEffect(() => {
    getFileList();
  }, [page, pageSize, sorterColumnKey, sorterOrder]);

  const handleSearchReset = (dataIndex: string) => {
    setTotal(0);
    setPage(1);
    setSearchText({
      ...searchText,
      [dataIndex]: "",
    });
    setSorterColumnKey({});
    getFileList();
  };
  const handleSearch = (dataIndex: string, value: string) => {
    setSearchText({
      ...searchText,
      [dataIndex]: value,
    });
  };

  const getColumnSearchProps = (dataIndex: string, dataIndexName: string) => ({
    filterDropdown: () => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`搜索${dataIndexName}`}
          value={searchText[dataIndex]}
          onChange={(e) => handleSearch(dataIndex, e.target.value)}
          onPressEnter={() => getFileList()}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            size="small"
            onClick={() => getFileList()}
            style={{ width: 90 }}
          >
            搜索
          </Button>
          <Button
            size="small"
            onClick={() => handleSearchReset(dataIndex)}
            style={{ width: 90 }}
          >
            重置
          </Button>
        </Space>
      </div>
    ),
  });

  const columns = [
    {
      title: "文件名称",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      render: (text: string, record: { name?: string; path?: string }) => (
        <Row>
          <Col span={2}>
            <FolderOpenOutlined
              onClick={() =>
                openFileShowInExplorer(
                    `${record.path}`
                )
              }
            />
          </Col>
          <Col span={22}>
            <CopyText
              width="300px"
              ellipsisLine={1}
              color="#333"
              name={record.name || ""}
            ></CopyText>
          </Col>
        </Row>
      ),
      ...getColumnSearchProps("name", "文件名称"),
    },
    {
      title: "文件路径",
      dataIndex: "path",
      key: "path",
      render: (text: string, record: { path?: string }) => (
        <CopyText
          width="300px"
          ellipsisLine={1}
          color="#333"
          name={record.path || ""}
        ></CopyText>
      ),
      ...getColumnSearchProps("path", "文件路径"),
    },
    {
      title: "文件大小",
      dataIndex: "file_size",
      key: "file_size",
      sorter: true,
      render: (text: string, record: { file_size: number }) => (
        <CopyText
          width="150px"
          ellipsisLine={1}
          color="#333"
          name={formatFileSize(record.file_size)}
        ></CopyText>
      ),
    },
    {
      title: "生成时间",
      dataIndex: "create_time",
      key: "create_time",
      sorter: true,
      render: (text: string, record: { create_time: number }) => (
        <CopyText
          width="160px"
          ellipsisLine={1}
          color="#333"
          name={dayjs
            .unix(record.create_time / 1000)
            .format("YYYY-MM-DD HH:mm:ss")}
        ></CopyText>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "creation_time",
      key: "creation_time",
      sorter: true,
      render: (text: string, record: { creation_time: number }) => (
        <CopyText
          width="160px"
          ellipsisLine={1}
          color="#333"
          name={dayjs.unix(record.creation_time).format("YYYY-MM-DD HH:mm:ss")}
        ></CopyText>
      ),
    },
    {
      title: "修改时间",
      dataIndex: "modified_time",
      key: "modified_time",
      sorter: true,
      render: (text: string, record: { modified_time: number }) => (
        <CopyText
          width="160px"
          ellipsisLine={1}
          color="#333"
          name={dayjs.unix(record.modified_time).format("YYYY-MM-DD HH:mm:ss")}
        ></CopyText>
      ),
    },
  ];

  // rowSelection objects indicates the need for row selection
  const rowSelection: any = {
    onChange: (
      selectedRowKeys: React.SetStateAction<string[]>,
      selectedRows: any,
    ) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows,
      );
      setUserSelectedRowKeys(selectedRowKeys);
    },
    onSelect: (record: any, selected: any, selectedRows: any) => {
      console.log("onSelect", record, selected, selectedRows);
    },
    onSelectAll: (selected: any, selectedRows: any, changeRows: any) => {
      console.log("onSelectAll", selected, selectedRows, changeRows);
    },
    selectedRowKeys: userSelectedRowKeys,
  };
  const expandable = {
    defaultExpandAllRows: true,
  };
  const [checkStrictly, setCheckStrictly] = useState(false);

  const onTableChange: any = (
    pagination: {
      current: React.SetStateAction<number>;
      pageSize: React.SetStateAction<number>;
    },
    filters: any,
    sorter: {
      order: string;
      columnKey: any;
    },
    extra: any,
  ) => {
    console.log("pagination", pagination);
    console.log("sorter", sorter);
    if (pagination.current !== page) {
      setTotal(0);
      setPage(pagination.current);
      return;
    }
    if (pagination.pageSize !== pageSize) {
      setTotal(0);
      setPage(1);
      setPageSize(pagination.pageSize);
      return;
    }
    // 筛选排序
    if (
      sorter &&
      JSON.stringify(sorter) !== "{}" &&
      sorter.order !== sorterOrder
    ) {
      setTotal(0);
      setPage(1);
      if (sorter.order) {
        setSorterColumnKey({
          // ...sorterColumnKey,
          [sorter.columnKey]: sorter.order === "ascend" ? "ASC" : "DESC",
        });
      } else {
        const _sorterColumnKey = { ...sorterColumnKey };
        delete _sorterColumnKey[sorter.columnKey];
        setSorterColumnKey({
          ..._sorterColumnKey,
        });
      }
    }
  };

  return (
    <div className={styles.CalculateListPage}>
      <Space>
        <Button type="primary" danger onClick={() => removeFilesByDB()}>
          删除选中的文件
        </Button>
        <Button type="primary" onClick={() => openDialogSave()}>
          统一移动到指定目录
        </Button>
        {/*<Button type="primary">导出</Button>*/}
      </Space>
      <Table
        style={{
          width: "calc(100% - 48px)",
        }}
        columns={columns as any}
        loading={loading}
        pagination={{
          total,
          pageSize,
          current: page,
          showQuickJumper: true,
        }}
        rowSelection={{ ...rowSelection }}
        expandable={{
          defaultExpandAllRows: false,
        }}
        scroll={{
          scrollToFirstRowOnChange: true,
          x: true,
        }}
        key={"id"}
        dataSource={data}
        onChange={onTableChange}
      />
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
  );
}
