---
name: b4a-mc-move
description: "The module moves objects to another folder. The original folder structure will be created below the destination folder. It is possible to remove parts of the original folder. If there is a link in the destination folder it will be removed before moving the object. Uses the b4A / best4Automic ReST API's mc.Move module (aliases: ObjectMove). Use when the user wants to move object in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Object: Move

The module moves objects to another folder. The original folder structure will be created below the destination folder. It is possible to remove parts of the original folder. If there is a link in the destination folder it will be removed before moving the object. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.Move",
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
| Destination folder | `destination-folder` | Defines the destination folder for the move operation |
| Base folder | `base-folder` | The given folder is removed from the path of the source objects when calculating the destination folder |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
