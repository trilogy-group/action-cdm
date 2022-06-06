import {CdmCommand} from "./cdmCommand";
import {CDMCommandParameters, CDMCommands} from "./types";

export class SchemaRemoveCommand extends CdmCommand {
    command: string = CDMCommands.schemaRemove

    constructor() {
        super()
        this.command = CDMCommands.schemaRemove
        this.mandatoryParameters = [
            CDMCommandParameters.connection,
            CDMCommandParameters.product,
            CDMCommandParameters.environment,
            CDMCommandParameters.name
        ]
        this.optionalParameters = [
            //   CDMCommandParameters.async, // we'll always use sync for now
            CDMCommandParameters.force
        ]
    }

    async process(): Promise<void> {
        await this.getCdmResult()
    }
}