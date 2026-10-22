# Automic Release Manager

A small web app for planning releases of packages that are announced by Automic systems.

- **Webhook backend** (FastAPI, port 8080): receives package announcements and stores them in SQLite.
- **Dashboard API** (FastAPI, port 8000): serves packages, releases, release logs and connections to the frontend.
- **Frontend** (React + Material UI, Vite, port 5173): Dashboard, Packages, Releases and Environments pages.

Data is stored in `data/releasemanager.db` (SQLite). Set `RELEASEMANAGER_DB` to use another file, for example for tests.

## Prerequisites

- Python 3.13
- Node.js (current LTS) and npm

## Setup

From the project root:

```powershell
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
cd frontend
npm install
```

## Configuration

Settings are read from a `.env` file in the project root (not committed). All of them are optional.

| Variable | Purpose | Default |
| --- | --- | --- |
| `WEBHOOK_PORT` | Port of the webhook backend | `8080` |
| `WEBHOOK_TOKEN` | If set, webhook calls must send this token | none |
| `RELEASEMANAGER_DB` | Path of the SQLite file | `data/releasemanager.db` |
| `B4A_REST_API_URL`, `B4A_REST_API_USERNAME`, `B4A_REST_API_PASSWORD` | b4A ReST API login. If none is set, login and token handling are switched off ("informational mode") | none |
| `VITE_CLERK_ACTIVE` | `true` shows the Clerk sign-in in the frontend | `false` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key, needed when Clerk is active | none |

Only variables starting with `VITE_` reach the browser. Never put secrets behind that prefix. Restart the Vite dev server after changing `.env`.

## Running

Start the three parts in separate terminals, from the project root.

```powershell
# 1. Webhook backend (port from WEBHOOK_PORT, default 8080)
.venv\Scripts\python.exe run_webhook.py

# 2. Dashboard API (port 8000)
.venv\Scripts\python.exe run_api.py

# 3. Frontend (port 5173)
cd frontend
npm run dev
```

Open <http://localhost:5173>. The frontend proxies `/api` to the dashboard API on port 8000, so that has to be running as well.
Restart the API after changing Python code; the Vite dev server reloads the frontend by itself.

## Webhook

Automic systems announce packages with a `POST` to the webhook backend:

```bash
curl -X POST http://localhost:8080/webhook/packages \
  -H "Content-Type: application/json" \
  -d '{"packageName": "PKG.A", "source": "AE24-1200", "version": "1.2.4"}'
```

- Returns `202 Accepted` and stores the package.
- If `WEBHOOK_TOKEN` is set, add `Authorization: Bearer <token>` or `X-Webhook-Token: <token>`. Otherwise the call is answered with `401`.
- Health check: `GET http://localhost:8080/webhook/health` returns `200` when the backend and its database are healthy, `503` otherwise.
- The webhook backend listens on all interfaces. Allow its port in the firewall if senders run on other machines. The dashboard API only listens on `127.0.0.1`.

## Using the app

- **Environments:** define connections (a unique name and an optional description) under Development, Test or Production. A name can only be defined once across all sections.
- **Packages:** shows every received package, whatever its source. Packages from a defined Development connection can be assigned to a release that is not closed. Packages that are not assigned to a release can be deleted.
- **Releases:** create releases (name required; description and dates optional) with the status Planned, Active or Closed. Moving a release from Planned to Active sets the start date to today if none is set. Click a release for its details and the full activity log. The description can only be edited while the release is Planned. Closed releases also lock their packages and dates.
- **Test:** lists every package name and version and its test cases. Entries without a test case are shown in light magenta. A test case has a name, an optional description and optional Cucumber steps. The steps are chosen from the step definitions in `input/cucumber.conf` (optional, read on every request; built-in defaults are used when the file does not exist) and are stored as a Gherkin scenario; click a test case to see it.
- **Dashboard:** overview of packages, releases and environments, including a notice for packages from non-Development connections.

## Building the frontend

```powershell
cd frontend
npm run build
```
