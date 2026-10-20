---
name: b4a-info-documentationread
description: "The module reads the XML and also the text documentation of objects. It will be printed in the report of the module. Empty elements of the structured documentation will not be shown. Uses the b4A / best4Automic ReST API's info.DocumentationRead module (aliases: ObjectDocumentationRead). Use when the user wants to read documentation object in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Object: Read documentation

The module reads the XML and also the text documentation of objects. It will be printed in the report of the module. Empty elements of the structured documentation will not be shown. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "info.DocumentationRead",
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
| Type | `type` | Defines the documentation type. Possible values: Text (text), XML (xml) |
| XML node | `xml-node` | Path to the XML node |
| Pattern | `pattern` | A regular expression used as the anchor for the modes 'Before pattern', 'After pattern' and 'Replace pattern' |
| Support multiline matching | `multiline` | Activates the support for regular expressions matching multiple lines |
| show matched documentation fragment only | `matched-only` | If set just the matched part of the text documentation or XML node value is shown |
| Output directory | `output-dir` | The found objects are written to files in the given directory |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
