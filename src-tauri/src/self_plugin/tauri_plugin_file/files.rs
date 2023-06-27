use std::fs;
use std::path::{Path, PathBuf};
use tauri::command;
use serde::{Serialize, Serializer};
// use tauri::api::file::IntoInvokeHandler;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error)
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

fn read_files_in_directory(directory: &Path, files: &mut Vec<PathBuf>) -> Result<()> {
    if let Ok(entries) = fs::read_dir(directory) {
        for entry in entries {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.is_file() {
                    files.push(path.clone());
                } else if path.is_dir() {
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
