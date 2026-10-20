---
name: b4a-pm-importbpmn
description: "This module converts BPMN (Business Process Model and Notation) specifications into executable workflows, turning each task from the BPMN definition into a deployable object based on an Automation Engine template referenced in the BPMN definition. Uses the b4A / best4Automic ReST API's pm.ImportBPMN module (aliases: CreateBPMN, CreateFromBPMN, pm.PackageCreateBPMN). Use when the user wants to import a BPMN workflow into a package in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Package: Import BPMN

This module converts BPMN (Business Process Model and Notation) specifications into executable workflows, turning each task from the BPMN definition into a deployable object based on an Automation Engine template referenced in the BPMN definition. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "pm.ImportBPMN",
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
| Structured Documentation Object | `structured-docu` | Stores information in the object's structured documentation if given |
| Reset Structured Documentation | `structured-docu-reset` | Clears the object's structured documentation before writing new data |
| Structured Documentation Tab Name | `structured-docu-name` | Defines which documentation tab to use; defaults to the first tab if empty |
| Mode | `mode` | Operation mode. Possible values: Clone (`clone` — duplicates templates and writes input parameters as object variables), Action (`action` — uses templates as actions bound with the default PromptSet values) |
| Package | `package` | Name of the package |
| BPMN File | `bpmn-file` | Name of the BPMN specification file |
| Object Name Expression | `object-name-expression` | b4A Expression used to generate object names |
| Default Workflow Name | `default-workflow-name` | Fallback workflow name if the BPMN definition has no process name |
| Task State | `task-state` | Successor task status, e.g. `ENDED_OK`, `ENDED_NOT_OK`, `FAULT_NO_HOST` |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
