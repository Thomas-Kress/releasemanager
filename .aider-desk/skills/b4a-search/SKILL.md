---
name: b4a-search
description: Search for Automic objects (jobs, folders, connections, etc.) via the b4A / best4Automic ReST API's info.Search module. Use when the user wants to search for, find, or list objects in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill.
---

# b4A Object Search

Search Automic objects with module name `info.Search`. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "info.Search",
  "options": {
    "connection": "<connection>"
  }
}
```

Use the user-provided connection, or `$B4A_DEFAULT_CONNECTION` when none is given.

### Name filter

The search can be more specific by adding the name filter. If required, the name filter is added to the options item like shown in the example below. The name filter can have normal wildcards like the question mark (`?`) for exactly one character or the asterix (`*`) for multiple characters (as normally used). The name filter is optional and used only when requested.

```json
{
  "name": "info.Search",
  "options": {
    "connection": "connection",
    "name": "name filter"
  }
}
```

Other options also be possible but not discribed for the moment, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`. An empty report right after `COMPLETED` is not a failed search — re-fetch shortly after.
