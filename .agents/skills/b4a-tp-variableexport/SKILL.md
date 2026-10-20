---
name: b4a-tp-variableexport
description: "Similar to the module tp.Export this module exports variable objects. The objects are exported as files in CSV format (separator semicolon). For each object a file will be created and if requested the folder structure will be created in the filesystem. Uses the b4A / best4Automic ReST API's tp.VariableExport module (aliases: VariableExport). Use when the user wants to export variable in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Variable: Export

Similar to the module tp.Export this module exports variable objects. The objects are exported as files in CSV format (separator semicolon). For each object a file will be created and if requested the folder structure will be created in the filesystem. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "tp.VariableExport",
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
| Output directory | `output-dir` | The found objects are written to files in the given directory |
| Use sub-directories matching the AE folders | `use-folders` | The files are stored in sub-directories that match the folder in the Automic AE system. |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
