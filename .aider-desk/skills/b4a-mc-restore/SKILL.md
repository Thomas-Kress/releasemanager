---
name: b4a-mc-restore
description: "The Automation Engine offers an object-based version management, which can be activated. Each object gets its own version number, which will be increased when the object is saved. If a transport has be rolled back it is not possible based on one version number for all objects. This module provides the possibility to restore the last or last but one version. Additionaly objects can be restored to version of a given point in time. Uses the b4A / best4Automic ReST API's mc.Restore module (aliases: Restore, ObjectRestore). Use when the user wants to restore object in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Object: Restore

The Automation Engine offers an object-based version management, which can be activated. Each object gets its own version number, which will be increased when the object is saved. If a transport has be rolled back it is not possible based on one version number for all objects. This module provides the possibility to restore the last or last but one version. Additionaly objects can be restored to version of a given point in time. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.Restore",
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
| Restore Mode | `restore-mode` | Defines the way the version that should be restored will be specified. Possible values: Number (number), Date (date) |
| Version | `version-number` | Defines the version to restore. Starting to count from the current version. |
| Version Date | `version-date` | A version at least as old as the given date will be restored |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
