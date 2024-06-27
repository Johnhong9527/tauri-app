#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod menus;
mod self_plugin;
mod servics;
mod utils;

use crate::menus::default::use_memu;
use crate::menus::event::m_event;
use self_plugin::tauri_plugin_file;
use servics::files_servics;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_persisted_scope::init())
        .plugin(tauri_plugin_file::init())
        .plugin(files_servics::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(
                    "sqlite:files.db",
                    files_servics::migrations::set_files_migrations(),
                )
                .build(),
        )
        .menu(use_memu())
        .on_menu_event(|event| {
            // 处理菜单事件
            m_event(event);
        })
        // .setup(|app| Ok(()))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
