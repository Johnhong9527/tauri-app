```rs
use rusqlite::{Connection, Result};

fn main() -> Result<()> {
    // 打开第一个数据库连接
    let conn1 = Connection::open("database1.db")?;

    // 打开第二个数据库连接
    let conn2 = Connection::open("database2.db")?;

    // 在第一个数据库中创建一个表
    conn1.execute(
        "CREATE TABLE IF NOT EXISTS database1_table (id INTEGER PRIMARY KEY, name TEXT)",
        [],
    )?;

    // 在第二个数据库中创建一个表
    conn2.execute(
        "CREATE TABLE IF NOT EXISTS database2_table (id INTEGER PRIMARY KEY, age INTEGER)",
        [],
    )?;

    // 在第一个数据库中插入一些数据
    conn1.execute("INSERT INTO database1_table (id, name) VALUES (1, 'John')", [])?;

    // 在第二个数据库中插入一些数据
    conn2.execute("INSERT INTO database2_table (id, age) VALUES (1, 25)", [])?;

    // 跨数据库查询
    let query = "SELECT d1.name, d2.age FROM database1.db.database1_table AS d1
                 JOIN database2.db.database2_table AS d2 ON d1.id = d2.id";
    let mut stmt = conn1.prepare(query)?;
    let rows = stmt.query_map([], |row| {
        Ok((row.get::<_, String>(0)?, row.get::<_, i32>(1)?))
    })?;

    for row in rows {
        let (name, age) = row?;
        println!("Name: {}, Age: {}", name, age);
    }

    Ok(())
}
```