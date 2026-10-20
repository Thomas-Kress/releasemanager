---
name: b4a-mc-locationsync
description: "This module finds all objects it has found with the set filters in the source connection in the target connection and moves the object to the same folder as the source connection. If the folder in the destination connection does not already exist in which the object with the same name is located in the source connection, this folder will be created. Uses the b4A / best4Automic ReST API's mc.LocationSync module. Use when the user wants to folder synchronization object in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Object: Folder Synchronization

This module finds all objects it has found with the set filters in the source connection in the target connection and moves the object to the same folder as the source connection. If the folder in the destination connection does not already exist in which the object with the same name is located in the source connection, this folder will be created. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.LocationSync",
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
| only synchronize objects in source connection | `only-src-objects` | if the option is set the objects to move will be searched for in the source connection |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
