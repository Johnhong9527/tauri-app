pub(crate) mod files;

use tauri::{
    plugin::{Builder, TauriPlugin},
    Runtime,
};

use self::files::*;

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("st-files")
        .invoke_handler(tauri::generate_handler![
            get_all_directory,
            get_file_type_by_path,
            calculate_file_hash,
            get_file_info,
            mv_file_to_trash,
            get_app_data_dir,
            // open_finder
            show_file_in_explorer,
            move_specific_files,
            // get_file_info_by_path,
            file_exists
        ])
        .setup(|_app| {
            // app.manage(SqliteMap::default());
            Ok(())
        })
        .build()
}
