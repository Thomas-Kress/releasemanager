---
name: b4a-tp-export
description: "The module uses the interface to export objects as XML files. It creates a XML file for each object and creates the folder structure from the Automic-System in the filesystem. Additionally links can be exported as well. Uses the b4A / best4Automic ReST API's tp.Export module (aliases: Export, ObjectExport). Use when the user wants to export object in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Object: Export

The module uses the interface to export objects as XML files. It creates a XML file for each object and creates the folder structure from the Automic-System in the filesystem. Additionally links can be exported as well. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "tp.Export",
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
| Output directory | `output-dir` | The found objects are written to files in the given directory |
| Store in client directory | `store-client` | If given the objects will be stored in a directory named after the source client |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
