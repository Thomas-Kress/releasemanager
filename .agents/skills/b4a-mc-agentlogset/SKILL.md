---
name: b4a-mc-agentlogset
description: "Since version 8 of the UC4 Operations Manager some protocol information will not be written to the report (REP) anymore. Instead the information will be written to another report called agent log (PLOG). This report must be activated via an option. This module can activate and deactivate the option. Uses the b4A / best4Automic ReST API's mc.AgentLogSet module (aliases: JobAgentLogSet). Use when the user wants to set agent log job in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Job: Set Agent Log

Since version 8 of the UC4 Operations Manager some protocol information will not be written to the report (REP) anymore. Instead the information will be written to another report called agent log (PLOG). This report must be activated via an option. This module can activate and deactivate the option. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.AgentLogSet",
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
| Mode | `mode` | Defines if to activate or to deactivate the agent log. Possible values: Activate (activate), Deactivate (deactivate) |
| Job types | `job-types` | Job types that should be modified. Possible values: JMX-Job (JOBS_JMX), SAP-Job (JOBS_R3), SQL-Job (JOBS_SQL), RA-Job (JOBS_CIT) |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
