# CDM interface for database creation per PR.

Use this action to create/delete database schemas per PR to isolate
environments. Currently very few of the commands are supported,
but the checks and commands might be enhanced. Any contribution is
welcome.

To use CDM interface, you might need to have a VPN connectivity, unless
the runner runs in the central VPC (in most of the cases it doesn't).

Apart from that, you might need to request CDM access for your service
account. Refer [this](https://trilogy-eng.atlassian.net/browse/CENTRAL-152829)
ticket.

This github action is tested with education platform, all education platform
projects can use the same service account without any issues.

> If you do not have a service account, first request it
[supportportal-df](https://supportportal-df.atlassian.net/servicedesk/customer/portal/6/group/76/create/620).

> Since this action directly uses the CDM API, you should refer CDM API reference,
[here](https://confluence.devfactory.com/pages/viewpage.action?pageId=337251147).

## Commands

Each command has corresponding mandatory or optional parameters, which must be defined as action inputs.

You can refer to the [CDM API reference](https://confluence.devfactory.com/pages/viewpage.action?pageId=337251147)
for the details of the commands.

#### Common inputs for all commands

Those inputs are required for all the commands. The other inputs are defined under the regarding command bellow.

| Parameter Name | Description                                  |
|----------------|----------------------------------------------|
| `username`     | CDM service username                         |
| `password`     | CDM service password                         |
| `command`      | CDM command. eg. `schemaNew`, `schemaRemove` |

> ⚠️ Even though the `command` you want to use is not implemented here, you can still use it.
> In that case, there won't be any mandatory field check inside this action.
>
> However, in any case, you need to provide `username`, `password` and `command` inputs.

### `schemaNew`

| Parameter Name | Mandatory?                                                             | Description                                            |
|----------------|------------------------------------------------------------------------|--------------------------------------------------------|
| `connection`   | Y                                                                      | Database connection. eg. `postgres06`, `aurora-6`      |
| `product`      | Y                                                                      | Product name. eg. `'Education Platform'`               |
| `environment`  | Y                                                                      | Database environment. eg. `Dev`                        |
| `name`         | Y                                                                      | Database name.                                         |
| `details`      | Y                                                                      | Description. default: `GitHub CDM action`              |
| `options`      | N                                                                      | Those options varies, refer CDM API.                   |
| `ownermail`    | N _(even though it was set as optional in CDM doc, API mandates that)_ | Owner email address. default: `action-cdm@example.com` |
| `ownerskype`   | N _(even though it was set as optional in CDM doc, API mandates that)_ | Owner skype. default: `live:action-cdm`                |
| `async`        | N _(we use this always as `false`)_                                    | Call async or sync                                     |

This command doesn't directly call `schemaNew` command in CDM, rather, first it checks if the schema exists
using `schemaGet` command. If the schema exists, it will skip the command.

### `schemaRemove`

| Parameter Name | Mandatory?                          | Description                                       |
|----------------|-------------------------------------|---------------------------------------------------|
| `connection`   | Y                                   | Database connection. eg. `postgres06`, `aurora-6` |
| `product`      | Y                                   | Product name. eg. `'Education Platform'`          |
| `environment`  | Y                                   | Database environment. eg. `Dev`                   |
| `name`         | Y                                   | Database name.                                    |
| `force`        | N                                   | Force delete. default: `false`                    |
| `async`        | N _(we use this always as `false`)_ | Call async or sync                                |

### `schemaGet`

Almost all parameters are optional here. If you provide parameters, those will be used to filter the result.

| Parameter Name | Mandatory?                          | Description                                       |
|----------------|-------------------------------------|---------------------------------------------------|
| `connection`   | N                                   | Database connection. eg. `postgres06`, `aurora-6` |
| `product`      | N                                   | Product name. eg. `'Education Platform'`          |
| `environment`  | N                                   | Database environment. eg. `Dev`                   |
| `engine `      | N                                   | Database engine. eg. `mysql`                      |
| `name`         | N                                   | Database name.                                    |
| `async`        | N _(we use this always as `false`)_ | Call async or sync                                |

### `schemaUserGrantFullAccess`

| Parameter Name | Mandatory?                          | Description                                        |
|----------------|-------------------------------------|----------------------------------------------------|
| `connection`   | Y                                   | Database connection. eg. `postgres06`, `aurora-6`  |
| `schema`       | Y                                   | Database name, or schema name.                     |
| `name`         | Y                                   | Database user name.                                |
| `async`        | N _(we use this always as `false`)_ | Call async or sync                                 |

## Building the action

When you update something, be sure to build it, and commit the generated files.

```bash
npm run all
```

## Example usage in github actions

```yaml
name: Create-delete schemas per PR

# assuming a service account has been created, and the same account is authorized
# for CDM, and required values are set in secrets.

on:
  pull_request:
    types: [opened, ready_for_review, reopened, synchronize, closed]
  workflow_dispatch:
    branches:
      - '**'

# Environment variables can be overridden in .github/env
env:
  MAIN_PREFIX: main
  SPRING_DATASOURCE_DATABASE: dedu_readapp
  GITHUB_TOKEN: ${{ secrets.ENG_STD_TOKEN }}

concurrency:
  group: demo-${{ github.event.number }}
  cancel-in-progress: true

jobs:
  db-ops:
    name: Manage PR-based databases
    runs-on: ubuntu-latest
    env:
      SERVICE_USER: ${{ secrets.VPN_USERNAME }}
      SERVICE_USER_PASS: ${{ secrets.VPN_PASSWORD }}
      VPN_AUTH_CODE: ${{ secrets.VPN_AUTH_CODE }}
      CDM_CONNECTION: aurora-6
      CDM_PRODUCT: 'Education Plaform'
      CDM_ENVIRONMENT: Dev
      CDM_DATABASE_NAME: dedu_readapp_PR${{ github.event.number }}
      CDM_DATABASE_USER: user
      CDM_DETAILS: 'Edupf Read-App database for PR-${{ github.event.number }}'
      CDM_OWNER_MAIL: mehmetemre.atasever@trilogy.com
      CDM_OWNER_SKYPE: live:m.emre.atasever
    steps:
      - id: identify_db
        run: |
          echo "::set-output name=database_name::${{ env.CDM_DATABASE_NAME }}"
      - name: Connect to the VPN
        uses: trilogy-group/action-kerio-vpn@v1
        with:
          vpn-username: ${{ secrets.SRV_ACCOUNT_USER }}
          vpn-password: ${{ secrets.SRV_ACCOUNT_PASSWORD }}
          vpn-auth-code: ${{ secrets.VPN_AUTH_CODE }}
      - name: Check VPN Connectivity
        run: |
          nslookup dev.epf.pg.aureacentral.com || exit 1
          nslookup dev.epf.mysql.aureacentral.com || exit 1
      - name: DEBUG
        run: |
          echo "ACTION= ${{ github.event.action }}"
          echo "EVENT NUMBER= demo-${{ github.event.number }}"

      - uses: actions/checkout@v2
      - name: Create database
        # Create database only if the PR is not closed
        if: github.event.action != 'closed'
        uses: trilogy-group/action-cdm@v1
        with:
          username: ${{ secrets.SRV_ACCOUNT_USER }}
          password: ${{ secrets.SRV_ACCOUNT_PASSWORD }}
          command: schemaNew
          connection: aurora-6
          product: 'Education Plaform'
          environment: Dev
          name: dedu_readapp_sem_PR${{ github.event.number }}
          details: 'Edupf Read-App database for PR-${{ github.event.number }}'
          ownermail: mehmetemre.atasever@trilogy.com
          ownerskype: live:m.emre.atasever

      - name: Grant access to user
        if: github.event.action != 'closed'
        uses: trilogy-group/action-cdm@test
        with:
          username: ${{ env.SERVICE_USER }}
          password: ${{ env.SERVICE_USER_PASS }}
          command: schemaUserGrantFullAccess
          connection: ${{ env.CDM_CONNECTION }}
          schema: ${{ env.CDM_DATABASE_NAME }}
          name: ${{ env.CDM_DATABASE_USER }}

      - name: Delete PR database
        # Delete the database when PR is closed
        if: github.event.action == 'closed'
        uses: trilogy-group/action-cdm@v1
        with:
          username: ${{ secrets.SRV_ACCOUNT_USER }}
          password: ${{ secrets.SRV_ACCOUNT_PASSWORD }}
          command: schemaRemove
          connection: aurora-6
          product: 'Education Plaform'
          environment: Dev
          name: dedu_readapp_sem_PR${{ github.event.number }}
          force: true

  deploy:
    name: Do the rest of the deployment
    runs-on: ubuntu-latest
    if: always() && (needs.db-ops.result == 'success' || github.event_name != 'pull_request')
    needs: db-ops
    steps:
      - name: Override database name if PR-based environment
        if: github.event_name == 'pull_request'
        run: |
          echo "SPRING_DATASOURCE_DATABASE=${{ needs.db-ops.outputs.database_name }}" >> "$GITHUB_ENV"
      - name: deploy
        run: |
          echo "used db: ${{ env.SPRING_DATASOURCE_DATABASE }}"
          echo "the rest of the deployment stuff"

```
