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
        UNIQUE (path)
    );`,
    search_files: `CREATE TABLE IF NOT EXISTS search_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        time TIMESTAMP,
        sourceId INTEGER,
        type TEXT CHECK(length(name) <= 255),
        name TEXT,
        path TEXT,
        hash TEXT,
        db_version TEXT,
        UNIQUE (path)
    );`
}