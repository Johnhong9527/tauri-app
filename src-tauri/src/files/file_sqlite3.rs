pub mod file_sqlite3 {
    // 判断是否新建表
    pub fn is_create(table_name: &str) -> bool {
        if table_name.len() < 1 {
            return false;
        }
        let connection = sqlite::open("tauri.db").unwrap();
        let query: String = format!("SELECT tbl_name FROM sqlite_master WHERE tbl_name = '{}'", table_name);
        let mut is_table: bool = false;
        connection
            .iterate(query, |pairs| {
                for &(_tpl_name, value) in pairs.iter() {
                    // println!("27__ {} = {}", tpl_name, value.unwrap());
                    if  value.unwrap() == table_name {
                        is_table = true
                    }
                }
                true
            })
            .unwrap();
        is_table
    }

    pub fn create (table_name: &str) -> bool {
        if table_name.len() < 1 {
            return false;
        }
        let connection = sqlite::open("tauri.db").unwrap();
        // CREATE TABLE users (name TEXT, age INTEGER)
        let query: String = format!("CREATE TABLE '{}' ( name TEXT, path TEXT, history_path TEXT, uuid TEXT, parent_id TEXT, create_time INTEGER, update_time INTEGER, file_type TEXT, user TEXT, rule TEXT );", table_name);
        // let mut isTable: bool = false;
        connection.execute(query).unwrap();
        true
    }
}
