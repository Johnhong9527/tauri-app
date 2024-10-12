import { table_init } from "@/databases/index";
// import { SQLite } from "@/plugins/tauri-plugin-sqlite";
import Database from "tauri-plugin-sql-api";
import { BOOKMARKS_DB_PATH } from "@/config";
import { createSql } from "@/databases/createTableSql";

export async function addRowData(name: string, type: string, bookmarkHtml: string) {
  try {
    const DB = await Database.load(`sqlite:${BOOKMARKS_DB_PATH}`);
    // 创建表
    await DB.execute(createSql.bookmarks_history);

    /* 查询当前数据 */
    const [totalRow] = await DB.select("SELECT COUNT(*) AS total_entries FROM bookmarks_history  ") as any;
    
    // 执行sql
    const dbinfo = await DB.execute(
      `INSERT INTO bookmarks_history (create_time, last_modified, name, type, source_text) VALUES ($1, $2, $3, $4, $5)`,
      [
        new Date().getTime(), // 获取当前时间的时间戳
        new Date().getTime(), // 获取当前时间的时间戳
        `${name}_${totalRow.total_entries + 1}`,
        type,
        bookmarkHtml
      ],
    );
    return Promise.resolve(dbinfo);
  } catch (err) {
    if (err && `${err}`.indexOf("UNIQUE constraint failed") > -1) {
      return "当前路径重复";
    }
    return err;
  }
}

export async function getAllRow() {
    try {
        const DB = await Database.load(`sqlite:${BOOKMARKS_DB_PATH}`);
        // 创建表
        await DB.execute(createSql.bookmarks_history);
    
        /* 查询当前数据 */
        const totalRow = await DB.select("SELECT * FROM bookmarks_history  ") as any;
        console.log(4343, totalRow);
        return Promise.resolve(totalRow);
      } catch (err) {
        if (err && `${err}`.indexOf("UNIQUE constraint failed") > -1) {
          return "当前路径重复";
        }
        return err;
      }
}

