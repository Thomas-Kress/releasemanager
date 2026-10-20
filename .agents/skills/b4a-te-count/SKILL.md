---
name: b4a-te-count
description: "To evaluate the amount of executions of runnable objects this module can be used. It counts the number of executions in a given period. Uses the b4A / best4Automic ReST API's te.Count module (aliases: StatisticExecutionCount). Use when the user wants to count executions execution in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Execution: Count Executions

To evaluate the amount of executions of runnable objects this module can be used. It counts the number of executions in a given period. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "te.Count",
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
| Date Selection | `date-selection` | Defines the timestamp used for the date selection. Possible values: None (none), Activation (activation), Start (start), End (end) |
| Begin timestamp | `stat-begin` | Beginning of time period |
| End timestamp | `stat-end` | End of time period |
| ID | `id` | An identifier for the department the jobs belong to |
| Label | `label` | A description or the department the objects belong to |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
