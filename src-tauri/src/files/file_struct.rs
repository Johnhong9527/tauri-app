// pub mod FileStruct {
//     pub struct Site {
//         pub domain: String,
//         pub nation: String,
//     }
// }

use std::time::Duration;

#[derive(Debug)]
pub struct Site {
    pub domain: String,
    pub nation: String,
}


// name TEXT, path TEXT, history_path TEXT, uuid TEXT, parent_id TEXT, create_time INTEGER, update_time INTEGER, file_type TEXT, user TEXT, rule TEXT

#[derive(Debug)]
pub struct File {
    pub name: String,
    pub path: String,
    pub history_path: String,
    pub uuid: String,
    pub parent_id: String,
    pub create_time: Duration,
    pub update_time: Duration,
    pub file_type: String,
    pub user: String,
    pub rule: String,
}
