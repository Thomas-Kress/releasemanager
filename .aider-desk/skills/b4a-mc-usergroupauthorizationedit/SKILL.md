---
name: b4a-mc-usergroupauthorizationedit
description: "To edit group authorizations this module can be used. It supports actions like 'Add' or 'Remove' and 'Set' und reads the authorizations from a file in JSON format. Uses the b4A / best4Automic ReST API's mc.UserGroupAuthorizationEdit module. Use when the user wants to edit authorization user group in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A User group: Edit Authorization

To edit group authorizations this module can be used. It supports actions like 'Add' or 'Remove' and 'Set' und reads the authorizations from a file in JSON format. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.UserGroupAuthorizationEdit",
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
| Action | `action` | Defines the action to perform. Privileges cann be add, removed or set. Possible values: Add (add), Remove (remove), Set (set) |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
