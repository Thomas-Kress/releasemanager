"""Starts the server (API, webhook and UI) listening on port 8080."""

import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8080)
