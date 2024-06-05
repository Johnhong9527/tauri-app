export interface FileInfoType {
  path?: string;
  checkboxAll?: boolean;
  addType?: string;
  passType?: string;
  checkedSizeValues?: unknown[];
  checkboxSizeAll?: boolean;
  checkedTypeValues?: unknown[];
}

export interface FileInfoEditerType {
  title?: string;
  showModal: boolean;
  onClickOk?: Function;
  onClickCancel?: Function;
  fileInfoSource?: FileInfoType;
}

export type insertSearchFilesPasamsType = {
  id: number;
  sourceId?: number | string | any;
  path: string;
  time: string;
  progress: number;
};

export type historyListType = {
  id?: number | string | any;
  time: number | string | any;
  path: string;
  type: string;
  name: string;
  hash: string;
};
