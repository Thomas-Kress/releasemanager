---
name: b4a-mc-useredit
description: "The module is used for creating and modifying users. It writes user information from a file (CSV format) to a client that can be created with the module info.UserRead. A lot of user options can be set and the memberships of user groups can be defined. Uses the b4A / best4Automic ReST API's mc.UserEdit module (aliases: UserManageEdit). Use when the user wants to edit user in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A User: Edit

The module is used for creating and modifying users. It writes user information from a file (CSV format) to a client that can be created with the module info.UserRead. A lot of user options can be set and the memberships of user groups can be defined. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.UserEdit",
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
| Mode | `mode` | Defines if the module should just create or modify the user or if it should do both (whatever is required). Possible values: Both (both), Create (create), Modify (modify) |
| Generate passwords for new user | `generate-password` | If the option is set new random passwords will be generate for new users if no password has been specified. The generated passwords will be written to the input file. |
| Ignore missing groups | `ignore-missing-groups` | Missing groups will not cause an error in processing |
| Synchronize LDAP data | `sync-ldap` | Synchronize LDAP data for users with LDAP connection enabled |
| Ignore failed LDAP synchronisation | `ignore-sync-ldap-error` | If set errors during LDAP synchronisation will be ignored |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
