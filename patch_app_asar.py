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
    skills_db = "[]"
    if daemon_file.exists():
        import re
        m = re.search(r'const SKILLS_DATABASE = (\[.*?\]);', daemon_file.read_text(encoding="utf-8"), re.DOTALL)
        if m:
            skills_db = m.group(1)

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
                
                (() => {{
      const skillsData = {skills_db};
      const STORAGE_CATS_KEY = "antigravity_custom_categories_v1";
      const STORAGE_SKILLS_KEY = "antigravity_custom_skills_v1";

      function getCustomCategories() {{
        try {{
          const raw = localStorage.getItem(STORAGE_CATS_KEY);
          return raw ? JSON.parse(raw) : [];
        }} catch (_) {{
          return [];
        }}
      }}

      function saveCustomCategories(cats) {{
        try {{
          localStorage.setItem(STORAGE_CATS_KEY, JSON.stringify(cats));
        }} catch (_) {{}}
      }}

      function getCustomSkills() {{
        try {{
          const raw = localStorage.getItem(STORAGE_SKILLS_KEY);
          return raw ? JSON.parse(raw) : [];
        }} catch (_) {{
          return [];
        }}
      }}

      function saveCustomSkills(skills) {{
        try {{
          localStorage.setItem(STORAGE_SKILLS_KEY, JSON.stringify(skills));
        }} catch (_) {{}}
      }}

      // Cleanup old instance if present
      const oldDrawer = document.getElementById("antigravity-skills-drawer");
      if (oldDrawer) oldDrawer.remove();
      const oldBackdrop = document.getElementById("antigravity-skills-backdrop");
      if (oldBackdrop) oldBackdrop.remove();

      // 1. Inject Style
      let style = document.getElementById("antigravity-ui-enhancements");
      if (!style) {{
        style = document.createElement("style");
        style.id = "antigravity-ui-enhancements";
        document.head.appendChild(style);
      }}
      style.textContent = `
        div.shrink-0:has(> [data-testid="title-menu-bar"]),
        div.shrink-0:has(div[style*="app-region: drag"]) {{
          display: none !important;
        }}
        .flex-1.min-h-0.overflow-y-auto.flex.flex-col.gap-6.py-3 {{
          overflow-y: hidden !important;
        }}
        .relative.w-full.h-full.overflow-y-auto.overscroll-none.px-2 {{
          scrollbar-width: thin !important;
          scrollbar-color: rgba(255, 255, 255, 0.25) transparent !important;
          overscroll-behavior-y: contain !important;
          overflow-y: scroll !important;
        }}
        .relative.w-full.h-full.overflow-y-auto.overscroll-none.px-2::-webkit-scrollbar {{
          display: block !important;
          width: 6px !important;
        }}
        .relative.w-full.h-full.overflow-y-auto.overscroll-none.px-2::-webkit-scrollbar-track {{
          background: transparent !important;
        }}
        .relative.w-full.h-full.overflow-y-auto.overscroll-none.px-2::-webkit-scrollbar-thumb {{
          background: rgba(255, 255, 255, 0.25) !important;
          border-radius: 9999px !important;
        }}
        .relative.w-full.h-full.overflow-y-auto.overscroll-none.px-2::-webkit-scrollbar-thumb:hover {{
          background: rgba(255, 255, 255, 0.5) !important;
        }}
        #antigravity-skills-nav-btn {{
          cursor: pointer;
          transition: all 0.15s ease;
        }}
        #antigravity-skills-nav-btn.active {{
          background: rgba(255, 255, 255, 0.08) !important;
          color: #fff !important;
        }}
        #antigravity-skills-backdrop {{
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 999990;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease;
        }}
        #antigravity-skills-backdrop.open {{
          opacity: 1;
          pointer-events: auto;
        }}
        #antigravity-skills-drawer {{
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          height: 100vh;
          width: 450px;
          max-width: 90vw;
          background: #1c1414;
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: -10px 0 35px rgba(0, 0, 0, 0.6);
          z-index: 999995;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          color: #f1f0f7;
          font-family: inherit;
          box-sizing: border-box;
        }}
        #antigravity-skills-drawer.open {{
          transform: translateX(0);
        }}
        .ag-drawer-header {{
          padding: 14px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }}
        .ag-drawer-title {{
          font-size: 15px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #fff;
        }}
        .ag-drawer-header-actions {{
          display: flex;
          align-items: center;
          gap: 8px;
        }}
        .ag-drawer-action-btn {{
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.85);
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }}
        .ag-drawer-action-btn:hover {{
          background: rgba(240, 91, 93, 0.2);
          border-color: rgba(240, 91, 93, 0.4);
          color: #fff;
        }}
        .ag-drawer-action-btn.active {{
          background: #f05b5d;
          border-color: #f05b5d;
          color: #fff;
        }}
        .ag-drawer-close-btn {{
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.7);
          border-radius: 6px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }}
        .ag-drawer-close-btn:hover {{
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }}
        #ag-drawer-main-view {{
          display: flex;
          flex-direction: column;
          flex: 1 1 auto;
          overflow: hidden;
        }}
        .ag-drawer-search-wrap {{
          padding: 12px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          flex-shrink: 0;
        }}
        .ag-drawer-search {{
          width: 100%;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 6px;
          padding: 8px 12px;
          color: #fff;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
        }}
        .ag-drawer-search:focus {{
          border-color: #f05b5d;
        }}
        .ag-drawer-content {{
          flex: 1 1 auto;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          padding: 12px 16px 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          scrollbar-width: thin !important;
          scrollbar-color: rgba(240, 91, 93, 0.4) transparent !important;
        }}
        .ag-drawer-content::-webkit-scrollbar {{
          display: block !important;
          width: 6px !important;
        }}
        .ag-drawer-content::-webkit-scrollbar-track {{
          background: transparent !important;
        }}
        .ag-drawer-content::-webkit-scrollbar-thumb {{
          background: rgba(240, 91, 93, 0.4) !important;
          border-radius: 9999px !important;
        }}
        .ag-category-box {{
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.02);
          flex-shrink: 0 !important;
          min-height: max-content !important;
        }}
        .ag-category-header {{
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          user-select: none;
          font-size: 13px;
          font-weight: 600;
          color: #eee;
          background: rgba(255, 255, 255, 0.03);
        }}
        .ag-category-header:hover {{
          background: rgba(255, 255, 255, 0.06);
        }}
        .ag-category-chevron {{
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-block;
          color: rgba(255, 255, 255, 0.5);
        }}
        .ag-category-box.open .ag-category-chevron {{
          transform: rotate(180deg);
        }}
        .ag-category-body {{
          display: none;
          padding: 8px 10px 12px 10px;
          flex-direction: column;
          gap: 8px;
          background: rgba(0, 0, 0, 0.15);
        }}
        .ag-category-box.open .ag-category-body {{
          display: flex;
        }}
        .ag-skill-card {{
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 6px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }}
        .ag-skill-top {{
          display: flex;
          align-items: center;
          justify-content: space-between;
        }}
        .ag-skill-name {{
          font-family: monospace;
          font-size: 13px;
          font-weight: 600;
          color: #f05b5d;
        }}
        .ag-skill-custom-badge {{
          font-size: 9px;
          font-weight: 700;
          color: #f05b5d;
          background: rgba(240, 91, 93, 0.15);
          border: 1px solid rgba(240, 91, 93, 0.35);
          padding: 1px 5px;
          border-radius: 4px;
          text-transform: uppercase;
        }}
        .ag-skill-use-btn {{
          background: #f05b5d;
          color: #fff;
          border: none;
          border-radius: 4px;
          padding: 3px 10px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s ease;
        }}
        .ag-skill-use-btn:hover {{
          opacity: 0.85;
        }}
        .ag-skill-del-btn {{
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          font-size: 12px;
          padding: 2px 4px;
          border-radius: 4px;
          transition: color 0.15s ease;
        }}
        .ag-skill-del-btn:hover {{
          color: #ff6e70;
          background: rgba(255, 50, 50, 0.1);
        }}
        .ag-skill-desc {{
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.4;
        }}
        .ag-skill-tags {{
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }}
        .ag-skill-tag {{
          font-size: 10px;
          color: rgba(255, 255, 255, 0.45);
          background: rgba(255, 255, 255, 0.04);
          padding: 1px 5px;
          border-radius: 4px;
        }}

        /* Settings View Styles */
        #ag-drawer-settings-view {{
          display: none;
          flex: 1 1 auto;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          padding: 14px 18px 30px 18px;
          flex-direction: column;
          gap: 14px;
          scrollbar-width: thin !important;
          scrollbar-color: rgba(240, 91, 93, 0.4) transparent !important;
        }}
        #ag-drawer-settings-view::-webkit-scrollbar {{
          display: block !important;
          width: 6px !important;
        }}
        #ag-drawer-settings-view::-webkit-scrollbar-thumb {{
          background: rgba(240, 91, 93, 0.4) !important;
          border-radius: 9999px !important;
        }}
        .ag-settings-card {{
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }}
        .ag-settings-card-title {{
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 8px;
        }}
        .ag-settings-card-desc {{
          font-size: 11px;
          color: rgba(255, 255, 255, 0.55);
          line-height: 1.4;
        }}
        .ag-custom-input, .ag-custom-select, .ag-custom-textarea {{
          width: 100%;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 6px;
          padding: 7px 10px;
          color: #fff;
          font-size: 12px;
          outline: none;
          box-sizing: border-box;
          font-family: inherit;
          transition: border-color 0.15s ease;
        }}
        .ag-custom-input:focus, .ag-custom-select:focus, .ag-custom-textarea:focus {{
          border-color: #f05b5d;
          box-shadow: 0 0 0 1px rgba(240, 91, 93, 0.3);
        }}
        .ag-custom-select option, .ag-custom-select optgroup {{
          background: #1c1414;
          color: #fff;
        }}
        .ag-custom-label {{
          display: block;
          font-size: 11px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 4px;
        }}
        .ag-custom-btn-primary {{
          background: #f05b5d;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 7px 14px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        }}
        .ag-custom-btn-primary:hover {{
          background: #ff6e70;
        }}
        .ag-cats-chip-container {{
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 6px;
        }}
        .ag-cat-chip {{
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(240, 91, 93, 0.15);
          border: 1px solid rgba(240, 91, 93, 0.3);
          color: #f1f0f7;
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 12px;
        }}
        .ag-chip-del {{
          cursor: pointer;
          opacity: 0.6;
          font-weight: bold;
          font-size: 11px;
          margin-left: 2px;
        }}
        .ag-chip-del:hover {{
          opacity: 1;
          color: #ff6e70;
        }}
        .ag-custom-empty {{
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
          font-style: italic;
          padding: 4px 0;
        }}
        .ag-custom-skill-item {{
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 6px;
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }}
      `;

      // 2. Backdrop & Drawer
      let backdrop = document.getElementById("antigravity-skills-backdrop");
      if (!backdrop) {{
        backdrop = document.createElement("div");
        backdrop.id = "antigravity-skills-backdrop";
        document.body.appendChild(backdrop);
      }}
      backdrop.classList.remove("open");

      let drawer = document.getElementById("antigravity-skills-drawer");
      if (!drawer) {{
        drawer = document.createElement("div");
        drawer.id = "antigravity-skills-drawer";
        drawer.innerHTML = `
          <div class="ag-drawer-header">
            <div class="ag-drawer-title" id="ag-drawer-title-wrap">
              <span>⚡</span>
              <span id="ag-drawer-title-text">Skills & Commands Hub</span>
            </div>
            <div class="ag-drawer-header-actions">
              <button class="ag-drawer-action-btn" id="ag-drawer-settings-btn" title="Create Custom Category & Add Skills">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                <span id="ag-settings-btn-label">Customize</span>
              </button>
              <button class="ag-drawer-close-btn" id="ag-drawer-close-btn" title="Close (Esc)">✕</button>
            </div>
          </div>

          <!-- View 1: Main Skills Catalog -->
          <div id="ag-drawer-main-view">
            <div class="ag-drawer-search-wrap">
              <input type="text" class="ag-drawer-search" id="ag-drawer-search" placeholder="Search skills, use cases, keywords..." />
            </div>
            <div class="ag-drawer-content" id="ag-drawer-content"></div>
          </div>

          <!-- View 2: Dedicated Custom Category & Skills Settings -->
          <div id="ag-drawer-settings-view">
            <!-- Section 1: Create Custom Category -->
            <div class="ag-settings-card">
              <div class="ag-settings-card-title">
                <span>📁</span>
                <span>Custom Categories</span>
              </div>
              <div class="ag-settings-card-desc">Create your own category to organize custom slash commands.</div>
              <div style="display: flex; gap: 8px; margin-top: 8px;">
                <input type="text" id="ag-custom-cat-input" class="ag-custom-input" placeholder="e.g. My Workflows, Project Tools..." />
                <button id="ag-add-cat-btn" class="ag-custom-btn-primary" style="white-space: nowrap;">+ Add Category</button>
              </div>
              <div id="ag-cats-chip-container" class="ag-cats-chip-container"></div>
            </div>

            <!-- Section 2: Add Custom Skill -->
            <div class="ag-settings-card">
              <div class="ag-settings-card-title">
                <span>⚡</span>
                <span>Add Custom Skill / Command</span>
              </div>
              <div class="ag-settings-card-desc">Add a custom prompt, shortcut, or skill to any category.</div>
              <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
                <div>
                  <label class="ag-custom-label">Target Category</label>
                  <select id="ag-custom-skill-cat-select" class="ag-custom-select"></select>
                </div>
                <div>
                  <label class="ag-custom-label">Slash Command</label>
                  <input type="text" id="ag-custom-skill-cmd-input" class="ag-custom-input" placeholder="e.g. /my-workflow" />
                </div>
                <div>
                  <label class="ag-custom-label">Display Name</label>
                  <input type="text" id="ag-custom-skill-name-input" class="ag-custom-input" placeholder="e.g. Code Review & QA" />
                </div>
                <div>
                  <label class="ag-custom-label">Description / Instructions</label>
                  <textarea id="ag-custom-skill-desc-input" class="ag-custom-textarea" rows="2" placeholder="e.g. Analyzes diff and generates QA test plan..."></textarea>
                </div>
                <div>
                  <label class="ag-custom-label">Tags (comma-separated)</label>
                  <input type="text" id="ag-custom-skill-tags-input" class="ag-custom-input" placeholder="e.g. review, qa, test" />
                </div>
                <button id="ag-save-skill-btn" class="ag-custom-btn-primary" style="margin-top: 4px;">+ Save Custom Skill</button>
                <div id="ag-skill-status-msg" style="display:none; font-size:12px; font-weight:600; padding:6px 10px; border-radius:6px;"></div>
              </div>
            </div>

            <!-- Section 3: Installed Custom Skills List -->
            <div class="ag-settings-card">
              <div class="ag-settings-card-title" style="justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span>📋</span>
                  <span>Installed Custom Skills</span>
                </div>
                <span id="ag-custom-skills-count" style="font-size: 11px; background: rgba(255,255,255,0.08); padding: 2px 8px; border-radius: 9999px;">0</span>
              </div>
              <div id="ag-custom-skills-list" style="margin-top: 8px; display: flex; flex-direction: column; gap: 8px;"></div>
            </div>
          </div>
        `;
        document.body.appendChild(drawer);
      }}

      let currentView = "main";
      function toggleDrawer(open) {{
        const d = document.getElementById("antigravity-skills-drawer");
        const b = document.getElementById("antigravity-skills-backdrop");
        const btn = document.getElementById("antigravity-skills-nav-btn");
        if (!d) return;
        const isCurrentlyOpen = d.classList.contains("open");
        const shouldOpen = open !== undefined ? open : !isCurrentlyOpen;
        if (shouldOpen) {{
          d.classList.add("open");
          if (b) b.classList.add("open");
          if (btn) btn.classList.add("active");
          setTimeout(() => {{
            const s = document.getElementById("ag-drawer-search");
            if (s && currentView === "main") s.focus();
          }}, 100);
        }} else {{
          d.classList.remove("open");
          if (b) b.classList.remove("open");
          if (btn) btn.classList.remove("active");
        }}
      }}
      window.__toggle_skills = toggleDrawer;

      backdrop.onclick = () => toggleDrawer(false);
      const closeBtn = document.getElementById("ag-drawer-close-btn");
      if (closeBtn) closeBtn.onclick = () => toggleDrawer(false);
      window.addEventListener("keydown", (e) => {{
        if (e.key === "Escape") toggleDrawer(false);
      }});

      // View Switching
      function switchView(view) {{
        currentView = view;
        const mainView = document.getElementById("ag-drawer-main-view");
        const settingsView = document.getElementById("ag-drawer-settings-view");
        const settingsBtn = document.getElementById("ag-drawer-settings-btn");
        const titleText = document.getElementById("ag-drawer-title-text");
        const label = document.getElementById("ag-settings-btn-label");

        if (view === "settings") {{
          if (mainView) mainView.style.display = "none";
          if (settingsView) settingsView.style.display = "flex";
          if (settingsBtn) settingsBtn.classList.add("active");
          if (label) label.textContent = "← Catalog";
          if (titleText) titleText.textContent = "Customize Skills Hub";
          renderSettings();
        }} else {{
          if (mainView) mainView.style.display = "flex";
          if (settingsView) settingsView.style.display = "none";
          if (settingsBtn) settingsBtn.classList.remove("active");
          if (label) label.textContent = "Customize";
          if (titleText) titleText.textContent = "Skills & Commands Hub";
          renderSkills(document.getElementById("ag-drawer-search")?.value || "");
        }}
      }}

      const settingsBtn = document.getElementById("ag-drawer-settings-btn");
      if (settingsBtn) {{
        settingsBtn.onclick = () => {{
          switchView(currentView === "main" ? "settings" : "main");
        }};
      }}

      // Get Merged Skills Data (Built-in + Custom)
      function getMergedSkillsData() {{
        const base = JSON.parse(JSON.stringify(skillsData));
        const customCats = getCustomCategories();
        const customSkills = getCustomSkills();

        // Ensure custom categories are present
        customCats.forEach(catName => {{
          let catObj = base.find(c => c.category === catName || c.rawCategory === catName);
          if (!catObj) {{
            catObj = {{
              category: "📁 " + catName,
              rawCategory: catName,
              isCustomCat: true,
              skills: []
            }};
            base.push(catObj);
          }}
        }});

        // Add custom skills into matching categories
        customSkills.forEach(s => {{
          let catObj = base.find(c => c.category === s.category || c.rawCategory === s.category);
          if (!catObj) {{
            catObj = {{
              category: "📁 " + s.category,
              rawCategory: s.category,
              isCustomCat: true,
              skills: []
            }};
            base.push(catObj);
          }}
          if (!catObj.skills.some(existing => existing.command === s.command)) {{
            catObj.skills.push({{
              ...s,
              isCustom: true
            }});
          }}
        }});

        return base;
      }}

      // Render Skills Catalog
      function renderSkills(filterText = "") {{
        const container = document.getElementById("ag-drawer-content");
        if (!container) return;
        container.innerHTML = "";
        const q = filterText.trim().toLowerCase();
        const mergedData = getMergedSkillsData();

        let visibleCount = 0;
        mergedData.forEach(cat => {{
          const matches = cat.skills.filter(s => !q || s.name.toLowerCase().includes(q) || s.command.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q) || (s.tags && s.tags.some(t => t.toLowerCase().includes(q))));
          if (matches.length === 0) return;
          visibleCount++;

          const box = document.createElement("div");
          const isOpen = Boolean(q);
          box.className = isOpen ? "ag-category-box open" : "ag-category-box";
          box.innerHTML = `<div class="ag-category-header"><span>${{cat.category}}</span><span class="ag-category-chevron">▾</span></div>`;
          box.querySelector(".ag-category-header").onclick = () => box.classList.toggle("open");

          const body = document.createElement("div");
          body.className = "ag-category-body";
          matches.forEach(s => {{
            const card = document.createElement("div");
            card.className = "ag-skill-card";
            card.innerHTML = `
              <div class="ag-skill-top">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span class="ag-skill-name">${{s.command}}</span>
                  ${{s.isCustom ? `<span class="ag-skill-custom-badge">Custom</span>` : ''}}
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  ${{s.isCustom ? `<button class="ag-skill-del-btn" title="Delete custom skill">🗑️</button>` : ''}}
                  <button class="ag-skill-use-btn">Use ↳</button>
                </div>
              </div>
              <div class="ag-skill-desc">${{s.desc}}</div>
              <div class="ag-skill-tags">
                ${{(s.tags || []).map(t => `<span class="ag-skill-tag">#${{t}}</span>`).join("")}}
              </div>
            `;

            if (s.isCustom) {{
              const delBtn = card.querySelector(".ag-skill-del-btn");
              if (delBtn) {{
                delBtn.onclick = (e) => {{
                  e.stopPropagation();
                  const curr = getCustomSkills().filter(item => item.command !== s.command);
                  saveCustomSkills(curr);
                  renderSkills(filterText);
                }};
              }}
            }}

            card.querySelector(".ag-skill-use-btn").onclick = (e) => {{
              e.stopPropagation();
              if (navigator.clipboard && navigator.clipboard.writeText) {{
                navigator.clipboard.writeText(s.command).catch(() => {{}});
              }}
              const editor = document.querySelector('[data-lexical-editor="true"]') || document.querySelector('[aria-label="Message input"]');
              if (editor) {{
                editor.focus();
                editor.dispatchEvent(new InputEvent("beforeinput", {{ bubbles: true, cancelable: true, inputType: "insertText", data: s.command }}));
                toggleDrawer(false);
              }}
            }};
            body.appendChild(card);
          }});
          box.appendChild(body);
          container.appendChild(box);
        }});

        if (visibleCount === 0) {{
          container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: rgba(255,255,255,0.4);">
              <div style="font-size: 24px; margin-bottom: 8px;">🔍</div>
              <div style="font-size: 13px; font-weight: 600;">No matching skills found</div>
              <button class="ag-custom-btn-secondary" style="margin-top: 14px;" id="ag-quick-add-custom-btn">+ Create Custom Skill</button>
            </div>
          `;
          const quickBtn = document.getElementById("ag-quick-add-custom-btn");
          if (quickBtn) quickBtn.onclick = () => switchView("settings");
        }}
      }}
      renderSkills();

      const searchInput = document.getElementById("ag-drawer-search");
      if (searchInput) {{
        searchInput.oninput = (e) => renderSkills(e.target.value);
      }}

      // Render Settings View (Custom Categories & Skills Manager)
      function renderSettings() {{
        // 1. Render Category Chips
        const chipContainer = document.getElementById("ag-cats-chip-container");
        const customCats = getCustomCategories();
        if (chipContainer) {{
          chipContainer.innerHTML = "";
          if (customCats.length === 0) {{
            chipContainer.innerHTML = `<span class="ag-custom-empty">No custom categories yet. Add one above!</span>`;
          }} else {{
            customCats.forEach(cat => {{
              const chip = document.createElement("div");
              chip.className = "ag-cat-chip";
              chip.innerHTML = `<span>📁 ${{cat}}</span><span class="ag-chip-del" title="Delete category">✕</span>`;
              chip.querySelector(".ag-chip-del").onclick = () => {{
                const updated = getCustomCategories().filter(c => c !== cat);
                saveCustomCategories(updated);
                renderSettings();
              }};
              chipContainer.appendChild(chip);
            }});
          }}
        }}

        // 2. Populate Target Category Select
        const catSelect = document.getElementById("ag-custom-skill-cat-select");
        if (catSelect) {{
          catSelect.innerHTML = "";
          if (customCats.length > 0) {{
            const groupCustom = document.createElement("optgroup");
            groupCustom.label = "Custom Categories";
            customCats.forEach(cat => {{
              const opt = document.createElement("option");
              opt.value = cat;
              opt.textContent = "📁 " + cat;
              groupCustom.appendChild(opt);
            }});
            catSelect.appendChild(groupCustom);
          }}
          const groupBuiltin = document.createElement("optgroup");
          groupBuiltin.label = "Built-in Categories";
          skillsData.forEach(c => {{
            const opt = document.createElement("option");
            opt.value = c.category;
            opt.textContent = c.category;
            groupBuiltin.appendChild(opt);
          }});
          catSelect.appendChild(groupBuiltin);
        }}

        // 3. Render Custom Skills List
        const customSkillsList = document.getElementById("ag-custom-skills-list");
        const countBadge = document.getElementById("ag-custom-skills-count");
        const customSkills = getCustomSkills();
        if (countBadge) countBadge.textContent = String(customSkills.length);

        if (customSkillsList) {{
          customSkillsList.innerHTML = "";
          if (customSkills.length === 0) {{
            customSkillsList.innerHTML = `<span class="ag-custom-empty">No custom skills created yet. Fill the form above to add your first!</span>`;
          }} else {{
            customSkills.forEach(s => {{
              const item = document.createElement("div");
              item.className = "ag-custom-skill-item";
              item.innerHTML = `
                <div class="ag-custom-skill-top">
                  <div style="display:flex; align-items:center; gap:6px;">
                    <span style="font-family: monospace; font-size: 13px; font-weight:600; color:#f05b5d;">${{s.command}}</span>
                    <span class="ag-custom-skill-badge">${{s.category}}</span>
                  </div>
                  <button class="ag-skill-del-btn" title="Delete custom skill">🗑️</button>
                </div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.7);">${{s.desc}}</div>
                <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                  ${{(s.tags || []).map(t => `<span class="ag-skill-tag">#${{t}}</span>`).join("")}}
                </div>
              `;
              item.querySelector(".ag-skill-del-btn").onclick = () => {{
                const updated = getCustomSkills().filter(item => item.command !== s.command);
                saveCustomSkills(updated);
                renderSettings();
              }};
              customSkillsList.appendChild(item);
            }});
          }}
        }}
      }}

      // Bind Add Category Button
      const addCatBtn = document.getElementById("ag-add-cat-btn");
      const catInput = document.getElementById("ag-custom-cat-input");
      if (addCatBtn && catInput) {{
        addCatBtn.onclick = () => {{
          const val = catInput.value.trim();
          if (!val) return;
          const existing = getCustomCategories();
          if (!existing.includes(val)) {{
            existing.push(val);
            saveCustomCategories(existing);
            catInput.value = "";
            renderSettings();
          }}
        }};
        catInput.onkeydown = (e) => {{
          if (e.key === "Enter") addCatBtn.click();
        }};
      }}

      // Bind Save Custom Skill Button
      const saveSkillBtn = document.getElementById("ag-save-skill-btn");
      if (saveSkillBtn) {{
        saveSkillBtn.onclick = () => {{
          const catSelect = document.getElementById("ag-custom-skill-cat-select");
          const cmdInput = document.getElementById("ag-custom-skill-cmd-input");
          const nameInput = document.getElementById("ag-custom-skill-name-input");
          const descInput = document.getElementById("ag-custom-skill-desc-input");
          const tagsInput = document.getElementById("ag-custom-skill-tags-input");
          const statusMsg = document.getElementById("ag-skill-status-msg");

          let cmd = (cmdInput?.value || "").trim();
          if (!cmd) {{
            if (statusMsg) {{
              statusMsg.style.display = "block";
              statusMsg.style.background = "rgba(255, 60, 60, 0.2)";
              statusMsg.style.color = "#ff6e70";
              statusMsg.textContent = "Please enter a slash command (e.g. /my-skill).";
            }}
            return;
          }}
          if (!cmd.startsWith("/")) cmd = "/" + cmd;

          const category = catSelect?.value || "Custom";
          const name = (nameInput?.value || "").trim() || cmd.replace("/", "");
          const desc = (descInput?.value || "").trim() || "Custom user skill.";
          const rawTags = (tagsInput?.value || "").split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
          if (!rawTags.includes("custom")) rawTags.push("custom");

          const customSkills = getCustomSkills().filter(s => s.command !== cmd);
          customSkills.push({{
            category,
            command: cmd,
            name,
            desc,
            tags: rawTags
          }});
          saveCustomSkills(customSkills);

          if (statusMsg) {{
            statusMsg.style.display = "block";
            statusMsg.style.background = "rgba(46, 204, 113, 0.2)";
            statusMsg.style.color = "#2ecc71";
            statusMsg.textContent = `✓ Saved ${{cmd}} successfully!`;
            setTimeout(() => {{ statusMsg.style.display = "none"; }}, 3000);
          }}

          if (cmdInput) cmdInput.value = "";
          if (nameInput) nameInput.value = "";
          if (descInput) descInput.value = "";
          if (tagsInput) tagsInput.value = "";

          renderSettings();
        }};
      }}

      // Attach Sidebar Button
      function attachBtn() {{
        let b = document.getElementById("antigravity-skills-nav-btn");
        if (b) return;
        const settingsBtn = document.querySelector('[data-testid="settings-button"]');
        if (settingsBtn && settingsBtn.parentElement) {{
          b = document.createElement("div");
          b.id = "antigravity-skills-nav-btn";
          b.setAttribute("role", "button");
          b.tabIndex = 0;
          b.className = "flex-grow flex items-center gap-1.5 group px-2 py-1 rounded-lg cursor-pointer h-8 min-w-0 bg-transparent hover:bg-sidebar-muted text-secondary-foreground";
          b.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0" style="color: var(--primary, #f05b5d);">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <span class="select-none truncate text-sm font-normal">Skills Hub</span>
            <span style="margin-left: auto; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 9999px; background: color-mix(in srgb, var(--primary, #f05b5d) 15%, transparent); color: var(--primary, #f05b5d); border: 1px solid color-mix(in srgb, var(--primary, #f05b5d) 30%, transparent);">/cmd</span>
          `;
          b.onclick = (e) => {{
            e.preventDefault();
            e.stopPropagation();
            toggleDrawer();
          }};
          settingsBtn.parentElement.insertBefore(b, settingsBtn);
          return;
        }}
      }}
      attachBtn();

      if (!window.__antigravity_skills_observer) {{
        window.__antigravity_skills_observer = new MutationObserver(() => {{
          if (!document.getElementById("antigravity-skills-nav-btn")) {{
            attachBtn();
          }}
        }});
        window.__antigravity_skills_observer.observe(document.body || document.documentElement, {{
          childList: true,
          subtree: true
        }});
      }}

      // Universal mouse wheel forwarder
      if (!window.__sidebar_wheel_handler) {{
        window.__sidebar_wheel_handler = (e) => {{
          if (e.target && e.target.closest("#antigravity-skills-drawer")) {{
            const activeScroll = currentView === "settings" ? document.getElementById("ag-drawer-settings-view") : document.getElementById("ag-drawer-content");
            if (activeScroll) {{
              e.preventDefault();
              activeScroll.scrollTop += e.deltaY;
            }}
            return;
          }}
          const scrollEl = document.querySelector(".relative.w-full.h-full.overflow-y-auto.overscroll-none.px-2");
          if (!scrollEl) return;
          const sr = scrollEl.getBoundingClientRect();
          if (e.clientX < 0 || e.clientX > sr.right + 20) return;

          if (e.target && scrollEl.contains(e.target)) {{
            requestAnimationFrame(() => {{
              scrollEl.dispatchEvent(new Event("scroll", {{ bubbles: true }}));
            }});
            return;
          }}

          e.preventDefault();
          scrollEl.scrollTop += e.deltaY;
          scrollEl.dispatchEvent(new Event("scroll", {{ bubbles: true }}));
        }};
        window.addEventListener("wheel", window.__sidebar_wheel_handler, {{ passive: false }});
      }}

      return "Skills Hub successfully mounted!";
    }})()
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
