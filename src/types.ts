
export interface CdmDatabaseInfo {
    name: string
    details?: string|null
    environment: string
    product: string
    connection: string
    engine: string
    options: string|null
    owneremail?: string|null
    ownerskype?: string|null
    pos?: string|null
}

export interface CdmResultMessage {
    message: string
}

export type CdmResult = CdmResultMessage | CdmDatabaseInfo[]

export interface CdmResponse {
    isError: boolean
    token?: string
    message?: string
    result?: CdmResult
}

export class KeyMap<T = string, U = string> extends Map<T, U> {
    private caseInsensitiveMap: Map<T, U>

    constructor(iterable?: Iterable<[T, U]>){
        super();
        this.caseInsensitiveMap = new Map<T, U>()
        if (iterable) {
            for (const [key, value] of iterable) {
                this.set(key, value);
            }
        }
    }

    set(key: T, value: U): this {
        super.set(key, value)

        if (typeof key === 'string') {
            key = key.toLowerCase() as unknown as T;
        }
        this.caseInsensitiveMap.set(key, value)
        return this;
    }

    delete(key: T): boolean {
        const ret = super.delete(key)

        if (typeof key === 'string') {
            key = key.toLowerCase() as unknown as T;
        }
        this.caseInsensitiveMap.delete(key)
        return ret;
    }

    clear(): void {
        this.caseInsensitiveMap.clear();
        super.clear();
    }

    getCaseInsensitive(key: T): U {
        if (typeof key === 'string') {
            key = key.toLowerCase() as unknown as T;
        }
        const ret = this.caseInsensitiveMap.get(key);

        if (ret === undefined) {
            throw Error(`key ${key} does not exist`)
        }

        return ret
    }

    has(key: T): boolean {
        if (typeof key === 'string') {
            key = key.toLowerCase() as unknown as T;
        }

        // check only case Insensitive Map
        return this.caseInsensitiveMap.has(key);
    }
}

export enum CDMCommands {
    schemaGet = 'schemaGet',
    schemaNew = 'schemaNew',
    schemaRemove = 'schemaRemove',
}

export enum CDMCommandParameters {
    command = 'command',
    connection = 'connection',
    product = 'product',
    environment = 'environment',
    engine = "engine",
    name = 'name',
    details = 'details',
    options = 'options',
    ownermail = 'ownermail',
    ownerskype = 'ownerskype',
    force = 'force',
    async = 'async'
}
