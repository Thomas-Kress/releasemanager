---
name: b4a-pm-index
description: "This module creates a package index containing a list of installed packages and their metadata, stored in an XML variable. By default the index supports around 1,000 b4A packages (limited by the 1 MB per-entry variable size, configurable via MAX_VARIABLE_SIZE in UC_SYSTEM_SETTINGS). The generated XML contains package name, version, description, folder location, dependencies, and custom metadata entries, and can be queried with XPath or AE script language. Uses the b4A / best4Automic ReST API's pm.Index module. Use when the user wants to build a package index in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Package: Build Index

This module creates a package index containing a list of installed packages and their metadata, stored in an XML variable. By default the index supports around 1,000 b4A packages (limited by the 1 MB per-entry variable size, configurable via `MAX_VARIABLE_SIZE` in `UC_SYSTEM_SETTINGS`). The generated XML contains package name, version, description, folder location, dependencies, and custom metadata entries, and can be queried with XPath or AE script language. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "pm.Index",
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
| Include index for base folders | `include-base-folders` | When enabled, also creates an index for configured base folders |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
