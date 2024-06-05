export type insertSearchFilesPasamsType = {
    id: number,
    sourceId?: number|string|any,
    path: string,
    time: string,
    progress: number
}

export type historyListType = {
    id?: number|string|any,
    time: number|string|any,
    path: string,
    type: string,
    name: string,
    hash: string,
}