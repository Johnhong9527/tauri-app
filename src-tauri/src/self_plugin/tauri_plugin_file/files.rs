use hex;
use serde::{Deserialize, Serialize};
use sha2::{Digest as OtherDigest, Sha256}; // 确保导入 `Digest`
use std::fs;
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;
use tauri::command;
extern crate trash;

#[derive(Debug, Deserialize, Serialize)]
pub enum FileSizeCategory {
    Huge,      // 4GB+
    VeryLarge, // 1GB to 4GB-
    Large,     // 128MB to 1GB-
    Medium,    // 1MB to 128MB-
    Small,     // 16KB to 1MB-
    Tiny,      // 1B to 16KB-
    Empty,     // Empty files or directories
}

#[derive(Debug, Deserialize, Serialize)]
pub struct FileInfo {
    pub path: Option<String>,
    pub checkbox_all: Option<bool>,
    pub add_type: Option<String>,
    pub pass_type: Option<String>,
    // pub checked_size_values: Option<Vec<String>>, // 假设值类型为 String，具体类型视情况调整
    pub checked_size_values: Option<Vec<FileSizeCategory>>, // 使用正确的类型
    pub checkbox_size_all: Option<bool>,
    pub checked_type_values: Option<Vec<String>>, // 同上
    pub time: Option<String>,
    pub id: Option<u32>,
    pub progress: Option<f32>,
    pub types: Option<Vec<String>>,
}

#[command]
pub fn get_all_directory(file_info: FileInfo) -> Vec<PathBuf> {
    let mut files = Vec::new();
    if let Some(ref path) = file_info.path {
        println!("Processing directory: {}", path);
        let directory = Path::new(path);
        read_files_in_directory(
            directory,
            &mut files,
            &file_info.checked_size_values,
            &file_info.types,
        );
        files
    } else {
        files
    }
}

#[command]
pub fn get_file_type(file_path: &str) -> Option<&str> {
    let path = Path::new(file_path);
    path.extension().and_then(|ext| ext.to_str())
}

#[command]
pub fn get_file_type_by_path(file_path: String) -> String {
    if let Some(file_type) = get_file_type(&file_path) {
        file_type.to_string()
    } else {
        "Unknown file type".to_string()
    }
}

fn read_files_in_directory(
    dir: &Path,
    files: &mut Vec<PathBuf>,
    filters: &Option<Vec<FileSizeCategory>>,
    types: &Option<Vec<String>>,
) {
    if dir.is_dir() {
        // 尝试读取目录，忽略错误
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries {
                if let Ok(entry) = entry {
                    let path = entry.path();
                    if path.is_dir() {
                        // 递归调用，忽略错误
                        read_files_in_directory(&path, files, filters, types);
                    } else {
                        // 尝试获取文件元数据，忽略错误
                        if let Ok(metadata) = fs::metadata(&path) {
                            let size = metadata.len();
                            let size_matches = filters.is_none()
                                || file_size_matches(size, filters.as_ref().unwrap());
                            let type_matches = types.is_none()
                                || file_type_matches(&path, types.as_ref().unwrap());

                            if size_matches && type_matches {
                                files.push(path);
                            }
                        }
                    }
                }
            }
        }
    }
}

fn file_size_matches(size: u64, categories: &Vec<FileSizeCategory>) -> bool {
    use FileSizeCategory::*;
    categories.iter().any(|category| match category {
        Huge => size >= 4_294_967_296,
        VeryLarge => (1_073_741_824..4_294_967_296).contains(&size),
        Large => (134_217_728..1_073_741_824).contains(&size),
        Medium => (1_048_576..134_217_728).contains(&size),
        Small => (16_384..1_048_576).contains(&size),
        Tiny => (1..16_384).contains(&size),
        Empty => size == 0,
    })
}

fn file_type_matches(path: &Path, types: &Vec<String>) -> bool {
    if let Some(ext) = path.extension() {
        if let Some(ext_str) = ext.to_str() {
            return types.iter().any(|type_str| type_str == ext_str);
        }
    }
    false
}

#[command]
pub fn calculate_file_hash(file_path: String) -> String {
    let file_bytes = fs::read(file_path).expect("Failed to read file");

    // 初始化 SHA256 哈希上下文
    let mut hasher = Sha256::new();
    hasher.update(&file_bytes);

    // 完成哈希计算
    let result = hasher.finalize();

    // 将结果转换为十六进制字符串
    hex::encode(result)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileInfos {
    file_path: PathBuf,
    file_name: Option<String>,
    file_type: Option<String>,
    file_size: u64,
    modified_time: Option<u64>, // 时间戳形式
    creation_time: Option<u64>,
}

#[command]
pub fn get_file_info(file_path: String) -> FileInfos {
    let path = Path::new(&file_path);

    // 使用 match 来处理可能的错误
    let metadata = match fs::metadata(&path) {
        Ok(meta) => meta,
        Err(_) => {
            return FileInfos {
                // 在这里处理错误，可能是返回默认的 FileInfos
                file_path: path.to_path_buf(),
                file_name: None,
                file_type: None,
                file_size: 0,
                modified_time: None,
                creation_time: None,
            };
        }
    };

    // 获取文件修改时间
    let modified_time = metadata
        .modified()
        .ok()
        .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
        .map(|d| d.as_secs());

    // 获取文件创建时间
    let accessed_time = metadata
        .accessed()
        .ok()
        .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
        .map(|d| d.as_secs());

    // 构造 FileInfo 结构
    FileInfos {
        file_path: path.to_path_buf(),
        file_name: path
            .file_name()
            .and_then(|name| name.to_str())
            .map(|name| name.to_string()),
        file_type: get_file_type(&file_path).map(|t| t.to_string()), // 确保 get_file_type 也不返回 Result 或 Option
        file_size: metadata.len(),
        modified_time,
        creation_time: accessed_time,
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RequestMvFile {
    code: Option<u64>,
    msg: Option<String>,
    data: Option<String>,
}

#[command]
pub fn mv_file_to_trash(file_path: String) -> RequestMvFile {
    let data = file_path.clone();
    if let Err(e) = trash::delete(file_path) {
        RequestMvFile {
            code: Some(500),
            msg: Some(format!("Error moving file to trash: {}", e)),
            data: Some(format!("{}", data)),
        }
    } else {
        println!("File successfully moved to trash.");
        RequestMvFile {
            code: Some(200),
            msg: Some("File successfully moved to trash.".to_string()),
            data: Some(format!("{}", data)),
        }
    }
}

#[derive(Debug, Deserialize, Serialize)]
enum AppError {
    DataDirNotFound,
    Other(String),
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match *self {
            AppError::DataDirNotFound => write!(f, "Application data directory not found"),
            AppError::Other(ref err) => write!(f, "Error: {}", err),
        }
    }
}

#[command]
pub fn get_app_data_dir() -> String {
    std::env::var("MY_APP_DATA_DIR")
    .unwrap_or_else(|_| "Environment variable for app data directory not set".to_string())
}
