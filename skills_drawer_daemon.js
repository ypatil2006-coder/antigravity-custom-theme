#!/usr/bin/env node
/**
 * Antigravity 2.0 Skills Hub Background Daemon
 * 
 * Continuously monitors for running Antigravity 2.0 Electron instances via CDP.
 * Automatically injects the Skills Drawer & Left Sidebar Button upon startup or restart.
 */

const fs = require('fs');
const path = require('path');

const CANDIDATE_PORT_FILES = [
  "/home/yash/.config/Antigravity-Profiles/Account-1/DevToolsActivePort",
  "/home/yash/.config/Antigravity-Profiles/Account-2/DevToolsActivePort",
  "/home/yash/.config/Antigravity-Profiles/Account-3/DevToolsActivePort",
  "/home/yash/.config/Antigravity-Profiles/Account-4/DevToolsActivePort",
  "/home/yash/.config/Antigravity-Profiles/Account-5/DevToolsActivePort",
  "/home/yash/.config/Antigravity-Profiles/Account-6/DevToolsActivePort",
  "/home/yash/.config/Antigravity/DevToolsActivePort"
];

// Complete database of Antigravity skills categorised by workflow
const SKILLS_DATABASE = [
  {
    category: "🎨 UI & 3D Design Suite",
    icon: "🎨",
    skills: [
      {
        name: "stitch",
        command: "/stitch",
        desc: "Complete Stitch Suite: reverse-engineer design systems, extract static HTML, synthesize React components, tokens & UI generation.",
        tags: ["stitch", "ui", "design-system", "react", "components", "vite"]
      },
      {
        name: "blender",
        command: "/blender",
        desc: "Complete Blender 3D Suite: hard-surface modeling, PBR materials, 3-point/HDRI lighting, cinematic cameras, Cycles/EEVEE, GLB/FBX export.",
        tags: ["3d", "blender", "modeling", "materials", "lighting", "rendering", "export"]
      },
      {
        name: "ui-ux-pro-max",
        command: "/ui-ux-pro-max",
        desc: "UI/UX design intelligence: 79 styles, 192 product palettes, 74 font pairings, 119 UX guidelines, and stack-specific UI implementation.",
        tags: ["ui", "ux", "design", "typography", "palette", "components"]
      },
      {
        name: "frontend-design",
        command: "/frontend-design",
        desc: "Distinctive, production-grade visual design for web interfaces with custom personality and polish.",
        tags: ["frontend", "ui", "css", "layout", "aesthetic"]
      },
      {
        name: "design-system",
        command: "/design-system",
        desc: "Token architecture (primitive -> semantic -> component), CSS variables, spacing/typography scales.",
        tags: ["design", "tokens", "css", "specs"]
      },
      {
        name: "canvas-design",
        command: "/canvas-design",
        desc: "Create beautiful visual art, posters, and graphical compositions in PNG and PDF.",
        tags: ["art", "canvas", "graphic", "png", "pdf"]
      },
      {
        name: "banner-design",
        command: "/banner-design",
        desc: "Multi-platform banners for YouTube, Twitter/X, LinkedIn, Facebook, hero sections, and print.",
        tags: ["banner", "social", "hero", "marketing"]
      },
      {
        name: "web-design-guidelines",
        command: "/web-design-guidelines",
        desc: "Audit UI code against Web Interface Guidelines for accessibility, layout, and visual hierarchy.",
        tags: ["audit", "guidelines", "a11y", "ui"]
      }
    ]
  },
  {
    category: "🎬 Video, Motion & Animation",
    icon: "🎬",
    skills: [
      {
        name: "hyperframes",
        command: "/hyperframes",
        desc: "Complete HyperFrames Video Suite: renders video from HTML/CSS & GSAP. Promos, explainers, motion graphics, audio mix, and subtitles.",
        tags: ["video", "hyperframes", "animation", "motion", "render", "mp4"]
      },
      {
        name: "gsap-core",
        command: "/gsap-core",
        desc: "GSAP animation core: timelines, tweens, staggers, scroll triggers, matchMedia, and reduced-motion.",
        tags: ["animation", "gsap", "javascript", "motion", "svg"]
      },
      {
        name: "gsap-framer-scroll-animation",
        command: "/gsap-framer-scroll-animation",
        desc: "High-performance scroll-driven and pinned animations blending GSAP and Framer Motion.",
        tags: ["scroll", "framer", "gsap", "interaction"]
      },
      {
        name: "ui-animation",
        command: "/ui-animation",
        desc: "Design, review, and extract UI micro-motion, CSS transitions, spring curves, and gesture navigation.",
        tags: ["micro-motion", "transitions", "spring", "gestures"]
      }
    ]
  },
  {
    category: "🎮 Gaming & Optimization",
    icon: "🎮",
    skills: [
      {
        name: "roblox",
        command: "/roblox",
        desc: "Complete Roblox Suite: Luau scripting, networking, DataStores, physics, UI/GUI, character rigs, and Studio MCP automation.",
        tags: ["roblox", "luau", "game-dev", "datastores", "networking", "studio"]
      },
      {
        name: "pptimize",
        command: "/pptimize",
        desc: "All-in-one PC game optimization: GPU control panel, VRR pacing, engine config tuning, and CPU thread pinning.",
        tags: ["gaming", "fps", "performance", "optimization", "gpu", "latency"]
      },
      {
        name: "deadlocked",
        command: "/deadlocked",
        desc: "Full lifecycle management, installation, config, and troubleshooting for Deadlocked CS2 Linux overlay.",
        tags: ["cs2", "gaming", "linux", "overlay", "deadlocked"]
      }
    ]
  },
  {
    category: "🔥 Backend, Cloud & AI",
    icon: "🔥",
    skills: [
      {
        name: "firebase",
        command: "/firebase",
        desc: "Complete Firebase Suite: Firestore modeling, security rules, Auth, App Hosting (SSR), Data Connect SQL, and Remote Config.",
        tags: ["firebase", "firestore", "auth", "backend", "rules", "sql"]
      },
      {
        name: "gemini-api-dev",
        command: "/gemini-api-dev",
        desc: "Google Gemini API SDK: multimodal comprehension, function calling, structured JSON output, and streaming.",
        tags: ["gemini", "ai", "llm", "multimodal", "sdk"]
      },
      {
        name: "gemini-live-api-dev",
        command: "/gemini-live-api-dev",
        desc: "Bidirectional WebSocket streaming audio/video with Gemini Live API and voice activity detection.",
        tags: ["gemini", "live", "websocket", "voice", "streaming"]
      },
      {
        name: "gemini-omni-flash-api",
        command: "/gemini-omni-flash-api",
        desc: "Generative video editing, frame transitions, and video extension with Gemini Omni Flash.",
        tags: ["video", "omni", "generative", "gemini"]
      },
      {
        name: "google-antigravity-sdk",
        command: "/google-antigravity-sdk",
        desc: "Design, implement, and orchestrate autonomous AI agents and multi-agent systems.",
        tags: ["antigravity", "agents", "sdk", "orchestration"]
      },
      {
        name: "mcp-builder",
        command: "/mcp-builder",
        desc: "Build Model Context Protocol servers in Python (FastMCP) or TypeScript.",
        tags: ["mcp", "servers", "tools", "fastmcp"]
      }
    ]
  },
  {
    category: "🧐 Engineering Quality & Reasoning",
    icon: "🧐",
    skills: [
      {
        name: "ponytail",
        command: "/ponytail",
        desc: "Lazy senior dev mode: minimal diffs that fully solve the task. Subcommands: /ponytail audit, /ponytail review, /ponytail debt.",
        tags: ["ponytail", "clean", "minimal", "refactor", "yagni", "audit"]
      },
      {
        name: "claude-council",
        command: "/claude-council",
        desc: "Multi-perspective AI consensus council for complex architectural and refactoring decisions.",
        tags: ["council", "consensus", "architecture", "reasoning"]
      },
      {
        name: "using-superpowers",
        command: "/using-superpowers",
        desc: "Autonomous superpower skills suite: systematically guides task discovery, planning, debugging, and verification.",
        tags: ["superpowers", "workflow", "discipline"]
      },
      {
        name: "systematic-debugging",
        command: "/systematic-debugging",
        desc: "4-phase systematic debugging framework: reproduce, isolate root cause, test hypotheses, and verify fix.",
        tags: ["debugging", "troubleshooting", "root-cause"]
      },
      {
        name: "writing-plans",
        command: "/writing-plans",
        desc: "Rigorous step-by-step implementation planning with bite-sized tasks and verification tests.",
        tags: ["planning", "architecture", "roadmap"]
      },
      {
        name: "executing-plans",
        command: "/executing-plans",
        desc: "Execute written implementation plans systematically with review checkpoints.",
        tags: ["execution", "plans", "tracking"]
      },
      {
        name: "test-driven-development",
        command: "/test-driven-development",
        desc: "Strict TDD workflow: red-green-refactor cycle before writing any implementation code.",
        tags: ["tdd", "testing", "unit-test"]
      },
      {
        name: "verification-before-completion",
        command: "/verification-before-completion",
        desc: "Empirical proof protocol: run commands and verify real test/build output before claiming completion.",
        tags: ["verification", "testing", "ci"]
      },
      {
        name: "git-commit",
        command: "/git-commit",
        desc: "Intelligent Conventional Commit staging, diff analysis, and conventional message authoring.",
        tags: ["git", "commit", "conventional-commits"]
      },
      {
        name: "security-best-practices",
        command: "/security-best-practices",
        desc: "Deep security audit for injection, auth bypasses, OWASP Top 10, and memory safety.",
        tags: ["security", "audit", "owasp", "hardening"]
      }
    ]
  },
  {
    category: "🐞 Browser & E2E Automation",
    icon: "🐞",
    skills: [
      {
        name: "browser",
        command: "/browser",
        desc: "Autonomous single-prompt browser control over active Chrome via CDP and background daemon.",
        tags: ["browser", "cdp", "playwright", "automation"]
      },
      {
        name: "cdp-daemon-automation",
        command: "/cdp-daemon-automation",
        desc: "Persistent background Playwright daemon with file-based IPC for silent, repeatable browser tasks.",
        tags: ["cdp", "daemon", "ipc", "silent"]
      },
      {
        name: "chrome-devtools",
        command: "/chrome-devtools",
        desc: "Chrome DevTools MCP server for live DOM debugging, network inspection, and console logging.",
        tags: ["devtools", "mcp", "dom", "network"]
      },
      {
        name: "webapp-testing",
        command: "/webapp-testing",
        desc: "Test and verify local web applications with Playwright: screenshots, logs, and interaction.",
        tags: ["playwright", "e2e", "testing", "webapp"]
      },
      {
        name: "playwright-best-practices",
        command: "/playwright-best-practices",
        desc: "Production Playwright patterns: resilient locators, auto-waiting, fixtures, and CI reliability.",
        tags: ["playwright", "testing", "best-practices"]
      },
      {
        name: "a11y-debugging",
        command: "/a11y-debugging",
        desc: "Web accessibility (WCAG) audit: semantic HTML, ARIA labels, focus states, tap targets.",
        tags: ["a11y", "accessibility", "wcag"]
      },
      {
        name: "debug-optimize-lcp",
        command: "/debug-optimize-lcp",
        desc: "Debug and optimize Largest Contentful Paint (LCP) performance and Core Web Vitals.",
        tags: ["lcp", "performance", "cwv", "speed"]
      },
      {
        name: "memory-leak-debugging",
        command: "/memory-leak-debugging",
        desc: "Diagnose and resolve Node.js/JS memory leaks via heap snapshots and object allocation tracking.",
        tags: ["memory", "leak", "heapsnapshot"]
      }
    ]
  },
  {
    category: "📄 Documents, Specs & Office",
    icon: "📄",
    skills: [
      {
        name: "prd",
        command: "/prd",
        desc: "Generate high-quality Product Requirements Documents with user stories, technical specs, and risks.",
        tags: ["prd", "specs", "product", "requirements"]
      },
      {
        name: "docx",
        command: "/docx",
        desc: "Create, inspect, format, and edit Word documents (.docx) with tables of contents, headings, and tables.",
        tags: ["docx", "word", "documents", "office"]
      },
      {
        name: "pdf",
        command: "/pdf",
        desc: "Manipulate, extract text/tables, split, merge, encrypt, and fill forms in PDF documents.",
        tags: ["pdf", "extract", "forms", "documents"]
      },
      {
        name: "pptx",
        command: "/pptx",
        desc: "Create and edit PowerPoint (.pptx) pitch decks, presentations, master layouts, and speaker notes.",
        tags: ["pptx", "powerpoint", "slides", "deck"]
      },
      {
        name: "xlsx",
        command: "/xlsx",
        desc: "Read, create, formula-model, format, and validate Excel (.xlsx) spreadsheets.",
        tags: ["xlsx", "excel", "sheets", "data", "spreadsheets"]
      },
      {
        name: "slides",
        command: "/slides",
        desc: "Create strategic HTML presentations with Chart.js, design tokens, and contextual layouts.",
        tags: ["slides", "html", "chartjs", "presentation"]
      }
    ]
  }
];

