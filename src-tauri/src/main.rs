#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod files;
mod menus;
mod event_loop;
use crate::menus::default::use_memu;
use crate::menus::event::m_event;
use crate::event_loop::{greet, file_path};

fn main() {
    tauri::Builder::default()
        .menu(use_memu())
        .on_menu_event(|event| {
            // 处理菜单事件
            m_event(event);
        })
        .invoke_handler(tauri::generate_handler![greet, file_path])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
