use anyhow::{anyhow, Result}; // 引入错误处理库
use rusqlite::{
    types::FromSql,              // 用于将 SQLite 数据类型转换为 Rust 类型
    types::Value as SqliteValue, // SQLite 的值类型
    types::ValueRef::{Blob, Integer, Null, Real, Text}, // SQLite 值引用类型
    Connection,
    Params,
    Row,
    ToSql, // 引入 SQLite 连接、参数、行和 ToSql 类型
};
use serde_json::{Number, Value}; // 引入 JSON 处理库
use std::{collections::HashMap, sync::Mutex}; // 引入 HashMap 和 Mutex

// 查询单个值
pub fn query_one_value<P, V>(connection: &Connection, sql: &str, p: P) -> Result<V>
where
    P: Params,  // 参数类型
    V: FromSql, // 从 SQLite 值转换的类型
{
    // 准备 SQL 语句
    let mut stmt = connection.prepare(sql)?;

    // 执行查询并映射结果
    let result_iter = stmt.query_map(p, |row| Ok(row.get(0)?))?;

    // 遍历查询结果
    for result in result_iter {
        if let Ok(i32_temp) = result {
            // 返回查询到的值
            return Ok(i32_temp);
        }
    }
    Err(anyhow!("")) // 如果没有结果，返回错误
}

// 将 rusqlite 的行转换为 JSON 值
pub fn rusqlite_row_to_value(row: &Row<'_>, cnt: usize) -> Result<Vec<Value>> {
    let mut cols = Vec::<Value>::new(); // 存储列值
    for i in 0..cnt {
        // 获取每一列的值
        let rusqlite_value = row.get_ref_unwrap(i);
        // 将 rusqlite 的值转换为 JSON 值
        let idns_value = match rusqlite_value {
            Null => Value::Null,                                  // 空值
            Integer(i64_v) => Value::Number(Number::from(i64_v)), // 整数
            Real(f64_v) => Value::Number(Number::from_f64(f64_v).map_or(Number::from(0i64), |r| r)), // 浮点数
            Text(str_v) => Value::String(String::from_utf8(str_v.to_vec()).unwrap()), // 文本
            Blob(v) => Value::Null, // 二进制数据（这里处理为 Null）
        };
        cols.push(idns_value); // 将转换后的值添加到列集合中
    }

    return Ok(cols); // 返回列值集合
}

// 将 rusqlite 的行转换为 HashMap
pub fn rusqlite_row_to_map(_row: &Row<'_>, names: &Vec<String>) -> Result<HashMap<String, Value>> {
    let mut row = HashMap::default(); // 创建一个 HashMap 来存储行数据
    for (i, name) in names.iter().enumerate() {
        // 获取每一列的值
        let rusqlite_value = _row.get_ref_unwrap(i);
        // 将 rusqlite 的值转换为 JSON 值
        let v = match rusqlite_value {
            Real(f64_v) => Value::Number(Number::from_f64(f64_v).map_or(Number::from(0i64), |r| r)), // 浮点数
            Integer(i64_v) => Value::Number(Number::from(i64_v)), // 整数
            Text(str_v) => Value::String(String::from_utf8(str_v.to_vec()).unwrap()), // 文本
            Blob(_v) => Value::Null,                              // 二进制数据（这里处理为 Null）
            _ => Value::Null,                                     // 其他类型处理为 Null
        };
        row.insert(name.to_owned(), v); // 将列名和值添加到 HashMap 中
    }
    Ok(row) // 返回 HashMap
}

// 将 JSON 值转换为 rusqlite 的值
pub fn value_to_rusqlite_value(json_value: &Value) -> Result<SqliteValue> {
    return Ok(match json_value {
        Value::Null => SqliteValue::Null, // 空值
        Value::Number(v) => {
            if v.is_f64() {
                SqliteValue::Real(v.as_f64().unwrap() as f64) // 浮点数
            } else if v.is_i64() {
                SqliteValue::Integer(v.as_i64().unwrap()) // 有符号整数
            } else if v.is_u64() {
                SqliteValue::Integer(v.as_u64().unwrap().try_into().unwrap()) // 无符号整数
            } else {
                SqliteValue::Integer(0) // 其他情况默认整数0
            }
        }
        Value::String(string_v) => SqliteValue::Text(string_v.clone()), // 字符串
        _ => SqliteValue::Null,                                         // 其他类型处理为 Null
    });
}