function getInjectionPayload() {
  const skillsJson = JSON.stringify(SKILLS_DATABASE);
  return `
    (() => {
      const skillsData = ${skillsJson};

      // 1. Inject Styles
      const styleId = "antigravity-skills-hub-styles";
      let styleEl = document.getElementById(styleId);
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = styleId;
        (document.head || document.documentElement).appendChild(styleEl);
      }
      styleEl.textContent = \`
          /* Cleanly hide upper title/menu bar without affecting sidebar header */
          div.shrink-0:has(> [data-testid="title-menu-bar"]),
          div.shrink-0:has(div[style*="app-region: drag"]) {
            display: none !important;
          }

          #antigravity-skills-nav-btn {
            position: relative;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          }
          #antigravity-skills-nav-btn:hover {
            transform: translateX(2px);
          }
          #antigravity-skills-nav-btn.active {
            background: color-mix(in srgb, var(--primary, #f05b5d) 15%, transparent) !important;
            color: var(--primary, #f05b5d) !important;
          }

          #antigravity-skills-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.45);
            backdrop-filter: blur(4px);
            z-index: 999990;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.25s ease;
          }
          #antigravity-skills-backdrop.open {
            opacity: 1;
            pointer-events: auto;
          }

          #antigravity-skills-drawer {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            height: 100vh;
            max-height: 100vh;
            width: 440px;
            max-width: 92vw;
            background: rgba(26, 14, 14, 0.95);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border-left: 1px solid color-mix(in srgb, var(--primary, #f05b5d) 30%, rgba(255, 255, 255, 0.12));
            box-shadow: -12px 0 40px rgba(0, 0, 0, 0.65);
            z-index: 999995;
            display: flex;
            flex-direction: column;
            overflow: hidden !important;
            transform: translateX(100%);
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            color: #f1f0f7;
            font-family: inherit;
            box-sizing: border-box;
          }
          #antigravity-skills-drawer.open {
            transform: translateX(0);
          }

          .ag-drawer-header {
            padding: 18px 20px 14px 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
          }
          .ag-drawer-title-group {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .ag-drawer-title {
            font-size: 16px;
            font-weight: 700;
            letter-spacing: -0.2px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: #fff;
          }
          .ag-drawer-subtitle {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.55);
          }
          .ag-drawer-close-btn {
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.7);
            border-radius: 8px;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.15s ease;
          }
          .ag-drawer-close-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            transform: scale(1.05);
          }

          .ag-drawer-search-wrap {
            padding: 12px 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            flex-shrink: 0;
          }
          .ag-drawer-search {
            width: 100%;
            background: rgba(0, 0, 0, 0.35);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 8px;
            padding: 8px 12px;
            color: #fff;
            font-size: 13px;
            outline: none;
            box-sizing: border-box;
            transition: border-color 0.15s ease, box-shadow 0.15s ease;
          }
          .ag-drawer-search:focus {
            border-color: var(--primary, #f05b5d);
            box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary, #f05b5d) 20%, transparent);
          }
          .ag-drawer-search::placeholder {
            color: rgba(255, 255, 255, 0.4);
          }

          .ag-drawer-content {
            flex: 1 1 0% !important;
            min-height: 0 !important;
            max-height: calc(100vh - 135px) !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            padding: 12px 16px 36px 16px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            overscroll-behavior: contain;
            scrollbar-width: thin;
            scrollbar-color: color-mix(in srgb, var(--primary, #f05b5d) 35%, transparent) transparent;
          }
          .ag-drawer-content::-webkit-scrollbar {
            width: 6px;
          }
          .ag-drawer-content::-webkit-scrollbar-thumb {
            background: color-mix(in srgb, var(--primary, #f05b5d) 35%, transparent);
            border-radius: 9999px;
          }
          .ag-drawer-content::-webkit-scrollbar-thumb:hover {
            background: var(--primary, #f05b5d);
          }

          .ag-category-box {
            border: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(255, 255, 255, 0.02);
            border-radius: 10px;
            overflow: hidden;
            transition: border-color 0.15s ease;
          }
          .ag-category-box:hover {
            border-color: rgba(255, 255, 255, 0.15);
          }
          .ag-category-header {
            padding: 10px 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            user-select: none;
            background: rgba(255, 255, 255, 0.03);
            transition: background 0.15s ease;
          }
          .ag-category-header:hover {
            background: rgba(255, 255, 255, 0.06);
          }
          .ag-category-title {
            font-size: 13px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            color: #eee;
          }
          .ag-category-badge {
            font-size: 10px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 9999px;
            background: rgba(255, 255, 255, 0.08);
            color: rgba(255, 255, 255, 0.7);
          }
          .ag-category-chevron {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.4);
            transition: transform 0.2s ease;
          }
          .ag-category-box.open .ag-category-chevron {
            transform: rotate(180deg);
          }
          .ag-category-body {
            display: none;
            padding: 10px 10px 12px 10px;
            flex-direction: column;
            gap: 8px;
            background: rgba(0, 0, 0, 0.15);
          }
          .ag-category-box.open .ag-category-body {
            display: flex;
          }

          .ag-skill-card {
            background: rgba(255, 255, 255, 0.035);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 8px;
            padding: 10px 12px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            transition: all 0.15s ease;
          }
          .ag-skill-card:hover {
            background: rgba(255, 255, 255, 0.06);
            border-color: color-mix(in srgb, var(--primary, #f05b5d) 35%, transparent);
            transform: translateY(-1px);
          }
          .ag-skill-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .ag-skill-name {
            font-family: monospace;
            font-size: 12.5px;
            font-weight: 700;
            color: var(--primary, #f05b5d);
            background: color-mix(in srgb, var(--primary, #f05b5d) 12%, transparent);
            padding: 2px 7px;
            border-radius: 5px;
            letter-spacing: -0.2px;
          }
          .ag-skill-use-btn {
            background: var(--primary, #f05b5d);
            color: #101010;
            border: none;
            border-radius: 6px;
            padding: 4px 12px;
            font-size: 11.5px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.15s ease;
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .ag-skill-use-btn:hover {
            opacity: 0.9;
            transform: scale(1.04);
            box-shadow: 0 2px 8px color-mix(in srgb, var(--primary, #f05b5d) 30%, transparent);
          }
          .ag-skill-use-btn.injected {
            background: #4ade80 !important;
            color: #064e3b !important;
          }
          .ag-skill-desc {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.72);
            line-height: 1.4;
          }
          .ag-skill-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-top: 2px;
          }
          .ag-skill-tag {
            font-size: 10px;
            color: rgba(255, 255, 255, 0.45);
            background: rgba(255, 255, 255, 0.04);
            padding: 1px 5px;
            border-radius: 4px;
        \`;

      // 2. Backdrop
      let backdrop = document.getElementById("antigravity-skills-backdrop");
      if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.id = "antigravity-skills-backdrop";
        document.body.appendChild(backdrop);
      }
      backdrop.classList.remove("open");

      // 3. Drawer
      let drawer = document.getElementById("antigravity-skills-drawer");
      if (!drawer) {
        drawer = document.createElement("div");
        drawer.id = "antigravity-skills-drawer";
        drawer.innerHTML = \`
          <div class="ag-drawer-header">
            <div class="ag-drawer-title-group">
              <div class="ag-drawer-title">
                <span>⚡</span>
                <span>Skills & Commands Hub</span>
              </div>
              <div class="ag-drawer-subtitle">Browse, filter, and inject workflows into chat</div>
            </div>
            <button class="ag-drawer-close-btn" id="ag-drawer-close-btn" title="Close (Esc)">✕</button>
          </div>
          <div class="ag-drawer-search-wrap">
            <input type="text" class="ag-drawer-search" id="ag-drawer-search" placeholder="Search skills, use cases, keywords... (e.g. review, stitch, clean)" />
          </div>
          <div class="ag-drawer-content" id="ag-drawer-content"></div>
        \`;
        document.body.appendChild(drawer);
      }
      drawer.classList.remove("open");

      // 4. Render Skills
      function renderSkills(filterText = "") {
        const container = document.getElementById("ag-drawer-content");
        if (!container) return;
        container.innerHTML = "";

        const query = filterText.trim().toLowerCase();
        let totalRendered = 0;

        skillsData.forEach((category, idx) => {
          const matchingSkills = category.skills.filter(s => {
            if (!query) return true;
            return (
              s.name.toLowerCase().includes(query) ||
              s.command.toLowerCase().includes(query) ||
              s.desc.toLowerCase().includes(query) ||
              s.tags.some(t => t.toLowerCase().includes(query))
            );
          });

          if (matchingSkills.length === 0) return;
          totalRendered += matchingSkills.length;

          const catBox = document.createElement("div");
          const isOpen = Boolean(query);
          catBox.className = isOpen ? "ag-category-box open" : "ag-category-box";

          const header = document.createElement("div");
          header.className = "ag-category-header";
          header.innerHTML = \`
            <div class="ag-category-title">
              <span>\${category.icon}</span>
              <span>\${category.category}</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="ag-category-badge">\${matchingSkills.length}</span>
              <span class="ag-category-chevron">▼</span>
            </div>
          \`;
          header.onclick = () => catBox.classList.toggle("open");

          const body = document.createElement("div");
          body.className = "ag-category-body";

          matchingSkills.forEach(s => {
            const card = document.createElement("div");
            card.className = "ag-skill-card";
            card.innerHTML = \`
              <div class="ag-skill-top">
                <span class="ag-skill-name">\${s.command}</span>
                <button class="ag-skill-use-btn" data-command="\${s.command}">
                  <span>Use</span>
                  <span>↳</span>
                </button>
              </div>
              <div class="ag-skill-desc">\${s.desc}</div>
              <div class="ag-skill-tags">
                \${s.tags.map(t => \`<span class="ag-skill-tag">#\${t}</span>\`).join("")}
              </div>
            \`;

            const useBtn = card.querySelector(".ag-skill-use-btn");
            useBtn.onclick = (e) => {
              e.stopPropagation();
              injectCommand(s.command, useBtn);
            };

            body.appendChild(card);
          });

          catBox.appendChild(header);
          catBox.appendChild(body);
          container.appendChild(catBox);
        });

        if (totalRendered === 0) {
          container.innerHTML = \`
            <div style="text-align:center; padding: 40px 20px; color: rgba(255,255,255,0.4);">
              <div style="font-size:24px; margin-bottom:8px;">🔍</div>
              <div style="font-size:13px; font-weight:600;">No matching skills found</div>
            </div>
          \`;
        }
      }

      renderSkills();

      const searchInput = document.getElementById("ag-drawer-search");
      if (searchInput) {
        searchInput.oninput = (e) => renderSkills(e.target.value);
      }

      const contentContainer = document.getElementById("ag-drawer-content");
      if (drawer && contentContainer) {
        drawer.addEventListener("wheel", (e) => {
          contentContainer.scrollTop += e.deltaY;
        }, { passive: true });
      }

      function toggleDrawer(open) {
        const drawerEl = document.getElementById("antigravity-skills-drawer");
        const backdropEl = document.getElementById("antigravity-skills-backdrop");
        const navBtn = document.getElementById("antigravity-skills-nav-btn");
        if (!drawerEl) return;

        const isCurrentlyOpen = drawerEl.classList.contains("open");
        const shouldOpen = open !== undefined ? open : !isCurrentlyOpen;

        if (shouldOpen) {
          drawerEl.classList.add("open");
          if (backdropEl) backdropEl.classList.add("open");
          if (navBtn) navBtn.classList.add("active");
          setTimeout(() => {
            const searchEl = document.getElementById("ag-drawer-search");
            if (searchEl) {
              searchEl.focus();
              searchEl.select();
            }
          }, 150);
        } else {
          drawerEl.classList.remove("open");
          if (backdropEl) backdropEl.classList.remove("open");
          if (navBtn) navBtn.classList.remove("active");
        }
      }
      window.__antigravity_toggle_skills_drawer = toggleDrawer;

      backdrop.onclick = () => toggleDrawer(false);
      const closeBtn = document.getElementById("ag-drawer-close-btn");
      if (closeBtn) closeBtn.onclick = () => toggleDrawer(false);

      window.addEventListener("keydown", (e) => {
        const drawerEl = document.getElementById("antigravity-skills-drawer");
        if (e.key === "Escape" && drawerEl && drawerEl.classList.contains("open")) {
          toggleDrawer(false);
        }
      });

      function injectCommand(cmd, btnEl) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(cmd).catch(() => {});
        }
        const editor = document.querySelector('[data-lexical-editor="true"]') || document.querySelector('[aria-label="Message input"]');
        if (editor) {
          editor.focus();
          const inputEvent = new InputEvent('beforeinput', {
            bubbles: true,
            cancelable: true,
            inputType: 'insertText',
            data: cmd
          });
          editor.dispatchEvent(inputEvent);

          setTimeout(() => {
            const esc = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true });
            editor.dispatchEvent(esc);
            document.dispatchEvent(esc);
          }, 40);

          if (btnEl) {
            btnEl.classList.add("injected");
            btnEl.innerHTML = "<span>✓ Injected!</span>";
            setTimeout(() => {
              btnEl.classList.remove("injected");
              btnEl.innerHTML = "<span>Use</span><span>↳</span>";
            }, 1200);
          }

          setTimeout(() => toggleDrawer(false), 280);
        }
      }

      function attachSidebarButton() {
        if (document.getElementById("antigravity-skills-nav-btn")) {
          return;
        }
        const settingsBtn = document.querySelector('[data-testid="settings-button"]');
        if (settingsBtn && settingsBtn.parentElement) {
          const btn = document.createElement("div");
          btn.id = "antigravity-skills-nav-btn";
          btn.setAttribute("role", "button");
          btn.tabIndex = 0;
          btn.className = "flex-grow flex items-center gap-1.5 group px-2 py-1 rounded-lg cursor-pointer h-8 min-w-0 bg-transparent hover:bg-sidebar-muted text-secondary-foreground";
          btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0" style="color: var(--primary, #f05b5d);">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <span class="select-none truncate text-sm font-normal">Skills Hub</span>
            <span style="margin-left: auto; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 9999px; background: color-mix(in srgb, var(--primary, #f05b5d) 15%, transparent); color: var(--primary, #f05b5d); border: 1px solid color-mix(in srgb, var(--primary, #f05b5d) 30%, transparent);">/cmd</span>
          `;
          btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleDrawer();
          };
          settingsBtn.parentElement.insertBefore(btn, settingsBtn);
          return;
        }

        const customLink = document.querySelector('a[href="/customizations"]');

        if (customLink && customLink.parentElement) {
          const btn = document.createElement("button");
          btn.id = "antigravity-skills-nav-btn";
          btn.type = "button";
          btn.className = "inline-flex items-center font-medium transition-colors select-none outline-none cursor-pointer disabled:opacity-50 flex-grow w-full justify-start select-none font-normal h-8 min-w-0 gap-1.5 px-2 py-1 rounded-lg bg-transparent text-secondary-foreground hover:bg-sidebar-muted hover:text-foreground";
          btn.innerHTML = \`
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-primary" style="color: var(--primary, #f05b5d);">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <span class="truncate text-sm" style="font-weight: 500;">Skills</span>
            <span style="margin-left: auto; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 9999px; background: color-mix(in srgb, var(--primary, #f05b5d) 15%, transparent); color: var(--primary, #f05b5d); border: 1px solid color-mix(in srgb, var(--primary, #f05b5d) 30%, transparent);">/cmd</span>
          \`;
          btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleDrawer();
          };
          customLink.insertAdjacentElement("afterend", btn);
        }
      }

      // Initial attach attempt
      attachSidebarButton();

      if (!window.__antigravity_skills_observer) {
        window.__antigravity_skills_observer = new MutationObserver(() => {
          if (!document.getElementById("antigravity-skills-nav-btn")) {
            attachSidebarButton();
          }
        });
        window.__antigravity_skills_observer.observe(document.body || document.documentElement, {
          childList: true,
          subtree: true
        });
      }

      return "Skills Hub successfully mounted!";
    })()
  `;
}

