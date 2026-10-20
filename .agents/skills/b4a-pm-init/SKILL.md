---
name: b4a-pm-init
description: "This module creates a template structure for a new package, including the required directories and metadata variables. The subdirectories created and the metadata values assigned can be configured via entries in the pm.conf file. Uses the b4A / best4Automic ReST API's pm.Init module (aliases: TemplateCreate, pm.PackageTemplateCreate, pm.PackageInit). Use when the user wants to initialize a package in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Package: Initialize

This module creates a template structure for a new package, including the required directories and metadata variables. The subdirectories created and the metadata values assigned can be configured via entries in the `pm.conf` file. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "pm.Init",
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
| Overwrite existing Package | `overwrite` | Overwrites the base structure of an existing package |
| Custom values for metadata variables | `custom-metadata` | CSV file with custom values for metadata variables |
| Metadata Title | `metadata-title` | Title for the metadata variable |
| Base folder | `base-folder` | Base folder where the package should be initialized. Possible values: PACKAGES/BEST-BLU, PACKAGES/BEST4AUTOMIC, SYSTEM, INTERNAL, TEST_SUITE, TRASHPKG, DEMO, PACKAGES |
| Package Title | `package-title` | Title set at the package folder level |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
