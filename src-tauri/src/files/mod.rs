pub(crate) mod files;

use tauri::{
    plugin::{Builder, TauriPlugin}, Runtime,
};

use self::file_sqlite3::*;

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("st-files")
        .invoke_handler(tauri::generate_handler![
          is_create,create,inset
        ])
        .setup(|app| {
            Ok(())
        })
        .build()
}
