import { table_init } from "@/databases/index";
// import { SQLite } from "@/plugins/tauri-plugin-sqlite";
import Database from "tauri-plugin-sql-api";
import { FILE_DB_PATH } from "@/config";
import {
  FileInfoType,
  historyListType,
  insertSearchFilesPasamsType,
} from "@/types/files";
import { createSql } from "@/databases/createTableSql";

/**
 * 写入用户选择好的目录和处理规则数据
 * @param path 需要处理的文件夹路径
 * @param fileInfoParams 配置好的文件信息
 * @returns false 表示写入成功
 */
export async function insertSeletedFileHistory(
  path?: string,
  fileInfoParams?: FileInfoType
) {
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
    // await table_init(FILE_DB_PATH, "select_history");
    const DB = await Database.load("sqlite:files.db");
    // 创建表
    await DB.execute(createSql.select_history);
    // const DB = await SQLite.open(FILE_DB_PATH);
    await DB.execute(
      `INSERT INTO select_history (time, name, path, addType, checkboxAll, checkboxSizeAll, checkedSizeValues, checkedTypeValues, passType) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        new Date().getTime(), // 获取当前时间的时间戳
        path, // 假设 path 变量是预定义的
        path, // path 变量用于 name 和 path
        fileInfoParams?.addType || "",
        fileInfoParams?.checkboxAll ? 1 : 0,
        fileInfoParams?.checkboxSizeAll ? 1 : 0,
        fileInfoParams?.checkedSizeValues?.toString() || "",
        fileInfoParams?.checkedTypeValues?.toString() || "",
        fileInfoParams?.passType || "",
      ]
    );
    return false;
  } catch (err) {
    console.log(5454, err);
    if (err && `${err}`.indexOf("UNIQUE constraint failed") > -1) {
      return "当前路径重复";
    }
    return err;
  }
}

export async function updateSelectedFileHistory(
  path?: string,
  fileInfoParams?: FileInfoType
) {
  try {
    const DB = await Database.load("sqlite:files.db");
    // 创建表
    await DB.execute(createSql.select_history);
    const result = await DB.execute(
      `UPDATE select_history 
             SET addType = $1, checkboxAll = $2, checkboxSizeAll = $3, checkedSizeValues = $4, checkedTypeValues = $5, passType = $6 
             WHERE path = $7;`,
      [
        fileInfoParams?.addType || "",
        fileInfoParams?.checkboxAll ? 1 : 0,
        fileInfoParams?.checkboxSizeAll ? 1 : 0,
        fileInfoParams?.checkedSizeValues?.toString() || "",
        fileInfoParams?.checkedTypeValues?.toString() || "",
        fileInfoParams?.passType || "",
        path, // 假设 path 变量是预定义的
      ]
    );
    return false;
  } catch (error) {
    console.log(595959, error);
    if (error && `${error}`.indexOf("UNIQUE constraint failed") > -1) {
      return "当前数据格式异常";
    }
    return error;
  }
}

export async function updateSelectedFileHistoryFiles(
  path: string,
  filesNum: number
) {
  try {
    const DB = await Database.load("sqlite:files.db");
    // 创建表
    await DB.execute(createSql.select_history);
    const result = await DB.execute(
      `UPDATE select_history 
             SET files = $1
             WHERE path = $2;`,
      [
        filesNum,
        path, // 假设 path 变量是预定义的
      ]
    );
    return false;
  } catch (error) {
    console.log(595959, error);
    if (error && `${error}`.indexOf("UNIQUE constraint failed") > -1) {
      return "当前数据格式异常";
    }
    return error;
  }
}

/**
 *
 * @param path 文件的路径
 * @returns FileInfoType
 */
export async function get_info_by_path(
  path: string
): Promise<[FileInfoType | boolean, string]> {
  try {
    // await table_init(FILE_DB_PATH, "select_history");
    // const DB = await SQLite.open(FILE_DB_PATH);
    const DB = await Database.load("sqlite:files.db");
    // 创建表
    await DB.execute(createSql.select_history);
    const res = await DB.select(
      "SELECT * FROM select_history WHERE path = $1",
      [path]
    );
    if (Array.isArray(res)) {
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

/**
 *
 * @param path 文件的路径
 * @returns FileInfoType
 */
export async function get_info_by_id(
  id: number
): Promise<[FileInfoType | boolean, string]> {
  try {
    // await table_init(FILE_DB_PATH, "select_history");
    // const DB = await SQLite.open(FILE_DB_PATH);
    const DB = await Database.load("sqlite:files.db");
    // 创建表
    await DB.execute(createSql.select_history);
    const res = await DB.select("SELECT * FROM select_history WHERE id = $1", [
      id,
    ]);
    if (Array.isArray(res)) {
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
  type,
  name,
  hash,
  creation_time,
  modified_time,
  file_size,
}: insertSearchFilesPasamsType) {
  try {
    const DB = await Database.load(`sqlite:files_${sourceId}.db`);
    // 创建表
    await DB.execute(createSql.search_files);
    await DB.execute(
      `
        INSERT into search_files 
          (create_time, sourceId, name, type, path, hash, creation_time, modified_time, file_size, db_version) 
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
      [
        new Date().getTime(),
        sourceId,
        name,
        type,
        path,
        hash,
        creation_time,
        modified_time,
        file_size,
        "1",
      ]
    );
    return Promise.resolve([true, ""]);
  } catch (err) {
    // console.log(145, err);
    if (err && `${err}`.indexOf("UNIQUE constraint failed") > -1) {
      return Promise.resolve([false, "当前路径重复"]);
    }
    return Promise.resolve([false, err]);
  }
}

