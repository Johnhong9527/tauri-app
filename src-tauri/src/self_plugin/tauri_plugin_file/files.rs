use async_std::fs as async_std_fs;
use async_std::prelude::*;
use hex;
use serde::{Deserialize, Serialize};
use sha2::{Digest as OtherDigest, Sha256};
use std::ffi::OsStr;
use std::path::{Path, PathBuf};
use std::pin::Pin;
use std::time::UNIX_EPOCH;
use tauri::command;

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
    pub checked_size_values: Option<Vec<FileSizeCategory>>,
    pub checkbox_size_all: Option<bool>,
    pub checked_type_values: Option<Vec<String>>,
    pub time: Option<String>,
    pub id: Option<u32>,
    pub progress: Option<f32>,
    pub types: Option<Vec<String>>,
    pub excluded_file_names: Option<Vec<String>>,
}

#[command]
pub async fn get_all_directory(file_info: FileInfo) -> Vec<FileInfos> {
    let mut files = Vec::new();
    if let Some(ref path) = file_info.path {
        println!("Processing directory: {}", path);
        let directory = Path::new(path);
        read_files_in_directory(
            directory,
            &mut files,
            &file_info.checked_size_values,
            &file_info.types,
            &file_info.excluded_file_names,
        )
        .await;
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

fn read_files_in_directory<'a>(
    dir: &'a Path,
    files: &'a mut Vec<FileInfos>,
    filters: &'a Option<Vec<FileSizeCategory>>,
    types: &'a Option<Vec<String>>,
    excluded_file_names: &'a Option<Vec<String>>,
) -> Pin<Box<dyn Future<Output = ()> + Send + 'a>> {
    Box::pin(async move {
        let metadata = match async_std_fs::metadata(dir).await {
            Ok(metadata) => metadata,
            Err(_) => return,
        };

        if metadata.is_dir() {
            let mut entries = match async_std_fs::read_dir(dir).await {
                Ok(entries) => entries,
                Err(_) => return,
            };

            while let Some(entry) = entries.next().await {
                let entry = match entry {
                    Ok(entry) => entry,
                    Err(_) => continue,
                };

                let path: std::path::PathBuf = entry.path().into();

                if let Some(file_name) = path.file_name().and_then(|name| name.to_str()) {
                    if file_name.starts_with('.') || file_name.starts_with('$') {
                        read_files_in_directory(
                            path.as_path(),
                            files,
                            filters,
                            types,
                            excluded_file_names,
                        )
                        .await;
                        continue;
                    }
                }

                if let Some(excluded_names) = excluded_file_names {
                    if excluded_names.iter().any(|excluded| {
                        path.components()
                            .any(|component| component.as_os_str() == OsStr::new(excluded))
                    }) {
                        continue;
                    }
                }

                let metadata = match async_std_fs::metadata(&path).await {
                    Ok(metadata) => metadata,
                    Err(_) => continue,
                };

                if metadata.is_dir() {
                    read_files_in_directory(
                        path.as_path(),
                        files,
                        filters,
                        types,
                        excluded_file_names,
                    )
                    .await;
                    continue;
                }

                if let Some(file_name) = path.file_name().and_then(|name| name.to_str()) {
                    if let Some(excluded_names) = excluded_file_names {
                        if excluded_names.contains(&String::from(file_name)) {
                            continue;
                        }
                    }
                }

                let size_matches = filters
                    .as_ref()
                    .map_or(true, |f| file_size_matches(metadata.len(), f));
                let type_matches = types.as_ref().map_or(true, |t| file_type_matches(&path, t));
                if size_matches && type_matches {
                    if let Some(path_str) = path.to_str() {
                        let path_info = get_file_info(path_str.to_string()).await;
                        files.push(path_info);
                    } else {
                        continue;
                    }
                }
            }
        }
    })
}

