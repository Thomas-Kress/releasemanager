---
name: b4a-pm-build
description: "This module generates a release archive from the current state of a package in a selected tenant. The archive can be deployed to any tenant with the pm.Install module. The generated ZIP archive contains three subdirectories: config (configuration variables in CSV format), runtime (runtime variables as empty files), and objects (exported objects in XML format). Tenant- and environment-specific configuration is organized into subdirectories named after the b4A connection or environment. Uses the b4A / best4Automic ReST API's pm.Build module (aliases: Build, pm.PackageBuild). Use when the user wants to build a package release in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Package: Build Release

This module generates a release archive from the current state of a package in a selected tenant. The archive can be deployed to any tenant with the pm.Install module. The generated ZIP archive contains three subdirectories: `config` (configuration variables in CSV format), `runtime` (runtime variables as empty files), and `objects` (exported objects in XML format). Tenant- and environment-specific configuration is organized into subdirectories named after the b4A connection or environment. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "pm.Build",
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
| Package Release File | `zip-file` | Absolute path to the package release file |
| Documentation Directory | `docu-dir` | Contents of the given directory are added to the package |
| Release Type | `release-type` | Automatically sets the version number per Semantic Versioning. Possible values: Major, Minor, Fix, Config, Undefined |
| Custom Metadata Entries | `custom-metadata-entries` | List of additional metadata entries (key=value pairs) added to the package metadata variable |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