/**
 * 获取“select_history”表中的历史记录，并进行分页。
 * 此函数首先计算总记录数，然后根据提供的页码和页面大小参数返回相应的记录。
 *
 * @param page 当前请求的页码，代表用户想要访问的数据页。
 * @param pageSize 每页展示的记录数量，决定了每次查询返回的数据条数。
 * @returns 返回一个对象，其中包含两个属性：
 *          - data: FileInfoType[] - 当前页的记录数据数组。
 *          - total: number - 表中的总记录数，用于前端计算总页数。
 */
export async function get_all_history(
  page?: number,
  pageSize?: number
): Promise<{
  [x: string]: any;
  data: insertSearchFilesPasamsType[];
  total: number;
}> {
  // await table_init(FILE_DB_PATH, "select_history");
  const DB = await Database.load("sqlite:files.db");
  // 创建表
  await DB.execute(createSql.select_history);
  // 查询总记录数
  const totalResult = await DB.select(
    "SELECT COUNT(*) AS total FROM select_history"
  );
  console.log(128, totalResult);
  // [Log] 128 – {lastInsertId: 0, rowsAffected: 0} (file-service.ts, line 51)
  const total = Array.isArray(totalResult) && totalResult[0].total; // 获取总记录数
  // 计算分页偏移量
  const offset = (page || 1 - 1) * (pageSize || 10);

  // 获取当前页的数据
  const data = await DB.select(
    "SELECT * FROM select_history LIMIT ? OFFSET ?",
    [pageSize, offset]
  );
  console.log(138, data, pageSize, offset);
  DB.close();
  return { data: Array.isArray(data) ? data : [], total }; // 返回包含数据和总记录数的对象
}

