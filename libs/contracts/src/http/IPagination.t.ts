export type TPagination = {
    total?: number;
    page?: number;
    pageSize?: number;
    nextPage?: number;
    previousPage?: number;
}

export interface IPageOptions {
    page: number;
    pageSize?: number;
    skip?: number;
}

export type ParseRequestOptions = {
    allowPageSizeOverride?: boolean
    totalCount: number
}