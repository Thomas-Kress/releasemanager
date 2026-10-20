---
name: b4a-mc-workflowtaskadd
description: "This module is able to add objects as tasks to one or more workflows. The position in the workflow will be defined by the predecessor. When adding the task all successors of the given predecessor will be set as sucessors of the new task. The status in the dependencies of the successors can be provided via option. Uses the b4A / best4Automic ReST API's mc.WorkflowTaskAdd module (aliases: WorkflowAddTask). Use when the user wants to add tasks workflow in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Workflow: Add Tasks

This module is able to add objects as tasks to one or more workflows. The position in the workflow will be defined by the predecessor. When adding the task all successors of the given predecessor will be set as sucessors of the new task. The status in the dependencies of the successors can be provided via option. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.WorkflowTaskAdd",
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
| New task name | `new-task` | Object name of the new task to add |
| Predecessor Name | `predecessor-name` | Object name of the predecessor task |
| Predecessor Number | `predecessor-no` | Running number of the predecessor task |
| Branch for new tasks | `new-task-branch` | Defines the branch, in which the new task should be added. Possible values: Both (both), True (true), False (false) |
| Layout Mode | `layout-mode` | Define the mode used to layout the modified workflows. With 'Automatic' (auto) the layout will be done by the system automatically. When choosing the mode 'Insert Column' (column) a columns will be inserted for the new task and all other tasks behind it will be moved to the next column. The last mode 'Define Position' (position) will position the new task at the given position. This may result in changed positions for other tasks if the position was already taken. Possible values: Automatic (auto), Insert Column (column), Define Position (position) |
| Position | `position` | Defines the x and y coordinates of the new task |
| No duplicates | `no-duplicate` | Do not add the task if the current successor is the same object already |
| Task State | `task-state` | Task state to use for the dependencies to the successors. Possible values: (blank), ANY_ABEND (ANY_ABEND), ANY_ABEND_EXCEPT_FAULT (ANY_ABEND_EXCEPT_FAULT), ANY_EXCEPT_FAULT (ANY_EXCEPT_FAULT), ANY_OK (ANY_OK), ANY_OK_OR_UNBLOCKED (ANY_OK_OR_UNBLOCKED), ANY_SKIPPED (ANY_SKIPPED), ENDED_CANCEL (ENDED_CANCEL), ENDED_EMPTY (ENDED_EMPTY), ENDED_ESCALATED (ENDED_ESCALATED), ENDED_INACTIVE (ENDED_INACTIVE), ENDED_INACTIVE_MANUAL (ENDED_INACTIVE_MANUAL), ENDED_NOT_OK (ENDED_NOT_OK), ENDED_NOT_OK_SYNC (ENDED_NOT_OK_SYNC), ENDED_OK (ENDED_OK), ENDED_OK_OR_EMPTY (ENDED_OK_OR_EMPTY), ENDED_OK_OR_INACTIV (ENDED_OK_OR_INACTIV), ENDED_OK_OR_UNBLOCKED (ENDED_OK_OR_UNBLOCKED), ENDED_SKIPPED (ENDED_SKIPPED), ENDED_SKIPPED_CONDITIONS (ENDED_SKIPPED_CONDITIONS), ENDED_SKIPPED_SYNC (ENDED_SKIPPED_SYNC), ENDED_TIMEOUT (ENDED_TIMEOUT), ENDED_TRUNCATE (ENDED_TRUNCATE), ENDED_UNDEFINED (ENDED_UNDEFINED), ENDED_VANISHED (ENDED_VANISHED), FAULT_ALREADY_RUNNING (FAULT_ALREADY_RUNNING), FAULT_NO_HOST (FAULT_NO_HOST), FAULT_OTHER (FAULT_OTHER), USER_100_200 (USER_100_200), USER_147 (USER_147), USER_201_299 (USER_201_299), USER_300 (USER_300), USER_500_600 (USER_500_600) |
| Else state | `else-state` | Defines the state of the workflow when the predecessor task fails. Possible values: Standard (standard), Abort (abort), Block (block), Skip (skip), Block + Abort Signal (blockabort) |
| Else execute | `else-execute` | Defines the object, that will be executed when the state of the predecessor does not matching the configured one |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
