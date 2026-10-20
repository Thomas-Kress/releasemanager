---
name: b4a-info-patternsearch
description: "Advanced search for character strings in various attributes of objects below a defined folder. The pattern must be passed as a regular expression. The results are output as a CSV file. Uses the b4A / best4Automic ReST API's info.PatternSearch module. Use when the user wants to extended string search in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Extended string search

Advanced search for character strings in various attributes of objects below a defined folder. The pattern must be passed as a regular expression. The results are output as a CSV file. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "info.PatternSearch",
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
| Folder | `folder` | The regular expression is searched for below this folder |
| Pattern | `pattern` | Regular expression that is searched for in the attributes. It does not have to represent the entire character string, but only occur in the character string |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
