---
name: b4a-te-breakpointrelease
description: "The module can release breakpoints of active workflows. The breakpoint to be released is defined by the task's name and the running number optionally. Uses the b4A / best4Automic ReST API's te.BreakpointRelease module (aliases: WorkflowReleaseBreakpoint). Use when the user wants to release breakpoint task in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Task: Release breakpoint

The module can release breakpoints of active workflows. The breakpoint to be released is defined by the task's name and the running number optionally. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "te.BreakpointRelease",
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
| Task | `task` | Name of the workflow task |
| Task number | `task-no` | Running number of the workflow task |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
