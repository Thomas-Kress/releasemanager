---
name: b4a-pm-credentialstoragedownload
description: "This module downloads the credentials stored in a storage object and saves them to files. Based on the given storage object name, tenant- and environment-specific storage objects are included as well. A directory is created for each storage object, and a file is generated for each entry within it. Uses the b4A / best4Automic ReST API's pm.CredentialStorageDownload module. Use when the user wants to download credentials from storage in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Credential Storage: Download Credentials

This module downloads the credentials stored in a storage object and saves them to files. Based on the given storage object name, tenant- and environment-specific storage objects are included as well. A directory is created for each storage object, and a file is generated for each entry within it. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "pm.CredentialStorageDownload",
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
| Storage Object for Access Data | `credential-storage` | The storage object containing the credentials |
| Output Directory | `output-dir` | Found objects are written to files in the given directory |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
