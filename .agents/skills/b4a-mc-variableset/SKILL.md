---
name: b4a-mc-variableset
description: "This module can be used to change or add entries to variable objects. Only the key must be passed on to the module. All values (1-5) are optional. Uses the b4A / best4Automic ReST API's mc.VariableSet module (aliases: VariableSet). Use when the user wants to set entry variable in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Variable: Set entry

This module can be used to change or add entries to variable objects. Only the key must be passed on to the module. All values (1-5) are optional. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.VariableSet",
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
| 1. value | `value-1` | Defines the first value of the entry |
| 2. value | `value-2` | Defines the second value of the entry |
| 3. value | `value-3` | Defines the third value of the entry |
| 4. value | `value-4` | Defines the fourth value of the entry |
| 5. value | `value-5` | Defines the fifth value of the entry |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
