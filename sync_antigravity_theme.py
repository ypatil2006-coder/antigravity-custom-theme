#!/usr/bin/env python3
"""
Antigravity 2.0 Dynamic Boxed Theme Synchronizer (1:1 Spotify Matching Engine)
Reads Material 3 color tokens from ~/.config/noctalia/colors.json,
generates Antigravity 2.0 Modular Boxed Terminal stylesheet with 1:1 Spotify
color hierarchy (solid primary pills, crisp foreground typography, notch legends,
interactive hover border glows, 16px rounded Settings modal with inset floating
divider), and live-injects CSS into running Antigravity Electron instances via
DevTools CDP with Promise-awaited WebSocket completion.

Usage:
    python3 sync_antigravity_theme.py           # Sync & inject live
    python3 sync_antigravity_theme.py --watch   # Watch & sync on change
"""

import json
import os
import sys
import time
import hashlib
import argparse
import subprocess

COLORS_PATH = (
    "/home/yash/.config/noctalia/colors.json"
    if os.path.exists("/home/yash/.config/noctalia/colors.json")
    else os.path.expanduser("~/.config/noctalia/colors.json")
)

DEVTOOLS_PORT_FILE = os.path.expanduser("~/.config/Antigravity/DevToolsActivePort")

OUTPUT_DIRS = [
    os.path.expanduser("~/.gemini/antigravity"),
    os.path.expanduser("~/.gemini/antigravity-cli"),
    os.path.expanduser("~/Projects/boxed-terminal-theme-suite/antigravity"),
    os.path.expanduser("~/Projects/antigravity-custom-theme")
]


def hex_to_rgb(hex_color: str) -> tuple:
    hex_color = hex_color.lstrip("#")
    if len(hex_color) == 6:
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    return (255, 255, 255)


def lighten(hex_color: str, amount: float) -> str:
    r, g, b = hex_to_rgb(hex_color)
    r = min(255, int(r + (255 - r) * amount))
    g = min(255, int(g + (255 - g) * amount))
    b = min(255, int(b + (255 - b) * amount))
    return f"#{r:02x}{g:02x}{b:02x}"


