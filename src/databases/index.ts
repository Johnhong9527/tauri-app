import { SQLite } from "@/plugins/tauri-plugin-sqlite";
import { createSql } from "./createTableSql";
import { TableName } from "@/types/table";
export const table_init = async (dbName: string, tableName: TableName) => {
  const dbversion = await SQLite.open(dbName);
  //查询是否有该表
  const rows = await dbversion.queryWithArgs<Array<{ count: number }>>(
    `SELECT count(1) count FROM sqlite_master WHERE type='table' and name = '${tableName}' `
  );
  if (!!rows && rows.length > 0 && rows[0].count > 0) {
  } else {
    //创建表
    await dbversion.execute(createSql[tableName]);
  }
};

export const DB = async (dbName: string) => await SQLite.open(dbName);
