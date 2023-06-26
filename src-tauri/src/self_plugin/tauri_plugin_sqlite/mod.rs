pub(crate) mod sqlite;
//  as tauri_plugin_sqlite;

use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

use self::sqlite::*;

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("rrai-sqlite")
        .invoke_handler(tauri::generate_handler![
            open,
            open_with_flags,
            query_with_args,
            close,
            execute_sql,
            execute_batch,
            execute
        ])
        .setup(|app| {
            // app.manage(SqliteMap::default());
            Ok(())
        })
        .build()
}
