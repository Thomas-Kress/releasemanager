---
name: b4a-login
description: Login with the b4A ReST API to receive an access token. Use when the user wants to create an access token for further b4A ReST API calls or when the user wants to login to Automic with the b4A ReST API. b4A and best4Automic are the same product, the b4A ReST API is the same as the best4Automic ReST API.
---

# b4A Login

Obtain a bearer token from `POST /login`. Use this skill before any other authenticated b4A ReST API call (including [b4a-search](../b4a-search/SKILL.md)).

## Prerequisites

A reachable B4A instance and a `.env` file at the project root (no trailing slash on the URL):

```
B4A_REST_API_URL=http://localhost:9081
B4A_REST_API_USERNAME=USER/DEPARTMENT
B4A_REST_API_PASSWORD=...
```

The password is often Automic-encrypted (starts with `--`). Pass it through unmodified; do not decode or re-encode it.

## Create a request to login

`POST {B4A_REST_API_URL}/login` with JSON body:

- `username` — the username (`B4A_REST_API_USERNAME`)
- `password` — the password (`B4A_REST_API_PASSWORD`)
- `language` — optional, defaults to `"en"`. `"de"` is also valid.

`/login` itself needs no `Authorization` header.

```http
POST /login
Content-Type: application/json

{
  "username": "USER/DEPARTMENT",
  "password": "pass",
  "language": "en"
}
```

```bash
curl -sS -D headers.txt -o body.json \
  -X POST "$B4A_REST_API_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$B4A_REST_API_USERNAME\",\"password\":\"$B4A_REST_API_PASSWORD\",\"language\":\"en\"}"
```

Always call the **full URL** (`$B4A_REST_API_URL/login`). Do not pass a leading-slash path as a standalone argument — Git Bash on Windows can rewrite it.

## Get the access token from the response header

The access token is returned in the `Authorization` response header. Store it for subsequent API calls.

Send it as a Bearer token:

```
Authorization: Bearer <token>
```

If the header value already starts with `Bearer `, use it as-is. Otherwise prefix `Bearer `. Almost every other endpoint returns `401` without this header — including `/version`.

## Get the expiration time from the response body

The expiration time is returned in the response body as `expires`. Store it if you need to refresh the token before it expires.

Example response body:

```json
{
  "roles": [
    {
      "name": "B4A.DEMO.USRG.ALLGEMEIN",
      "title": "Allgemein"
    }
  ],
  "user": {
    "username": "USERNAME/DEPARTMENT",
    "firstName": "Firstname",
    "lastName": "Lastname"
  },
  "emailAddress": "mail@example.com",
  "expires": "2026-08-21T19:33:41.000Z",
  "restRoles": ["INFO", "SERVICE", "MODULE", "ADMIN"]
}
```

A successful login is HTTP 200 with an `Authorization` header and an `expires` field. HTTP 401 means the credentials in `.env` are wrong or expired for this instance.

## Smoke check

Confirm the token against `GET {B4A_REST_API_URL}/version` before calling other paths. Guessed paths often return 401 rather than 404 even with a valid token — a 401 on an unfamiliar path does not necessarily mean login failed.
