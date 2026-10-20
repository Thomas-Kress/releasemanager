---
name: b4a-info-variablesearch
description: "The module allows to search in variables for regular expressions. It is possible to use file with several expressions or just to use one single expression. The list of found objects is stored in a file in CSV format. Uses the b4A / best4Automic ReST API's info.VariableSearch module. Use when the user wants to search variable in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Variable: Search

The module allows to search in variables for regular expressions. It is possible to use file with several expressions or just to use one single expression. The list of found objects is stored in a file in CSV format. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "info.VariableSearch",
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
| Pattern File | `pattern-file` | A file containing one regular expression in each line |
| Pattern | `pattern` | A regular expression that is searched for in the variables |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
