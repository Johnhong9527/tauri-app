use tauri_plugin_sql::{Migration, MigrationKind};

// 这里维护可配置的
pub fn set_files_migrations() -> Vec<Migration> {
    vec![
        // Define your migrations here
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: "CREATE TABLE select_history ( id INTEGER PRIMARY KEY AUTOINCREMENT, time TIMESTAMP, name TEXT CHECK(length(name) <= 255), path TEXT CHECK(length(path) <= 500), checkboxAll INTEGER NOT NULL CHECK (checkboxAll IN (0, 1)), addType TEXT, passType TEXT, checkedSizeValues TEXT, checkboxSizeAll INTEGER NOT NULL CHECK (checkboxSizeAll IN (0, 1)), checkedTypeValues TEXT, UNIQUE (path) );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create_initial_tables",
            sql: "CREATE TABLE search_files (id INTEGER PRIMARY KEY AUTOINCREMENT, time TIMESTAMP, sourceId INTEGER, type TEXT CHECK(length(name) <= 255), name TEXT CHECK(length(name) <= 255), path TEXT CHECK(length(path) <= 500), hash TEXT CHECK(length(path) <= 2000), unique(path));",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "deop filed",
            sql: "ALTER TABLE search_files DROP COLUMN time;",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "add filed to",
            sql: "ALTER TABLE search_files ADD time TIMESTAMP;",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "add filed to",
            sql: "ALTER TABLE search_files RENAME COLUMN time TO create_time;",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "add filed to",
            sql: "ALTER TABLE search_files RENAME COLUMN create_time TO time;",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 7,
            description: "add filed to",
            sql: "ALTER TABLE search_files DROP COLUMN time;",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 8,
            description: "修改字段名称",
            sql: "ALTER TABLE search_files ADD source2Id INTEGER;",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 9,
            description: "迁移source2Id数据",
            sql: "UPDATE search_files SET source2Id = sourceId;",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 10,
            description: "删除sourceId的数据",
            sql: "ALTER TABLE search_files DROP COLUMN sourceId;",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 11,
            description: "恢复sourceId的数据",
            sql: "ALTER TABLE search_files ADD sourceId INTEGER;UPDATE search_files SET sourceId = source2Id;ALTER TABLE search_files DROP COLUMN source2Id;",
            kind: MigrationKind::Up,
        }
    ]
}
// migrations 增加字段, 删除字段、修改字段、无法修改字段类型
// 本地解决方案: 无法修改字段类型可以新建一个表,然后把数据进行迁移,最后把老的字段移除



