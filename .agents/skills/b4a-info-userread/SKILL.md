---
name: b4a-info-userread
description: "The module can read user objects including group memberships. The data is stored in a file in CSV format. The same files can be used as input for the module mc.UserEdit. Uses the b4A / best4Automic ReST API's info.UserRead module (aliases: UserManageRead). Use when the user wants to read user in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A User: Read

The module can read user objects including group memberships. The data is stored in a file in CSV format. The same files can be used as input for the module mc.UserEdit. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "info.UserRead",
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
| Output file | `csv-file` | Filename of the output file in CSV format |
| show in tabular view | `cvs-show` | Additionally to the file in CSV format the result is shown in a table |
| CSV file mode | `csv-mode` | The mode 'overwrite' will overwrite existing files and the with 'append' the new data will be appended to existing files. Possible values: Overwrite (overwrite), Append (append) |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
