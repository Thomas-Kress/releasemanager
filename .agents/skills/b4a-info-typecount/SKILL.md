---
name: b4a-info-typecount
description: "The module counts the number of different object types in a given folder. Uses the b4A / best4Automic ReST API's info.TypeCount module (aliases: FolderScan). Use when the user wants to count object type in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Object Type: Count

The module counts the number of different object types in a given folder. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "info.TypeCount",
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
| Folder | `folder` | Folder to search |
| verbose output | `verbose` | If set an overview of the directory structure is shown in the report |
| Resolve object type | `resolve-job-type` | Determine the exact type of a JOBS object (UNIX, WINDOWS, .) |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
