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
          gap: 5px;
          cursor: pointer;
          transition: all 0.15s ease;
        }}
        .ag-drawer-action-btn:hover {{
          background: rgba(240, 91, 93, 0.2);
          border-color: rgba(240, 91, 93, 0.4);
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
          padding: 12px 16px;
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
        .ag-drawer-footer {{
          padding: 10px 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(0, 0, 0, 0.2);
          flex-shrink: 0;
        }}
        .ag-drawer-footer a {{
          color: #f05b5d;
          text-decoration: none;
          font-family: monospace;
          font-weight: 600;
          cursor: pointer;
        }}
        .ag-drawer-footer a:hover {{
          text-decoration: underline;
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
            <div class="ag-drawer-title">
              <span>⚡</span>
              <span>Skills & Commands Hub</span>
            </div>
            <div class="ag-drawer-header-actions">
              <button class="ag-drawer-close-btn" id="ag-drawer-close-btn" title="Close (Esc)">✕</button>
            </div>
          </div>
          <div class="ag-drawer-search-wrap">
            <input type="text" class="ag-drawer-search" id="ag-drawer-search" placeholder="Search skills, commands, keywords..." />
          </div>
          <div class="ag-drawer-content" id="ag-drawer-content"></div>
          <div class="ag-drawer-footer">
            <span>Import / consolidate skills:</span>
            <a id="ag-footer-agent-link">/skills-manager ↳</a>
          </div>
        `;
        document.body.appendChild(drawer);
      }}

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
            if (s) s.focus();
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

      // Quick footer link insertion
      const footerLink = document.getElementById("ag-footer-agent-link");
      if (footerLink) {{
        footerLink.onclick = () => {{
          const editor = document.querySelector('[data-lexical-editor="true"]') || document.querySelector('[aria-label="Message input"]');
          if (editor) {{
            editor.focus();
            editor.dispatchEvent(new InputEvent("beforeinput", {{ bubbles: true, cancelable: true, inputType: "insertText", data: "/skills-manager" }}));
            toggleDrawer(false);
          }}
        }};
      }}

      // 3. Render Skills
      function renderSkills(filterText = "") {{
        const container = document.getElementById("ag-drawer-content");
        if (!container) return;
        container.innerHTML = "";
        const q = filterText.trim().toLowerCase();

        let visibleCount = 0;
        skillsData.forEach(cat => {{
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
                <span class="ag-skill-name">${{s.command}}</span>
                <button class="ag-skill-use-btn">Use ↳</button>
              </div>
              <div class="ag-skill-desc">${{s.desc}}</div>
              <div class="ag-skill-tags">
                ${{(s.tags || []).map(t => `<span class="ag-skill-tag">#${{t}}</span>`).join("")}}
              </div>
            `;

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
              <div style="font-size: 11px; margin-top: 6px;">Import any skill from GitHub or local path with: <code>/skills-manager import &lt;url&gt;</code></div>
            </div>
          `;
        }}
      }}
      renderSkills();

      const searchInput = document.getElementById("ag-drawer-search");
      if (searchInput) {{
        searchInput.oninput = (e) => renderSkills(e.target.value);
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
            const activeScroll = document.getElementById("ag-drawer-content");
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
