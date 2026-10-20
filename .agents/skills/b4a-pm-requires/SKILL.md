---
name: b4a-pm-requires
description: "This module searches a package's objects for references to objects in other packages, scanning both object attributes and scripts. The discovered package references are written to a variable object. Uses the b4A / best4Automic ReST API's pm.Requires module (aliases: pm.DependencySearch, DependencySearch, pm.PackageDependencySearch). Use when the user wants to search package dependencies in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Package: Dependency Search

This module searches a package's objects for references to objects in other packages, scanning both object attributes and scripts. The discovered package references are written to a variable object — as key-value pairs in a static variable, or as structured XML listing package dependencies hierarchically. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "pm.Requires",
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
| Variable Object | `variable` | Name of the variable object used to store the data |
| Source Connection for Variable | `variable-source` | Alternative b4A connection where the variable can be found |
| XML Variable | `xml-variable` | Name of the XML variable object used to store the information |
| Key | `xml-variable-key` | Key within the XML variable object to use |
| Source Connection for XML Variable | `xml-variable-source` | Alternative b4A connection where the XML variable can be found |
| Package | `package` | Name of the package to analyze |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
