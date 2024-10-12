use tauri_plugin_sql::{
    Migration, MigrationKind, 
    // MigrationKind
};

// 这里维护可配置的
pub fn set_bookmarks_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "add filed to",
            sql: "ALTER TABLE bookmarks_history ADD source_text TEXT;",
            kind: MigrationKind::Up,
        },
    ]
}
// migrations 增加字段, 删除字段、修改字段、无法修改字段类型
// 本地解决方案: 无法修改字段类型可以新建一个表,然后把数据进行迁移,最后把老的字段移除