export async function get_list_by_sourceid(
  sourceId: string
): Promise<[insertSearchFilesPasamsType[] | false, string]> {
  try {
    // await table_init(FILE_DB_PATH, "select_history");
    // const DB = await SQLite.open(FILE_DB_PATH);
    const DB = await Database.load(`sqlite:files_${sourceId}.db`);
    // 创建表
    await DB.execute(createSql.search_files);
    const res = await DB.select(
      "SELECT * FROM search_files WHERE sourceId = $1",
      [sourceId]
    );
    console.log(969696, sourceId);

    /* const res = await DB.queryWithArgs<Array<insertSearchFilesPasamsType>>(
          "SELECT * FROM search_files WHERE sourceId = :sourceId GROUP BY hash HAVING COUNT(*) > 1",
          { ":sourceId": sourceid }
        ); */
    console.log(3434, res);

    if (Array.isArray(res)) {
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

export async function delSelectedFileHistory(path?: string) {
  try {
    const DB = await Database.load("sqlite:files.db");
    const result = await DB.execute(
      `DELETE FROM select_history WHERE path = $1`,
      [
        path, // 假设 path 变量是预定义的
      ]
    );
    console.log(206, result);
    return false;
  } catch (error) {
    console.log(595959, error);
    if (error && `${error}`.indexOf("UNIQUE constraint failed") > -1) {
      return "当前数据格式异常";
    }
    return error;
  }
}

/* 
count: 6, 
                    hash: "3ba7bbfc03e3bed23bf066e2e9a6a5389dd33fd8637bc0220d9e6d642ccf5946", 
                    paths: "/Users/sysadmin/Pictures/test/欧洲4_副本.jpeg,/Users/s…4.jpeg,/Users/sysadmin/Pictures/test/欧洲4_副本5.jpeg", 
                    ids: "17,21,22,26,27,31", 
                    times: "1718613803964,1718613804035,1718613804041,1718613804070,1718613804080,1718613804112"
*/
type DuplicateFileInfo = {
  count: number;
  hash: string;
  paths: string[];
  ids: string[];
};

type SearchResult = [boolean, DuplicateFileInfo[] | string | unknown];

export async function searchDuplicateFile({
  sourceId,
  page = 1,
  pageSize = 1000,
}: {
  sourceId: string;
  page?: number;
  pageSize?: number;
}): Promise<SearchResult> {
  try {
    const DB = await Database.load(`sqlite:files_${sourceId}.db`);
    // 创建表
    await DB.execute(createSql.search_files);
    /* 
    select * from search_files where sourceId = $1 in (select sourceId from search_files group by hash having count(hash) > 1)
 */
    // const res = await DB.select("SELECT * from search_files WHERE sourceId = $1", [sourceId]);
    const res: DuplicateFileInfo[] = await DB.select(
      `SELECT hash,
       sourceId,
       GROUP_CONCAT(id)    AS ids,
       COUNT(*)           AS count
FROM search_files
WHERE sourceId = $1
  AND hash IS NOT NULL  
  AND hash != "''"
  AND hash != ""
GROUP BY hash, sourceId
HAVING COUNT(*) > 1
`,
/* ORDER BY [creation_time] ASC
LIMIT $3 OFFSET ($2 - 1) * $3; */
      [sourceId, page, pageSize]
    );
    return Promise.resolve([true, res]);
  } catch (err) {
    // console.log(145, err);
    if (err && `${err}`.indexOf("UNIQUE constraint failed") > -1) {
      return Promise.resolve([false, "当前路径重复"]);
    }
    return Promise.resolve([false, err]);
  }
}

export default async function get_progress_by_sourceId(
  sourceId: string
): Promise<any> {
  const DB = await Database.load(`sqlite:files_${sourceId}.db`);
  // 创建表
  await DB.execute(createSql.search_files);

  const res: DuplicateFileInfo[] = await DB.select(
    `SELECT 
    COUNT(*) AS total_entries,
    COUNT(CASE WHEN sourceId = $1 THEN 1 ELSE NULL END) AS sourceId_1_count,
    COUNT(CASE WHEN hash IS NULL OR hash = '' THEN 1 ELSE NULL END) AS hash_null_count
FROM search_files;`,
    [sourceId]
  );

  return res;
}

export async function updateFileHsah(
  path?: string,
  hash?: string,
  sourceId?: string
) {
  try {
    const DB = await Database.load(`sqlite:files_${sourceId}.db`);
    // 创建表
    await DB.execute(createSql.search_files);
    const result = await DB.execute(
      `UPDATE search_files 
             SET hash = $1
             WHERE path = $2 and sourceId = $3;`,
      [
        hash,
        path, // 假设 path 变量是预定义的
        sourceId,
      ]
    );
    return false;
  } catch (error) {
    console.log(595959, error);
    if (error && `${error}`.indexOf("UNIQUE constraint failed") > -1) {
      return "当前数据格式异常";
    }
    return error;
  }
}


export async function get_fileInfo_by_id(id: string, sourceId: string) {
  try {
    const DB = await Database.load(`sqlite:files_${sourceId}.db`);
    // 创建表
    await DB.execute(createSql.search_files);
    const res = await DB.select("SELECT * FROM search_files WHERE id = $1 and sourceId = $2", [
      id, sourceId
    ]);
    if (Array.isArray(res)) {
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

export async function del_file_by_id(path: string, sourceId: string) {
  try {
    const DB = await Database.load(`sqlite:files_${sourceId}.db`);
    // 创建表
    await DB.execute(createSql.search_files);
    const result = await DB.execute(
      `DELETE FROM search_files WHERE path = $1 and sourceId = $2`,
      [
        path, // 假设 path 变量是预定义的
        sourceId,
      ]
    );
    console.log(206, result);
    return false;
  } catch (error) {
    console.log(595959, error);
    if (error && `${error}`.indexOf("UNIQUE constraint failed") > -1) {
      return "当前数据格式异常";
    }
    return error;
  }
}
