---
name: b4a-mc-titlegenerate
description: "The title of objects is used to provide a short description of the functionality of objects. In newer versions of the Automation Engine the title of objects becomes more important as it is used in several situations in the AWI instead of the object name. To provide an automatically generated title for objects thsi module can be used. It can generate titles based on several object attributes. Uses the b4A / best4Automic ReST API's mc.TitleGenerate module (aliases: ObjectTitleGenerate). Use when the user wants to title generator object in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Object: Title Generator

The title of objects is used to provide a short description of the functionality of objects. In newer versions of the Automation Engine the title of objects becomes more important as it is used in several situations in the AWI instead of the object name. To provide an automatically generated title for objects thsi module can be used. It can generate titles based on several object attributes. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.TitleGenerate",
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
| Title pattern | `title-pattern` | Defines a pattern used to generate the new title |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
