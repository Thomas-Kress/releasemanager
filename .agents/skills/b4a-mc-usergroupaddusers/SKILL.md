---
name: b4a-mc-usergroupaddusers
description: "The module adds users to a user group. The users can either be specified as a list of user name patterns or read from the members of a list of groups. Uses the b4A / best4Automic ReST API's mc.UserGroupAddUsers module. Use when the user wants to add users user group in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A User Group: Add Users

The module adds users to a user group. The users can either be specified as a list of user name patterns or read from the members of a list of groups. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.UserGroupAddUsers",
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
| User group | `group` | The name of the user group to change |
| Source | `source` | Defines the type of the source for users. If the users to add should be taken from other groups (group consolidation) or if a list of pattern of usernames should be added. Possible values: Users (user), Groups (group) |
| Username Patterns | `users` | A list of username patterns |
| User Groups | `groups` | A list of user group objects |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
