export type TSortDirection = 'asc' | 'desc'

export type TSortDefaults = {
    defaultField?: string;
    defaultDirection?: TSortDirection;
}

export type TSortResult = Record<string, TSortDirection>