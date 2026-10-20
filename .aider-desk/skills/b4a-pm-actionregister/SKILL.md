---
name: b4a-pm-actionregister
description: "When adding new objects to workflows, users can choose between objects or actions. For actions from packages to be available in that selection, they must be registered beforehand. This module performs that registration. Uses the b4A / best4Automic ReST API's pm.ActionRegister module (aliases: ActionRegister, pm.PackageActionRegister). Use when the user wants to register a package action in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Package: Register Action

When adding new objects to workflows, users can choose between objects or actions. For actions from packages to be available in that selection, they must be registered beforehand. This module performs that registration. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "pm.ActionRegister",
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
| Package | `package` | Name of the package |
| Use Categories from Metadata | `use-categories` | When enabled, reads subfolders for registration from the metadata categories entry |
| Subfolder | `sub-folder` | When enabled, specifies a subfolder where the action should be registered |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
