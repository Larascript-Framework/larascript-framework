/* eslint-disable no-unused-vars */

export interface IApiResponse<Data = unknown> {
    build(): TApiResponse<Data>;
    setData(data: Data): this;
    getData(): Data;
    getCode(): number;
    getTotalCount(): number | undefined;
    setAdditionalMeta(additionalMeta: Record<string, unknown>): this;
    getAdditionalMeta(): Record<string, unknown>;
}

export type TApiResponse<Data = unknown> = {
    meta: Record<string, unknown>;
    data: Data;
}

