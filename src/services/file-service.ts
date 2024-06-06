import { table_init } from "@/databases/index";
import { SQLite } from "@/plugins/tauri-plugin-sqlite";
import { FILE_DB_PATH } from "@/config";
import { FileInfoType, historyListType, insertSearchFilesPasamsType } from "@/types/files";

export async function insertSeletedFileHistory(path?: string, fileInfo?: FileInfoType) {
  /*
    addType: ".1231,.kidd"
    checkboxAll: true
    checkboxSizeAll: true
    checkedSizeValues: ["巨大（4GB+）", "特大（1~4GB-）", "大（128MB ~ 1GB-）", "中（1MB ~ 128MB-）", "小（16KB ~ 1MB-）", "微小（1B ~ 16KB-）", "空文件及目录"] (7)
    checkedTypeValues: ["音频", "视频", "文档", "图片", "应用程序", "压缩包", "其他所有带扩展名的类型", "其他所有无扩展名的类型", "指定", "排除"] (10)
    passType: ".1231,.2113"
    path: "/Users/sysadmin/Downloads"
 */
  try {
    await table_init(FILE_DB_PATH, "select_history");
    const DB = await SQLite.open(FILE_DB_PATH);
    await DB.execute(
      `INSERT INTO select_history (time,name,path) VALUES (:time,:name,:path)`,
      {
        ":time": new Date().getTime(),
        ":name": path,
        ":path": path,
      }
    );
    return false;
  } catch (err) {
    if (err && `${err}`.indexOf("UNIQUE constraint failed") > -1) {
      return "当前路径重复";
    }
    return err;
  }
}
export async function get_info_by_path(path: string):Promise<[{id: number}|boolean, string]>{
  try {
    await table_init(FILE_DB_PATH, "select_history");
    const DB = await SQLite.open(FILE_DB_PATH);
    const res = await DB.queryWithArgs<Array<{ id: number }>>(
      "SELECT * FROM select_history WHERE path = :path",
      { ":path": path }
    );
    console.log(3434, res);

    if(res.length) {
      return [res[0], ""];
    }
    return [false, "暂无数据"];
  } catch (err) {
    if (err && `${err}`.indexOf("UNIQUE constraint failed") > -1) {
      return [false, "当前路径重复"];
    }
    return [false, `${err}`];
  }
}
// export async function getSource(path: string) {

// }
export async function insertSearchFiles({
  path,
  sourceId,
  // type,
  // name,
  // hash
}: insertSearchFilesPasamsType) {
  try {
    await table_init(FILE_DB_PATH, "search_files");
    const DB = await SQLite.open(FILE_DB_PATH);
    await DB.execute(
      `INSERT INTO search_files (time,sourceId,name,type,path,hash) VALUES (:time,:sourceId,:name,:type,:path,:hash)`,
      {
        ":time": new Date().getTime(),
        ":sourceId": sourceId,
        ":path": path,
        // ":type": type,
        // ":name": name,
        // ":hash": hash,
      }
    );
    return Promise.resolve([true, ""]);
  } catch (err) {
    if (err && `${err}`.indexOf("UNIQUE constraint failed") > -1) {
      return Promise.resolve([false, "当前路径重复"]);
    }
    return Promise.resolve([false, err]);
  }
}

export async function get_all_history(): Promise<historyListType[]>{
  await table_init(FILE_DB_PATH, "select_history");
  const DB = await SQLite.open(FILE_DB_PATH);
  return await DB.queryWithArgs<Array<historyListType>>(
    "SELECT * FROM select_history"
  );
}

export async function get_list_by_sourceid(sourceId: number):Promise<[insertSearchFilesPasamsType[]|false, string]>{
  try {
    await table_init(FILE_DB_PATH, "select_history");
    const DB = await SQLite.open(FILE_DB_PATH);
    const res = await DB.queryWithArgs<Array<insertSearchFilesPasamsType>>(
      "SELECT * FROM search_files WHERE sourceId = :sourceId",
      { ":sourceId": sourceId }
    );
    console.log(969696, sourceId);

    /* const res = await DB.queryWithArgs<Array<insertSearchFilesPasamsType>>(
      "SELECT * FROM search_files WHERE sourceId = :sourceId GROUP BY hash HAVING COUNT(*) > 1",
      { ":sourceId": sourceid }
    ); */
    console.log(3434, res);

    if(res.length) {
      return [res, ""];
    }
    return [false, "暂无数据"];
  } catch (err) {
    if (err && `${err}`.indexOf("UNIQUE constraint failed") > -1) {
      return [false, "当前路径重复"];
    }
    return [false, `${err}`];
  }
}