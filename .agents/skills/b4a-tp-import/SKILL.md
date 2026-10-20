---
name: b4a-tp-import
description: "The module can import objects that have been exported with the module tp.Export. The objects will be created in the same folder as they been located in the source. If necessary the folders will be created. Uses the b4A / best4Automic ReST API's tp.Import module (aliases: Import, ObjectImport). Use when the user wants to import object in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Object: Import

The module can import objects that have been exported with the module tp.Export. The objects will be created in the same folder as they been located in the source. If necessary the folders will be created. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "tp.Import",
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
| overwrite links | `overwrite-links` | Defines if existing links should be overwritten |
| overwrite objects | `overwrite-objects` | Defines if existing objects should be overwritten |
| Base folder | `base-folder` | This folder will be used as the base folder instead of the root folder |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
