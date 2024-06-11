/**
 * 迁移表字段
 *   path?: string;
  checkboxAll?: boolean;
  addType?: string;
  passType?: string;
  checkedSizeValues?: unknown[];
  checkboxSizeAll?: boolean;
  checkedTypeValues?: unknown[];
 */
export const fileFileds = [
    {
        key: 'checkboxAll',
        sql: `ALTER TABLE '{tableName}' ADD 'checkboxAll' INTEGER NOT NULL CHECK (Enabled IN (0, 1))`
    },
    {
        key: 'addType',
        sql: `ALTER TABLE '{tableName}' ADD 'addType' TEXT`
    },
    {
        key: 'passType',
        sql: `ALTER TABLE '{tableName}' ADD 'passType' TEXT`
    },
    {
        key: 'checkedSizeValues',
        sql: `ALTER TABLE '{tableName}' ADD 'checkedSizeValues' TEXT`
    },
    {
        key: 'checkboxSizeAll',
        sql: `ALTER TABLE '{tableName}' ADD 'checkboxSizeAll' INTEGER NOT NULL CHECK (Enabled IN (0, 1))`
    },
    {
        key: 'checkedTypeValues',
        sql: `ALTER TABLE '{tableName}' ADD 'checkedTypeValues' TEXT`
    }
]