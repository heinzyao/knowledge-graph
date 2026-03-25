"""
File system watcher using watchdog.
Bridges watchdog's thread-based callbacks to asyncio coroutines.
"""
from __future__ import annotations

import asyncio
from collections.abc import Awaitable, Callable
from pathlib import Path

from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer


class _ExcelEventHandler(FileSystemEventHandler):
    def __init__(self, callback: Callable[[str, str], Awaitable[None]]) -> None:
        super().__init__()
        self._callback = callback
        self._loop: asyncio.AbstractEventLoop | None = None

    def set_loop(self, loop: asyncio.AbstractEventLoop) -> None:
        self._loop = loop

    def _dispatch_async(self, event_type: str, path: str) -> None:
        p = Path(path)
        if p.suffix.lower() != ".xlsx" or p.name.startswith("~$"):
            return
        if self._loop and self._loop.is_running():
            asyncio.run_coroutine_threadsafe(
                self._callback(event_type, path),
                self._loop,
            )

    def on_created(self, event) -> None:  # type: ignore[override]
        if not event.is_directory:
            self._dispatch_async("created", event.src_path)

    def on_modified(self, event) -> None:  # type: ignore[override]
        if not event.is_directory:
            self._dispatch_async("modified", event.src_path)

    def on_deleted(self, event) -> None:  # type: ignore[override]
        if not event.is_directory:
            self._dispatch_async("deleted", event.src_path)

    def on_moved(self, event) -> None:  # type: ignore[override]
        if not event.is_directory:
            self._dispatch_async("deleted", event.src_path)
            self._dispatch_async("created", event.dest_path)


class FolderWatcher:
    def __init__(
        self,
        folder: Path,
        callback: Callable[[str, str], Awaitable[None]],
    ) -> None:
        self.folder = folder
        self._handler = _ExcelEventHandler(callback)
        self._observer = Observer()

    def start(self, loop: asyncio.AbstractEventLoop) -> None:
        self._handler.set_loop(loop)
        self._observer.schedule(self._handler, str(self.folder), recursive=True)
        self._observer.start()

    def stop(self) -> None:
        self._observer.stop()
        self._observer.join()
