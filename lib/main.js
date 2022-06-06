import * as core from '@actions/core';
import { KeyMap, CDMCommands, CDMCommandParameters } from './commands/types';
import { UnknownCommand, SchemaNewCommand, SchemaGetCommand, SchemaRemoveCommand, SchemaUserGrantFullAccess } from './commands';
// CDM commands map
const commands = new KeyMap([
    [CDMCommands.schemaGet, new SchemaGetCommand()],
    [CDMCommands.schemaNew, new SchemaNewCommand()],
    [CDMCommands.schemaRemove, new SchemaRemoveCommand()],
    [CDMCommands.schemaUserGrantFullAccess, new SchemaUserGrantFullAccess()]
]);
async function run() {
    const commandString = core.getInput(CDMCommandParameters.command, { required: true });
    let command;
    try {
        command = commands.getCaseInsensitive(commandString);
    }
    catch (error) {
        command = new UnknownCommand(commandString);
    }
    await command.process();
}
run()
    .then(() => {
    core.info('success');
})
    .catch(error => {
    if (error instanceof Error) {
        core.setFailed(error);
        return;
    }
    console.error('Unknown error', error);
    core.setFailed('failed!');
});
