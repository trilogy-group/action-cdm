import { CdmCommand } from './cdmCommand'
import { CDMCommandParameters, CDMCommands } from './types'

export class SchemaUserGrantFullAccess extends CdmCommand {
  command: string = CDMCommands.schemaUserGrantFullAccess

  constructor () {
    super()
    this.command = CDMCommands.schemaUserGrantFullAccess
    this.mandatoryParameters = [
      CDMCommandParameters.connection,
      CDMCommandParameters.schema,
      CDMCommandParameters.name
    ]
    this.optionalParameters = [
      //   CDMCommandParameters.async, // we'll always use sync for now
    ]
  }

  async process (): Promise<void> {
    await this.getCdmResult()
  }
}
