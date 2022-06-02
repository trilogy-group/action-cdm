import * as core from '@actions/core'
import {KeyMap, CDMCommands, CDMCommandParameters} from './types'
import {CdmCommand} from "./cdmCommand";
import {SchemaNewCommand} from "./schemaNewCommand";
import {SchemaGetCommand} from "./schemaGetCommand";
import {SchemaRemoveCommand} from "./schemaRemoveCommand";

// CDM commands map
const commands = new KeyMap<string, CdmCommand>([
  [CDMCommands.schemaGet, new SchemaGetCommand()],
  [CDMCommands.schemaNew, new SchemaNewCommand()],
  [CDMCommands.schemaRemove, new SchemaRemoveCommand()]
])

async function run (): Promise<void> {
  const commandString = core.getInput(CDMCommandParameters.command, { required: true })

  const command = commands.getCaseInsensitive(commandString)
  await command.process()
}

run()
  .then(() => {
    core.info('success')
  })
  .catch(error => {
    if (error instanceof Error) {
      core.setFailed(error)
      return
    }

    console.error('Unknown error', error)
    core.setFailed('failed!')
  })
