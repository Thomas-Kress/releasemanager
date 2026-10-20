---
name: b4a-mc-syncattributeedit
description: "The module is able to add or replace the sync attributes of objects. Which sync attributes should be edited is defined in a file. Uses the b4A / best4Automic ReST API's mc.SyncAttributeEdit module (aliases: RunnableSyncAttributeEdit). Use when the user wants to edit sync attributes runnable in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Runnable: Edit sync attributes

The module is able to add or replace the sync attributes of objects. Which sync attributes should be edited is defined in a file. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.SyncAttributeEdit",
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
| Mode | `mode` | Defines the mode of action. Possible values: Replace (replace), Append (append) |
| Sync definitions | `sync-file` | File containing the sync attributes |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
