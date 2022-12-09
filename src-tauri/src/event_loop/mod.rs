/// .
// pub fn greet;
// pub fn greeted;

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
pub fn file_path(name: &str) -> String {
    format!("{}", name)
}