#[command]
pub async fn get_file_info(file_path: String) -> FileInfos {
    let path = Path::new(&file_path);

    let metadata = match async_std_fs::metadata(&path).await {
        Ok(meta) => meta,
        Err(_) => {
            return FileInfos {
                file_path: path.to_path_buf(),
                file_name: None,
                file_type: None,
                file_size: 0,
                modified_time: None,
                creation_time: None,
            };
        }
    };

    let modified_time = metadata
        .modified()
        .ok()
        .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
        .map(|d| d.as_secs());

    let accessed_time = metadata
        .accessed()
        .ok()
        .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
        .map(|d| d.as_secs());

    FileInfos {
        file_path: path.to_path_buf(),
        file_name: path
            .file_name()
            .and_then(|name| name.to_str())
            .map(|name| name.to_string()),
        file_type: get_file_type(&file_path).map(|t| t.to_string()),
        file_size: metadata.len(),
        modified_time,
        creation_time: accessed_time,
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
pub async fn calculate_file_hash(file_path: String) -> String {
    let file_bytes = match async_std_fs::read(file_path).await {
        Ok(bytes) => bytes,
        Err(_) => return "Failed to read file".to_string(),
    };

    let mut hasher = Sha256::new();
    hasher.update(&file_bytes);

    let result = hasher.finalize();
    hex::encode(result)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileInfos {
    file_path: PathBuf,
    file_name: Option<String>,
    file_type: Option<String>,
    file_size: u64,
    modified_time: Option<u64>,
    creation_time: Option<u64>,
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

#[derive(Debug, Serialize, Deserialize)]
pub struct RequestMvFile {
    code: Option<u64>,
    msg: Option<String>,
    data: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MoveFileError {
    error: String,
}

impl std::fmt::Display for MoveFileError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.error)
    }
}

impl std::error::Error for MoveFileError {}

#[command]
pub async fn move_specific_files(
    file_paths: Vec<PathBuf>,
    dest_dir: &str,
) -> Result<RequestMvFile, MoveFileError> {
    let destination = Path::new(dest_dir);
    if !destination.is_dir() {
        return Err(MoveFileError {
            error: "Destination directory does not exist or is not a directory.".to_string(),
        });
    }

    for file_path in file_paths {
        if file_path.is_file() {
            let dest_file_path =
                destination.join(file_path.file_name().unwrap_or_else(|| OsStr::new("")));
            if let Err(e) = async_std_fs::rename(&file_path, &dest_file_path).await {
                return Err(MoveFileError {
                    error: format!("Failed to move file '{}': {}", file_path.display(), e),
                });
            }
        } else {
            return Err(MoveFileError {
                error: format!("Provided path '{}' is not a file.", file_path.display()),
            });
        }
    }

    Ok(RequestMvFile {
        code: Some(200),
        msg: Some("All specified files moved successfully.".to_string()),
        data: Some("All specified files moved successfully.".to_string()),
    })
}

#[command]
pub fn get_app_data_dir() -> String {
    std::env::var("MY_APP_DATA_DIR")
        .unwrap_or_else(|_| "Environment variable for app data directory not set".to_string())
}

#[command]
pub fn show_file_in_explorer(file_path: String) -> RequestMvFile {
    println!("256 {}", file_path);

    #[cfg(target_os = "linux")]
    let path = std::path::Path::new(&file_path);
    #[cfg(target_os = "linux")]
    let parent_dir = match path.parent() {
        Some(dir) => dir.to_str().unwrap_or(""),
        None => {
            return RequestMvFile {
                code: Some(500),
                msg: Some("No parent directory found.".to_string()),
                data: Some("No parent directory found.".to_string()),
            }
        }
    };

    #[cfg(target_os = "windows")]
    let command = std::process::Command::new("explorer")
        .args(&["/select,", &file_path])
        .spawn();

    #[cfg(target_os = "macos")]
    let command = std::process::Command::new("open")
        .args(&["-R", &file_path])
        .spawn();

    #[cfg(target_os = "linux")]
    let command = std::process::Command::new("nautilus")
        .args(&["--browser", "--select", &file_path])
        .or_else(|_| {
            std::process::Command::new("xdg-open")
                .arg(parent_dir)
                .spawn()
        });

    match command {
        Ok(_) => RequestMvFile {
            code: Some(200),
            msg: Some("success".to_string()),
            data: Some("success".to_string()),
        },
        Err(e) => RequestMvFile {
            code: Some(500),
            msg: Some("error".to_string()),
            data: Some(e.to_string()),
        },
    }
}

#[command]
pub fn file_exists(file_path: &str) -> bool {
    Path::new(file_path).exists()
}