use tauri::AboutMetadata;
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};
pub fn use_memu () -> Menu {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let close = CustomMenuItem::new("close".to_string(), "Close");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide");

    let app_name = "System Tools";
    let file_submenu = Submenu::new(
        "File",
        Menu::new().add_item(quit).add_item(close),
    );

    let edit_submenu = Submenu::new(
        "Edit",
        Menu::new()
            .add_native_item(MenuItem::Undo)
            .add_native_item(MenuItem::Redo)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Cut)
            .add_native_item(MenuItem::Copy)
            .add_native_item(MenuItem::Paste)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::SelectAll),
    );

    let app_menu = Submenu::new(
        app_name,
        Menu::new()
            .add_native_item(MenuItem::About(
                app_name.to_string(),
                AboutMetadata::default(),
            ))
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Services)
            .add_native_item(MenuItem::Hide)
            .add_native_item(MenuItem::HideOthers)
            .add_native_item(MenuItem::ShowAll)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Quit),
    );

    Menu::new()
        .add_submenu(app_menu)
        .add_submenu(file_submenu)
        .add_submenu(edit_submenu)
        .add_item(hide)
}

