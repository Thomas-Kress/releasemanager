---
name: b4a-mc-documentationedit
description: "The module provides several possibilities to add or change the documentation of objects. All methods of modification can be applied the text and XML documentation. The new text is read from a file. Uses the b4A / best4Automic ReST API's mc.DocumentationEdit module (aliases: ObjectDocumentationEdit, mc.DocuEdit). Use when the user wants to edit documentation object in Automic through b4A. Run the job with the b4a-module skill; requires a valid auth token from the b4a-login skill."
---

# b4A Object: Edit documentation

The module provides several possibilities to add or change the documentation of objects. All methods of modification can be applied the text and XML documentation. The new text is read from a file. Start, poll, and fetch the report with [b4a-module](../b4a-module/SKILL.md). Get a bearer token first with [b4a-login](../b4a-login/SKILL.md) if no valid token is available.

## Prerequisites

Same as [b4a-module](../b4a-module/SKILL.md): bearer token, `.env` with `B4A_REST_API_URL`, and a connection (`B4A_DEFAULT_CONNECTION` or an explicit name).

## Payload

POST `/module` body for this job:

```json
{
  "name": "mc.DocumentationEdit",
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
| Type | `type` | Defines the documentation type. Possible values: Text (text), XML (xml) |
| Text | `docu` | Name of the file wiht the text to add |
| XML attributes | `xml-attributes` | Reads the text file as a list of attribute definitions. Such a file contains lines like <attribute>=<value> |
| Text node | `text-node` | defines the name of the text docu tab |
| XML node | `xml-node` | If the XML documentation is edited, than the XMl node must be specified as a path. Such a path must start with /<docu tab>/Content. The key <docu tab> is to be replaced by the name of the tab of the structured documentation. Elements of such a path may contain indexes in square brackets as known from XPath definitions (/Details/Content/Test[3]/b4A[2]/Docu). |
| Create XML node | `create-node` | If the XML node does not exist it will be created |
| Mode | `mode` | Defines the mode of operation meaning how to add the text or to show the documentation. Possible values: prepend (prepend), append (append), overwrite (overwrite), before (before), after (after), replace (replace) |
| Pattern | `pattern` | A regular expression used as the anchor for the modes 'Before pattern', 'After pattern' and 'Replace pattern' |

Other options may also be possible but are not documented here, so do not use them.

## Run

Follow [b4a-module](../b4a-module/SKILL.md): POST this payload, poll `get_module` until not `INITIATED`, then GET `get_report`.
