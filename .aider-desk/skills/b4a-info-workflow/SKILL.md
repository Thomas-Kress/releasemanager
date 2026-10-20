---
name: b4a-info-workflow
description: "The module reads details about workflows and its tasks. If a task is also a workflow all its tasks will read too (recursively). The results are stored in a file in CSV format. Uses the b4A / best4Automic ReST API's info.Workflow module (aliases: WorkflowDescribe). Use when the user wants to describe workflow in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Workflow: Describe

The module reads details about workflows and its tasks. If a task is also a workflow all its tasks will read too (recursively). The results are stored in a file in CSV format. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "info.Workflow",
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
| Create files with workflow structure | `tree-files` | If given for each processed workflow a file is created containing tree shown the structure of it. |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
