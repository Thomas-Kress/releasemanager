---
name: b4a-pm-repository
description: "This module manages a release repository for b4A Packages: initializing it, uploading and downloading releases, and listing packages and versions. It interfaces with available backend implementations, configured via a repository.json file. Supported backends are Filesystem (a directory with an index file) and Artifactory (via its REST API with Basic or AccessToken authentication). Uses the b4A / best4Automic ReST API's pm.Repository module. Use when the user wants to manage a package release repository in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Package Repository: Manage

This module manages a release repository for b4A Packages: initializing it, uploading and downloading releases, and listing packages and versions. It interfaces with available backend implementations, configured via a `repository.json` file. Supported backends are Filesystem (a directory with an index file) and Artifactory (via its REST API with Basic or AccessToken authentication). Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "pm.Repository",
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
| Operation | `operation` | Operation to execute. Possible values: Initialize (`init`), Upload (`upload`), Download (`download`), List Packages (`list-packages`), List Versions (`list-versions`) |
| Package | `package` | Name of the package |
| Version | `version` | Release version number |
| Upload File | `upload-file` | Release file to upload to the repository |
| Download File | `download-file` | Storage location for the downloaded release file |
| Repository Config File | `repository-config-file` | Path to the release repository configuration file |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
