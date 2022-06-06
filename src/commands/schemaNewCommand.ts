import { CdmCommand } from './cdmCommand'
import { SchemaGetCommand } from './schemaGetCommand'
import * as core from '@actions/core'
import {
  CDMCommandParameters,
  CDMCommands,
  CdmDatabaseInfo,
  CdmResponse,
  CdmResultMessage,
  KeyMap
} from './types'

export class SchemaNewCommand extends CdmCommand {
  command: string

  constructor () {
    super()
    this.command = CDMCommands.schemaNew
    this.mandatoryParameters = [
      CDMCommandParameters.connection,
      CDMCommandParameters.product,
      CDMCommandParameters.environment,
      CDMCommandParameters.name,
      CDMCommandParameters.details,
      CDMCommandParameters.ownermail,
      CDMCommandParameters.ownerskype
    ]
    this.optionalParameters = [
      CDMCommandParameters.options
      //   CDMCommandParameters.async, // we'll always use sync for now
    ]
  }

  async process (): Promise<void> {
    // check whether a database already existed
    const params = this.getCommandParams()
    const databaseName = params.get(CDMCommandParameters.name)

    if (databaseName === undefined || databaseName === '') {
      throw new Error('\'name\' input is missing or empty')
    }

    core.info(`Checking for database existence: ${databaseName}`)
    const schemaGetCommand = new SchemaGetCommand()
    const schemaGetParams = new KeyMap([
      [CDMCommandParameters.connection, params.getCaseInsensitive(CDMCommandParameters.connection)],
      [CDMCommandParameters.product, params.getCaseInsensitive(CDMCommandParameters.product)],
      [CDMCommandParameters.environment, params.getCaseInsensitive(CDMCommandParameters.environment)],
      [CDMCommandParameters.name, params.getCaseInsensitive(CDMCommandParameters.name)],
      [CDMCommandParameters.async, 'false']
    ])

    let cdmResult: CdmResponse|undefined
    try {
      cdmResult = await schemaGetCommand.getCdmResult(schemaGetParams)

      const databaseInfos = (cdmResult.result as CdmDatabaseInfo[])

      if (databaseInfos === undefined) {
        core.info('schemaGet did not return results.')
      } else if (databaseInfos.length > 0) {
        core.warning(`There is already database(s) named as ${params.getCaseInsensitive(CDMCommandParameters.name)}. Here is the database details:\n${JSON.stringify(databaseInfos, null, 2)}`)
        return
      }

      core.info(`No database found with name ${params.getCaseInsensitive(CDMCommandParameters.name)}`)
    } catch (error) {
      if (cdmResult === undefined) {
        console.error(error)

        let message = ''
        if (error instanceof Error) {
          message = error.message
        }
        throw new Error(`Unknown error while checking for database existence. ${message}`)
      }

      let message: string

      if (cdmResult.message !== undefined) {
        message = cdmResult.message
      } else if (cdmResult.result !== undefined && (cdmResult.result as CdmResultMessage).message !== undefined) {
        message = (cdmResult.result as CdmResultMessage).message
      } else {
        message = JSON.stringify(cdmResult)
      }

      throw new Error(`schemaGet error ${message}`)
    }

    core.info(`Creating database: ${params.getCaseInsensitive(CDMCommandParameters.name)}`)
    await this.getCdmResult()
  }
}
