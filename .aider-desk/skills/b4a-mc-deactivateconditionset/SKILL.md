---
name: b4a-mc-deactivateconditionset
description: "The module sets attributes for the deactivation condition, which can be read with the module info.DeactivateConditionRead. Uses the b4A / best4Automic ReST API's mc.DeactivateConditionSet module (aliases: RunnableDeactivateConditionSet). Use when the user wants to set deactivate condition runnable in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Runnable: Set Deactivate Condition

The module sets attributes for the deactivation condition, which can be read with the module info.DeactivateConditionRead. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.DeactivateConditionSet",
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
| Condition | `condition` | Selection of deactivate condition. Possible values: Never (never), After error-free execution (error_free_run), After error-free restart (error_free_restart), Always (always) |
| Days of delay | `days` | Number of days to wait before the task is deactivated |
| Task state | `state` | Task state is accepted as faultless. Possible values: (blank), ANY_ABEND (ANY_ABEND), ANY_ABEND_EXCEPT_FAULT (ANY_ABEND_EXCEPT_FAULT), ANY_EXCEPT_FAULT (ANY_EXCEPT_FAULT), ANY_OK (ANY_OK), ANY_OK_OR_UNBLOCKED (ANY_OK_OR_UNBLOCKED), ANY_SKIPPED (ANY_SKIPPED), ENDED_CANCEL (ENDED_CANCEL), ENDED_EMPTY (ENDED_EMPTY), ENDED_ESCALATED (ENDED_ESCALATED), ENDED_INACTIVE (ENDED_INACTIVE), ENDED_INACTIVE_MANUAL (ENDED_INACTIVE_MANUAL), ENDED_NOT_OK (ENDED_NOT_OK), ENDED_NOT_OK_SYNC (ENDED_NOT_OK_SYNC), ENDED_OK (ENDED_OK), ENDED_OK_OR_EMPTY (ENDED_OK_OR_EMPTY), ENDED_OK_OR_INACTIV (ENDED_OK_OR_INACTIV), ENDED_OK_OR_UNBLOCKED (ENDED_OK_OR_UNBLOCKED), ENDED_SKIPPED (ENDED_SKIPPED), ENDED_SKIPPED_CONDITIONS (ENDED_SKIPPED_CONDITIONS), ENDED_SKIPPED_SYNC (ENDED_SKIPPED_SYNC), ENDED_TIMEOUT (ENDED_TIMEOUT), ENDED_TRUNCATE (ENDED_TRUNCATE), ENDED_UNDEFINED (ENDED_UNDEFINED), ENDED_VANISHED (ENDED_VANISHED), FAULT_ALREADY_RUNNING (FAULT_ALREADY_RUNNING), FAULT_NO_HOST (FAULT_NO_HOST), FAULT_OTHER (FAULT_OTHER), USER_100_200 (USER_100_200), USER_147 (USER_147), USER_201_299 (USER_201_299), USER_300 (USER_300), USER_500_600 (USER_500_600) |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
