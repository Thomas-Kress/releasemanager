---
name: b4a-info-versionmanagement
description: "The module reads the version management details of objects and stores these in a structured documentation. Uses the b4A / best4Automic ReST API's info.VersionManagement module (aliases: info.Versions). Use when the user wants to read versions object in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Object: Read Versions

The module reads the version management details of objects and stores these in a structured documentation. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "info.VersionManagement",
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
| Save b4A Object List | `save-objects` | Saves the processed objects in a b4A object file |
| Save b4A Object Variable | `save-objects-vara` | Saves the processed objects in the given variable object |
| Save objects processed successfully only | `save-success-only` | A object is only written to the file if the processing was successful |
| Append processed objects to existing file/variable | `save-append` | if the file/variable already exists the new objects will be appended |
| Object for structured documentation | `structured-docu` | If given the information are stored in the structured documentation of the object |
| Connection | `structured-docu-connection` | if given the object for the structured documentation is used in the given connection. Possible values: any configured b4A connection. |
| Name of structured documentation | `structured-docu-name` | Defines the name of the tab of the structured documentation that should be used. If empty the first one is chosen. |
| empty structured documentation first | `structured-docu-reset` | if set the structured documentation of the object is emptied first |
| XML Variable | `xml-variable` | name of the XML variable object used to store the information |
| XML Variable Source Connection | `xml-variable-source` | If given it defines an alternative b4A connection where to find the variable object. Possible values: any configured b4A connection. |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
