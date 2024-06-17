import {
    delSelectedFileHistory,
    get_all_history, get_info_by_id,
    get_info_by_path,
    insertSeletedFileHistory,
    updateSelectedFileHistory
} from "@/services";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {FileInfoType, stepsStatusType} from "@/types/files";
import {message} from "@tauri-apps/api/dialog";
import styles from './CalculateDuplicateFiles.module.less'
import File from "@/plugins/tauri-plugin-file/file";
import {Button, Col, Row, Steps} from "antd";
import {LoadingOutlined, SolutionOutlined, UserOutlined} from "@ant-design/icons";
import { readDir, BaseDirectory } from '@tauri-apps/api/fs';

export default function CalculateDuplicateFiles() {
    let {fileId} = useParams();
    let navigate = useNavigate();
    const [fileInfo, setFileInfo] = useState<FileInfoType>({})
    const [current, setCurrent] = useState(1);
    const [percent, setPercent] = useState(85);
    const [stepsStatus, setStepsStatus] = useState<stepsStatusType>({
        scanDir: 'finish',
        fileOptions: 'process',
        duplicateFiles: 'wait',
        done: 'wait',
    })
    useEffect(() => {
        pageInit()
    }, []);

    async function pageInit() {
        if (fileId) {
            const [data, errorMsg] = await get_info_by_id(Number.parseInt(fileId));
            if (data && typeof data === 'object') {
                setFileInfo(data)
            } else {
                await message(errorMsg, {title: '查询失败', type: 'error'});
            }
        }
    }

    async function getFiles() {
        if (fileInfo.path) {
            console.log(4545)
            setStepsStatus({
                ...stepsStatus,
                fileOptions: 'process'
            })
            //
            // const files = await File.getAllList(fileInfo.path);
            // console.log(34, files)

            // /Users/honghaitao/Downloads/PDF Expert Installer.app

            // const hash = await File.getHash('/Users/honghaitao/Downloads/PDF Expert Installer.app')
            // console.log(39, hash)
        }
    }
    async function scanDirAll() {
        navigate('/calculate-list/' + fileId)
        // if(fileInfo.path) {
        //     console.log(626262, fileInfo)
        //     const files = await File.getAllList(fileInfo);
        //     console.log(636363, files)
        // }
    }

    return (
        <div className={styles.CalculateDuplicateFiles}>
            <Row justify="start" align="middle">
                <Col>
                    <div className={styles.pageTitle} onClick={() => getFiles()}>路径: {fileInfo.path}</div>
                </Col>
                <Col>
                    <Button type="primary" onClick={() => scanDirAll()}>
                        开始
                    </Button>
                </Col>
            </Row>

            <div className={styles.stepsBox}>
                <Steps
                    current={current} percent={percent}
                    labelPlacement="horizontal"
                    direction="vertical"
                    items={[
                        {
                            title: '扫描目录文件',
                            status: stepsStatus.scanDir,
                        },
                        {
                            title: '计算文件属性',
                            status: stepsStatus.fileOptions,
                        },
                        {
                            title: '分析重复文件',
                            status: stepsStatus.duplicateFiles,
                        },
                        {
                            title: '完成',
                            status: stepsStatus.done,
                        },
                    ]}
                />
            </div>
        </div>
    );
}
