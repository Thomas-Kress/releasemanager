---
name: b4a-te-restart
description: "Restarts a task. If not given the reference runID is determined automatically. For file transfers the option for doing the entire transfer again can be set. Uses the b4A / best4Automic ReST API's te.Restart module (aliases: Restart, RunnableRestart). Use when the user wants to restart task in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Task: Restart

Restarts a task. If not given the reference runID is determined automatically. For file transfers the option for doing the entire transfer again can be set. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "te.Restart",
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
| Restart Point | `restart-point` | Defines the restart point for the task |
| start file transfer from the beginning | `entire-filetransfer` | If given file transfer will be restart from the beginning and not continue at the last position |
| Ignore activation errors | `ignore-activation-errors` | If set no error will be reported if the activation fails |
| automatic submission of promptsets | `submit-promptset` | if a restarted task requires a promptset to be submitted it will be submitted using the default values |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
