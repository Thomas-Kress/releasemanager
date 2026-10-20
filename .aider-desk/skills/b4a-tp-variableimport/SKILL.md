---
name: b4a-tp-variableimport
description: "Similar to the module tp.Import this module can import variable objects that have been exported with the module tp.VariableExport. The input file must be in CSV format with a semicolon as separator. Uses the b4A / best4Automic ReST API's tp.VariableImport module (aliases: VariableImport). Use when the user wants to import variable in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Variable: Import

Similar to the module tp.Import this module can import variable objects that have been exported with the module tp.VariableExport. The input file must be in CSV format with a semicolon as separator. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "tp.VariableImport",
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
| Create variable objects | `create` | Create the variable object if it does not exist. |
| Reset variable objects | `reset` | Removes all entries before adding the new ones. |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
