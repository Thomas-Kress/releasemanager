---
name: b4a-pm-dependencydefinitioncreate
description: "The module determines a package's dependencies and automatically generates a dependency definition from them. Generation can be influenced by specifying an operator and a base version. Uses the b4A / best4Automic ReST API's pm.DependencyDefinitionCreate module. Use when the user wants to create a package dependency definition in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Package: Create Dependency Definition

The module determines a package's dependencies and automatically generates a dependency definition from them. Generation can be influenced by specifying an operator and a base version. The default mode `overwrite` replaces any existing dependencies in the metadata variable entirely; `add` preserves pre-existing dependencies and only adds new ones for a package if a dependency with the given operator does not already exist. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "pm.DependencyDefinitionCreate",
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
| Package | `package` | Name of the package |
| Operator | `operator` | Operator for the dependency definition. Possible values: Approximately Equal (`~=`), Greater Than or Equal (`>=`) |
| Base-Version | `base-version` | Base version for the dependency definition. Possible values: Major (`major`), Minor (`minor`) |
| Mode | `mode` | Whether to add to or overwrite existing dependencies. Possible values: Add (`add`), Overwrite (`overwrite`) |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
