---
name: b4a-mc-usergroupprivilegeedit
description: "To edit group privileges this module can be used. If privileges already have the required state it will not be touched when the action is 'Add' or 'Remove'. The action 'Set' will remove all privileges and afterwards set the selected. Uses the b4A / best4Automic ReST API's mc.UserGroupPrivilegeEdit module. Use when the user wants to edit privileges user group in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A User group: Edit Privileges

To edit group privileges this module can be used. If privileges already have the required state it will not be touched when the action is 'Add' or 'Remove'. The action 'Set' will remove all privileges and afterwards set the selected. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.UserGroupPrivilegeEdit",
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
| Action | `action` | Defines the action to perform. Privileges cann be add, removed or set. Possible values: Add (add), Remove (remove), Set (set) |
| Privileges (Access to Explorer Folders) | `priv-folders` | Defines privileges for access to special folders. Possible values: No folder (no-folder), Recycle bin (recycle-bin), Transport case (transport-case), Version management (version-management) |
| Privileges (Administration) | `priv-admin` | Defines privileges for administration tasks. Possible values: Change system status (STOP/GO) (system-stop-go), Create diagnostic information (create-diagnostic), Perform system updates (system-upgrade), FileEvents: execute without specifying a Login object (fileevent-without-login), FileTransfer: execute without specifying a Login object (filetransfer-without-login), ILM actions (ilm-actions), Manage favorites at group level (favorite-groups), SAP criteria manager (sap-criteria-manager) |
| Privileges (AWI Access Control) | `priv-awi` | Defines privileges for AWI access controls. Possible values: Administration (admin), Analytics (analytics), Analytics for all clients (analytics-all), Dashboard (dashboard), Messages (messsage), Process Assembly (assembly), Process Monitoring (monitoring), Service Catalog (service-catalog) |
| Privileges (Advanced Editing) | `priv-edit` | Defines privileges for advanced editing. Possible values: Create and modify backend variable (backend-variable), Object properties: manually reset the Opened flag (open-reset), Create and modify SQL-internal variables (sqli-variable) |
| Privileges (View Messages) | `priv-messages` | Defines privileges for viewing messages. Possible values: View administrator messages (admin), View all messages of one's own client (all-clients), View messages of one's own user group (group), View security messages (security), Create memory dump (mem-dump) |
| Privileges (Access Control) | `priv-access` | Defines privileges for access control. Possible values: Access to auto-forecast (auto-forecast), Access to deactivated tasks (deactivated-tasks), Access to system overview (system-overview), Grant permissions at object level (auth-object), Login via CallAPI (callapi), Manually modify the status of a task (status-manual), Take over activity (take-over), View server load across all clients (usage), Access to the metrics endpoint of the Automic REST API (restapi-metrics) |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
