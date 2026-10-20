---
name: b4a-mc-scheduletaskadd
description: "This module is able to add objects as tasks to one or more schedules. Additionally to the task name a time and a calendar condition can be defined. If a list of calendar keywords is sepcified all of the keywords must be found in the given calendar object. Uses the b4A / best4Automic ReST API's mc.ScheduleTaskAdd module (aliases: ScheduleAddTask, ScheduleTaskAdd). Use when the user wants to add task schedule in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Schedule: Add Task

This module is able to add objects as tasks to one or more schedules. Additionally to the task name a time and a calendar condition can be defined. If a list of calendar keywords is sepcified all of the keywords must be found in the given calendar object. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.ScheduleTaskAdd",
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
| Day offset | `day-offset` | Defines the start of period |
| No duplicate entry | `no-duplicate` | If there is already an entry for the same object at the same start time the entry will not be added, but the calendar condition will be amended. |
| Calendar Match Rule | `calendar-match` | Defines in which way the calendar definitions of to match. Possible values: All (all), None (none), One (one) |
| Calendar Keywords | `calendars` | A list of pairs of calender object and a keyword |
| Prompt Buffer File | `prompt-buffer` | A file containing a list of variables to pass on to the object to define PromptSet values |
| Task State | `task-state` | Task state to use for the dependencies to the successors. Possible values: (blank), ANY_ABEND (ANY_ABEND), ANY_ABEND_EXCEPT_FAULT (ANY_ABEND_EXCEPT_FAULT), ANY_EXCEPT_FAULT (ANY_EXCEPT_FAULT), ANY_OK (ANY_OK), ANY_OK_OR_UNBLOCKED (ANY_OK_OR_UNBLOCKED), ANY_SKIPPED (ANY_SKIPPED), ENDED_CANCEL (ENDED_CANCEL), ENDED_EMPTY (ENDED_EMPTY), ENDED_ESCALATED (ENDED_ESCALATED), ENDED_INACTIVE (ENDED_INACTIVE), ENDED_INACTIVE_MANUAL (ENDED_INACTIVE_MANUAL), ENDED_NOT_OK (ENDED_NOT_OK), ENDED_NOT_OK_SYNC (ENDED_NOT_OK_SYNC), ENDED_OK (ENDED_OK), ENDED_OK_OR_EMPTY (ENDED_OK_OR_EMPTY), ENDED_OK_OR_INACTIV (ENDED_OK_OR_INACTIV), ENDED_OK_OR_UNBLOCKED (ENDED_OK_OR_UNBLOCKED), ENDED_SKIPPED (ENDED_SKIPPED), ENDED_SKIPPED_CONDITIONS (ENDED_SKIPPED_CONDITIONS), ENDED_SKIPPED_SYNC (ENDED_SKIPPED_SYNC), ENDED_TIMEOUT (ENDED_TIMEOUT), ENDED_TRUNCATE (ENDED_TRUNCATE), ENDED_UNDEFINED (ENDED_UNDEFINED), ENDED_VANISHED (ENDED_VANISHED), FAULT_ALREADY_RUNNING (FAULT_ALREADY_RUNNING), FAULT_NO_HOST (FAULT_NO_HOST), FAULT_OTHER (FAULT_OTHER), USER_100_200 (USER_100_200), USER_147 (USER_147), USER_201_299 (USER_201_299), USER_300 (USER_300), USER_500_600 (USER_500_600) |
| Count | `repeat-count` | repeats task up to that many execution |
| Minutes | `repeat-minutes` | repeats task after that many minutes |
| Else execute | `else-execute` | Defines the object, that will be executed when the state of the predecessor does not matching the configured one |
| Only after last failed run | `after-last-run` | Just execute the object after the last failed run |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
