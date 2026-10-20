---
name: b4a-info-processsearch
description: "To find specific code fragments in the processes of objects this module can be used. Additionally it is possible to find the objects that do not contain a given code fragment. Patterns to find are read from a file. The results are stored in a file in CSV format. Uses the b4A / best4Automic ReST API's info.ProcessSearch module (aliases: ObjectProcessSearch). Use when the user wants to search in processes object in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Object: Search in Processes

To find specific code fragments in the processes of objects this module can be used. Additionally it is possible to find the objects that do not contain a given code fragment. Patterns to find are read from a file. The results are stored in a file in CSV format. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "info.ProcessSearch",
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
| Process | `process` | Selects the processes to work on. Possible values: All (all), Pre-Script (pre), Script (process), !Script (event), Post-Script (post) |
| case-insensitive matching | `case-insensitive` | The regular expressions are matched case-insensitive |
| List matching objects only | `matches-only` | Only shows/saves the objects matching the criteria |
| complementary set | `complementary` | Selects the objects that do not match the given patterns (complementary set) |
| List of pattern | `pattern-file` | List of patterns to search for. Each line of the file should contain one pattern and nothing else. |
| Pattern | `pattern` | A regular expression that is searched for in all processes |
| Replacement rule | `replace-with` | A pattern defining a replacement for the matching line in the output file. |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
