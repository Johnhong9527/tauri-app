// import { SQLite } from "@/plugins/tauri-plugin-sqlite";
import { createSql } from "./createTableSql";
import { TableName } from "@/types/table";
import {fileFileds} from './addFiledInTable'
import Database from "tauri-plugin-sql-api";
export const table_init = async (dbName: string, tableName: TableName) => {
  const DB = await Database.load(`sqlite:${dbName}.db`);
  // 创建表
  await DB.execute(createSql.search_files);
  //查询是否有该表
  const rows = await DB.select<Array<{ count: number }>>(
    `SELECT count(1) count FROM sqlite_master WHERE type='table' and name = '${tableName}' `
  );
  if (!!rows && rows.length > 0 && rows[0].count > 0) {
  } else {
    //创建表
    await DB.execute(createSql[tableName]);
  }
};

export const table_add_filed = async (tableName: string, dbName: string, addFileFileds: any[]) =>  {
  const dbversion = await Database.load(`sqlite:${dbName}.db`);
  // 创建表
  await dbversion.execute(createSql.search_files);
  // const dbversion = await SQLite.open(dbName);
  // 依据版本增加
  const addField = await Promise.allSettled(addFileFileds.map(async (item) => {
    try {
      const is_field = await is_field_in_table(item.key, tableName, dbName);
      if(!is_field) {
        return await dbversion.execute(item.sql.replace('{tableName}', tableName))
      }
    } catch (err) {
      console.log('table_add_filed 出现bug::', err);
    }
    return true
  }))
  console.log(4545, addField);
}

export const is_field_in_table = async (fidld: string, tableName: string, dbName: string) => {
  // 不能为空
  if (!fidld || !tableName || !dbName) {
    return Promise.reject('必填数据不能为空');
  }
  try {
    const dbversion = await Database.load(`sqlite:${dbName}.db`);
    // 创建表
    await dbversion.execute(createSql.search_files);
    // const dbversion = await SQLite.open(dbName);
    const fidldList: any[] = await dbversion.select(`SELECT * FROM sqlite_master WHERE type='table' AND name='${tableName}' AND sql LIKE '%${fidld}%'`);
    console.log(5656, fidldList);
    if(fidldList.length) {
      // 字段存在
      return Promise.resolve(true);
    }
    // 字段不存在
    return Promise.resolve(false);
  } catch (error) {
    return Promise.reject('查询失败');
  }
}

export const DB = async (dbName: string) => await await Database.load(`sqlite:${dbName}.db`);
