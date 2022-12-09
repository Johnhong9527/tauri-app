use tauri::AboutMetadata;
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};
pub fn use_memu () -> Menu {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let close = CustomMenuItem::new("close".to_string(), "Close");
    // let submenu = Submenu::new("File", Menu::new().add_item(quit).add_item(close));
    let app_name = "System Tools";
    Menu::new()
        // 添加菜单
        .add_submenu(Submenu::new(
            app_name,
            Menu::new()
                .add_native_item(MenuItem::About(
                    app_name.to_string(),
                    AboutMetadata::default(),
                ))
                .add_native_item(MenuItem::Separator)
                .add_native_item(MenuItem::Services)
                .add_native_item(MenuItem::Separator)
                .add_native_item(MenuItem::Hide)
                .add_native_item(MenuItem::HideOthers)
                .add_native_item(MenuItem::ShowAll)
                .add_native_item(MenuItem::Separator)
                .add_native_item(MenuItem::Quit),
        ))
        .add_native_item(MenuItem::Copy)
        .add_item(CustomMenuItem::new("hide", "Hide"))
        .add_submenu(Submenu::new("File", Menu::new().add_item(quit).add_item(close)))
}

