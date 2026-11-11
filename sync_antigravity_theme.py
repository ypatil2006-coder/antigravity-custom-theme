#!/usr/bin/env python3
"""
Antigravity 2.0 MLH Hackathon Comic Neubrutalism Theme Synchronizer
Injects the master antigravity-boxed-terminal.css into all active Antigravity Electron instances.
"""

import asyncio
import json
import os
import glob
from pathlib import Path

CSS_PATH = "/home/yash/Projects/antigravity-custom-theme/antigravity-boxed-terminal.css"

def find_all_ports():
    ports = set()
    candidate_files = [
        "/tmp/antigravity-cdp-port"
    ]
    base_profiles = Path("/home/yash/.config/Antigravity-Profiles")
    if base_profiles.exists():
        for p in base_profiles.glob("*/DevToolsActivePort"):
            candidate_files.append(str(p))
    for f in candidate_files:
        if os.path.exists(f):
            try:
                with open(f, "r") as pf:
                    val = pf.readline().strip()
                    if val.isdigit():
                        ports.add(int(val))
            except Exception:
                pass
    return sorted(ports)

async def inject_into_port(port, css):
    import urllib.request
    import websockets
    try:
        req = urllib.request.Request(f"http://127.0.0.1:{port}/json/list")
        with urllib.request.urlopen(req, timeout=1.5) as resp:
            targets = json.loads(resp.read().decode())
    except Exception as e:
        return

    for t in targets:
        ws_url = t.get("webSocketDebuggerUrl")
        if not ws_url or t.get("type") != "page":
            continue
        try:
            async with websockets.connect(ws_url, open_timeout=2) as ws:
                inject_js = f"""(() => {{
                    let style = document.getElementById("antigravity-panel-blitz-theme");
                    if (!style) {{
                        style = document.createElement("style");
                        style.id = "antigravity-panel-blitz-theme";
                        document.head.appendChild(style);
                    }}
                    style.textContent = {json.dumps(css)};
                    return true;
                }})()"""
                await ws.send(json.dumps({
                    "id": 1,
                    "method": "Runtime.evaluate",
                    "params": {"expression": inject_js, "returnByValue": True}
                }))
                await ws.recv()
                print(f"[+] Injected into {t.get('title', 'page')} (port {port})")
        except Exception as e:
            pass

async def main():
    if not os.path.exists(CSS_PATH):
        print("CSS file not found:", CSS_PATH)
        return
    with open(CSS_PATH) as f:
        css = f.read()

    ports = find_all_ports()
    print("Found active CDP ports:", ports)
    for p in ports:
        await inject_into_port(p, css)

if __name__ == "__main__":
    asyncio.run(main())
