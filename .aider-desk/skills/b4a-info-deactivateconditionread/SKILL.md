---
name: b4a-info-deactivateconditionread
description: "The object attributes for deactivation of tasks can be read with this module and stored in a file in CSV format. Uses the b4A / best4Automic ReST API's info.DeactivateConditionRead module (aliases: RunnableDeactivateConditionRead). Use when the user wants to read deactivation condition runnable in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Runnable: Read Deactivation Condition

The object attributes for deactivation of tasks can be read with this module and stored in a file in CSV format. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "info.DeactivateConditionRead",
  "options": {
    "connection": "<connection>"
  }
}
```

Use the user-provided connection, or `$B4A_DEFAULT_CONNECTION` when none is given.

This module takes no documented options beyond `connection`. Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
