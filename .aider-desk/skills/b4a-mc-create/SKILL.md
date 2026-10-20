---
name: b4a-mc-create
description: "This simple module allows to create objects. Optionally a title can be provided. To create the objects a folder and a template must be specified. Uses the b4A / best4Automic ReST API's mc.Create module (aliases: ObjectCreate). Use when the user wants to create object in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Object: Create

This simple module allows to create objects. Optionally a title can be provided. To create the objects a folder and a template must be specified. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.Create",
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
| Mode | `input-mode` | Defines the input mode. Possible values: Object (object), Variable (vara) |
| Object name | `name` | In object mode, the name of the object to be created and in vara mode, the vara object containing the object names. |
| Template | `template` | Template to use for the new object |
| Folder | `folder` | In this folder the new object will be created |
| Title | `title` | Title of the new object |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
