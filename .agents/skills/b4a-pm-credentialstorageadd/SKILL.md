---
name: b4a-pm-credentialstorageadd
description: "This module adds credentials to a storage object. The stored data can be retrieved during package installation to replenish login and connection objects with credentials that are not included in the transport. Uses the b4A / best4Automic ReST API's pm.CredentialStorageAdd module. Use when the user wants to add credentials to storage in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Credential Storage: Add Credentials

This module adds credentials to a storage object. The stored data can be retrieved during package installation to replenish login and connection objects with credentials that are not included in the transport. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "pm.CredentialStorageAdd",
  "options": {
    "connection": "<connection>"
  }
}
```

Use the user-provided connection, or `$B4A_DEFAULT_CONNECTION` when none is given.

### Options

Add any of these to the `options` object when the user's request calls for them. All are optional; only add an option when it is actually needed.

| Option | Flag | Description |
|---|---|---|
| Credential Storage Object | `credential-storage` | Storage object containing the credentials |
| Object Name | `object-name` | Name of the login or connection object |
| Object Type | `object-type` | Type of object for credential storage. Possible values: Login, R/3 Connection, REST/SOAP/Web/Mail/FTP Connection, Database Connection, Informatica Connection |
| Username | `credential-username` | User name |
| Password | `credential-password` | User password |
| Encryption Secret | `credential-password-key` | Secret used for password encryption. Possible values: Server, AE-Script |
| Key Passphrase | `passphrase` | PGP key password |
| Domain Username | `domain-username` | Domain user name |
| Domain Password | `domain-password` | Domain user password |
| AE Username | `ae-username` | AE user name |
| AE Department | `ae-department` | AE user department |
| AE Client | `ae-client` | Client for the AE user login |
| AE Password | `ae-password` | AE user password |
| Host | `credential-host` | Host attribute for login objects (agent or wildcard) |
| Host Type | `credential-hosttype` | Host type for login objects |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
