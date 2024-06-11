use crate::self_plugin::tauri_plugin_sqlite::sqlite::{execute, execute_batch, query_with_args};
use anyhow::{anyhow, Result};
use serde_json::{json, Value};

// 定义一个异步的数据库版本操作接口
#[async_trait::async_trait]
pub trait DatabaseVersionSql {
    // 获取版本号
    async fn version(&self) -> u32;
    // 执行DDL脚本之前的操作
    async fn before(&self);
    // 获取DDL脚本
    async fn ddl(&self) -> Vec<String>;
    // 执行DDL脚本之后的操作
    async fn after(&self);
}

// 获取数据库版本
pub async fn get_database_version(path: &String) -> Result<u32> {
    // 检查版本表是否存在
    if !check_version_table(path).await? {
        Err(anyhow!("系统错误，没有数据库版本表!"))
    } else {
        // 查询数据库版本
        let versions = query_with_args(
            path.to_string(),
            "SELECT version FROM databases_version WHERE name = :name".to_string(),
            json!({
                ":name": path.clone()
            }),
        ).await?;

        // 如果没有版本记录，返回0
        if versions.len() == 0 {
            Ok(0)
        } else {
            // 获取版本号
            let version = versions.get(0).map_or(0, |row| {
                if let Some(Value::Number(v)) = row.get("version") {
                    let v: u32 = v.as_u64().unwrap().try_into().unwrap();
                    v
                } else {
                    0
                }
            });
            Ok(version)
        }
    }
}

// 设置数据库版本
pub async fn set_database_version(path: &String, version: u32) -> Result<bool> {
    // 检查版本表是否存在
    if !check_version_table(path).await? {
        Err(anyhow!("系统错误，没有数据库版本表!"))
    } else {
        // 更新数据库版本
        execute(
            path.to_string(),
            "INSERT INTO databases_version (name, version) VALUES (:name, :version) 
             ON CONFLICT(name) DO UPDATE SET version = :version".to_string(),
            json!({
                ":name": path.clone(),
                ":version": version
            }),
        ).await?;
        Ok(true)
    }
}

// 合并数据库版本
pub async fn merge_database_version<T>(path: &String, list: Vec<T>) -> Result<bool>
    where
        T: DatabaseVersionSql,
{
    // 获取当前版本
    let version = get_database_version(path).await?;
    tracing::debug!("当前数据库版本:{}", version);

    // 循环执行升级脚本
    for item in list {
        let item_version = item.version().await;

        // 如果新版本大于当前版本，执行升级
        if item_version > version {
            item.before().await;
            let ddls = item.ddl().await;

            // 执行DDL脚本
            for ddl_sql in ddls {
                execute_batch(path.to_string(), ddl_sql).await?;
            }

            item.after().await;
            set_database_version(path, item_version).await?;
        }
    }
    Ok(true)
}

// 普通DDL数据库版本结构体
#[derive(Debug)]
pub struct NormalDdlDatabaseVersionSql {
    version: u32,
    ddl: Vec<String>,
}

impl NormalDdlDatabaseVersionSql {
    // 创建一个新实例
    fn new(version: u32, ddl: Vec<String>) -> Self {
        Self { version, ddl }
    }
}

// 实现 DatabaseVersionSql 接口
#[async_trait::async_trait]
impl DatabaseVersionSql for NormalDdlDatabaseVersionSql {
    async fn version(&self) -> u32 {
        self.version
    }
    async fn before(&self) {
        tracing::debug!("nothing!");
    }
    async fn ddl(&self) -> Vec<String> {
        self.ddl.clone()
    }
    async fn after(&self) {
        tracing::debug!("nothing!");
    }
}

// 检查版本表是否存在
async fn check_version_table(path: &String) -> Result<bool> {
    let sql = String::from(
        "SELECT count(1) count FROM sqlite_master WHERE type='table' and name = :name ",
    );

    let rows = query_with_args(
        path.to_string(),
        sql,
        json!({
            ":name": "databases_version"
        }),
    ).await?;

    // 如果表不存在，创建版本表
    if rows.len() == 0 {
        execute_batch(
            path.to_string(),
            "CREATE TABLE databases_version (name TEXT, version INTEGER, unique(name));"
                .to_string(),
        ).await?;
        Ok(true)
    } else {
        let count = rows.get(0).map_or(0, |row| {
            if let Some(Value::Number(v)) = row.get("count") {
                let v: u32 = v.as_u64().unwrap().try_into().unwrap();
                v
            } else {
                0
            }
        });

        // 如果表不存在，创建版本表
        if count == 0 {
            execute_batch(
                path.to_string(),
                "CREATE TABLE databases_version (name TEXT, version INTEGER, unique(name));"
                    .to_string(),
            ).await?;
        }
        Ok(true)
    }
}