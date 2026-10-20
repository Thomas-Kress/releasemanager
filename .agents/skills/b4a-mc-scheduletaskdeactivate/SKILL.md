---
name: b4a-mc-scheduletaskdeactivate
description: "This module can activate or deactivate schedule tasks that re identified by the start time anf object name. Additionally the reload of the definition at turnaround can be triggered. Uses the b4A / best4Automic ReST API's mc.ScheduleTaskDeActivate module (aliases: ScheduleDeActivateTask, ScheduleTaskDeActivate). Use when the user wants to deactivate task schedule in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Schedule: Deactivate Task

This module can activate or deactivate schedule tasks that re identified by the start time anf object name. Additionally the reload of the definition at turnaround can be triggered. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.ScheduleTaskDeActivate",
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
| Task | `task` | Object name of the task. |
| Start time | `time` | Start time for the Task |
| Reload schedule at next turnaround | `reload` | If set the schedule objects will be reload at next turnaround. |
| Action | `action` | Defines if the task should set to active or inactive. Possible values: Inactive (inactive), Active (active) |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
