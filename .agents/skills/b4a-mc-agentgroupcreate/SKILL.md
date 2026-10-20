---
name: b4a-mc-agentgroupcreate
description: "This module supports creating new and editing existing agent groups. For the platform 'CIT' it is possible to set the 'Solution'. Supported solutions are 'FTPAGENT', 'INFORMATICAAGENT', 'MAILAGENT', 'WEBSERVICEREST' and 'WEBSERVICESOAP'. Specifying 'All' or 'All active and inactive' as the mode, you need to specify the max number of parallel tasks. If the option is 'Limit maximum parallel tasks', the limit has to be set in the field 'Max. parallel tasks'. Uses the b4A / best4Automic ReST API's mc.AgentGroupCreate module. Use when the user wants to create agent group in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Agent group: Create

This module supports creating new and editing existing agent groups. For the platform 'CIT' it is possible to set the 'Solution'. Supported solutions are 'FTPAGENT', 'INFORMATICAAGENT', 'MAILAGENT', 'WEBSERVICEREST' and 'WEBSERVICESOAP'. Specifying 'All' or 'All active and inactive' as the mode, you need to specify the max number of parallel tasks. If the option is 'Limit maximum parallel tasks', the limit has to be set in the field 'Max. parallel tasks'. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.AgentGroupCreate",
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
| Name | `name` | Name of the Agent Group to be created or edited |
| Folder | `folder` | The agent group will be created in or moved into this folder |
| Title | `title` | Title of the Agent Group |
| Platform | `platform` | Choose the platform for this Agent Group. Possible values: BS2000 (BS2000), CIT (CIT), GCOS8 (GCOS8), JMX (JMX), MAIL (MAIL), MVS (MVS), NSK (NSK), OA (OA), OS400 (OS400), PS (PS), R3 (R3), SIEBEL (SIEBEL), SQL (SQL), UNIX (UNIX), VMS (VMS), WINDOWS (WINDOWS) |
| Solution | `solution` | Choose the solution for this CIT Agent Group. Possible values: FTPAGENT (FTPAGENT), INFORMATICAAGENT (INFORMATICAAGENT), MAILAGENT (MAILAGENT), WEBSERVICEREST (WEBSERVICEREST), WEBSERVICESOAP (WEBSERVICESOAP) |
| Mode | `mode` | defines the mode of the agent group. Possible values: any (any), first (first), next (next), load (load), all (all), All active and inactive (allIncludingInactive) |
| Parallel tasks | `parallel-tasks` | Defines how many tasks are allowed to run in parallel. Possible values: Unlimited (Unlimited), Limit parallel tasks (Limited), Suspend task processing (SuspendProcessing) |
| Max. parallel tasks | `max-parallel` | defines the number of max. parallel tasks. |
| Agents | `agents` | Define the agents to be added to this Agent Group |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
