pub mod migration; // 定义数据库迁移模块
mod rusqlite_utils; // 定义一些辅助工具模块

use anyhow::{anyhow, Result}; // 引入错误处理库
use rusqlite::{types::Value as SqliteValue, Connection, OpenFlags, ToSql}; // 引入rusqlite库
use serde_json::Value as JsonValue; // 引入JSON库
use std::collections::HashMap; // 引入HashMap数据结构
use std::sync::{Arc, Mutex, RwLock}; // 引入并发处理库

// 定义一个全局的数据库连接缓存，使用RwLock进行读写锁定
lazy_static::lazy_static! {
    pub(crate) static ref CONNECTIONS: RwLock<HashMap<String, Arc<Mutex<Connection>>>> =
        RwLock::new(HashMap::new());
}

// 打开数据库连接
pub async fn open(path: &String) -> Result<Arc<Mutex<Connection>>> {
    open_with_flags(path, OpenFlags::default()).await
}

// 打开带有标志的数据库连接
pub async fn open_with_flags(path: &String, flags: OpenFlags) -> Result<Arc<Mutex<Connection>>> {
    // 判断是否已经打开
    let exist = CONNECTIONS.read().unwrap().contains_key(path);

    if exist {
        if let Some(arc_conn) = CONNECTIONS.read().unwrap().get(path) {
            return Ok(arc_conn.clone());
        } else {
            Err(anyhow!("获取失败"))
        }
    } else {
        // 构造数据库路径
        let mut storage_path = crate::utils::system_tools_home_path()?.join("sqlite");
        storage_path.push(path.clone());

        let prefix = storage_path.parent().unwrap_or(storage_path.as_path());
        std::fs::create_dir_all(prefix).map_err(|err| anyhow::anyhow!(err))?;

        // 打开数据库连接
        let arc_conn = Arc::new(Mutex::new(Connection::open_with_flags(
            &storage_path,
            flags,
        )?));

        // 将连接缓存
        let mut cache = CONNECTIONS.write().unwrap();
        cache.insert(path.clone(), arc_conn.clone());

        Ok(arc_conn)
    }
}

// 执行SQL语句
pub async fn execute_sql(path: &String, sql: &String) -> Result<usize> {
    let arc_conn = open(path).await?;

    let conn = arc_conn
        .lock()
        .map_err(|err| anyhow!("lock数据库连接失败:{}", err))?;

    let res = conn.execute(sql.as_str(), [])?;
    Ok(res)
}

// 关闭数据库连接
pub async fn close(path: &String) -> Result<bool> {
    let arc_conn = open(path).await?;

    let conn = arc_conn
        .lock()
        .map_err(|err| anyhow!("lock数据库连接失败:{}", err))?;

    drop(conn);
    // 移除缓存
    let mut cache = CONNECTIONS
        .write()
        .map_err(|err| anyhow!("获取锁失败:{}", err))?;

    cache.remove(path);
    Ok(true)
}

// 批量执行SQL语句
pub async fn execute_batch(path: &String, sql: &String) -> Result<bool> {
    let arc_conn = open(path).await?;

    let connection = arc_conn
        .lock()
        .map_err(|err| anyhow!("lock数据库连接失败:{}", err))?;

    let res = connection.execute_batch(sql.as_str())?;
    Ok(true)
}

// 执行带参数的SQL语句
pub async fn execute(path: &String, sql: &String, args: &JsonValue) -> Result<usize> {
    let arc_conn = open(path).await?;

    let conn = arc_conn
        .lock()
        .map_err(|err| anyhow!("lock数据库连接失败:{}", err))?;

    // 将参数转换为SQLite的值
    let mut args_sqlite_values = HashMap::<String, SqliteValue>::new();
    let mut named_args: Vec<(&str, &dyn ToSql)> = vec![];

    if let JsonValue::Object(json_value) = args {
        for (k, v) in json_value {
            args_sqlite_values.insert(k.clone(), rusqlite_utils::value_to_rusqlite_value(v)?);
        }
    }

    for (k, v) in &args_sqlite_values {
        named_args.push((k, v as &dyn ToSql));
    }

    let res = conn.execute(sql.as_str(), &*named_args)?;
    return Ok(res);
}

// 执行带参数的查询语句
pub async fn query_with_args(
    path: &String,
    sql: &String,
    args: &JsonValue,
) -> Result<Vec<HashMap<String, JsonValue>>> {
    let arc_conn = open(path).await?;

    let conn = arc_conn
        .lock()
        .map_err(|err| anyhow!("lock数据库连接失败:{}", err))?;

    let mut stmt = conn.prepare(sql.as_str())?;

    let mut names: Vec<String> = Vec::new();
    for name in stmt.column_names() {
        names.push(name.to_string());
    }

    let mut args_sqlite_values = HashMap::<String, SqliteValue>::new();
    let mut named_args: Vec<(&str, &dyn ToSql)> = vec![];

    if let JsonValue::Object(json_value) = args {
        for (k, v) in json_value {
            args_sqlite_values.insert(k.clone(), rusqlite_utils::value_to_rusqlite_value(v)?);
        }
    }

    for (k, v) in &args_sqlite_values {
        named_args.push((k, v as &dyn ToSql));
    }

    let schema_iter = stmt.query_map(&*named_args, |row| {
        rusqlite_utils::rusqlite_row_to_map(row, &names)
            .map_err(|_e| rusqlite::Error::ExecuteReturnedResults)
    })?;

    let mut result = Vec::<HashMap<String, JsonValue>>::new();

    for table_result in schema_iter {
        if let Ok(row_value) = table_result {
            result.push(row_value);
        }
    }
    Ok(result)
}