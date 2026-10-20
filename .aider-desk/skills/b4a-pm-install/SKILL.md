---
name: b4a-pm-install
description: "Package archives created with the pm.Build module can be deployed to any tenant with this module. Installation unpacks the archive, checks for previous versions, removes old scheduled tasks, imports objects (restoring credentials and permissions), imports configuration variables, recalculates calendar objects, creates runtime variables, marks deprecated objects, adds custom metadata entries, and schedules new tasks. Uses the b4A / best4Automic ReST API's pm.Install module (aliases: Deploy, PackageDeploy, Install, pm.PackageInstall). Use when the user wants to install a package in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Package: Install

Package archives created with the pm.Build module can be deployed to any tenant with this module. Installation unpacks the archive, checks for previous versions, removes old scheduled tasks, imports objects (restoring credentials and permissions), imports configuration variables, recalculates calendar objects, creates runtime variables, marks deprecated objects, adds custom metadata entries, and schedules new tasks. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "pm.Install",
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
| Package Release File | `zip-file` | Absolute path to the package release file |
| Skip Configuration Objects Installation | `no-config` | Configuration objects are not installed; existing versions are kept |
| Force Connection Object Import | `force-import-conn` | Forces import of connection objects under certain conditions when they already exist |
| Custom Metadata Entries | `custom-metadata-entries` | List of additional metadata entries (key=value pairs) added to the package metadata variable |
| Credential Storage Object | `credential-storage` | Storage object containing credentials |
| Credential Source Connection | `credential-source` | Alternative b4A connection for the storage object with credentials |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
