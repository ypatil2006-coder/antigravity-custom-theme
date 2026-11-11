#!/usr/bin/env python3
"""
Patches Antigravity app.asar to replace the startup white screen with the Antigravity 2.0 Loading Screen:
1. Re-extracts clean app.asar from /opt/Antigravity/resources/app.asar.
2. Patches dist/loadingOverlay.js:
   - Matches Noctalia Material 3 colors (mSurface: #281f15, mPrimary: #e4a967) or dark fallback.
   - Prevents premature removal on 'did-finish-load'.
   - Polls win.webContents until React actually renders children inside #root.
   - Smoothly fades out and closes the WebContentsView overlay.
   - Includes 25s safety fallback timeout.
3. Patches dist/utils.js:
   - Sets BrowserWindow backgroundColor and titleBarOverlay color to match Noctalia theme (#281f15).
   - Disables Window Controls Overlay (titleBarOverlay: false).
4. Packs into /home/yash/.config/Antigravity-Profiles/app.asar.
"""

import os
import shutil
import subprocess
import sys
from pathlib import Path

EXTRACTED_DIR = Path.home() / ".config/Antigravity-Profiles/asar_extracted"
ORIGINAL_ASAR = Path("/opt/Antigravity/resources/app.asar")
TARGET_ASAR = Path.home() / ".config/Antigravity-Profiles/app.asar"

