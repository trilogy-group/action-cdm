export class KeyMap extends Map {
    constructor(iterable) {
        super();
        this.caseInsensitiveMap = new Map();
        if (iterable != null) {
            for (const [key, value] of iterable) {
                this.set(key, value);
            }
        }
    }
    set(key, value) {
        super.set(key, value);
        if (typeof key === 'string') {
            key = key.toLowerCase();
        }
        this.caseInsensitiveMap.set(key, value);
        return this;
    }
    delete(key) {
        const ret = super.delete(key);
        if (typeof key === 'string') {
            key = key.toLowerCase();
        }
        this.caseInsensitiveMap.delete(key);
        return ret;
    }
    clear() {
        this.caseInsensitiveMap.clear();
        super.clear();
    }
    getCaseInsensitive(key) {
        if (typeof key === 'string') {
            key = key.toLowerCase();
        }
        const ret = this.caseInsensitiveMap.get(key);
        if (ret === undefined) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            throw Error(`key ${key} does not exist`);
        }
        return ret;
    }
    has(key) {
        if (typeof key === 'string') {
            key = key.toLowerCase();
        }
        // check only case Insensitive Map
        return this.caseInsensitiveMap.has(key);
    }
}
export var CDMCommands;
(function (CDMCommands) {
    CDMCommands["schemaGet"] = "schemaGet";
    CDMCommands["schemaNew"] = "schemaNew";
    CDMCommands["schemaRemove"] = "schemaRemove";
    CDMCommands["schemaUserGrantFullAccess"] = "schemaUserGrantFullAccess";
})(CDMCommands || (CDMCommands = {}));
export var CDMCommandParameters;
(function (CDMCommandParameters) {
    CDMCommandParameters["username"] = "username";
    CDMCommandParameters["password"] = "password";
    CDMCommandParameters["command"] = "command";
    CDMCommandParameters["connection"] = "connection";
    CDMCommandParameters["product"] = "product";
    CDMCommandParameters["environment"] = "environment";
    CDMCommandParameters["engine"] = "engine";
    CDMCommandParameters["schema"] = "schema";
    CDMCommandParameters["name"] = "name";
    CDMCommandParameters["details"] = "details";
    CDMCommandParameters["options"] = "options";
    CDMCommandParameters["ownermail"] = "ownermail";
    CDMCommandParameters["ownerskype"] = "ownerskype";
    CDMCommandParameters["force"] = "force";
    CDMCommandParameters["async"] = "async";
})(CDMCommandParameters || (CDMCommandParameters = {}));
