#!/usr/bin/env python3
"""
Antigravity 2.0 Dynamic Boxed Theme Synchronizer (In-App Frosted Glass Engine)
Reads Material 3 color tokens from ~/.config/noctalia/colors.json,
generates Antigravity 2.0 Modular Boxed Terminal stylesheet with in-app
frosted glass surfaces (rgba(surface, 0.38) + blur(14px)), CDP native
transparent backing override (no Hyprland window rule required), seamless
cutout legends (Sidebar, Main, Prompt), bright primary borders matching Kitty
and Spotify, high-contrast typography, 16px rounded Settings modal with inset
floating divider, compact sidebar proportions, fluid flex layout, and live-injects
CSS into running Antigravity Electron instances via DevTools CDP with Promise-awaited
WebSocket completion.

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
    primary = colors.get("mPrimary", "#f5f0c9")
    surface = colors.get("mSurface", "#292714")
    surface_variant = colors.get("mSurfaceVariant", "#452521")
    on_surface = colors.get("mOnSurface", "#f3f3f2")
    on_surface_variant = colors.get("mOnSurfaceVariant", "#b6b0af")
    outline = colors.get("mOutline", "#72705d")
    error = colors.get("mError", "#fd4663")
    primary_hover = lighten(primary, 0.15)
    r, g, b = hex_to_rgb(surface)
    surface_rgb = f"{r}, {g}, {b}"

    return f"""
        :root, .dark, body {{
            /* In-App Pure Glass Color Engine */
            --background: {surface} !important;
            --sidebar: {surface} !important;
            --sidebar-secondary: {surface_variant} !important;
            --sidebar-muted: {surface} !important;
            --card: {surface_variant} !important;
            --card-border: {primary} !important;
            --border: {primary} !important;
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

        /* ===== 1. Master Root Window Surface (In-App Transparent Canvas) ===== */
        html,
        body,
        #root,
        div[class*="h-screen"][class*="w-screen"],
        div[class*="relative w-screen"],
        div.h-full.w-full {{
            background-color: transparent !important;
            background: transparent !important;
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
            background-color: rgba({surface_rgb}, 0.75) !important;
            backdrop-filter: blur(16px) !important;
            border: 1px solid {primary} !important;
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
            border-color: {primary_hover} !important;
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
            background-color: {primary} !important;
            opacity: 0.6 !important;
            pointer-events: none !important;
            z-index: 20 !important;
        }}

        /* Fluid Layout Container */
        div.flex-1.flex.min-h-0.relative > div.relative.flex.w-full.h-full {{
            padding: 14px 10px 10px 10px !important;
            gap: 10px !important;
            background-color: transparent !important;
            background: transparent !important;
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
            background-color: rgba({surface_rgb}, 0.38) !important;
            backdrop-filter: blur(14px) !important;
            border: 1px solid {primary} !important;
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
            border-color: {primary_hover} !important;
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

        /* When Sidebar is Collapsed */
        div.flex[style*="width: 0px"] > div > div.bg-sidebar,
        div.flex[style*="width: 0%"] > div > div.bg-sidebar,
        div.flex[style*="display: none"] > div > div.bg-sidebar,
        div.bg-sidebar[style*="width: 0px"],
        div.bg-sidebar:empty {{
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            display: none !important;
        }}
        div.flex[style*="width: 0px"] > div > div.bg-sidebar::before,
        div.flex[style*="width: 0%"] > div > div.bg-sidebar::before,
        div.bg-sidebar[style*="width: 0px"]::before {{
            display: none !important;
            content: none !important;
        }}

        /* Inner Sidebar Resets */
        div.bg-sidebar div:not(.settings-modal-container *),
        div.bg-sidebar section:not(.settings-modal-container *),
        div.bg-sidebar button:not(.settings-modal-container *),
        div.bg-sidebar a:not(.settings-modal-container *) {{
            border: none !important;
        }}
        div.bg-sidebar div::before,
        div.bg-sidebar section::before {{
            content: none !important;
        }}
        div.flex > div.h-full.w-full > div.h-full.w-full.flex.flex-col.pb-2.bg-sidebar::before {{
            content: "Sidebar" !important;
        }}

        /* Sidebar Section Titles */
        div.bg-sidebar div.flex.items-center.justify-between.py-1.px-2 {{
            background-color: transparent !important;
            color: {on_surface_variant} !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
            padding-top: 10px !important;
            padding-bottom: 4px !important;
            padding-left: 6px !important;
            padding-right: 6px !important;
            opacity: 0.85 !important;
        }}

        /* Sidebar Item Rows & High-Contrast Typography */
        div.bg-sidebar div.cursor-pointer.rounded-lg,
        div.bg-sidebar button.group\\/headerbtn,
        div.bg-sidebar button {{
            background-color: transparent !important;
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
        }}

        div.bg-sidebar .truncate,
        div.bg-sidebar span,
        div.bg-sidebar a {{
            color: {on_surface} !important;
            opacity: 0.95 !important;
        }}
        div.bg-sidebar span.text-xs {{
            color: {on_surface_variant} !important;
            opacity: 0.75 !important;
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
            background-color: rgba({surface_rgb}, 0.38) !important;
            backdrop-filter: blur(14px) !important;
            border: 1px solid {primary} !important;
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
            border-color: {primary_hover} !important;
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

        /* Workspace Header Title Typography */
        div.relative.z-0.flex-1 button.rounded-full span,
        div.relative.z-0.flex-1 .truncate {{
            color: {on_surface} !important;
            opacity: 0.95 !important;
        }}

        /* Main Workspace Split Divider */
        div.relative.z-0.flex-1.flex.min-h-0.h-full.border-t.border-border div.relative.flex.w-full.h-full > div.bg-border,
        div[class*="border-t border-border"] div.relative.flex.w-full.h-full > div.bg-border {{
            display: block !important;
            width: 1px !important;
            background-color: {primary} !important;
            opacity: 0.6 !important;
            margin: 16px 8px !important;
            height: calc(100% - 32px) !important;
            align-self: center !important;
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
            border: 1px solid {primary} !important;
            border-radius: 8px !important;
            padding: 0 !important;
            overflow: visible !important;
            box-shadow: none !important;
            transition: border-color 0.15s ease !important;
        }}
        div[class*="bg-card-border"]:hover,
        div[class*="bg-card-border"]:focus-within {{
            border-color: {primary_hover} !important;
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
            border-top: 1px solid {primary} !important;
            opacity: 0.8 !important;
            border-radius: 0 0 7px 7px !important;
        }}

        div[class*="bg-card-border"] [contenteditable],
        div[class*="bg-card-border"] textarea {{
            color: {on_surface} !important;
            font-family: "JetBrainsMono Nerd Font", monospace !important;
            background: transparent !important;
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
    """Live inject CSS into running Antigravity Electron via CDP with in-app transparent backing."""
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
                                method: "Emulation.setDefaultBackgroundColorOverride",
                                params: {{
                                    color: {{ r: 0, g: 0, b: 0, a: 0 }}
                                }}
                            }}));
                            ws.send(JSON.stringify({{
                                id: 3,
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
                                                el.textContent = ${{JSON.stringify({escaped_css})}};
                                            }}
                                            if (document.readyState === "loading") {{
                                                document.addEventListener("DOMContentLoaded", applyTheme);
                                            }} else {{
                                                applyTheme();
                                            }}
                                            const observer = new MutationObserver(() => {{
                                                let el = document.getElementById("antigravity-boxed-theme-style");
                                                if (!el || el.textContent !== ${{JSON.stringify({escaped_css})}}) {{
                                                    applyTheme();
                                                }}
                                            }});
                                            observer.observe(document.documentElement, {{ childList: true, subtree: true }});
                                        }})()
                                    `
                                }}
                            }}));
                            ws.send(JSON.stringify({{
                                id: 4,
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
                                            el.textContent = ${{JSON.stringify({escaped_css})}};
                                            return "In-App Frosted Glass Applied!";
                                        }})()
                                    `,
                                    returnByValue: true
                                }}
                            }}));
                        }};
                        ws.onmessage = (e) => {{
                            const data = JSON.parse(e.data);
                            if (data.id === 4) {{
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
    primary = colors.get("mPrimary", "#f5f0c9")

    for out_dir in OUTPUT_DIRS:
        os.makedirs(out_dir, exist_ok=True)
        css_file = os.path.join(out_dir, "antigravity-boxed-terminal.css")
        with open(css_file, "w") as f:
            f.write(css)

    inject_cdp(css)
    print(f"✓ Generated & Live-Injected Antigravity 2.0 In-App Frosted Glass Theme (Primary: {primary})")


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