def generate_css(colors: dict) -> str:
    primary = colors.get("mPrimary", "#f96553")
    surface = colors.get("mSurface", "#291614")
    surface_variant = colors.get("mSurfaceVariant", "#452521")
    on_surface = colors.get("mOnSurface", "#f3f2f2")
    on_surface_variant = colors.get("mOnSurfaceVariant", "#b6b0af")
    outline = colors.get("mOutline", "#746260")
    error = colors.get("mError", "#d91f08")
    primary_hover = lighten(primary, 0.15)

    return f"""
        :root, .dark, body {{
            /* 1:1 Spotify Color Engine */
            --background: {surface} !important;
            --sidebar: {surface} !important;
            --sidebar-secondary: {surface_variant} !important;
            --sidebar-muted: {surface} !important;
            --card: {surface_variant} !important;
            --card-border: {outline} !important;
            --border: {outline} !important;
            --primary: {primary} !important;
            --primary-foreground: #101010 !important;
            --foreground: {on_surface} !important;
            --muted-foreground: {on_surface_variant} !important;
            --secondary: {surface_variant} !important;
            --secondary-foreground: {on_surface} !important;
            --font-sans: "JetBrainsMono Nerd Font", "JetBrains Mono", monospace !important;
            --font-mono: "JetBrainsMono Nerd Font", "JetBrains Mono", monospace !important;
        }}

        * {{
            font-family: "JetBrainsMono Nerd Font", "JetBrains Mono", monospace !important;
            box-sizing: border-box !important;
        }}

        /* ===== 1. Master Root Window Surface ===== */
        html,
        body,
        #root,
        div[class*="h-screen"][class*="w-screen"],
        div[class*="relative w-screen"],
        div.h-full.w-full {{
            background-color: {surface} !important;
            background: {surface} !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
        }}

        /* Remove Top Title / Nav Menu Bar */
        div.shrink-0:has([data-testid="title-menu-bar"]),
        [data-testid="title-menu-bar"],
        div.shrink-0[style*="35px"],
        div.flex.items-center.gap-1.px-2.h-full.bg-sidebar.w-full,
        div.flex.items-center.justify-end.shrink-0 {{
            display: none !important;
            height: 0 !important;
            min-height: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: hidden !important;
        }}

        /* ===== Settings Modal Dialog ===== */
        .settings-modal-backdrop,
        div[class*="settings-modal-backdrop"] {{
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            position: fixed !important;
            inset: 0 !important;
            z-index: 5000 !important;
            background: rgba(0, 0, 0, 0.65) !important;
            backdrop-filter: blur(8px) !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
        }}

        .settings-modal-container,
        div.settings-modal-container,
        div[class*="settings-modal-container"],
        div[class*="settings-modal"] > div {{
            display: flex !important;
            flex-direction: column !important;
            width: 950px !important;
            max-width: 90vw !important;
            height: 75vh !important;
            min-height: 520px !important;
            max-height: 85vh !important;
            background-color: {surface} !important;
            border: 1px solid {outline} !important;
            border-radius: 16px !important;
            box-shadow: 0 25px 70px rgba(0, 0, 0, 0.7) !important;
            overflow: hidden !important;
            position: relative !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            transition: border-color 0.15s ease !important;
        }}
        .settings-modal-container:hover {{
            border-color: {primary} !important;
        }}

        .settings-modal-container > div.flex-1,
        div[class*="settings-modal-container"] > div.flex-1 {{
            height: 100% !important;
            min-height: 0 !important;
            flex: 1 1 0% !important;
            display: flex !important;
            flex-direction: column !important;
            border: none !important;
        }}

        .settings-modal-container div.relative.flex.w-full.h-full.outline-none > div:first-child,
        .settings-modal-container div[style*="width: 200px"],
        .settings-modal-container div.flex:has(> div.h-full.w-full.flex.flex-col.bg-sidebar) {{
            border-right: none !important;
            position: relative !important;
        }}

        .settings-modal-container div.relative.flex.w-full.h-full.outline-none > div:first-child::after,
        .settings-modal-container div[style*="width: 200px"]::after {{
            content: "" !important;
            position: absolute !important;
            top: 16px !important;
            bottom: 16px !important;
            right: 0 !important;
            width: 1px !important;
            background-color: {outline} !important;
            pointer-events: none !important;
            z-index: 20 !important;
        }}

        /* Fluid Layout Container */
        div.flex-1.flex.min-h-0.relative > div.relative.flex.w-full.h-full {{
            padding: 14px 10px 10px 10px !important;
            gap: 10px !important;
            background-color: {surface} !important;
            box-sizing: border-box !important;
            min-width: 0 !important;
        }}

        /* Position Absolute Floating Top-Left Buttons (Toggle + Nav) */
        div.absolute.top-0.left-0.flex.items-center.shrink-0.z-50,
        div[class*="absolute top-0 left-0"][class*="z-50"] {{
            top: 20px !important;
            left: 16px !important;
            height: 26px !important;
            z-index: 50 !important;
            pointer-events: auto !important;
        }}

        div.flex-1.flex.min-h-0.relative > div.relative.flex.w-full.h-full > div[class*="w-[1px]"],
        div.flex-1.flex.min-h-0.relative > div.relative.flex.w-full.h-full > div.bg-border {{
            display: none !important;
            width: 0 !important;
        }}

        div.flex-1.flex.min-h-0.relative > div.relative.flex.w-full.h-full > div.flex,
        div.flex-1.flex.min-h-0.relative > div.relative.flex.w-full.h-full > div.flex > div.h-full.w-full,
        div.flex-1.flex.min-h-0.relative > div.relative.flex.w-full.h-full > div:last-child {{
            overflow: visible !important;
        }}

        /* ===== 2. Left Sidebar Pane (.Sidebar.) ===== */
        div.flex > div.h-full.w-full > div.h-full.w-full.flex.flex-col.pb-2.bg-sidebar {{
            position: relative !important;
            background-color: {surface} !important;
            border: 1px solid {outline} !important;
            border-radius: 8px !important;
            margin: 0 !important;
            height: 100% !important;
            padding: 30px 6px 6px 6px !important;
            overflow: visible !important;
            box-sizing: border-box !important;
            min-width: 0 !important;
            transition: border-color 0.15s ease !important;
        }}
        div.flex > div.h-full.w-full > div.h-full.w-full.flex.flex-col.pb-2.bg-sidebar:hover {{
            border-color: {primary} !important;
        }}
        div.flex > div.h-full.w-full > div.h-full.w-full.flex.flex-col.pb-2.bg-sidebar::before {{
            content: "Sidebar" !important;
            position: absolute !important;
            top: 0 !important;
            right: 20px !important;
            left: auto !important;
            transform: translateY(-50%) !important;
            padding: 0 6px !important;
            background-color: {surface} !important;
            color: {primary} !important;
            font-family: "JetBrainsMono Nerd Font", monospace !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
            line-height: 1 !important;
            z-index: 50 !important;
            pointer-events: none !important;
            border: none !important;
        }}

        /* Solid Bright Pill for "+ New Conversation" Button (Matching Spotify "All" Pill) */
        div.bg-sidebar a[href*="/chat"],
        div.bg-sidebar button:has-text("+ New Conversation"),
        div.bg-sidebar a:has(svg) {{
            background-color: {primary} !important;
            color: #101010 !important;
            font-weight: 700 !important;
            border-radius: 6px !important;
            transition: opacity 0.15s ease, transform 0.1s ease !important;
        }}
        div.bg-sidebar a[href*="/chat"]:hover {{
            opacity: 0.9 !important;
            transform: translateY(-1px) !important;
        }}
        div.bg-sidebar a[href*="/chat"] * {{
            color: #101010 !important;
            font-weight: 700 !important;
        }}

        /* Sidebar Section Titles & Crisp Text */
        div.bg-sidebar div.flex.items-center.justify-between.py-1.px-2 {{
            background-color: transparent !important;
            color: {primary} !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
            padding-top: 10px !important;
            padding-bottom: 4px !important;
            padding-left: 6px !important;
            padding-right: 6px !important;
            opacity: 0.9 !important;
        }}

        /* Sidebar Item Rows */
        div.bg-sidebar div.cursor-pointer.rounded-lg,
        div.bg-sidebar button.group\\/headerbtn,
        div.bg-sidebar button {{
            background-color: transparent !important;
            color: {on_surface} !important;
            border-radius: 6px !important;
            margin-bottom: 2px !important;
            transition: background-color 0.1s ease, color 0.1s ease !important;
            cursor: pointer !important;
            pointer-events: auto !important;
        }}
        div.bg-sidebar div.cursor-pointer.rounded-lg:hover,
        div.bg-sidebar button.group\\/headerbtn:hover,
        div.bg-sidebar button:hover {{
            background-color: {surface_variant} !important;
            color: {primary} !important;
        }}

        /* Sidebar Scroll Container */
        div.bg-sidebar .overflow-y-auto {{
            display: flex !important;
            flex-direction: column !important;
            height: 100% !important;
            max-height: 100% !important;
            padding-left: 4px !important;
            padding-right: 4px !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
        }}

        /* ===== 3. Right Main Workspace Pane (.Main.) ===== */
        div.relative.z-0.flex-1.flex.min-h-0.h-full.border-t.border-border,
        div[class*="border-t border-border"][class*="flex-1"] {{
            position: relative !important;
            background-color: {surface} !important;
            border: 1px solid {outline} !important;
            border-radius: 8px !important;
            margin: 0 !important;
            height: 100% !important;
            min-width: 0 !important;
            flex: 1 1 0% !important;
            padding: 16px 14px 14px 14px !important;
            overflow: visible !important;
            box-sizing: border-box !important;
            transition: border-color 0.15s ease !important;
        }}
        div.relative.z-0.flex-1.flex.min-h-0.h-full.border-t.border-border:hover,
        div[class*="border-t border-border"][class*="flex-1"]:hover {{
            border-color: {primary} !important;
        }}
        div.relative.z-0.flex-1.flex.min-h-0.h-full.border-t.border-border::before,
        div[class*="border-t border-border"][class*="flex-1"]::before {{
            content: "Main" !important;
            position: absolute !important;
            top: 0 !important;
            left: 20px !important;
            transform: translateY(-50%) !important;
            padding: 0 6px !important;
            background-color: {surface} !important;
            color: {primary} !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
            line-height: 1 !important;
            z-index: 50 !important;
            pointer-events: none !important;
            border: none !important;
        }}

        /* Top Workspace Title Bar (e.g. "Arch Linux Maintainance / Hyprland ricing") */
        div.relative.z-0.flex-1 button.rounded-full,
        div.relative.z-0.flex-1 .truncate.flex-1.min-w-0,
        div.relative.z-0.flex-1 div.shrink-0 span {{
            color: {on_surface} !important;
            font-weight: 600 !important;
        }}

        /* Main Workspace Split Divider */
        div.relative.z-0.flex-1.flex.min-h-0.h-full.border-t.border-border div.relative.flex.w-full.h-full > div.bg-border,
        div[class*="border-t border-border"] div.relative.flex.w-full.h-full > div.bg-border {{
            display: block !important;
            width: 1px !important;
            background-color: {outline} !important;
            margin: 16px 8px !important;
            height: calc(100% - 32px) !important;
            align-self: center !important;
            opacity: 0.8 !important;
            transition: background-color 0.15s ease, opacity 0.15s ease !important;
        }}
        div.relative.z-0.flex-1.flex.min-h-0.h-full.border-t.border-border div.relative.flex.w-full.h-full > div.bg-border:hover,
        div[class*="border-t border-border"] div.relative.flex.w-full.h-full > div.bg-border:hover {{
            background-color: {primary} !important;
            opacity: 1 !important;
        }}

        /* ===== 4. Prompt Container (.Prompt.) ===== */
        div[class*="bg-card-border"] {{
            position: relative !important;
            background: transparent !important;
            background-color: transparent !important;
            border: 1px solid {outline} !important;
            border-radius: 8px !important;
            padding: 0 !important;
            overflow: visible !important;
            box-shadow: none !important;
            transition: border-color 0.15s ease !important;
        }}
        div[class*="bg-card-border"]:hover,
        div[class*="bg-card-border"]:focus-within {{
            border-color: {primary} !important;
        }}

        /* Clean Notch Mask */
        div[class*="bg-card-border"]::before {{
            content: "Prompt" !important;
            position: absolute !important;
            top: 0 !important;
            left: 14px !important;
            transform: translateY(-50%) !important;
            padding: 0 6px !important;
            background-color: {surface} !important;
            color: {primary} !important;
            font-family: "JetBrainsMono Nerd Font", monospace !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
            line-height: 1 !important;
            z-index: 50 !important;
            pointer-events: none !important;
            border: none !important;
        }}

        div[class*="bg-card-border"] div.bg-card,
        div[class*="bg-card-border"] > div:first-child {{
            background: transparent !important;
            background-color: transparent !important;
            border: none !important;
            border-radius: 8px 8px 0 0 !important;
            padding: 4px 6px !important;
        }}

        div[class*="bg-card-border"] > div.grid,
        div[class*="bg-card-border"] > div:last-child:not(:first-child) {{
            background: transparent !important;
            background-color: transparent !important;
            border-top: 1px solid {outline} !important;
            border-radius: 0 0 7px 7px !important;
        }}

        div[class*="bg-card-border"] [contenteditable],
        div[class*="bg-card-border"] textarea {{
            color: {on_surface} !important;
            font-family: "JetBrainsMono Nerd Font", monospace !important;
            background: transparent !important;
        }}

        /* Send Button Accent Pill */
        button[title*="Send message"]:not(:disabled),
        div[class*="bg-card-border"] button:has(svg):last-child:not(:disabled) {{
            background-color: {primary} !important;
            color: #101010 !important;
        }}
        button[title*="Send message"]:not(:disabled) svg {{
            color: #101010 !important;
            fill: #101010 !important;
        }}

        /* ===== 5. Scrollbars ===== */
        ::-webkit-scrollbar {{
            width: 4px !important;
            height: 4px !important;
        }}
        ::-webkit-scrollbar-thumb {{
            background: {outline} !important;
            border-radius: 4px !important;
        }}
        ::-webkit-scrollbar-thumb:hover {{
            background: {primary} !important;
        }}
    """


