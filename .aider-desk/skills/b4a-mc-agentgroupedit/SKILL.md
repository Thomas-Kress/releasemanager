---
name: b4a-mc-agentgroupedit
description: "This module supports setting the mode of the agent groups. For the mode First it is possible to define the agent that should be at the top of the list. Uses the b4A / best4Automic ReST API's mc.AgentGroupEdit module (aliases: HostGroupEdit). Use when the user wants to edit agent group in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Agent Group: Edit

This module supports setting the mode of the agent groups. For the mode First it is possible to define the agent that should be at the top of the list. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.AgentGroupEdit",
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
| Mode | `mode` | defines the mode of the agent group. Possible values: any (any), first (first), next (next), load (load), all (all), All active and inactive (allIncludingInactive) |
| First Agent | `first-agent` | defines the first agent in the list. This is might be usful in mode 'First'. |
| Last Agent | `last-agent` | defines the last agent in the list and can be used with mode 'First' |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
