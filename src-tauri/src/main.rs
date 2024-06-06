#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

// mod files;
// use crate::files::{file_struct, file_tools};
mod menus;
mod event_loop;
mod self_plugin;
mod common;
mod utils;


use crate::menus::default::use_memu;
use crate::menus::event::m_event;
use crate::event_loop::{greet, file_path, file_sort};
use self_plugin::tauri_plugin_sqlite;
use self_plugin::tauri_plugin_file;


use tauri::{Manager, generate_context};
// use tauri_plugin_sql::{Builder as SqlBuilder, TauriSql};
use tauri::api::path::app_data_dir;

use tauri_plugin_sql::{Migration, MigrationKind};

fn main() {
    let migrations = vec![
        // Define your migrations here
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create_initial_tables",
            sql: "ALTER TABLE 'users' ADD 'addType' TEXT;ALTER TABLE 'users' ADD 'userTime' TEXT;",
            kind: MigrationKind::Up,
        }
        // Migration {
        //     version: 3,
        //     description: "create_initial_tables",
        //     sql: "ALTER TABLE users DROP COLUMN userTime;",
        //     kind: MigrationKind::Up,
        // },
        // Migration {
        //     version: 4,
        //     description: "create_initial_tables",
        //     sql: "ALTER TABLE 'users' ADD 'addType' TEXT;",
        //     kind: MigrationKind::Up,
        // },
        // Migration {
        //     version: 5,
        //     description: "create_initial_tables",
        //     sql: "ALTER TABLE 'users' ADD 'addType2' TEXT;",
        //     kind: MigrationKind::Up,
        // }
    ];
    tauri::Builder::default()
        .plugin(tauri_plugin_sqlite::init())
        .plugin(tauri_plugin_file::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
            .add_migrations("sqlite:test.db", migrations)
        .build()
    )

        .menu(use_memu())
        .on_menu_event(|event| {
            // 处理菜单事件
            m_event(event);
        })
        .invoke_handler(tauri::generate_handler![greet, file_path, file_sort])
        .setup(|app| {
            let app_handle = app.handle();
            let app_dir = app_data_dir(&app_handle.config());

            // 打印应用程序目录路径
            println!("打印应用程序目录路径App directory: {:?}", app_dir);


            // // 设定数据库文件路径
            // let db_path = app_dir.join("test.db");
            // println!("Database file path: {:?}", db_path);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
