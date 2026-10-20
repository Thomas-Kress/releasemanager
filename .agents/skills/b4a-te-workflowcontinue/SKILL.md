---
name: b4a-te-workflowcontinue
description: "The module provides some ways to continue a Workflow or to cancel the activity. The workflows will be searched for in the activities and can filtered with sefveral criteria. Uses the b4A / best4Automic ReST API's te.WorkflowContinue module (aliases: WorkflowContinue). Use when the user wants to continue workflow task in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Task: Continue Workflow

The module provides some ways to continue a Workflow or to cancel the activity. The workflows will be searched for in the activities and can filtered with sefveral criteria. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "te.WorkflowContinue",
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
| Action | `action` | Defines the action to perform on the workflows. Possible values: Restart (restart), Unblock (unblock), Cancel Workflow (cancel), Cancel Workflow Recursive (cancel_recursive) |
| automatic submission of promptsets | `submit-promptset` | if a restarted task requires a promptset to be submitted it will be submitted using the default values |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
