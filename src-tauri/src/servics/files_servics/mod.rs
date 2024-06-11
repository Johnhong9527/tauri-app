pub(crate) mod files_servics;

pub mod migrations; // 定义数据库迁移模块
use tauri::{
    plugin::{Builder, TauriPlugin}, Runtime,
};


use self::files_servics::*;

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("ss-files")
        .invoke_handler(tauri::generate_handler![
            // is_create,
            // create,
            // inset,
            test2
        ])
        .setup(|_app| {
            Ok(())
        })
        .build()
}
