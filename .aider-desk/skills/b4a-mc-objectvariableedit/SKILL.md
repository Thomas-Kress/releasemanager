---
name: b4a-mc-objectvariableedit
description: "The module can modify the variables of executable object shown in the tab variables & promptsets. As input a b4A script is used. Uses the b4A / best4Automic ReST API's mc.ObjectVariableEdit module (aliases: RunnableVariableEdit). Use when the user wants to amend variables runnable in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Runnable: Amend Variables

The module can modify the variables of executable object shown in the tab variables & promptsets. As input a b4A script is used. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.ObjectVariableEdit",
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
| b4A script variable | `command-vara` | A variable object containing commands to execute |
| b4A script file | `command-file` | Name of a file containing the commands to execute |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
