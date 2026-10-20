---
name: b4a-pm-reportinstallation
description: "This module generates a report of all packages installed in a tenant, storing it in the structured documentation of an object. For each installed package the report includes the package name, version number, release creation timestamp, installation timestamp, and dependency definition. Uses the b4A / best4Automic ReST API's pm.ReportInstallation module (aliases: ReportInstallation). Use when the user wants to report package installations in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Package: Report Installation

This module generates a report of all packages installed in a tenant, storing it in the structured documentation of an object. For each installed package the report includes the package name, version number, release creation timestamp, installation timestamp, and dependency definition. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "pm.ReportInstallation",
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
| Object for structured documentation | `structured-docu` | Stores information in the object's structured documentation if given |
| Connection | `structured-docu-connection` | Uses the structured documentation object in the given connection |
| Structured documentation name | `structured-docu-name` | Tab name for the structured documentation; uses the first tab if empty |
| Clear structured documentation | `structured-docu-reset` | Clears the object's structured documentation before storing the report |
| XML variable | `xml-variable` | XML variable object used to store the report information |
| Key | `xml-variable-key` | Key within the XML variable object to use |
| Source connection for variable | `xml-variable-source` | Alternative b4A connection where the variable can be found |
| Exclude packages | `exclude-packages` | Excludes packages matching the given patterns from the report |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
