---
name: b4a-info-agent
description: "The module reads information about the available agents of a client and saves the data in a file in CSV format. When the module is called in client 0 the access rights will be listet for each client. Uses the b4A / best4Automic ReST API's info.Agent module (aliases: AgentDescribe). Use when the user wants to describe agent in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Agent: Describe

The module reads information about the available agents of a client and saves the data in a file in CSV format. When the module is called in client 0 the access rights will be listet for each client. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "info.Agent",
  "options": {
    "connection": "<connection>"
  }
}
```

Use the user-provided connection, or `$B4A_DEFAULT_CONNECTION` when none is given.

This module takes no documented options beyond `connection`. Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
