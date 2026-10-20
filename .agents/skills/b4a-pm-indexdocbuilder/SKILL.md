---
name: b4a-pm-indexdocbuilder
description: "This module generates documentation for the package index using templates, similar to pm.DocBuilder. Output formats include HTML, Confluence Storage Format, Markdown, SVG, and other text-based formats, using b4A Expressions for data insertion, replacements, and function calls. Uses the b4A / best4Automic ReST API's pm.IndexDocBuilder module. Use when the user wants to generate package index documentation in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Package Index: Generate Documentation

This module generates documentation for the package index using templates, similar to pm.DocBuilder. Output formats include HTML, Confluence Storage Format, Markdown, SVG, and other text-based formats, using b4A Expressions for data insertion, replacements, and function calls. Available template attributes include `packages` (list), `base_folders` (list), and per-connection attributes such as base folder, package folder, name, description, version, metadata (key-value pairs), and dependencies (name, operator, version). Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "pm.IndexDocBuilder",
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
| Template File | `template-file` | Documentation template source |
| Output File | `output-file` | Destination path for the generated documentation |
| Output Character Encoding | `output-encoding` | Character encoding for output files (defaults to the JVM encoding) |
| Convert to JSON String | `convert-to-json-string` | Forces output conversion to a JSON-compatible string format |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
