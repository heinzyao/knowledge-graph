"""
Entry point for the Excel Knowledge Graph server.

Usage:
    uv run python main.py [<data_folder>]

If <data_folder> is omitted, defaults to ./sample_data/
"""
from __future__ import annotations

import asyncio
import sys
import webbrowser
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from api import routes
from core.graph_builder import GraphBuilder
from core.watcher import FolderWatcher


# ------------------------------------------------------------------
# Data directory
# ------------------------------------------------------------------

def _resolve_data_dir() -> Path:
    if len(sys.argv) > 1:
        p = Path(sys.argv[1]).resolve()
        if not p.is_dir():
            print(f"[KG] Error: '{p}' is not a directory.")
            sys.exit(1)
        return p
    default = Path(__file__).parent / "sample_data"
    default.mkdir(exist_ok=True)
    return default.resolve()


DATA_DIR = _resolve_data_dir()

# ------------------------------------------------------------------
# Core services
# ------------------------------------------------------------------

builder = GraphBuilder(DATA_DIR)


async def _on_file_change(event_type: str, file_path: str) -> None:
    """Watchdog callback: incrementally update the graph and notify clients."""
    p = Path(file_path)
    try:
        rel = p.relative_to(DATA_DIR)
    except ValueError:
        return  # file outside data dir

    node_id = str(rel).replace("\\", "/")
    print(f"[KG] File {event_type}: {node_id}")

    if event_type == "deleted":
        builder.remove_node(node_id)
    else:
        builder.update_node(node_id)

    await routes.broadcast({"type": "update", "event": event_type, "node_id": node_id})


watcher = FolderWatcher(DATA_DIR, _on_file_change)

# ------------------------------------------------------------------
# FastAPI lifespan
# ------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"[KG] Scanning data directory: {DATA_DIR}")
    builder.build(include_implicit=True)
    print(f"[KG] Loaded {builder.node_count} node(s)")

    loop = asyncio.get_event_loop()
    watcher.start(loop)

    yield  # server is running

    watcher.stop()
    print("[KG] Shutdown complete.")


# ------------------------------------------------------------------
# App
# ------------------------------------------------------------------

app = FastAPI(title="Excel Knowledge Graph", lifespan=lifespan)

# Wire module-level globals in routes
routes.graph_builder = builder
routes.base_dir = DATA_DIR
routes.ws_connections = []

app.include_router(routes.router)

FRONTEND_DIR = Path(__file__).parent / "frontend"
app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")


@app.get("/")
async def index() -> FileResponse:
    return FileResponse(str(FRONTEND_DIR / "index.html"))


# ------------------------------------------------------------------
# Run
# ------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    print(f"[KG] Data directory : {DATA_DIR}")
    print(f"[KG] Opening        : http://localhost:8000")
    webbrowser.open("http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="warning")
