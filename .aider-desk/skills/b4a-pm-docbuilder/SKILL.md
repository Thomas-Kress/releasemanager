---
name: b4a-pm-docbuilder
description: "This module generates documentation for package objects using customizable templates. Templates support HTML, Confluence Storage Format, Markdown, or SVG output. Template files or documentation objects are combined with object attributes using b4A Expressions. Uses the b4A / best4Automic ReST API's pm.DocBuilder module (aliases: DocumentationGenerate, pm.DocumentationGenerate, pm.PackageDocumentationGenerate). Use when the user wants to generate package documentation in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Package: Generate Documentation

This module generates documentation for package objects using customizable templates. Templates support HTML, Confluence Storage Format, Markdown, or SVG output. Template files or documentation objects are combined with object attributes using b4A Expressions. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "pm.DocBuilder",
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
| Package | `package` | Name of the package to document |
| Template Directory | `template-dir` | Directory containing template files |
| Template Variable | `template-vara` | Static variable mapping object types to documentation objects |
| Template Connection | `template-source` | Alternative b4A connection where the template variable can be found |
| Output Directory | `output-dir` | Directory for the generated documentation files |
| Output Variable | `output-vara` | Static variable storing the generated documentation |
| Output Encoding | `output-encoding` | Character encoding for output files (defaults to the JVM encoding) |
| Extended Usage Search | `extended-usage` | Locates references to executable objects and workflow tasks |
| Usage Search Level | `extended-usage-level` | Scope of the usage search. Possible values: `objects-and-tasks`, `objects-only` |
| Extended Usage (with Scripts) | `extended-usage-with-processes` | Includes script references in the usage search |
| Extended Workflow Attributes | `extended-workflow-attrs` | Provides task-level object attributes with an `object.` prefix |
| Extended PromptSet Details | `extended-promptset-attrs` | Supplies additional PromptSet field information |
| Replace b4A Expressions | `b4a-expression-docu` | Substitutes b4A Expressions found in text documentation |
| JSON String Conversion | `convert-to-json-string` | Forces the output into a JSON-compatible format |
| Custom Attributes File | `custom-attributes-file` | CSV file with custom attribute definitions |
| Custom Attributes | `custom-attributes` | List of b4A Expression attributes as key=value pairs |
| Index Template Name | `index-template-name` | Template name used for the package index generation |
| Object Types | `types` | Object types to document, e.g. `JOBS`, `JOBP`, `VARA`, `CONN` |
| Object Name Pattern | `name` | Regular expression filtering which objects to document |
| Subfolders | `sub-folder` | Restricts documentation to specific package subfolders |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
