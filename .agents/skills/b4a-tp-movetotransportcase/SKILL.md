---
name: b4a-tp-movetotransportcase
description: "The module provides the possibility to move objects to the transport case. If the objects to move are located in different folders this module helps to make the task easier. The objects to transport are read from a file with one object per line. Uses the b4A / best4Automic ReST API's tp.MoveToTransportCase module (aliases: Import, ObjectMoveToTransportCase). Use when the user wants to move to transport case object in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Object: Move to Transport Case

The module provides the possibility to move objects to the transport case. If the objects to move are located in different folders this module helps to make the task easier. The objects to transport are read from a file with one object per line. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "tp.MoveToTransportCase",
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
| Cleanup mode | `cleanup-mode` | Defines how to act if the transport case is not empty. Possible values: None (none), Cleanup transport case (cleanup), Fail if not empty (fail) |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
