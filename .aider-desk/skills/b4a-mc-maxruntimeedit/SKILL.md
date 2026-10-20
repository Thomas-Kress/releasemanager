---
name: b4a-mc-maxruntimeedit
description: "For runnable objects a monitor of the maximum runtime can be defined that may trigger actions on deviations. The module allows to edit the attributes for the monitor options and the actions. Uses the b4A / best4Automic ReST API's mc.MaxRuntimeEdit module. Use when the user wants to maximum runtime monitor & actions runnable in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Runnable: Maximum Runtime Monitor & Actions

For runnable objects a monitor of the maximum runtime can be defined that may trigger actions on deviations. The module allows to edit the attributes for the monitor options and the actions. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.MaxRuntimeEdit",
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
| Mode | `mode` | The option controls whether all maximum runtime options or just the monitor or actions will be modified. Possible values: All (all), Monitor (monitor), Actions (action), Action Execute (action-exec) |
| Maximum Runtime Monitoring | `max-runtime-mode` | Mode for monitoring maximum runtime. Possible values: None (deactivated) (none), ERT (ert), Date (date), Fixed (fixed) |
| Duration | `max-runtime-fixed` | A fixed duration for the maximum runtime in seconds |
| Additional Duration | `max-runtime-ert` | An additional percentage added to the ERT for maximum runtime |
| Additional Days | `max-runtime-date-days` | Number of days for the maximum runtime |
| Finish Time | `max-runtime-date-time` | A fixed time of day as the finish time |
| Time Zone | `max-runtime-date-timezone` | The time zone for the given timestamp |
| cancel or quit task | `max-runtime-cancel` | if there are any deviations according to the monitor the task will be cancelled/quit |
| execute another object | `max-runtime-exec` | if there are any deviations according to the monitor a given object will be executed |
| Object Name | `max-runtime-exec-object` | if there are any deviations according to the monitor the given object will be executed |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
