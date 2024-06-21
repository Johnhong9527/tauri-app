#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod menus;
mod event_loop;
mod self_plugin;
mod common;
mod utils;
mod servics;

use crate::menus::default::use_memu;
use crate::menus::event::m_event;
use crate::event_loop::{greet, file_path, file_sort};
use self_plugin::tauri_plugin_file;
use servics::files_servics;
use tauri::api::path::app_data_dir;

fn main() {
    tauri::Builder::default()
        // .plugin(tauri_plugin_sqlite::init())
        .plugin(tauri_plugin_persisted_scope::init())
        .plugin(tauri_plugin_file::init())
        .plugin(files_servics::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
            .add_migrations("sqlite:files.db", files_servics::migrations::set_files_migrations())
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