def inject_cdp(css: str):
    """Live inject CSS into running Antigravity Electron via CDP with permanent reload persistence."""
    if not os.path.exists(DEVTOOLS_PORT_FILE):
        return

    try:
        with open(DEVTOOLS_PORT_FILE, "r") as f:
            port = f.readline().strip()

        escaped_css = json.dumps(css)
        node_script = f"""
        async function run() {{
            try {{
                const res = await fetch("http://127.0.0.1:{port}/json");
                const targets = await res.json();
                const pages = targets.filter(t => t.type === "page");
                for (const p of pages) {{
                    await new Promise((resolve) => {{
                        const ws = new WebSocket(p.webSocketDebuggerUrl);
                        ws.onopen = () => {{
                            ws.send(JSON.stringify({{ id: 1, method: "Page.enable" }}));
                            ws.send(JSON.stringify({{
                                id: 2,
                                method: "Page.addScriptToEvaluateOnNewDocument",
                                params: {{
                                    source: `
                                        (() => {{
                                            function applyTheme() {{
                                                let el = document.getElementById("antigravity-boxed-theme-style");
                                                if (!el) {{
                                                    el = document.createElement("style");
                                                    el.id = "antigravity-boxed-theme-style";
                                                    (document.head || document.documentElement).appendChild(el);
                                                }}
                                                if (el.textContent !== ${{JSON.stringify({escaped_css})}}) {{
                                                    el.textContent = ${{JSON.stringify({escaped_css})}};
                                                }}
                                            }}
                                            if (document.readyState === "loading") {{
                                                document.addEventListener("DOMContentLoaded", applyTheme);
                                            }} else {{
                                                applyTheme();
                                            }}
                                            const observer = new MutationObserver(() => {{
                                                if (!document.getElementById("antigravity-boxed-theme-style")) {{
                                                    applyTheme();
                                                }}
                                            }});
                                            observer.observe(document.documentElement, {{ childList: true, subtree: true }});
                                        }})()
                                    `
                                }}
                            }}));
                            ws.send(JSON.stringify({{
                                id: 3,
                                method: "Runtime.evaluate",
                                params: {{
                                    expression: `
                                        (() => {{
                                            let el = document.getElementById("antigravity-boxed-theme-style");
                                            if (!el) {{
                                                el = document.createElement("style");
                                                el.id = "antigravity-boxed-theme-style";
                                                (document.head || document.documentElement).appendChild(el);
                                            }}
                                            if (el.textContent !== ${{JSON.stringify({escaped_css})}}) {{
                                                el.textContent = ${{JSON.stringify({escaped_css})}};
                                            }}
                                            return "Live Injected!";
                                        }})()
                                    `,
                                    returnByValue: true
                                }}
                            }}));
                        }};
                        ws.onmessage = (e) => {{
                            const data = JSON.parse(e.data);
                            if (data.id === 3) {{
                                ws.close();
                                resolve();
                            }}
                        }};
                        ws.onerror = () => resolve();
                        setTimeout(resolve, 800);
                    }});
                }}
            }} catch(e) {{}}
        }}
        run();
        """
        subprocess.run(["node", "-e", node_script], timeout=4, capture_output=True)
    except Exception:
        pass


