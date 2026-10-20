"""Starts the dashboard API (b4A login + stored packages) on port 8000.

The React frontend (port 5173) proxies /api/* to this process.
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000)