function findActivePorts() {
  const ports = new Set();
  for (const file of CANDIDATE_PORT_FILES) {
    if (fs.existsSync(file)) {
      try {
        const port = fs.readFileSync(file, 'utf8').split('\n')[0].trim();
        if (port && !isNaN(port)) ports.add(parseInt(port, 10));
      } catch (e) {}
    }
  }
  return Array.from(ports);
}

let activeWsConnections = new Map();

function setupPageConnection(page, payload) {
  if (activeWsConnections.has(page.id)) {
    const existingWs = activeWsConnections.get(page.id);
    if (existingWs && existingWs.readyState === WebSocket.OPEN) {
      const heartbeatExpr = `(() => {
        if (!document.getElementById("antigravity-skills-hub-styles")) {
          ${payload}
          return "Re-injected styles & payload via heartbeat";
        }
        return "OK";
      })()`;
      existingWs.send(JSON.stringify({
        id: 999,
        method: 'Runtime.evaluate',
        params: {
          expression: heartbeatExpr,
          returnByValue: true
        }
      }));
      return;
    }
  }

  try {
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    activeWsConnections.set(page.id, ws);

    ws.onopen = () => {
      console.log(`[Skills Hub] Connected to page: ${page.title || page.id} (${page.url})`);
      // 1. Enable Page and Runtime domains (MANDATORY for lifecycle events and persistent scripts)
      ws.send(JSON.stringify({ id: 1, method: 'Page.enable' }));
      ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));

      // 2. Evaluate immediately in current document
      ws.send(JSON.stringify({
        id: 3,
        method: 'Runtime.evaluate',
        params: { expression: payload, returnByValue: true }
      }));

      // 3. Register script to run automatically on any page reload (Ctrl+R)
      ws.send(JSON.stringify({
        id: 4,
        method: 'Page.addScriptToEvaluateOnNewDocument',
        params: { source: payload }
      }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id === 3 || msg.id === 999) {
          const val = msg.result?.result?.value;
          const err = msg.result?.exceptionDetails;
          console.log(`[Skills Hub] Page ${page.id} (${page.title}): val=${val}, raw=${JSON.stringify(msg.result)}`);
          try {
            fs.writeFileSync('/tmp/skills_hub_status.json', JSON.stringify({
              pageId: page.id,
              title: page.title,
              url: page.url,
              value: val,
              raw: msg.result,
              error: err || null,
              time: new Date().toISOString()
            }, null, 2));
          } catch (_) {}
        }
        // Instant re-injection on reload events
        if (
          msg.method === 'Page.frameNavigated' ||
          msg.method === 'Page.loadEventFired' ||
          msg.method === 'Page.domContentEventFired'
        ) {
          ws.send(JSON.stringify({
            id: 5,
            method: 'Runtime.evaluate',
            params: { expression: payload, returnByValue: true }
          }));
        }
      } catch (e) {}
    };

    ws.onclose = () => {
      console.log(`[Skills Hub] Disconnected from ${page.title || page.id}`);
      activeWsConnections.delete(page.id);
    };

    ws.onerror = (err) => {
      console.error(`[Skills Hub] WebSocket error on ${page.id}:`, err.message || err);
      activeWsConnections.delete(page.id);
    };
  } catch (err) {
    activeWsConnections.delete(page.id);
  }
}

async function checkAndInject() {
  const ports = findActivePorts();
  if (ports.length === 0) return;

  const payload = getInjectionPayload();

  for (const port of ports) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 800);
      const res = await fetch(`http://127.0.0.1:${port}/json`, { signal: controller.signal });
      clearTimeout(timer);
      const targets = await res.json();
      const pages = targets.filter(t => t.type === 'page');

      for (const page of pages) {
        setupPageConnection(page, payload);
      }
    } catch (e) {
      // Port inactive or restarting
    }
  }
}

// Watch loop: check every 1.5 seconds
console.log("Antigravity Skills Hub Daemon started (Ctrl+R auto-reload resilient).");
setInterval(checkAndInject, 1500);
checkAndInject();
