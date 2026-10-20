---
name: b4a-pm-requiredby
description: "This module checks all packages in a tenant to determine whether they depend on the given package. It reads all metadata in the tenant and searches the dependency definitions for references to the package. Uses the b4A / best4Automic ReST API's pm.RequiredBy module (aliases: DependencySearchReverse, pm.DependencySearchReverse). Use when the user wants to reverse search package dependencies in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Package: Dependency Search (Reverse)

This module checks all packages in a tenant to determine whether they depend on the given package. It reads all metadata in the tenant and searches the dependency definitions for references to the package. Results can be stored in a static variable and/or an XML variable; static variable columns contain the package name, dependency definition, complete dependency definition, and status comparison (`OK` or `WRONG_VERSION`). Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "pm.RequiredBy",
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
| Package | `package` | Name of the package |
| Version | `version` | Version of best4Automic |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
