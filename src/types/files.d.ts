import {StepProps} from "antd/es/steps";

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
  time?: string;
  // progress: number;
  type: string,
  name: string,
  hash: string,
  file_size: string,
  creation_time?: string,
  modified_time?: string,
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
}