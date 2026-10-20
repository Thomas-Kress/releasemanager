---
name: b4a-pm-dependencydefinitionverify
description: "This module validates the correctness of dependency definitions stored in metadata variables. It determines a package's actual dependencies and compares them against the stated definitions, flagging missing or superfluous dependencies as errors. Version comparisons can also be verified against packages installed in the tenant. Results are stored in variables. Uses the b4A / best4Automic ReST API's pm.DependencyDefinitionVerify module. Use when the user wants to verify a package dependency definition in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Package: Verify Dependency Definition

This module validates the correctness of dependency definitions stored in metadata variables. It determines a package's actual dependencies and compares them against the stated definitions, flagging missing or superfluous dependencies as errors. Version comparisons can also be verified against packages installed in the tenant. Results are stored in a static variable and/or an XML variable, with status values such as `OK`, `UNNECESSARY`, `NOT_INSTALLED`, `WRONG_VERSION`, or `MISSING`. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "pm.DependencyDefinitionVerify",
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

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
