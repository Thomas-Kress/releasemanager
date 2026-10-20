---
name: b4a-mc-servicelevelobjectiveedit
description: "Uses the b4A / best4Automic ReST API's mc.ServiceLevelObjectiveEdit module (aliases: SLOEdit). Use when the user wants to edit service level objective in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Service Level Objective: Edit

Runs the mc.ServiceLevelObjectiveEdit module. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.ServiceLevelObjectiveEdit",
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
| Monitor this Service Level Objective | `monitoring` | Activates the monitoring of this Service Level Objective |
| Service Selection file | `service-selection-file` | This file contains the service selection in JSON format |
| Runs shorter than the Maximum Runtime (MRT) of the service | `consider-mrt` | Service is fulfilled if the execution takes less time than the maximum runtime (MRT) of the service. |
| Runs longer than the Minimum Runtime (SRT) of the service | `consider-srt` | Service is fulfilled if the execution takes longer than the minimum runtime (SRT) of the service. |
| End with specific end status | `consider-status` | Service is fulfilled when execution ends with specific status |
| Expected status | `expected-status` | The expected status of the execution. Possible values: (blank), ANY_ABEND (ANY_ABEND), ANY_ABEND_EXCEPT_FAULT (ANY_ABEND_EXCEPT_FAULT), ANY_EXCEPT_FAULT (ANY_EXCEPT_FAULT), ANY_OK (ANY_OK), ANY_OK_OR_UNBLOCKED (ANY_OK_OR_UNBLOCKED), ANY_SKIPPED (ANY_SKIPPED), ENDED_CANCEL (ENDED_CANCEL), ENDED_EMPTY (ENDED_EMPTY), ENDED_ESCALATED (ENDED_ESCALATED), ENDED_INACTIVE (ENDED_INACTIVE), ENDED_INACTIVE_MANUAL (ENDED_INACTIVE_MANUAL), ENDED_NOT_OK (ENDED_NOT_OK), ENDED_NOT_OK_SYNC (ENDED_NOT_OK_SYNC), ENDED_OK (ENDED_OK), ENDED_OK_OR_EMPTY (ENDED_OK_OR_EMPTY), ENDED_OK_OR_INACTIV (ENDED_OK_OR_INACTIV), ENDED_OK_OR_UNBLOCKED (ENDED_OK_OR_UNBLOCKED), ENDED_SKIPPED (ENDED_SKIPPED), ENDED_SKIPPED_CONDITIONS (ENDED_SKIPPED_CONDITIONS), ENDED_SKIPPED_SYNC (ENDED_SKIPPED_SYNC), ENDED_TIMEOUT (ENDED_TIMEOUT), ENDED_TRUNCATE (ENDED_TRUNCATE), ENDED_UNDEFINED (ENDED_UNDEFINED), ENDED_VANISHED (ENDED_VANISHED), FAULT_ALREADY_RUNNING (FAULT_ALREADY_RUNNING), FAULT_NO_HOST (FAULT_NO_HOST), FAULT_OTHER (FAULT_OTHER) |
| Execute on violation | `execute-on-violation` | Select if an object is to be executed in case of violation |
| Object | `on-violation-object` | Object to be executed in case of violation |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
