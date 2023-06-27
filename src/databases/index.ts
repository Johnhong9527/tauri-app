import { SQLite } from '@/plugins/tauri-plugin-sqlite';

export const getVersion = async (dbName: string): Promise<number> => {
    const dbversion = await SQLite.open(dbName);

    //查询是否有该表
    const rows = await dbversion.queryWithArgs<Array<{ count: number }>>("SELECT count(1) count FROM sqlite_master WHERE type='table' and name = 'select_history' ");

    console.log(rows);
    if (!!rows && rows.length > 0 && rows[0].count > 0) {

    } else {
        //创建表
        await dbversion.execute(`CREATE TABLE select_history (name TEXT, version INTEGER, unique(name));`)
    }

    //查询
    const versions = await dbversion.queryWithArgs<Array<{ version: number }>>("SELECT version FROM databases_version WHERE name = :name", { ':name': dbName });

    if (!!versions && versions.length > 0) {
        return versions[0].version;
    }

    return 0;
}