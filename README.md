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

## Parameters

Some of the parameters are in common among all commands.

| Parameter Name | Commands to applied                         | Description                                            |
|----------------|---------------------------------------------|--------------------------------------------------------|
| `username`     | all                                         | CDM service username                                   |
| `password`     | all                                         | CDM service password                                   |
| `command`      | all                                         | CDM command. eg. `schemaNew`, `schemaRemove`           |
| `connection`   | all                                         | Database connection. eg. `postgres06`, `aurora-6`      |
| `product`      | all                                         | Product name. eg. `'Education Platform'`               |
| `environment`  | all                                         | Database environment. eg. `Dev`                        |
| `name`         | _(only for `schemaNew` and `schemaRemove`)_ | Database name.                                         |
| `details`      | _(only for `schemaNew`)_                    | Description. default: `GitHub CDM action`              |
| `options`      | _(only for `schemaNew`)_                    | This is being used on `schemaNew`                      |
| `ownermail`    | _(only for `schemaNew`)_                    | Owner email address. default: `action-cdm@example.com` |
| `ownerskype`   | _(only for `schemaNew`)_                    | Owner skype. `live:action-cdm`                         |
| `force`        | _(only for `schemaRemove`)_                 | Force delete.                                          |
| `async`        | all                                         | Currently we use `async` as `false` all the times.     |

> ⚠️ Currently `schemaNew`, `schemaRemove` and `schemaGet` commands are supported.
> Please refer to the CDM API reference for more details, those parameters are only for the supported commands.

## Contribution

When you update something, be sure to build it.

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
  GITHUB_TOKEN: ${{ secrets.ENG_STD_TOKEN }}

concurrency:
  group: demo-${{ github.event.number }}
  cancel-in-progress: true

jobs:
  db-ops:
    name: Manage PR-based databases
    runs-on: ubuntu-latest
    steps:
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

  deploy-demo:
    name: Deploy demo environment
    if: github.repository != 'trilogy-group/eng-template'
    runs-on: ubuntu-latest
    needs: db-ops
    steps:
      - name: deploy
        run: |
          echo "the rest of the deployment stuff with PR-${{ github.event.number }}"
```
