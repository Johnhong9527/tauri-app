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
    // use crate::files::file_sqlite3::file_sqlite3::{inset, is_create};
    // use crate::files::file_struct::File;
    use std::path::Path;
    use std::time::SystemTime;
    // 生成 UUID
    let uuid = Uuid::new_v4();

    // let err = is_create("files");
    // println!("2424  {}", err);
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
    // let file = File {
    //     name: filename.to_string(),
    //     path: name.to_string(),
    //     history_path: name.to_string(),
    //     uuid: uuid.to_string(),
    //     parent_id: parentid.to_string(),
    //     create_time: timestamp,
    //     update_time: timestamp,
    //     file_type: name.to_string(),
    //     user: name.to_string(),
    //     rule: name.to_string(),
    // };
    // inset(file);

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
use tauri::api::http::FormPart::File;

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



fn read_file(path: &str) -> io::Result<Vec<u8>> {
    use std::fs::File;
    use std::io::{self, Read};
    let mut file = File::open(path)?;
    let mut bytes = Vec::new();
    file.read_to_end(&mut bytes)?;
    Ok(bytes)
}



fn create_file(path: &str, buf: &str) -> io::Result<()> {
    use std::fs::File;
    use std::io::{self, Write};
    let mut file = File::create(path)?;
    // let file_byts = read_file("/Users/sysadmin/Downloads/文件相似度对比_new.pdf")?;
    file.write_all(buf.as_bytes())?;
    Ok(())
}

fn jaccard(str1: &str, str2: &str) -> f64 {
    let set1: std::collections::HashSet<char> = str1.chars().collect();
    let set2: std::collections::HashSet<char> = str2.chars().collect();
    let intersection: std::collections::HashSet<char> = set1.intersection(&set2).map(|c| *c).collect();
    let union: std::collections::HashSet<char> = set1.union(&set2).map(|c| *c).collect();
    println!("134:   {}, {}", intersection.len() as f64 , union.len() as f64);
    return intersection.len() as f64 / union.len() as f64;
}

#[tauri::command(name = "file_sort")]
// pub fn file_sort(path: &str) -> String {
pub fn file_sort(path: &str)  {
    use file_diff::{diff_files};
    use std::io;
    use std::io::prelude::*;
    use std::fs::File;
    use strsim::damerau_levenshtein;

    // use strsim::{jaccard};
    let hash_info = get_file_hase(&path);
    // let mut file1 = match fs::File::open("/Users/sysadmin/Downloads/文件相似度对比_old.pdf") {
    //     Ok(f) => f,
    //     Err(e) => panic!("{}", e),
    // };
    // let mut f1 = File::open("/Users/sysadmin/Downloads/文件相似度对比_old.pdf").unwrap();
    // let mut f2 = File::open("/Users/sysadmin/Downloads/文件相似度对比_new.pdf").unwrap();
    // let mut buffer: [u64; 410] = [400; 410];

    // read up to 10 bytes
    // let n1 = f1.read(&mut buffer[..]).unwrap();
    // let n2 = f2.read(&mut buffer[..]).unwrap();
    let bytes = read_file("/Users/sysadmin/Downloads/文件相似度对比_old.pdf").unwrap();
    let mut bytes_str = format!("{:?}", bytes);
    // create_file("/Users/sysadmin/Downloads/文件相似度对比_old.md", &bytes_str);
    // let bytes2 = read_file("/Users/sysadmin/Downloads/文件相似度对比_new.pdf").unwrap();
    let bytes2 = read_file("/Users/sysadmin/Downloads/截屏2022-11-30 上午10.00.17 2.png").unwrap();
    let mut  bytes2_str = format!("{:?}", bytes2);
    // create_file("/Users/sysadmin/Downloads/文件相似度对比_new.md", &bytes2_str);


    // File.
    // let similarity = jaccard(bytes_str, bytes2_str);
    // println!("Jaccard similarity: {}", damerau_levenshtein(&bytes_str, &bytes2_str));
    println!("Jaccard damerau_levenshtein: {}", jaccard(&bytes_str, &bytes2_str));
    // create_file("/Users/sysadmin/Downloads/文件相似度对比_old.md", &bytes_str);

    // println!("The bytes_文件相似度对比_new: {:?}", bytes);
    // println!("The bytes: {:?}", &buffer[..n2]);


    // let mut buffer = [0; 10];
    // // read up to 10 bytes
    // let n = file1.read(&mut buffer[..]).unwrap();
    // println!("The bytes: {:?}", &buffer[..n]);


    // let mut file2 = match fs::File::open("/Users/sysadmin/Downloads/文件相似度对比_old.pdf") {
    //     Ok(f) => f,
    //     Err(e) => panic!("{}", e),
    // };

    // diff_files(&mut file1, &mut file2);
    // println!("diff_files_     {:?}", diff_files(&mut file1, &mut file2));
    // println!("diff_files_     {:?}", file1.as_inner());
    // println!("{:?}", hash_info);
    // format!("{{ 'path': {},'processed': {},'hash': {} }}`", hash_info.path, hash_info.processed, hash_info.hash)




    /*

    实现
    function jaccard(str1, str2) {
  let set1 = new Set(str1.split(''));
  let set2 = new Set(str2.split(''));
  let intersection = new Set([...set1].filter(x => set2.has(x)));
  let union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

let str1 = "hello";
let str2 = "world";
let similarity = jaccard(str1, str2);
console.log("Jaccard similarity: " + similarity);

*/
}
