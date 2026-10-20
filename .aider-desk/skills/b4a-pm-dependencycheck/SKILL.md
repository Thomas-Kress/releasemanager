---
name: b4a-pm-dependencycheck
description: "This module validates whether a package's dependencies are satisfied in a target system. It accepts either a package archive or a package name together with dependency definitions; results are shown in the report and can optionally be stored in variable objects. Uses the b4A / best4Automic ReST API's pm.DependencyCheck module (aliases: DependencyCheck, pm.PackageDependencyCheck). Use when the user wants to check package dependencies in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Package: Check Dependencies

This module validates whether a package's dependencies are satisfied in a target system. It accepts either a package archive or a package name together with dependency definitions; results are shown in the report and can optionally be stored in variable objects. Results include five columns: counter, package name, operator, version requirement, and status (`OK`, `MISSING`, or `FAILED`). Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "pm.DependencyCheck",
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
| Variable Object | `variable` | Name of the variable object used to store the result data |
| Source Connection for Variable | `variable-source` | Alternative b4A connection where the variable can be found |
| XML Variable | `xml-variable` | Name of the XML variable object used to store the information |
| Key | `xml-variable-key` | Key within the XML variable object to use |
| Source Connection for XML Variable | `xml-variable-source` | Alternative b4A connection where the XML variable can be found |
| Mode | `mode` | Defines the data source. Possible values: Package Archive (`file`), Options (`option`) |
| Package | `package` | Name of the package to check |
| Dependency Definitions | `dependencies` | Dependency specifications for the package |
| Package Release File | `zip-file` | Absolute path to the package release archive |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
