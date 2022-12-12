// 这里先放基础类型数据，如果不够的话再按模块拆分
#[tauri::command(name = "greet")]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command(name = "file_path")]
pub fn file_path(name: &str, parentid: &str) -> String {
    println!("1111111");
    // use std::fs;
    use uuid::Uuid;
    // #[macro_use]
    // extern crate lazy_static;
    extern crate regex;
    use crate::files::file_sqlite3::file_sqlite3::{inset, is_create};
    use crate::files::file_struct::File;
    use std::path::Path;
    use std::time::SystemTime;
    // 生成 UUID
    let uuid = Uuid::new_v4();

    let err = is_create("files");
    println!("2424  {}", err);
    // let parent = "".to_string();
    // let mut parent_id: String = "".to_string();
    // if parentid.len() > 0 {
    //    parent_id = parentid.to_string();
    // }

    let system_time = SystemTime::now();
    let timestamp = system_time
        .duration_since(SystemTime::UNIX_EPOCH)
        .expect("Failed to get timestamp");

    let filepath = Path::new(name);
    // 获取路径的最后一个部分（即用户名）
    let filename: String = filepath.file_name().unwrap().to_str().unwrap().to_string();
    println!("38383838383 {}, {}", filename, parentid);
    let file = File {
        name: filename.to_string(),
        path: name.to_string(),
        history_path: name.to_string(),
        uuid: uuid.to_string(),
        parent_id: parentid.to_string(),
        create_time: timestamp,
        update_time: timestamp,
        file_type: name.to_string(),
        user: name.to_string(),
        rule: name.to_string(),
    };
    inset(file);

    // 获取当前目录中的文件和目录
    // let entries = fs::read_dir(name).unwrap();
    // for entry in entries {
    //     // 获取目录的详细信息
    //     let dir = entry.unwrap();
    //      // 判断是否为目录
    //     if dir.file_type().unwrap().is_dir() {
    //         // 输出目录的名称
    //         // println!("{} is a directory", dir.file_name().to_string_lossy());
    //         // 如果是目录的话
    //         let path = format!("{}/{}", name, dir.file_name().to_string_lossy());
    //         file_path(&path);
    //     } else {
    //         // 输出目录的名称
    //         println!("{}", dir.file_name().to_string_lossy());
    //     }

    // }

    let res = format!("{}", name);
    // // println!("Message from Rust: {}", res);
    res
    // "files"
}

use sha2::{Digest, Sha256};
use std::{fs, io};

#[derive(Debug)]
struct UseHashInfoStruct {
    path: String,
    processed: String,
    hash: String,
}

fn get_file_hase(path: &str) -> UseHashInfoStruct {
    let file_path = path;
    let mut file = fs::File::open(&path).unwrap();
    let mut hasher = Sha256::new();
    let n = io::copy(&mut file, &mut hasher).unwrap();
    let hash = hasher.finalize();
    let hash_str = format!("{:x}", hash);
    // println!("Path: {}", path);
    // println!("Bytes processed: {}", n);
    // println!("Hash value: {}", hash_str);
    let info = UseHashInfoStruct {
        path: file_path.to_string(),
        processed: format!("{:x}", n),
        hash: hash_str,
    };
    info
}

#[tauri::command(name = "file_sort")]
pub fn file_sort(path: &str) -> String {
    let hash_info = get_file_hase(&path);
    println!("{:?}", hash_info.path);
    format!("{{ 'path': {},'processed': {},'hash': {} }}`", hash_info.path, hash_info.processed, hash_info.hash)
}
