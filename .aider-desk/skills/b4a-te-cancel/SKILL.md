---
name: b4a-te-cancel
description: "The module can cancel tasks that are active, blocked or in a waiting state. Optionally if the task is a workflow it can be cancelled recursively. Uses the b4A / best4Automic ReST API's te.Cancel module (aliases: RunnableCancel). Use when the user wants to cancel task in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Task: Cancel

The module can cancel tasks that are active, blocked or in a waiting state. Optionally if the task is a workflow it can be cancelled recursively. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "te.Cancel",
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
| resursive | `recursive` | Cancels the task recursively, which is required for workflows with sub-workflows. |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
