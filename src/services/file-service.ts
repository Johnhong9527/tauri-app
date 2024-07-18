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
  // [Log] 128 – {lastInsertId: 0, rowsAffected: 0} (file-service.ts, line 51)
  const total = Array.isArray(totalResult) && totalResult[0].total; // 获取总记录数
  // 计算分页偏移量
  const offset = (page || 1 - 1) * (pageSize || 10);

  // 获取当前页的数据
  const data = await DB.select(
    "SELECT * FROM select_history LIMIT ? OFFSET ?",
    [pageSize, offset]
  );
  DB.close();
  return { data: Array.isArray(data) ? data : [], total }; // 返回包含数据和总记录数的对象
}

export async function get_list_by_sourceid(
  sourceId: string
): Promise<[insertSearchFilesPasamsType[] | false, string]> {
  try {
    const DB = await Database.load(`sqlite:files_${sourceId}.db`);
    // 创建表
    await DB.execute(createSql.search_files);
    const res = await DB.select(
      "SELECT * FROM search_files WHERE sourceId = $1 AND (hash = '' OR hash IS NULL)",
      [sourceId]
    );

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
    return false;
  } catch (error) {
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
    const res: DuplicateFileInfo[] = await DB.select(
      `SELECT
    s.hash,
    s.sourceId,
    s.id,
    s.creation_time,
    s.modified_time,
    s.file_size,
    s.type,
    s.name,
    s.path,
    GROUP_CONCAT(s.id) AS ids,
    COUNT(*) AS count
FROM search_files s
LEFT JOIN duplicate_files d ON s.hash = d.hash
WHERE s.sourceId = $1
  AND s.hash IS NOT NULL
  AND s.hash != ''
  AND d.hash IS NULL
GROUP BY s.hash, s.sourceId
HAVING COUNT(*) > 1;
`,
      [sourceId, page, pageSize]
    );
    return Promise.resolve([true, res]);
  } catch (err) {
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
    COUNT(CASE WHEN sourceId = $1 THEN 1 ELSE NULL END) AS sourceId_count,
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


export async function get_fileInfo_by_path(path: string, sourceId: string) {
  try {
    const DB = await Database.load(`sqlite:files_${sourceId}.db`);
    // 创建表
    await DB.execute(createSql.search_files);
    const res = await DB.select("SELECT * FROM search_files WHERE path = $1 and sourceId = $2", [
      path, sourceId
    ]);
    if (Array.isArray(res) && res.length) {
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
    await DB.execute(
      `DELETE FROM search_files WHERE path = $1 and sourceId = $2`,
      [
        path, // 假设 path 变量是预定义的
        sourceId,
      ]
    );
    return Promise.resolve(false);
  } catch (error) {
    if (error && `${error}`.indexOf("UNIQUE constraint failed") > -1) {
      return "当前数据格式异常";
    }
    return Promise.resolve(error);
  }
}


/*
* 这个函数是获取到第一个hash为空的数据*/
export async function getFirstEmptyHashBySourceId(sourceId: string) {
  try {
    const DB = await Database.load(`sqlite:files_${sourceId}.db`);
    // 创建表
    await DB.execute(createSql.search_files);
    const res = await DB.select(
        `SELECT * FROM search_files
WHERE hash = '' OR hash IS NULL
LIMIT 1;`,
        [
          sourceId
        ]
    );
    if (Array.isArray(res) && res.length) {
      return Promise.resolve([res[0], ""]);
    }
    return Promise.resolve([false, "暂无数据"]);
  } catch (error) {
    if (error && `${error}`.indexOf("UNIQUE constraint failed") > -1) {
      return "当前数据格式异常";
    }
    return Promise.resolve([false, error]);
  }
}

/**
 * 重复文件数据
 * */
export async function setDuplicateFile(sourceId: string, {
  path,
  type,
  name,
  hash,
  creation_time,
  modified_time,
  file_size,
  ids
}: insertSearchFilesPasamsType) {
  try {
    const DB = await Database.load(`sqlite:files_${sourceId}.db`);
    // 创建表
    await DB.execute(createSql.duplicate_files);
    await DB.execute(
      `
        INSERT into duplicate_files 
          (create_time, sourceId, name, type, path, hash, creation_time, modified_time, file_size, db_version, ids) 
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
        ids
      ]
    );
    return Promise.resolve([true, ""]);
  } catch (error) {
    if (error && `${error}`.indexOf("UNIQUE constraint failed") > -1) {
      return "当前数据格式异常";
    }
    return Promise.resolve([false, error]);
  }
}
/**
 * 按照分页数据请求重复文件列表内容
 * @param page 当前请求的页码，代表用户想要访问的数据页。
 * @param pageSize 每页展示的记录数量，决定了每次查询返回的数据条数。
 * @returns 返回一个对象，其中包含两个属性：
 *          - data: FileInfoType[] - 当前页的记录数据数组。
 *          - total: number - 表中的总记录数，用于前端计算总页数。
 * */
export async function getDuplicateFile(
  {
    page,
    pageSize,
    sourceId
  }: 
  {
    page: number,
    pageSize: number,
    sourceId: string,
    sorterOrder?: string,
    sorterColumnKey?: string
  }
): Promise<{
  [x: string]: any;
  data: insertSearchFilesPasamsType[];
  total: number;
}>  {
  try {
    const DB = await Database.load(`sqlite:files_${sourceId}.db`);
    // 创建表
    await DB.execute(createSql.duplicate_files);
    // 查询总记录数
    const totalResult = await DB.select(
      "SELECT COUNT(*) AS total FROM duplicate_files"
    );
    const total = Array.isArray(totalResult) && totalResult[0].total; // 获取总记录数
    // 计算分页偏移量
    const offset = (page - 1 || 1 - 1) * (pageSize || 10);
    // 获取当前页的数据
    const data = await DB.select(
      "SELECT * FROM duplicate_files LIMIT ? OFFSET ?",
      [pageSize, offset]
    );
    return { data: Array.isArray(data) ? data : [], total }; // 返回包含数据和总记录数的对象
  } catch (error) {
    return { data: [], total: 0 };
  }
}



/*
代码解释：
多字段搜索：通过遍历 searchParams.keywords 对象，为每个指定的字段添加模糊搜索条件。
多字段排序：searchParams.sorters 是一个包含多个排序规则的数组，这些规则被转换为 SQL ORDER BY 子句的一部分。
参数化查询：继续使用参数化查询以防止 SQL 注入，并确保查询的安全性和效率。
这种方式为你的应用提供了更灵活的数据检索方式，使其能够根据多个字段进行搜索和排序。


以下是一个调用上述 `getDuplicateFiles` 函数的示例，该示例演示如何根据多个字段进行搜索和排序。在这个示例中，我们假设你正在查找包含特定关键字的文件名称或路径，并希望结果先按文件大小降序排列，然后按创建时间升序排列。

### 示例调用

假设你正在编写一个前端界面或服务端处理请求的脚本，这里是如何设置参数并调用函数的：

```javascript
async function fetchData() {
  // 设置分页参数
  const page = 1;
  const pageSize = 10;

  // 设置搜索和排序参数
  const searchParams = {
    sourceId: '123', // 假设的 sourceId
    keywords: {
      name: 'report', // 搜索文件名包含 'report'
      path: '2024'    // 搜索路径包含 '2024'
    },
    sorters: [
      { column: 'file_size', order: 'DESC' }, // 按文件大小降序
      { column: 'create_time', order: 'ASC' } // 按创建时间升序
    ]
  };

  // 调用函数获取数据
  try {
    const result = await getDuplicateFiles({ page, pageSize, searchParams });
  } catch (error) {
    console.error('Error fetching duplicate files:', error);
  }
}

// 执行函数
fetchData();
```

### 函数行为说明：

- **分页**：查询第一页数据，每页显示10条记录。
- **搜索条件**：
  - 在 `name` 字段中搜索包含 "report" 的记录。
  - 在 `path` 字段中搜索包含 "2024" 的记录。
- **排序条件**：
  - 首先按 `file_size` 字段降序排列，确保较大的文件先显示。
  - 然后按 `create_time` 字段升序排列，较早创建的文件在相同大小的情况下先显示。

这个示例充分展示了如何在实际应用中使用灵活的查询功能，满足复杂的数据检索需求。

*/
type SearchParam = {
    sourceId: string,
    keywords: { [key: string]: string }, // key: 字段名称, value: 搜索关键词
    sorters: { column: string, order: 'ASC' | 'DESC' }[] // 排序数组
};

interface FetchParams {
  page: number,
  pageSize: number,
  searchParams: SearchParam
}

export async function getDuplicateFiles_v2({
  page,
  pageSize,
  searchParams,
}: FetchParams): Promise<{
  data: FileInfoType[];
  total: number;
}> {
  try {
    const DB = await Database.load(`sqlite:files_${searchParams.sourceId}.db`);
    // 创建表
    await DB.execute(createSql.duplicate_files);
    // 动态构建查询条件
    const conditions = [];
    const params = [];
    // 处理多字段搜索
    Object.keys(searchParams.keywords).forEach(field => {
      if (searchParams.keywords[field]) {
        conditions.push(`${field} LIKE '%${searchParams.keywords[field]}%' `);
      }
    });
    // 计算分页偏移量
    const offset = page * pageSize;
    // 动态构建排序条件
    const orderByClauses = searchParams.sorters.map(sorter => `${sorter.column} ${sorter.order}`).join(', ');
    const orderBy = orderByClauses ? `ORDER BY ${orderByClauses}` : '';
    // 查询总记录数（考虑搜索条件）
    const totalQuery = `SELECT COUNT(*) AS total FROM duplicate_files ${conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''}`;
    const totalResult = await DB.select(totalQuery, params);
    const total = Array.isArray(totalResult) && totalResult[0].total; // 获取总记录数
    // 获取当前页的数据
    const dataQuery = `SELECT * FROM duplicate_files ${conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''} ${orderBy} LIMIT ? OFFSET ?`;
    params.push(pageSize, offset);
    const data = await DB.select(dataQuery, params);
    return { data: Array.isArray(data) ? data : [], total }; // 返回包含数据和总记录数的对象
  } catch (error) {
    console.error('Error fetching data:', error);
    return { data: [], total: 0 };
  }
}




