pub(crate) mod file_sqlite3;

use tauri::{
    plugin::{Builder, TauriPlugin}, Runtime,
};

use self::file_sqlite3::*;

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("ss-files")
        .invoke_handler(tauri::generate_handler![
          is_create,create,inset
        ])
        .setup(|app| {
            Ok(())
        })
        .build()
}