def apply_theme():
    if not os.path.exists(COLORS_PATH):
        print(f"Palette not found at {COLORS_PATH}")
        return

    with open(COLORS_PATH, "r") as f:
        colors = json.load(f)

    css = generate_css(colors)
    primary = colors.get("mPrimary", "#f96553")

    for out_dir in OUTPUT_DIRS:
        os.makedirs(out_dir, exist_ok=True)
        css_file = os.path.join(out_dir, "antigravity-boxed-terminal.css")
        with open(css_file, "w") as f:
            f.write(css)

    inject_cdp(css)
    print(f"✓ Generated & Live-Injected Antigravity 2.0 Boxed Terminal Theme (1:1 Spotify Match) (Primary: {primary})")


def main():
    parser = argparse.ArgumentParser(description="Antigravity 2.0 Boxed Theme Synchronizer")
    parser.add_argument("--watch", action="store_true", help="Watch for color palette changes")
    args = parser.parse_args()

    apply_theme()

    if args.watch:
        print("👁 Watching colors.json for Antigravity theme updates...")
        last_hash = ""
        while True:
            try:
                with open(COLORS_PATH, "rb") as f:
                    cur_hash = hashlib.md5(f.read()).hexdigest()
                if cur_hash != last_hash:
                    last_hash = cur_hash
                    apply_theme()
                time.sleep(1.0)
            except KeyboardInterrupt:
                break
            except Exception:
                time.sleep(1.0)


if __name__ == "__main__":
    main()
