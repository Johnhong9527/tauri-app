use std::fs;
// use crypto::digest::Digest;
// use crypto::sha2::Sha256;
use ring::digest::{Context, Digest, SHA256};
use serde::Serialize;
use serde::Serializer;
use std::path::Path;
use std::path::PathBuf;
// use tauri::api::path::resolve_path;
use tauri::command;
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

fn read_files_in_directory(directory: &Path, files: &mut Vec<PathBuf>) -> Result<()> {
    if let Ok(entries) = fs::read_dir(directory) {
        for entry in entries {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.is_file()
                    && filter_other_directory(
                        path.display().to_string().as_str(),
                        &[".obsidian", ".DS_Store"],
                    )
                {
                    // 过滤文件
                    // TODO 后续加上需要过滤的文件
                    println!("59{}", path.display());
                    files.push(path.clone());
                } else if path.is_dir()
                    && filter_other_directory(
                        path.display().to_string().as_str(),
                        &["node_modules", ".git", ".obsidian", ".DS_Store"],
                    )
                {
                    // 过滤 目录
                    // println!("{}", path.display());
                    read_files_in_directory(&path, files)?;
                }
            }
        }
    }
    Ok(())
}

#[command]
pub fn get_all_directory(path: String) -> Result<Vec<PathBuf>> {
    let directory = Path::new(&path);
    let mut files = Vec::new();
    read_files_in_directory(directory, &mut files)?;
    Ok(files)
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

#[command]
pub fn calculate_file_hash(file_path: String) -> Result<String> {
    let file_bytes = fs::read(file_path).expect("无法读取文件");
    let mut hasher = Context::new(&SHA256);
    hasher.update(&file_bytes);
    let digest: Digest = hasher.finish();
    let hash = hex::encode(digest.as_ref());
    Ok(hash)
}
