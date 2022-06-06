import * as core from '@actions/core';
import axios from 'axios';
import { CDMCommandParameters, KeyMap } from './types';
const apiEndpoint = 'http://cdm-cdb.aureacentral.com/api/sendRequest';
export class CdmCommand {
    constructor() {
        this.mandatoryParameters = [];
        this.optionalParameters = [];
    }
    getCommandParams() {
        const params = new KeyMap();
        this.mandatoryParameters.forEach(parameterName => {
            const input = core.getInput(parameterName, { required: true });
            params.set(parameterName, input);
        });
        this.optionalParameters.forEach(parameterName => {
            const input = core.getInput(parameterName, { required: false });
            if (input === '') {
                return;
            }
            params.set(parameterName, input);
        });
        return params;
    }
    async getCdmResult(params = this.getCommandParams()) {
        const username = core.getInput(CDMCommandParameters.username, { required: true });
        const password = core.getInput(CDMCommandParameters.password, { required: true });
        const auth = Buffer.from(`${username}:${password}`).toString('base64');
        params.set(CDMCommandParameters.command, this.command);
        // force sync for now
        params.set(CDMCommandParameters.async, 'false');
        core.info(this.command + ' parameters:\n' + JSON.stringify(Array.from(params.entries())));
        const { data } = await axios.get(apiEndpoint, {
            params: Object.fromEntries(params),
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Basic ${auth}`
            }
        });
        if (data.isError) {
            throw new Error(`CDM returned error: ${JSON.stringify(data, null, 2)}`);
        }
        else {
            core.info(`CDM returned success: ${JSON.stringify(data, null, 2)}`);
        }
        return data;
    }
}
