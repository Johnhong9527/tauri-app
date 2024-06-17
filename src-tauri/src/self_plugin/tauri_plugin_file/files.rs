use hex;
use ring::digest::{Context, Digest, SHA256};
use serde::{Deserialize, Serialize, Serializer};
use sha2::{Digest as OtherDigest, Sha256}; // 确保导入 `Digest`
use std::io::{self, Read};
use std::path::{Path, PathBuf};
use std::result::Result as new_Result;
use std::{fs, option};
use tauri::command;
// use std::result::Result;
// use tauri::api::file::IntoInvokeHandler;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

type Result<T> = std::result::Result<T, Error>;

// 提取 /Users/sysadmin/code/rust_project/tauri-app/diff_source/node_modules 中，最后面的数据
fn extract_last_value<'a>(path: &'a str, value: &'a str) -> &'a str {
    if let Some(index) = path.rfind(value) {
        let (content, _) = path.split_at(index);
        content.trim_end_matches('/')
    } else {
        path
    }
}

// 过滤
fn filter_other_directory(path: &str, directories: &[&str]) -> bool {
    // let directories = ["node_modules", ".git", ".obsidian", ".DS_Store"];
    for directory in directories.iter() {
        if extract_last_value(path, directory) != path {
            return false;
        }
    }
    true
}

// fn read_files_in_directory(directory: &Path, files: &mut Vec<PathBuf>) -> Result<()> {
//     if let Ok(entries) = fs::read_dir(directory) {
//         for entry in entries {
//             if let Ok(entry) = entry {
//                 let path = entry.path();
//                 if path.is_file()
//                     && filter_other_directory(
//                         path.display().to_string().as_str(),
//                         &[".obsidian", ".DS_Store"],
//                     )
//                 {
//                     // 过滤文件
//                     // TODO 后续加上需要过滤的文件
//                     println!("59{}", path.display());
//                     files.push(path.clone());
//                 } else if path.is_dir()
//                     && filter_other_directory(
//                         path.display().to_string().as_str(),
//                         &["node_modules", ".git", ".obsidian", ".DS_Store"],
//                     )
//                 {
//                     // 过滤 目录
//                     // println!("{}", path.display());
//                     read_files_in_directory(&path, files)?;
//                 }
//             }
//         }
//     }
//     Ok(())
// }

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
pub fn get_all_directory(file_info: FileInfo) -> Result<Vec<PathBuf>> {
    let mut files = Vec::new();
    if let Some(ref path) = file_info.path {
        println!("Processing directory: {}", path);
        let directory = Path::new(path);
        // 确保 read_files_in_directory 能返回一个 Result<(), Error>
        read_files_in_directory(
            directory,
            &mut files,
            &file_info.checked_size_values,
            &file_info.types,
        )?;
        Ok(files)
    } else {
        // 当没有提供路径时返回错误
        // Err(Error::new(std::io::ErrorKind::NotFound, "No path provided"))
        Ok(files)
    }
}

// #[command]
// fn getFileType(file_path: String) -> Option<String> {
//     let path = Path::new(&file_path);
//     path.extension()
//         .and_then(|ext| ext.to_str())
//         .map(|ext| ext.to_lowercase())
// }

#[command]
pub fn get_file_type(file_path: &str) -> Option<&str> {
    let path = Path::new(file_path);
    path.extension().and_then(|ext| ext.to_str())
}

#[command]
pub fn get_file_type_by_path(file_path: String) -> Result<String> {
    if let Some(file_type) = get_file_type(&file_path) {
        Ok(file_type.to_string())
    } else {
        Ok("Unknown file type".to_string())
    }
}

fn read_files_in_directory(
    dir: &Path,
    files: &mut Vec<PathBuf>,
    filters: &Option<Vec<FileSizeCategory>>,
    types: &Option<Vec<String>>,
) -> Result<()> {
    if dir.is_dir() {
        for entry in fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();
            if path.is_dir() {
                read_files_in_directory(&path, files, filters, types)?;
            } else {
                if let Ok(metadata) = fs::metadata(&path) {
                    let size = metadata.len();
                    let size_matches = filters.is_none() || file_size_matches(size, filters.as_ref().unwrap());
                    let type_matches = types.is_none() || file_type_matches(&path, types.as_ref().unwrap());

                    if size_matches && type_matches {
                        files.push(path);
                    }
                }
            }
        }
    }
    Ok(())
}

/* fn file_size_matches(size: u64, categories: &Vec<FileSizeCategory>) -> bool {
    categories.iter().any(|category| match category {
        FileSizeCategory::Huge => size >= 4294967296,
        FileSizeCategory::VeryLarge => size >= 1073741824 && size < 4294967296,
        FileSizeCategory::Large => size >= 134217728 && size < 1073741823,
        FileSizeCategory::Medium => size >= 1048576 && size < 134217728,
        FileSizeCategory::Small => size >= 16384 && size < 1048576,
        FileSizeCategory::Tiny => size >= 1 && size < 16384,
        FileSizeCategory::Empty => size == 0,
    })
} */
/// Determines if the given size matches any of the specified categories.
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
pub fn calculate_file_hash(file_path: String) -> Result<String> {
    // 使用 `?` 代替 `.expect` 来优雅地处理错误
    let file_bytes = fs::read(file_path)?;

    // 初始化 SHA256 哈希上下文
    let mut hasher = Sha256::new();
    hasher.update(&file_bytes);

    // 完成哈希计算
    let result = hasher.finalize();

    // 将结果转换为十六进制字符串
    let hash = hex::encode(result);
    Ok(hash)
}
