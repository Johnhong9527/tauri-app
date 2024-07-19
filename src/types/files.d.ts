import { StepProps } from "antd/es/steps";

export interface FileInfoType {
  path?: string;
  checkboxAll?: boolean;
  addType?: string;
  passType?: string;
  checkedSizeValues?: unknown[];
  checkboxSizeAll?: boolean;
  checkedTypeValues?: unknown[];
  files?: unknown[];
  time?: string;
  id?: number;
  progress?: number;
}

export interface FileInfoEditerType {
  title?: string;
  showModal: boolean;
  onClickOk?: Function;
  onClickCancel?: Function;
  fileInfoSource?: FileInfoType;
}

export type insertSearchFilesPasamsType = {
  id?: number;
  sourceId?: number | string | any;
  path: string;
  file_path?: string;
  time?: string;
  // progress: number;
  type: string;
  name: string;
  hash: string;
  file_size: string;
  creation_time?: string;
  modified_time?: string;
  ids?: string;
  idsNum?: number;
};

export type historyListType = {
  id?: number | string | any;
  time: number | string | any;
  path: string;
  type: string;
  name: string;
  hash: string;
};

export type stepsStatusType = {
  scanDir: StepProps.status;
  fileOptions: StepProps.status;
  duplicateFiles: StepProps.status;
  done: StepProps.status;
};

export type backFileInfoType = {
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: string;
  modified_time: string; // 时间戳形式
  creation_time: string;
};

export type fileInfoParamsType = {
  path?: string;
  checked_size_values?: string[];
  types?: any[];
  excluded_file_names?: number;
};
