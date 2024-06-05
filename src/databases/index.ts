import { SQLite } from "@/plugins/tauri-plugin-sqlite";
import { createSql } from "./createTableSql";
import { TableName } from "@/types/table";
import {fileFileds} from './addFiledInTable'
export const table_init = async (dbName: string, tableName: TableName) => {
  const dbversion = await SQLite.open(dbName);
  //查询是否有该表
  const rows = await dbversion.queryWithArgs<Array<{ count: number }>>(
    `SELECT count(1) count FROM sqlite_master WHERE type='table' and name = '${tableName}' `
  );
  // try {
  //   const ccdd = await dbversion.queryWithArgs(`SELECT * FROM sqlite_master WHERE type='table' AND name='${tableName}' AND sql LIKE '%iPassageway22%'`);
  //   console.log(121212, ccdd);
  // } catch (err11) {
  //   console.log(1313, err11);
  // }  
  // const aabb = await dbversion.execute(`ALTER TABLE '${tableName}' ADD 'iPassageway' VARCHAR(100) DEFAULT 0`);
  // console.log(111, aabb);
  
  if (!!rows && rows.length > 0 && rows[0].count > 0) {
    // ALTER TABLE 'IPC_FGUID' ADD 'iPassageway' VARCHAR(100) DEFAULT 0;
    // await dbversion.execute(`ALTER TABLE '${tableName}' ADD 'iPassageway' VARCHAR(100) DEFAULT 0`);
    console.log(2323232323);
  } else {
    //创建表
    await dbversion.execute(createSql[tableName]);
  }
};

export const table_add_filed = async () =>  {
  // 依据版本增加

}

export const DB = async (dbName: string) => await SQLite.open(dbName);
