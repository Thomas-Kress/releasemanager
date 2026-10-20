---
name: b4a-mc-variabledelete
description: "This module is able to delete entries in variable objects. If key can not be found in the object, it is interpreted as an error. Uses the b4A / best4Automic ReST API's mc.VariableDelete module (aliases: VariableDelete). Use when the user wants to delete entry variable in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Variable: Delete entry

This module is able to delete entries in variable objects. If key can not be found in the object, it is interpreted as an error. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.VariableDelete",
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
| Key | `key` | Defines the key of the entry |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
