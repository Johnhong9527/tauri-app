export const createSql = {
    select_history: `CREATE TABLE select_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        time TIMESTAMP,
        name TEXT CHECK(length(name) <= 255),
        path TEXT CHECK(length(path) <= 500),
        unique(path),
        checkboxAll INTEGER NOT NULL CHECK (Enabled IN (0, 1)),
        addType TEXT,
        passType TEXT,
        checkedSizeValues TEXT,
        checkboxSizeAll INTEGER NOT NULL CHECK (Enabled IN (0, 1)),
        checkedTypeValues TEXT
    );`,
    search_files: `CREATE TABLE search_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        time TIMESTAMP,
        sourceId INTEGER,
        type TEXT CHECK(length(name) <= 255),
        name TEXT CHECK(length(name) <= 255),
        path TEXT CHECK(length(path) <= 500),
        hash TEXT CHECK(length(path) <= 2000),
        unique(path)
    );`
}