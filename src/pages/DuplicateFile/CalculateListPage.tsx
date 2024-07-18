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
  Table,
} from "antd";
import type { CheckboxProps } from "antd";
import { useEffect, useState } from "react";
import {
  del_file_by_id,
  get_fileInfo_by_id,
  searchDuplicateFile,
  setDuplicateFile,
  getDuplicateFile,
  getDuplicateFiles_v2
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
import VirtualList from 'rc-virtual-list';
import dayjs from 'dayjs'
import { formatFileSize } from '@/utils';

export default function CalculateListPage() {
  const ContainerHeight = 500;
  let { fileId } = useParams();
  const [data, setData] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [tip, setTip] = useState<string>('');
  const [removeList, setRemoveList] = useState<string[]>([]);
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [userSelectedRowKeys, setUserSelectedRowKeys] = useState<string[]>([]);
  const [tableKey, setTableKey] = useState('123456')
  const [sorterOrder, setSorterOrder] = useState('')
  const [sorterColumnKey, setSorterColumnKey] = useState({})
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
    setTip('加载数据中~');
    const sorters = [];
    Object.keys(sorterColumnKey).forEach(key => {
      sorters.push({
        column: key,
        order: sorterColumnKey[key]
      })
    })
    const res = await getDuplicateFiles_v2({
      searchParams: {
        sourceId: `${fileId}`,
        keywords: {},
        sorters: sorters
      },
      page,
      pageSize
    })
    console.log(69696969, sorterColumnKey);
    const newData: any[] = [];
    const allids = []
    setTotal(res.total)
    if(Array.isArray(res.data) && res.data.length) {
      await res.data.reduce(
        async (prevPromise: any, currentFile: any) => {
          const ids = currentFile.ids.split(",");
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
          const children = otherItems
            .map((elm) => {
              if (elm.status === "fulfilled" && !elm.value[1]) {
                allids.push(`${ids[0]}_${elm.value[0].id}`)
                return {
                  id: `${ids[0]}_${elm.value[0].id}`,
                  key: `${ids[0]}_${elm.value[0].id}`,
                  ...elm.value[0]
                };
              }
              return false;
            })
            .filter((elm: any) => elm)
          allids.push(ids[0]);
          newData.push({
            ...currentFile,
            id: ids[0],
            key: ids[0],
            children: children,
            otherItems: children,
          });
          return Promise.resolve(0)
        }
      ), Promise.resolve(0)
      setData(newData);
      setTableKey(`${new Date().getTime()}`);
      setTimeout(() => {
        setLoading(false);
        setTip('');
      }, 300)
    } else {
      setData([]);
      setTableKey(`${new Date().getTime()}`);
      setLoading(false);
      setTip('');
    }
  }
  const appendData = async () => {
    setLoading(true);
    setRemoveList([]);
    setTip('正在统计中');
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
    /*
      count: 2
      hash: "fdd8051fcf884d8cc9a095cd77a58694e13b066aea68dc1fc353767ab0ebfe01"
      ids: "25494,26393"
      sourceId: 6
    */
    if (Array.isArray(searchDuplicateFileRes)) {
      let index = -1
      await searchDuplicateFileRes.reduce(
        async (prevPromise: any, currentFile: any) => {
          // 等待上一个 Promise 完成
          await prevPromise;
          index++
          const ids = currentFile.ids.split(",");
          const firstItem = await get_fileInfo_by_id(ids[0], `${fileId}`);
          try {
            // 写到本地的数据库中
            await setDuplicateFile(`${fileId}`, {
              ...firstItem[0],
              ids: currentFile.ids
            })
          } catch (err) {
            console.log(109, err);
          }
          setTip(`正在统计中: ${Math.floor((index / searchDuplicateFileRes.length) * 100)}% : ${searchDuplicateFileRes.length - index}`);
          return Promise.resolve(0);
        },
        Promise.resolve(0)
      );
      // 执行可分页的接口数据请求
      await getFileList();
    } else {
      setLoading(false)
      setTip('')
    }
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
  }

  useEffect(() => {
    getFileList();
  }, [page, pageSize, sorterColumnKey, sorterOrder])

  const columns: ColumnsType<DataType> = [
    {
      title: '文件名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: { name?: string, path?: string }) => (
        <Row>
          <Col span={2}>
            <FolderOpenOutlined onClick={() => openFileShowInExplorer('/Users/sysadmin/Library/Application Support/com.hht.com/files_3.db')} />
          </Col>
          <Col span={22}>
            {record.name}
          </Col>
        </Row>
      )
    },
    {
      title: '文件路径',
      dataIndex: 'path',
      key: 'path',
      render: (text: string, record: { path?: string }) => (
        <Row>
          
          <CopyText
            width="300px"
            ellipsisLine={1}
            color="#333"
            name={record.path || ""}
          ></CopyText>
        </Row>
        ),
    },
    {
      title: '文件大小',
      dataIndex: 'file_size',
      key: 'file_size',
      sorter: true,
      render: (text: string, record: { file_size?: string }) => (
          <CopyText
            width="150px"
            ellipsisLine={1}
            color="#333"
            name={formatFileSize(record.file_size)}
          ></CopyText>
        ),
    },
    {
      title: '修改时间',
      dataIndex: 'modified_time',
      key: 'modified_time',
      render: (text: string, record: { modified_time?: string }) => (
          <CopyText
            width="160px"
            ellipsisLine={1}
            color="#333"
            name={dayjs.unix(record.modified_time).format('YYYY-MM-DD HH:mm:ss') }
          ></CopyText>
        ),
    },
  ];

  // rowSelection objects indicates the need for row selection
  const rowSelection: TableRowSelection<DataType> = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      setUserSelectedRowKeys(selectedRowKeys);
    },
    onSelect: (record, selected, selectedRows) => {
      console.log('onSelect', record, selected, selectedRows);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      console.log('onSelectAll', selected, selectedRows, changeRows);
    },
    selectedRowKeys: userSelectedRowKeys
  };
  const expandable = {
    defaultExpandAllRows: true
  }
  const [checkStrictly, setCheckStrictly] = useState(false);

  function onTableChange(pagination,filters, sorter,extra) {
    console.log('pagination', pagination);
    console.log('sorter', sorter);
    if(pagination.current !== page) {
      setTotal(0);
      setPage(pagination.current);
      return
    }
    if(pagination.pageSize !== pageSize) {
      setTotal(0);
      setPage(1);
      setPageSize(pagination.pageSize);
      return
    }
    // 筛选排序
    if (sorter && JSON.stringify(sorter) !== {} && sorter.order !== sorterOrder) {
      setTotal(0);
      setPage(1);
      if(sorter.order) {
        setSorterColumnKey({
          ...sorterColumnKey,
          [sorter.columnKey]: sorter.order === 'ascend' ? 'ASC' : 'DESC'
        })
      } else {
        const _sorterColumnKey = {...sorterColumnKey}
        delete _sorterColumnKey[[sorter.columnKey]]
        setSorterColumnKey({
          ..._sorterColumnKey
        })
      }
    }
  }

  return (
    <div className={styles.CalculateListPage}>
      <Space>
        <Button type="primary" danger onClick={() => removeFilesByDB()}>
          删除选中的文件
        </Button>
        <Button type="primary" onClick={() => openDialogSave()}>
          统一移动到指定目录
        </Button>
        <Button type="primary">导出</Button>
      </Space>
      <Table
        columns={columns}
        loading={loading}
        pagination={{
          total,
          pageSize,
          current: page,
          showQuickJumper: true
        }}
        rowSelection={{ ...rowSelection}}
        expandable={{
          defaultExpandAllRows: false
        }}
        dataIndex="id"
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
