---
name: b4a-pm-reportmodifications
description: "This module scans for modifications made to a tenant's packages since the last build. The last build date is taken from the metadata variable's timestamp, or from the metadata's last modification date if unavailable. Results are stored in the structured documentation of a designated object. Uses the b4A / best4Automic ReST API's pm.ReportModifications module (aliases: ReportModifications). Use when the user wants to report package modifications in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Package: Report Modifications

This module scans for modifications made to a tenant's packages since the last build. The last build date is taken from the metadata variable's timestamp, or from the metadata's last modification date if unavailable. Results are stored in the structured documentation of a designated object. For each modified object the report captures the object name, modification date, and user; with detailed output enabled it also provides before/after comparisons of object properties such as titles, archive terms, process definitions, agent settings, and job configuration. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "pm.ReportModifications",
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
| Output Object | `structured-docu` | Stores information in the object's structured documentation if given |
| Connection | `structured-docu-connection` | Alternative b4A connection for the structured documentation object |
| Documentation Tab Name | `structured-docu-name` | Tab name for the structured documentation; uses the first tab if empty |
| Reset Documentation | `structured-docu-reset` | Clears the object's structured documentation before processing |
| XML Variable | `xml-variable` | XML variable object used to store the modification information |
| Variable Source Connection | `xml-variable-source` | Alternative b4A connection where the variable can be found |
| Package Filter | `package` | Targets a specific package by name |
| Detailed Output | `detailed-output` | Enables detailed logging of object-level changes in the XML output |
| Exclude Packages | `exclude-packages` | Filters out packages matching the given patterns |
| Exclude Objects | `exclude-objects` | Filters out objects matching the given patterns |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
