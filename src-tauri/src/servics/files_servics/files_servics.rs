// use std::fs::File;
// use crate::files::file_struct::File;
use tauri::command;
// use crate::{common::sqlite};
// use tauri::api::file::IntoInvokeHandler;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

// 判断是否新建表
// #[command]
// pub async fn is_create(table_name: &str) -> bool {
//     if table_name.len() < 1 {
//         return false;
//     }
//     let connection = sqlite::open("tauri.db").await.unwrap();
//     // let connection = load("sqlite::files.db").unwrap();
//     let query: String = format!(
//         "SELECT tbl_name FROM sqlite_master WHERE tbl_name = '{}'",
//         table_name
//     );
//     let mut is_table: bool = false;
//     connection
//         .iterate(query, |pairs| {
//             for &(_tpl_name, value) in pairs.iter() {
//                 if value.unwrap() == table_name {
//                     is_table = true
//                 }
//             }
//             true
//         })
//         .unwrap();
//     // is_table
//     if !is_table {
//         return create(table_name);
//     }
//     is_table
// }

// #[command]
// pub async fn create(table_name: &str) -> bool {
//     println!("28");
//     if table_name.len() < 1 {
//         return false;
//     }
//     let connection = sqlite::open("tauri.db").await.unwrap();
//     // CREATE TABLE users (name TEXT, age INTEGER)
//     let query: String = format!("CREATE TABLE '{}' ( name TEXT, path TEXT, history_path TEXT, uuid TEXT, parent_id TEXT, create_time INTEGER, update_time INTEGER, file_type TEXT, user TEXT, rule TEXT );", table_name);
//     // let mut isTable: bool = false;
//     println!("36");
//     connection.execute(query).unwrap();
//     true
// }

// #[command]
// pub async fn inset(file: File) -> bool {
//     // INSERT INTO files (name, path, history_path, uuid, parent_id, create_time, update_time, file_type, user, rule) VALUES ('1', '1', '2', '3', '4', 5, null, null, null, null)
//     let query: String = format!("INSERT INTO files (name, path, history_path, uuid, parent_id, create_time, update_time, file_type, user, rule) VALUES ('{}', '{}', '{}', '{}', '{}', '{:?}', '{:?}', '{}', '{}', '{}')", file.name, file.path, file.history_path, file.uuid, file.parent_id, file.create_time, file.update_time, file.file_type, file.user, file.rule);
//     let connection = sqlite::open("tauri.db").await.unwrap();
//     connection.execute(query).await.unwrap();
//     true
// }

#[command]
pub fn test2(name: &str) -> Result<String, String> {
    println!("36");
    Ok(name.to_string())
}