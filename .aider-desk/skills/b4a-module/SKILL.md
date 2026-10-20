---
name: b4a-module
description: Run a b4A / best4Automic ReST API module job via POST /module, poll get_module until it finishes, then fetch get_report. Use when starting, checking, or reading any module (not only search). Requires a valid auth token from the b4a-login skill.
---

# b4A Module Endpoint

Start a module job with `POST /module`, poll until it completes, then fetch the report. Get a bearer token first with [b4a-login](../b4a-login/SKILL.md).

Job-specific payload (module `name` and extra `options`) lives in that job's skill — for object search see [b4a-search](../b4a-search/SKILL.md). This skill covers the shared `/module` lifecycle only.

Always use the **full URL** (`$B4A_REST_API_URL` + path). Nested paths like `/module/254` break if Git Bash rewrites a leading slash.

## Prerequisites

- A valid bearer token from [b4a-login](../b4a-login/SKILL.md)
- `.env` at the project root:

```
B4A_REST_API_URL=http://localhost:9081
B4A_REST_API_USERNAME=USER/DEPARTMENT
B4A_REST_API_PASSWORD=...
B4A_DEFAULT_CONNECTION=connection    # used when no connection is given
```

No trailing slash on the URL. `B4A_DEFAULT_CONNECTION` is required unless the user names a connection explicitly.

## Flow

1. Login and keep the bearer token (see [b4a-login](../b4a-login/SKILL.md)).
2. Start the module (`POST /module`) with the job `name` and `options` from that job's skill.
3. Poll `get_module` until `status` is no longer `INITIATED`.
4. Fetch `get_report`.

### 1. Start module

`POST {B4A_REST_API_URL}/module`

```http
POST /module
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "<module.name>",
  "options": {
    "connection": "<connection>"
  }
}
```

Replace `<module.name>` and any extra `options` with the values from the job-specific skill. Always include `connection` (user-provided or `$B4A_DEFAULT_CONNECTION`). Do not add options that skill does not describe.

```bash
curl -sS -X POST "$B4A_REST_API_URL/module" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"<module.name>\",\"options\":{\"connection\":\"$B4A_DEFAULT_CONNECTION\"}}"
```

Expected: HTTP 202, `status: "INITIATED"`, plus `_links.get_module` and `_links.get_report`.

Verified shape (id/timestamps differ per run):

```json
{
  "id": 254,
  "name": "<module.name>",
  "status": "INITIATED",
  "_links": {
    "get_module": { "href": "http://localhost:9081/module/254" },
    "get_report": { "href": "http://localhost:9081/module/254/report" }
  }
}
```

### 2. Poll status

GET `_links.get_module.href` with the same bearer token until `status` is no longer `INITIATED` (typically `COMPLETED`). Sleep briefly between polls.

```bash
curl -sS "$B4A_REST_API_URL/module/254" \
  -H "Authorization: Bearer $TOKEN"
```

When complete:

```json
{
  "id": 254,
  "status": "COMPLETED",
  "returnCode": 0,
  "errorMessage": "",
  "_links": {
    "get_report": { "href": "http://localhost:9081/module/254/report" },
    "delete_module": { "href": "http://localhost:9081/module/254/cleanup" }
  }
}
```

Inspect `returnCode` / `errorMessage` before treating the job as successful.

### 3. Fetch report

GET `_links.get_report.href` with the same bearer token.

```bash
curl -sS "$B4A_REST_API_URL/module/254/report" \
  -H "Authorization: Bearer $TOKEN"
```

The report body can be empty (`HTTP 200`, empty text) right after `status` flips to `COMPLETED`. Re-fetch shortly after; do not treat an empty report as a failed job.

## Gotchas

- **`/module` requires the same bearer token as everything else.** HTTP 401 here almost always means the token expired or login never succeeded — re-run [b4a-login](../b4a-login/SKILL.md). If login also 401s, credentials in `.env` are wrong or expired.
- **Do not use a double-slash path** (`//module/254`). Jetty rejects nested paths with `400 Ambiguous URI empty segment`. Use the full URL from `_links` or `$B4A_REST_API_URL/module/<id>`.

## Troubleshooting

| Symptom | Fix |
|---|---|
| No connection available | Pass a connection explicitly, or set `B4A_DEFAULT_CONNECTION` in `.env`. |
| `HTTP 400 Ambiguous URI empty segment` | The path was rewritten to `//module/...` — call the full URL with a single slash. |
| `HTTP 401` on `/module` | Token missing/expired, or credentials in `.env` are wrong — see [b4a-login](../b4a-login/SKILL.md). |
| Report is empty after `COMPLETED` | Re-fetch `get_report` after a short wait; check `returnCode` / `errorMessage` on `get_module`. |
