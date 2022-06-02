"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const axios_1 = __importDefault(require("axios"));
const api_endpoint = "http://cdm-cdb.aureacentral.com/api/sendRequest";
var CommandParameters;
(function (CommandParameters) {
    CommandParameters["connection"] = "connection";
    CommandParameters["product"] = "product";
    CommandParameters["environment"] = "environment";
    CommandParameters["name"] = "name";
    CommandParameters["details"] = "details";
    CommandParameters["options"] = "options";
    CommandParameters["ownermail"] = "ownermail";
    CommandParameters["ownerskype"] = "ownerskype";
    CommandParameters["force"] = "force";
    CommandParameters["async"] = "async";
})(CommandParameters || (CommandParameters = {}));
// CDM commands and required parameters
const commands = {
    schemaNew: {
        mandatoryParameters: [
            CommandParameters.connection,
            CommandParameters.product,
            CommandParameters.environment,
            CommandParameters.name,
            CommandParameters.details,
            CommandParameters.ownermail,
            CommandParameters.ownerskype,
        ],
        optionalParameters: [
            CommandParameters.options,
            //   CommandParameters.async, // we'll always use sync for now
        ],
    },
    schemaRemove: {
        mandatoryParameters: [
            CommandParameters.connection,
            CommandParameters.product,
            CommandParameters.environment,
            CommandParameters.name,
        ],
        optionalParameters: [
            //   CommandParameters.async, // we'll always use sync for now
            CommandParameters.force,
        ],
    },
};
function getCommandParams(command) {
    var _a;
    const params = {};
    params["command"] = command;
    const commandParameters = commands[command];
    commandParameters.mandatoryParameters.forEach((parameterName) => {
        const input = core.getInput(parameterName, { required: true });
        params[parameterName] = input;
    });
    (_a = commandParameters.optionalParameters) === null || _a === void 0 ? void 0 : _a.forEach((parameterName) => {
        const input = core.getInput(parameterName, { required: false });
        if (input === "") {
            return;
        }
        params[parameterName] = input;
    });
    return params;
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const username = core.getInput("username", { required: true });
            const password = core.getInput("password", { required: true });
            const auth = Buffer.from(`${username}:${password}`).toString("base64");
            const command = core.getInput("command", { required: true });
            const params = getCommandParams(command);
            core.debug(`params = ${params}`);
            const { data } = yield axios_1.default.get(api_endpoint, {
                params: params,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Basic ${auth}`,
                },
            });
            core.debug(`CDM result: ${data}`);
            if (data.isError) {
                core.setFailed(data.result.message);
            }
            throw new Error(`CDM Error! ${data.result.message}`);
        }
        catch (error) {
            if (error instanceof Error) {
                core.setFailed(error.message);
                return;
            }
            console.log("Unknown error! ", error);
        }
    });
}
run();