def clean_extract():
    print(f"Extracting clean {ORIGINAL_ASAR}...")
    if EXTRACTED_DIR.exists():
        shutil.rmtree(EXTRACTED_DIR)
    EXTRACTED_DIR.mkdir(parents=True, exist_ok=True)
    res = subprocess.run(["npx", "-y", "@electron/asar", "extract", str(ORIGINAL_ASAR), str(EXTRACTED_DIR)], capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error extracting asar: {res.stderr}")
        sys.exit(1)
    print("[✓] Extracted clean app.asar")

def patch_loading_overlay():
    overlay_file = EXTRACTED_DIR / "dist" / "loadingOverlay.js"
    if not overlay_file.exists():
        print(f"Error: {overlay_file} not found")
        sys.exit(1)

    new_content = """\"use strict\";
Object.defineProperty(exports, \"__esModule\", { value: true });
exports.attachLoadingOverlay = attachLoadingOverlay;
const electron_1 = require(\"electron\");
const fs = require(\"fs\");

function getThemeColors() {
    let bg = \"#281f15\";
    let fg = \"#f3f2f2\";
    let primary = \"#e4a967\";
    try {
        const noctaliaPath = \"/home/yash/.config/noctalia/colors.json\";
        if (fs.existsSync(noctaliaPath)) {
            const data = JSON.parse(fs.readFileSync(noctaliaPath, \"utf8\"));
            if (data.mSurface) bg = data.mSurface;
            if (data.mOnSurface) fg = data.mOnSurface;
            if (data.mPrimary) primary = data.mPrimary;
        }
    } catch (_) {}
    return { bg, fg, primary };
}

/**
 * Generates the HTML content for the Antigravity 2.0 loading screen overlay.
 */
function getLoadingHtml(foregroundColor, backgroundColor) {
    const { bg, fg, primary } = getThemeColors();
    return `
<!DOCTYPE html>
<html>
<head>
<meta charset=\"utf-8\">
<style>
  html, body {
    margin: 0;
    padding: 0;
    background: ${bg} !important;
    background-color: ${bg} !important;
    color: ${fg} !important;
    font-family: \"JetBrainsMono Nerd Font\", \"JetBrains Mono\", system-ui, -apple-system, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    -webkit-app-region: drag;
    -webkit-user-select: none;
    transition: opacity 0.25s ease-out;
    opacity: 1;
  }
  .loader {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }
  .loader div {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${primary} !important;
    opacity: 0.3;
    animation: dot-pulse 1.5s infinite ease-in-out;
  }
  .loader div:nth-child(1) { animation-delay: 0s; }
  .loader div:nth-child(2) { animation-delay: 0.3s; }
  .loader div:nth-child(3) { animation-delay: 0.6s; }
  .text {
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.05em;
    opacity: 0.85;
    color: ${fg} !important;
  }
  @keyframes dot-pulse {
    0%, 100% { opacity: 0.2; transform: scale(0.9); }
    50% { opacity: 1; transform: scale(1.15); }
  }
</style>
</head>
<body>
  <div class=\"loader\">
    <div></div><div></div><div></div>
  </div>
  <div class=\"text\">Loading Antigravity</div>
</body>
</html>
  `;
}

/**
 * Attaches a temporary WebContentsView overlay that shows the Loading Antigravity screen.
 * Stays visible throughout startup (covering the language server and bundle compile time)
 * and only dismisses once React has mounted components into #root.
 */
function attachLoadingOverlay(win, foregroundColor, backgroundColor) {
    const { bg } = getThemeColors();
    const view = new electron_1.WebContentsView({
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });
    if (typeof view.setBackgroundColor === 'function') {
        view.setBackgroundColor(bg);
    }
    const html = getLoadingHtml(foregroundColor, backgroundColor);
    void view.webContents.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    win.contentView.addChildView(view);
    console.log('[LoadingOverlay] Attached Antigravity 2.0 Loading Overlay view');

    const updateBounds = () => {
        try {
            if (!win.isDestroyed()) {
                const [width, height] = win.getContentSize();
                const bounds = win.getBounds();
                const w = width > 0 ? width : (bounds.width || 1200);
                const h = height > 0 ? height : (bounds.height || 800);
                view.setBounds({ x: 0, y: 0, width: w, height: h });
            }
        } catch (_) {}
    };
    updateBounds();
    win.on('resize', updateBounds);
    win.on('ready-to-show', updateBounds);
    win.on('show', updateBounds);
    setTimeout(updateBounds, 100);
    setTimeout(updateBounds, 300);
    setTimeout(updateBounds, 800);

    let isDismissed = false;
    const dismissOverlay = () => {
        if (isDismissed) return;
        isDismissed = true;
        console.log('[LoadingOverlay] React ready! Fading out loading overlay smoothly...');
        try {
            view.webContents.executeJavaScript('document.body.style.opacity = "0";').catch(() => {});
            setTimeout(() => {
                try {
                    if (!win.isDestroyed()) {
                        win.contentView.removeChildView(view);
                        win.off('resize', updateBounds);
                    }
                } catch (_) {}
                try {
                    view.webContents.close();
                } catch (_) {}
                console.log('[LoadingOverlay] Overlay view cleanly closed.');
            }, 250);
        } catch (_) {
            try {
                if (!win.isDestroyed()) {
                    win.contentView.removeChildView(view);
                }
                view.webContents.close();
            } catch (_) {}
        }
    };

    const checkReady = async () => {
        if (isDismissed) return;
        try {
            if (win.isDestroyed() || win.webContents.isDestroyed()) return;
            const hasMounted = await win.webContents.executeJavaScript(
                'Boolean(document.getElementById("root") && document.getElementById("root").children.length > 0)'
            );
            if (hasMounted) {
                dismissOverlay();
                return;
            }
        } catch (_) {}
        if (!isDismissed) {
            setTimeout(checkReady, 80);
        }
    };

    // When the HTML shell arrives, start polling for React mount
    win.webContents.on('did-finish-load', () => {
        checkReady();
    });

    // Also poll after 500ms in case did-finish-load already fired
    setTimeout(checkReady, 500);

    // Guaranteed fallback after 25s so the user is never permanently stuck
    setTimeout(dismissOverlay, 25000);
}
"""
    overlay_file.write_text(new_content, encoding="utf-8")
    print("[✓] Patched dist/loadingOverlay.js with React-mount polling & Noctalia theme")

def patch_utils():
    utils_file = EXTRACTED_DIR / "dist" / "utils.js"
    if not utils_file.exists():
        return
    content = utils_file.read_text(encoding="utf-8")

    target_pattern = "const backgroundColor = isLight ? '#FAFAFA' : '#131313';"
    replacement = """let backgroundColor = '#281f15';
    let foregroundColor = '#f3f2f2';
    try {
        const noctaliaPath = '/home/yash/.config/noctalia/colors.json';
        if (fs.existsSync(noctaliaPath)) {
            const c = JSON.parse(fs.readFileSync(noctaliaPath, 'utf8'));
            if (c.mSurface) backgroundColor = c.mSurface;
            if (c.mOnSurface) foregroundColor = c.mOnSurface;
        }
    } catch (_) {}"""

    if target_pattern in content:
        content = content.replace(target_pattern, replacement)
        content = content.replace("const foregroundColor = isLight ? '#383A42' : '#FAFAFA';", "// foregroundColor set above")

    # Disable native Window Controls Overlay (minimize, maximize, close) for clean borderless tiling WM
    overlay_pattern = """        titleBarOverlay: isMacOS()
            ? false
            : {
                color: backgroundColor,
                symbolColor: foregroundColor,
                height: 30,
            },"""
    if overlay_pattern in content:
        content = content.replace(overlay_pattern, "        titleBarOverlay: false,")
        print("[✓] Disabled Window Controls Overlay (titleBarOverlay: false)")

    utils_file.write_text(content, encoding="utf-8")
    print("[✓] Patched dist/utils.js with Noctalia window colors and disabled WCO")

def patch_preload():
    preload_file = EXTRACTED_DIR / "dist" / "preload.js"
    if not preload_file.exists():
        return
    content = preload_file.read_text(encoding="utf-8")

    daemon_file = Path(__file__).resolve().parent / "skills_drawer_daemon.js"
    if not daemon_file.exists():
        daemon_file = Path("/home/yash/Projects/antigravity-custom-theme/skills_drawer_daemon.js")

    payload = subprocess.check_output(
        ["node", "-e", "const { getInjectionPayload } = require('./skills_drawer_daemon.js'); process.stdout.write(getInjectionPayload());"],
        cwd=str(daemon_file.parent)
    ).decode("utf-8")

    preload_injection = f'''
// Antigravity 2.0 UI Enhancements: Clean Top Bar Hide & Skills Hub
(function() {{
    try {{
        const injectUI = () => {{
            try {{
                if (!document.head || !document.body) {{
                    setTimeout(injectUI, 50);
                    return;
                }}
                {payload}
            }} catch (_) {{}}
        }};

        if (document.readyState === "loading") {{
            document.addEventListener("DOMContentLoaded", injectUI);
        }} else {{
            injectUI();
        }}
    }} catch (_) {{}}
}})();
'''
    content += "\n" + preload_injection
    preload_file.write_text(content, encoding="utf-8")
    print("[✓] Patched dist/preload.js with clean top bar hide and Skills Hub")

def verify_syntax():
    files = [
        EXTRACTED_DIR / "dist" / "loadingOverlay.js",
        EXTRACTED_DIR / "dist" / "utils.js",
        EXTRACTED_DIR / "dist" / "preload.js",
    ]
    for f in files:
        res = subprocess.run(["node", "--check", str(f)], capture_output=True, text=True)
        if res.returncode != 0:
            print(f"[✗] Syntax error in {f}:\n{res.stderr}")
            sys.exit(1)
    print("[✓] Syntax check passed on all patched files")

def pack_asar():
    print(f"Packing {EXTRACTED_DIR} into {TARGET_ASAR}...")
    cmd = ["npx", "-y", "@electron/asar", "pack", str(EXTRACTED_DIR), str(TARGET_ASAR)]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print(f"[✓] Successfully created {TARGET_ASAR} ({TARGET_ASAR.stat().st_size} bytes)")
        main_asar = Path("/home/yash/.config/Antigravity-Profiles/app.asar")
        if main_asar.parent.exists() and main_asar.resolve() != TARGET_ASAR.resolve():
            try:
                shutil.copy2(TARGET_ASAR, main_asar)
                print(f"[✓] Copied updated asar to {main_asar}")
            except shutil.SameFileError:
                pass
    else:
        print(f"[✗] Failed to pack asar:\n{res.stderr}")
        sys.exit(1)

def main():
    clean_extract()
    patch_loading_overlay()
    patch_utils()
    patch_preload()
    verify_syntax()
    pack_asar()

if __name__ == "__main__":
    main()
