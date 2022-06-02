import * as core from "@actions/core";
import axios from "axios";

const api_endpoint = "http://cdm-cdb.aureacentral.com/api/sendRequest";

interface CdmResult {
  message: string;
}

interface CdmResponse {
  isError: boolean;
  result: CdmResult;
}

interface KeyMap<T> {
  [key: string]: T;
}

enum CommandParameters {
  connection = "connection",
  product = "product",
  environment = "environment",
  name = "name",
  details = "details",
  options = "options",
  ownermail = "ownermail",
  ownerskype = "ownerskype",
  force = "force",
  async = "async",
}

interface CdmCommand {
  mandatoryParameters: CommandParameters[];
  optionalParameters?: CommandParameters[];
}

// CDM commands and required parameters
const commands: KeyMap<CdmCommand> = {
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

function getCommandParams(command: string): KeyMap<string> {
  const params: KeyMap<string> = {};

  params["command"] = command;

  const commandParameters = commands[command];

  commandParameters.mandatoryParameters.forEach((parameterName) => {
    const input = core.getInput(parameterName, { required: true });
    params[parameterName] = input;
  });

  commandParameters.optionalParameters?.forEach((parameterName) => {
    const input = core.getInput(parameterName, { required: false });

    if (input === "") {
      return;
    }

    params[parameterName] = input;
  });

  return params;
}

async function run(): Promise<void> {
  try {
    const username = core.getInput("username", { required: true });
    const password = core.getInput("password", { required: true });
    const auth = Buffer.from(`${username}:${password}`).toString("base64");

    const command = core.getInput("command", { required: true });
    const params = getCommandParams(command);

    core.debug(`params = ${params}`);

    const { data } = await axios.get<CdmResponse>(api_endpoint, {
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
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
      return;
    }

    console.log("Unknown error! ", error);
  }
}

run();
