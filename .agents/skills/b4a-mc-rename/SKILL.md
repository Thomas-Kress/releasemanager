---
name: b4a-mc-rename
description: "An important concept for Automic environments is the naming of objects. Naming objects is the base for an authorization concept. The rules for the naming for objects may change over time for different reasons. This module provides the functionality to rename objects based on rules defined in a mapping file. Uses the b4A / best4Automic ReST API's mc.Rename module (aliases: Rename, ObjectRename, UserRename, mc.UserRename). Use when the user wants to rename object in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Object: Rename

An important concept for Automic environments is the naming of objects. Naming objects is the base for an authorization concept. The rules for the naming for objects may change over time for different reasons. This module provides the functionality to rename objects based on rules defined in a mapping file. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.Rename",
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
| Mapping file | `mapping` | File containing a mapping of old object name pattern to new names |
| Renamed objects | `renamed-objects` | If given the file will contain a list of all mapped object names. |
| only rename objects | `rename-only` | just renames the objects without replacing any references |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
