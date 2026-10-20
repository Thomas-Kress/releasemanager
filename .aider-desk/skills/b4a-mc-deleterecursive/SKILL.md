---
name: b4a-mc-deleterecursive
description: "The module can be used to delete hugh amounts of objects in a folder structure. The restriction for the maximum number of object to be returned by a search are irrelevant for this module. Uses the b4A / best4Automic ReST API's mc.DeleteRecursive module (aliases: FolderDeleteRecursive, CleanUp, mc.CleanUp, ObjectCleanUp). Use when the user wants to delete recursive folder in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Folder: Delete Recursive

The module can be used to delete hugh amounts of objects in a folder structure. The restriction for the maximum number of object to be returned by a search are irrelevant for this module. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.DeleteRecursive",
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
| Test mode | `test-mode` | Activates a simulation mode |
| Folders | `folders` | A list of folders, that should be deleted |
| Also delete named folders | `include-named-folders` | The folders named in the list of folders to be deleted are also deleted. |
| recursive | `recursive` | Also deletes objects in sub-folders |
| Object name | `name` | Object names must match the given filter |
| Object Types | `types` | Object Types. Possible values: Calendar (CALE), Notification (CALL), RA-Solution (CITC), Client (CLNT), Code table (CODE), Connection (CONN), Cockpit (CPIT), Dashboard (DASH), Documentation (DOCU), Event (EVNT), Filter (FILTER), Agent (HOST), Host group (HOSTG), Agent/client assignment (HSTA), File transfer (JOBF), Job group (JOBG), Include (JOBI), Job (JOBS), Workflow (JOBP), RemoteTaskManager (JOBQ), Link (LINK), Login (LOGIN), Schedule (JSCH), Script (SCRI), Synchronization (SYNC), Time zone (TZ), User (USER), Group (USRG), Variable (VARA), Stylesheet (XSL), PromptSet (PRPT), Queue (QUEUE), Storage (STORE), Service Level Objective (SLO), Period (PERIOD) |
| Delete links only | `links-only` | If set only links to objects of the selected types will be deleted |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
