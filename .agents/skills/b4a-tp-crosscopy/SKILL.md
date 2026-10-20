---
name: b4a-tp-crosscopy
description: "To copy complete folder structures recursively from one client to another this module can be used. The folder structure will be recreated in the target client. The target client may be located in a different environment. Uses the b4A / best4Automic ReST API's tp.CrossCopy module (aliases: CrossCopy, ObjectCrossCopy). Use when the user wants to cross copy object in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Object: Cross Copy

To copy complete folder structures recursively from one client to another this module can be used. The folder structure will be recreated in the target client. The target client may be located in a different environment. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "tp.CrossCopy",
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
| Overwrite existing objects | `overwrite` | If set existing objects will be overwritten |
| newer objects only | `newer-only` | If set just newer objects will be copied to the destination |
| Lock operation | `locking` | Creates a locking object to ensure the operation can only run once at a time |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
