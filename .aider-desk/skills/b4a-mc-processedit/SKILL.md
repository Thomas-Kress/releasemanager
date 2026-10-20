---
name: b4a-mc-processedit
description: "A lot of objects contain processes, which may contain AE script or operating system code. In migration projects or while implementing new standards it might be necessary to do mass changes. This module can be used in four different modes to perform these changes. Uses the b4A / best4Automic ReST API's mc.ProcessEdit module (aliases: AmendProcess, ProcessEdit, ObjectProcessEdit). Use when the user wants to edit processes object in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Object: Edit Processes

A lot of objects contain processes, which may contain AE script or operating system code. In migration projects or while implementing new standards it might be necessary to do mass changes. This module can be used in four different modes to perform these changes. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.ProcessEdit",
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
| Process | `process` | Selects the processes to work on. Possible values: All (all), Pre-Script (pre), Script (process), !Script (event), Post-Script (post) |
| case-insensitive matching | `case-insensitive` | The regular expressions are matched case-insensitive |
| Mode | `mode` | Mode used to modify the processes. Possible values: Replace (REPLACE), Replace (Simple) (REPLACE_SIMPLE), Prepend (PREPEND), Append (APPEND) |
| List of patterns | `pattern-file` | List of patterns to search for |
| only in empty processes | `empty-only` | Only append/prepend text in empty processes |
| Text file | `text-file` | File containing the text to add in PREPEND and APPEND mode |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
