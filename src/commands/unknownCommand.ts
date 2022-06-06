import * as core from '@actions/core'
import { CdmCommand } from './cdmCommand'
import { CDMCommandParameters } from './types'

export class UnknownCommand extends CdmCommand {
  command: string

  constructor (commandName: string) {
    super()

    this.command = commandName
    // await this.getCdmResult()
    const env = process.env
    const ignoredInputs: string[] = [
      CDMCommandParameters.username,
      CDMCommandParameters.password,
      CDMCommandParameters.command
    ]

    // since this command takes inputs dynamically, do not use core.getInput
    // function from github actions/core
    for (const [k, v] of Object.entries(env)) {
      if (!k.toUpperCase().startsWith('INPUT_')) {
        continue
      }
      if (v === undefined || v === '') {
        continue
      }

      const key = k.replace('INPUT_', '').toLowerCase()
      if (ignoredInputs.includes(key)) {
        continue
      }

      console.log('=> ' + key + '="' + v + '"')

      this.optionalParameters.push(key)
    }
  }

  async process (): Promise<void> {
    core.info(`Processing unknown ${this.command} command`)

    await this.getCdmResult()
  }
}
