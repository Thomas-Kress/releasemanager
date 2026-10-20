---
name: b4a-pm-list
description: "This module creates an inventory of all installed packages in the system. Output can be written to a variable object or streamed with configurable columns; when streamed, the package name is always the first column. Uses the b4A / best4Automic ReST API's pm.List module. Use when the user wants to list packages in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Package: List

This module creates an inventory of all installed packages in the system. Output can be written to a variable object or streamed with configurable columns; when streamed, the package name is always the first column, followed by the base folder path, version information, dependencies, and any supplementary fields defined in `pm.conf` (via `pm-index-additional-entries`). Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "pm.List",
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
| Sorting | `order-by` | Column used for sorting results. Possible values: Unsorted (`unsorted`), Package Name (`package-name`) |
| Variable Object | `variable` | Variable object name for data storage |
| Variable Source Connection | `variable-source` | Alternative b4A connection where the variable can be found |
| Datastream Columns | `datastream-columns` | Output columns when streaming to output instead of a variable. Possible values: Folder, Version, Dependencies, Categories |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
