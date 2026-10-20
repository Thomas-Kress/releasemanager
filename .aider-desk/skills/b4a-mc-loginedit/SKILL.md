---
name: b4a-mc-loginedit
description: "The module is used to edit login objects. It is able to modify existing entries and to add new ones. Uses the b4A / best4Automic ReST API's mc.LoginEdit module (aliases: LoginEdit). Use when the user wants to edit login in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Login: Edit

The module is used to edit login objects. It is able to modify existing entries and to add new ones. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.LoginEdit",
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
| Test mode | `test-mode` | Activates a simulation mode |
| Input file | `input` | The name of the file containing the input data |
| Add missing entries | `add-missing` | Add entries to LOGIN objects if they do not exist. It works for entries with agent name only. |
| Encryption Key | `password-key` | Defines the secret for the password encryption. Possible values: Server (server), AE Script (ae-script) |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
