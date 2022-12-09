// 这里先放基础类型数据，如果不够的话再按模块拆分

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
pub fn file_path(name: &str) -> String {
    format!("{}", name)
}
