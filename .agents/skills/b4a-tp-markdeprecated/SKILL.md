---
name: b4a-tp-markdeprecated
description: "In some environments objects are not allowed to be deleted. After some time the environment will contain unused objects. To be able to mark this objects as deprecated they can be renamed, e.g. adding a prefix to the name. This task can be performed by this module. If necessary a rollback of such a renaming can also be done with this module. Uses the b4A / best4Automic ReST API's tp.MarkDeprecated module (aliases: Import, ObjectMarkDeprecated). Use when the user wants to mark depreated object in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Object: Mark Depreated

In some environments objects are not allowed to be deleted. After some time the environment will contain unused objects. To be able to mark this objects as deprecated they can be renamed, e.g. adding a prefix to the name. This task can be performed by this module. If necessary a rollback of such a renaming can also be done with this module. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "tp.MarkDeprecated",
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
| New name pattern | `new-name` | Defines a pattern for the new names. %s is replaced with the old name |
| Revert the marking of deprecated objects | `rollback` | Reverts the marking of deprecated objects |
| Rename references | `references` | Also renames references to the marked objects |
| b4A object list contains old object names | `old-names` | On rollback this option controls if the old object names can be read from the b4A object list or if the names need to be calculated. |
| Unused only | `unused-only` | Marks only unused objects as deprecated |
| Folder for deprecated objects | `move-to` | If given the deprecated objects are moved to this folder |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
