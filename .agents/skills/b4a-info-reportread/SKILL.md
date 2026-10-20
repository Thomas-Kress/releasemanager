---
name: b4a-info-reportread
description: "The module reads reports for a set of object in a given period of time. The reports will be written to files that are based on the object name, the report type and the runID. Optionally the content of the reports can be filtered based on a regular expression. Uses the b4A / best4Automic ReST API's info.ReportRead module (aliases: ReportRead). Use when the user wants to read report in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Report: Read

The module reads reports for a set of object in a given period of time. The reports will be written to files that are based on the object name, the report type and the runID. Optionally the content of the reports can be filtered based on a regular expression. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "info.ReportRead",
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
| Begin timestamp | `stat-begin` | Beginning of time period |
| End timestamp | `stat-end` | End of time period |
| Task states | `states` | defines the task status a task must have. Possible values: ANY_ABEND (ANY_ABEND), ANY_OK (ANY_OK), ANY_SKIPPED (ANY_SKIPPED), ENDED_CANCEL (ENDED_CANCEL), ENDED_EMPTY (ENDED_EMPTY), ENDED_INACTIVE_OBJECT (ENDED_INACTIVE_OBJECT), ENDED_INACTIVE (ENDED_INACTIVE), ENDED_NOT_OK (ENDED_NOT_OK), ENDED_OK (ENDED_OK), ENDED_OK_OR_EMPTY (ENDED_OK_OR_EMPTY), ENDED_OK_OR_INACTIV (ENDED_OK_OR_INACTIV), ENDED_SKIPPED (ENDED_SKIPPED), ENDED_TIMEOUT (ENDED_TIMEOUT), ENDED_UNDEFINED (ENDED_UNDEFINED), ENDED_VANISHED (ENDED_VANISHED), FAULT_ALREADY_RUNNING (FAULT_ALREADY_RUNNING), FAULT_NO_HOST (FAULT_NO_HOST), FAULT_OTHER (FAULT_OTHER), USER_100_200 (USER_100_200), USER_147 (USER_147), USER_201_299 (USER_201_299), USER_300 (USER_300), USER_500_600 (USER_500_600) |
| Agent (destination) | `agent` | Pattern of an agent name for the destination agent |
| include child tasks | `children` | Activating the option will include the child tasks in the analysis |
| Number of Levels | `recursion-depth` | Defines how many levels of child tasks should be included |
| Maximum number of results | `max-results` | Defines the maximum number of statistics records that will be retrieve per object |
| Output directory | `output-dir` | The directory where the report files will be stored |
| Report types | `report-types` | Selection of report types to investigate. Possible values: Activation report (ACT), Client report (CLNT), Runtime report (LOG), SYSLST report for BS2000 jobs (LST), Object report (OBJ), Agent-Report (PLOG), Post-Script-Report (POST), Internal report (PP), Job report (REP), Script-Report (REV0), JCL-Report (REV1), Object access report (REV2) |
| create folders | `with-folders` | creates the folders of the objects on the file system. Otherwise the files will be stored in the given folder. |
| Use Object Alias | `use-alias` | If set the object alias of statistic record is used in the filename instead of the object name |
| Regular Expression (whole line) | `regex` | Only the lines matching the given regular expression are written to the report files. The expression must match the whole line and not just a part of it. |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
