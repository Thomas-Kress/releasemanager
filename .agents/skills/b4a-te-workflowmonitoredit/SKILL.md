---
name: b4a-te-workflowmonitoredit
description: "The module provides functions to modify the monitor of a workflow. Breakpoints can be set, monitor jobs be added (with predecessors only), tasks set to inactive and comments append to task statistic records. Uses the b4A / best4Automic ReST API's te.WorkflowMonitorEdit module (aliases: WorkflowModifyMonitor). Use when the user wants to edit workflow monitor task in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Task: Edit Workflow Monitor

The module provides functions to modify the monitor of a workflow. Breakpoints can be set, monitor jobs be added (with predecessors only), tasks set to inactive and comments append to task statistic records. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "te.WorkflowMonitorEdit",
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
| b4A script variable | `command-vara` | A variable object containing commands to execute |
| b4A script file | `command-file` | Name of a file containing the commands to execute |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
