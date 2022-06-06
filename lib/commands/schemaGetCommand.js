import { CdmCommand } from "./cdmCommand";
import { CDMCommandParameters, CDMCommands } from "./types";
export class SchemaGetCommand extends CdmCommand {
    constructor() {
        super();
        this.command = CDMCommands.schemaGet;
        this.mandatoryParameters = [];
        this.optionalParameters = [
            CDMCommandParameters.connection,
            CDMCommandParameters.product,
            CDMCommandParameters.environment,
            CDMCommandParameters.engine,
            //   CDMCommandParameters.async, // we'll always use sync for now
        ];
    }
    async process() {
        await this.getCdmResult();
    }
}
