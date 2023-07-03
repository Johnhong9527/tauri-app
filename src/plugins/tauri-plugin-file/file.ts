import { invoke } from "@tauri-apps/api/tauri";

export class File {
  path: string;

  constructor(path: string) {
    this.path = path;
  }

  static async getAllList(path: string): Promise<string[]> {
    console.log(11,path);
    return await invoke<string[]>("plugin:st-files|get_all_directory", {
      path,
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
