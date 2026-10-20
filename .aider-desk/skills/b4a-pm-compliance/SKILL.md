---
name: b4a-pm-compliance
description: "The module evaluates whether package objects adhere to a configurable set of rules using extensible tests covering coding guidelines, process design, and documentation standards. Results are stored in an XML variable, with each test keeping its own key in the result XML. Uses the b4A / best4Automic ReST API's pm.Compliance module. Use when the user wants to check package compliance in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Package: Check Compliance

The module evaluates whether package objects adhere to a configurable set of rules using extensible tests covering coding guidelines, process design, and documentation standards. Results are stored in an XML variable, with each test keeping its own key in the result XML. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "pm.Compliance",
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
| Package | `package` | Name of the package to evaluate |
| Tests | `tests` | Selected tests to execute during the compliance check (e.g. agent, configuration, task-alias, documentation, folders, includes, metadata, object-name, links, title, schedule-variables, SLO, static-varas, unique-title) |
| Test Configuration File | `test-config-file` | Path to a JSON configuration file for the compliance tests |
| XML Variable | `xml-variable` | Name of the XML variable object storing the test results |
| XML Variable Source Connection | `xml-variable-source` | Alternative b4A connection where the variable can be found |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
