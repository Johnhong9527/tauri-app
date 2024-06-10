import Database from "tauri-plugin-sql-api";
import { createSql } from "../createTableSql";

export async function createTable() {

  const db = await Database.load("sqlite:test.db");
  // 创建表
  await db.execute(createSql.select_history);
}