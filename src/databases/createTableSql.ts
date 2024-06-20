export const createSql = {
    select_history: `CREATE TABLE IF NOT EXISTS select_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        time TIMESTAMP,
        name TEXT CHECK(length(name) <= 255),
        path TEXT CHECK(length(path) <= 500),
        checkboxAll INTEGER NOT NULL CHECK (checkboxAll IN (0, 1)),
        addType TEXT,
        passType TEXT,
        checkedSizeValues TEXT,
        checkboxSizeAll INTEGER NOT NULL CHECK (checkboxSizeAll IN (0, 1)),
        checkedTypeValues TEXT,
        files INTEGER,
        UNIQUE (path)
    );`,
    search_files: `CREATE TABLE IF NOT EXISTS search_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        create_time TIMESTAMP,
        creation_time TIMESTAMP,
        modified_time TIMESTAMP,
        file_size INTEGER,
        sourceId INTEGER,
        type TEXT,
        name TEXT,
        path TEXT,
        hash TEXT,
        db_version TEXT,
        UNIQUE (path)
    );`
}