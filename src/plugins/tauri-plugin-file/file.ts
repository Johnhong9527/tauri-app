import { invoke } from "@tauri-apps/api/tauri";

import Database from "tauri-plugin-sql-api";
import {
  backFileInfoType,
  fileInfoParamsType
} from "@/types/files";

export class File {
  path: string;

  constructor(path: string) {
    this.path = path;
  }

  // static async getAllList(fileInfo: FileInfoType): Promise<string[]> {
  static async getAllList(fileInfo: fileInfoParamsType): Promise<backFileInfoType[]> {
    return await invoke<backFileInfoType[]>("plugin:st-files|get_all_directory", {
      fileInfo,
    });
  }
  static async getType(path: string): Promise<string> {
    return await invoke<string>("plugin:st-files|get_file_type_by_path", {
      filePath: path,
    });
  }

  static async getHash(path: string): Promise<string> {
    return await invoke<string>("plugin:st-files|calculate_file_hash", {
      filePath: path,
    });
  }

  static async getInfo(path: string): Promise<any> {
    return await invoke<string>("plugin:st-files|get_file_info", {
      filePath: path,
    });
  }

  static async rmFile(path: string): Promise<any> {
    return await invoke<string>("plugin:st-files|mv_file_to_trash", {
      filePath: path,
    });
  }
  static async getAppDataDir(): Promise<string> {
    return await invoke<string>("plugin:st-files|get_app_data_dir");
  }
  static async showFileInExplorer(filePath: string): Promise<string> {
    return await invoke<string>("plugin:st-files|show_file_in_explorer", {
      filePath
    });
  }
  static async moveSpecificFiles(filePaths: string[], destDir: string): Promise<string> {
    return await invoke<string>("plugin:st-files|move_specific_files", {
      filePaths,
      destDir
    });
  }

  // async close(): Promise<boolean> {
  //     return await invoke('plugin:st-sqlite|close', { path: this.path })
  // }

  // async execute(sql: string, values?: Record<string, any>): Promise<boolean> {
  //     return values ? await invoke('plugin:st-sqlite|execute', { path: this.path, sql, args: values }) : await invoke('plugin:st-sqlite|execute_sql', { path: this.path, sql })
  // }

  // async queryWithArgs<T>(sql: string, values?: Record<string, any>): Promise<T> {
  //     return await invoke('plugin:st-sqlite|query_with_args', { path: this.path, sql, args: values ?? {} })
  // }
}

export default File;
