---
name: b4a-te-read
description: "The module searches for activities, that can be filtered by several criteria. Additionally the activities found can be stored in a file, which can be used as an exclude list for further runs of the module. Uses the b4A / best4Automic ReST API's te.Read module (aliases: ActivityRead). Use when the user wants to read task in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Task: Read

The module searches for activities, that can be filtered by several criteria. Additionally the activities found can be stored in a file, which can be used as an exclude list for further runs of the module. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "te.Read",
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
| Cache found objects | `cache` | activates the usage of a cache |
| Cache size | `cache-size` | defines the maximum number of elements stored in the cache |
| Cache file | `cache-file` | filename for the cache used to remember already listed activities |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
