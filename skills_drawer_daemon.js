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
      const STORAGE_CATS_KEY = "antigravity_custom_categories_v1";
      const STORAGE_SKILLS_KEY = "antigravity_custom_skills_v1";

      function getCustomCategories() {
        try {
          const raw = localStorage.getItem(STORAGE_CATS_KEY);
          return raw ? JSON.parse(raw) : [];
        } catch (_) {
          return [];
        }
      }

      function saveCustomCategories(cats) {
        try {
          localStorage.setItem(STORAGE_CATS_KEY, JSON.stringify(cats));
        } catch (_) {}
      }

      function getCustomSkills() {
        try {
          const raw = localStorage.getItem(STORAGE_SKILLS_KEY);
          return raw ? JSON.parse(raw) : [];
        } catch (_) {
          return [];
        }
      }

      function saveCustomSkills(skills) {
        try {
          localStorage.setItem(STORAGE_SKILLS_KEY, JSON.stringify(skills));
        } catch (_) {}
      }

      // Cleanup old instance if present
      const oldDrawer = document.getElementById("antigravity-skills-drawer");
      if (oldDrawer) oldDrawer.remove();
      const oldBackdrop = document.getElementById("antigravity-skills-backdrop");
      if (oldBackdrop) oldBackdrop.remove();

      // 1. Inject Style
      let style = document.getElementById("antigravity-ui-enhancements");
      if (!style) {
        style = document.createElement("style");
        style.id = "antigravity-ui-enhancements";
        document.head.appendChild(style);
      }
      style.textContent = \`
        div.shrink-0:has(> [data-testid="title-menu-bar"]),
        div.shrink-0:has(div[style*="app-region: drag"]) {
          display: none !important;
        }
        .flex-1.min-h-0.overflow-y-auto.flex.flex-col.gap-6.py-3 {
          overflow-y: hidden !important;
        }
        .relative.w-full.h-full.overflow-y-auto.overscroll-none.px-2 {
          scrollbar-width: thin !important;
          scrollbar-color: rgba(255, 255, 255, 0.25) transparent !important;
          overscroll-behavior-y: contain !important;
          overflow-y: scroll !important;
        }
        .relative.w-full.h-full.overflow-y-auto.overscroll-none.px-2::-webkit-scrollbar {
          display: block !important;
          width: 6px !important;
        }
        .relative.w-full.h-full.overflow-y-auto.overscroll-none.px-2::-webkit-scrollbar-track {
          background: transparent !important;
        }
        .relative.w-full.h-full.overflow-y-auto.overscroll-none.px-2::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.25) !important;
          border-radius: 9999px !important;
        }
        .relative.w-full.h-full.overflow-y-auto.overscroll-none.px-2::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5) !important;
        }
        #antigravity-skills-nav-btn {
          cursor: pointer;
          transition: all 0.15s ease;
        }
        #antigravity-skills-nav-btn.active {
          background: rgba(255, 255, 255, 0.08) !important;
          color: #fff !important;
        }
        #antigravity-skills-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
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
        }
        #antigravity-skills-drawer.open {
          transform: translateX(0);
        }
        .ag-drawer-header {
          padding: 14px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .ag-drawer-title {
          font-size: 15px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #fff;
        }
        .ag-drawer-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ag-drawer-action-btn {
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
        }
        .ag-drawer-action-btn:hover {
          background: rgba(240, 91, 93, 0.2);
          border-color: rgba(240, 91, 93, 0.4);
          color: #fff;
        }
        .ag-drawer-action-btn.active {
          background: #f05b5d;
          border-color: #f05b5d;
          color: #fff;
        }
        .ag-drawer-close-btn {
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
        }
        .ag-drawer-close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
        #ag-drawer-main-view {
          display: flex;
          flex-direction: column;
          flex: 1 1 auto;
          overflow: hidden;
        }
        .ag-drawer-search-wrap {
          padding: 12px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          flex-shrink: 0;
        }
        .ag-drawer-search {
          width: 100%;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 6px;
          padding: 8px 12px;
          color: #fff;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
        }
        .ag-drawer-search:focus {
          border-color: #f05b5d;
        }
        .ag-drawer-content {
          flex: 1 1 auto;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          padding: 12px 16px 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          scrollbar-width: thin !important;
          scrollbar-color: rgba(240, 91, 93, 0.4) transparent !important;
        }
        .ag-drawer-content::-webkit-scrollbar {
          display: block !important;
          width: 6px !important;
        }
        .ag-drawer-content::-webkit-scrollbar-track {
          background: transparent !important;
        }
        .ag-drawer-content::-webkit-scrollbar-thumb {
          background: rgba(240, 91, 93, 0.4) !important;
          border-radius: 9999px !important;
        }
        .ag-category-box {
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.02);
          flex-shrink: 0 !important;
          min-height: max-content !important;
        }
        .ag-category-header {
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
        }
        .ag-category-header:hover {
          background: rgba(255, 255, 255, 0.06);
        }
        .ag-category-chevron {
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-block;
          color: rgba(255, 255, 255, 0.5);
        }
        .ag-category-box.open .ag-category-chevron {
          transform: rotate(180deg);
        }
        .ag-category-body {
          display: none;
          padding: 8px 10px 12px 10px;
          flex-direction: column;
          gap: 8px;
          background: rgba(0, 0, 0, 0.15);
        }
        .ag-category-box.open .ag-category-body {
          display: flex;
        }
        .ag-skill-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 6px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ag-skill-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ag-skill-name {
          font-family: monospace;
          font-size: 13px;
          font-weight: 600;
          color: #f05b5d;
        }
        .ag-skill-custom-badge {
          font-size: 9px;
          font-weight: 700;
          color: #f05b5d;
          background: rgba(240, 91, 93, 0.15);
          border: 1px solid rgba(240, 91, 93, 0.35);
          padding: 1px 5px;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .ag-skill-use-btn {
          background: #f05b5d;
          color: #fff;
          border: none;
          border-radius: 4px;
          padding: 3px 10px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s ease;
        }
        .ag-skill-use-btn:hover {
          opacity: 0.85;
        }
        .ag-skill-del-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          font-size: 12px;
          padding: 2px 4px;
          border-radius: 4px;
          transition: color 0.15s ease;
        }
        .ag-skill-del-btn:hover {
          color: #ff6e70;
          background: rgba(255, 50, 50, 0.1);
        }
        .ag-skill-desc {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.4;
        }
        .ag-skill-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .ag-skill-tag {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.45);
          background: rgba(255, 255, 255, 0.04);
          padding: 1px 5px;
          border-radius: 4px;
        }

        /* Settings View Styles */
        #ag-drawer-settings-view {
          display: none;
          flex: 1 1 auto;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          padding: 14px 18px 30px 18px;
          flex-direction: column;
          gap: 14px;
          scrollbar-width: thin !important;
          scrollbar-color: rgba(240, 91, 93, 0.4) transparent !important;
        }
        #ag-drawer-settings-view::-webkit-scrollbar {
          display: block !important;
          width: 6px !important;
        }
        #ag-drawer-settings-view::-webkit-scrollbar-thumb {
          background: rgba(240, 91, 93, 0.4) !important;
          border-radius: 9999px !important;
        }
        .ag-settings-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ag-settings-card-title {
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ag-settings-card-desc {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.55);
          line-height: 1.4;
        }
        .ag-custom-input, .ag-custom-select, .ag-custom-textarea {
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
        }
        .ag-custom-input:focus, .ag-custom-select:focus, .ag-custom-textarea:focus {
          border-color: #f05b5d;
          box-shadow: 0 0 0 1px rgba(240, 91, 93, 0.3);
        }
        .ag-custom-select option, .ag-custom-select optgroup {
          background: #1c1414;
          color: #fff;
        }
        .ag-custom-label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 4px;
        }
        .ag-custom-btn-primary {
          background: #f05b5d;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 7px 14px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .ag-custom-btn-primary:hover {
          background: #ff6e70;
        }
        .ag-cats-chip-container {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 6px;
        }
        .ag-cat-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(240, 91, 93, 0.15);
          border: 1px solid rgba(240, 91, 93, 0.3);
          color: #f1f0f7;
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 12px;
        }
        .ag-chip-del {
          cursor: pointer;
          opacity: 0.6;
          font-weight: bold;
          font-size: 11px;
          margin-left: 2px;
        }
        .ag-chip-del:hover {
          opacity: 1;
          color: #ff6e70;
        }
        .ag-custom-empty {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
          font-style: italic;
          padding: 4px 0;
        }
        .ag-custom-skill-item {
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 6px;
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
      \`;

      // 2. Backdrop & Drawer
      let backdrop = document.getElementById("antigravity-skills-backdrop");
      if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.id = "antigravity-skills-backdrop";
        document.body.appendChild(backdrop);
      }
      backdrop.classList.remove("open");

      let drawer = document.getElementById("antigravity-skills-drawer");
      if (!drawer) {
        drawer = document.createElement("div");
        drawer.id = "antigravity-skills-drawer";
        drawer.innerHTML = \`
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
        \`;
        document.body.appendChild(drawer);
      }

      let currentView = "main";
      function toggleDrawer(open) {
        const d = document.getElementById("antigravity-skills-drawer");
        const b = document.getElementById("antigravity-skills-backdrop");
        const btn = document.getElementById("antigravity-skills-nav-btn");
        if (!d) return;
        const isCurrentlyOpen = d.classList.contains("open");
        const shouldOpen = open !== undefined ? open : !isCurrentlyOpen;
        if (shouldOpen) {
          d.classList.add("open");
          if (b) b.classList.add("open");
          if (btn) btn.classList.add("active");
          setTimeout(() => {
            const s = document.getElementById("ag-drawer-search");
            if (s && currentView === "main") s.focus();
          }, 100);
        } else {
          d.classList.remove("open");
          if (b) b.classList.remove("open");
          if (btn) btn.classList.remove("active");
        }
      }
      window.__toggle_skills = toggleDrawer;

      backdrop.onclick = () => toggleDrawer(false);
      const closeBtn = document.getElementById("ag-drawer-close-btn");
      if (closeBtn) closeBtn.onclick = () => toggleDrawer(false);
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") toggleDrawer(false);
      });

      // View Switching
      function switchView(view) {
        currentView = view;
        const mainView = document.getElementById("ag-drawer-main-view");
        const settingsView = document.getElementById("ag-drawer-settings-view");
        const settingsBtn = document.getElementById("ag-drawer-settings-btn");
        const titleText = document.getElementById("ag-drawer-title-text");
        const label = document.getElementById("ag-settings-btn-label");

        if (view === "settings") {
          if (mainView) mainView.style.display = "none";
          if (settingsView) settingsView.style.display = "flex";
          if (settingsBtn) settingsBtn.classList.add("active");
          if (label) label.textContent = "← Catalog";
          if (titleText) titleText.textContent = "Customize Skills Hub";
          renderSettings();
        } else {
          if (mainView) mainView.style.display = "flex";
          if (settingsView) settingsView.style.display = "none";
          if (settingsBtn) settingsBtn.classList.remove("active");
          if (label) label.textContent = "Customize";
          if (titleText) titleText.textContent = "Skills & Commands Hub";
          renderSkills(document.getElementById("ag-drawer-search")?.value || "");
        }
      }

      const settingsBtn = document.getElementById("ag-drawer-settings-btn");
      if (settingsBtn) {
        settingsBtn.onclick = () => {
          switchView(currentView === "main" ? "settings" : "main");
        };
      }

      // Get Merged Skills Data (Built-in + Custom)
      function getMergedSkillsData() {
        const base = JSON.parse(JSON.stringify(skillsData));
        const customCats = getCustomCategories();
        const customSkills = getCustomSkills();

        // Ensure custom categories are present
        customCats.forEach(catName => {
          let catObj = base.find(c => c.category === catName || c.rawCategory === catName);
          if (!catObj) {
            catObj = {
              category: "📁 " + catName,
              rawCategory: catName,
              isCustomCat: true,
              skills: []
            };
            base.push(catObj);
          }
        });

        // Add custom skills into matching categories
        customSkills.forEach(s => {
          let catObj = base.find(c => c.category === s.category || c.rawCategory === s.category);
          if (!catObj) {
            catObj = {
              category: "📁 " + s.category,
              rawCategory: s.category,
              isCustomCat: true,
              skills: []
            };
            base.push(catObj);
          }
          if (!catObj.skills.some(existing => existing.command === s.command)) {
            catObj.skills.push({
              ...s,
              isCustom: true
            });
          }
        });

        return base;
      }

      // Render Skills Catalog
      function renderSkills(filterText = "") {
        const container = document.getElementById("ag-drawer-content");
        if (!container) return;
        container.innerHTML = "";
        const q = filterText.trim().toLowerCase();
        const mergedData = getMergedSkillsData();

        let visibleCount = 0;
        mergedData.forEach(cat => {
          const matches = cat.skills.filter(s => !q || s.name.toLowerCase().includes(q) || s.command.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q) || (s.tags && s.tags.some(t => t.toLowerCase().includes(q))));
          if (matches.length === 0) return;
          visibleCount++;

          const box = document.createElement("div");
          const isOpen = Boolean(q);
          box.className = isOpen ? "ag-category-box open" : "ag-category-box";
          box.innerHTML = \`<div class="ag-category-header"><span>\${cat.category}</span><span class="ag-category-chevron">▾</span></div>\`;
          box.querySelector(".ag-category-header").onclick = () => box.classList.toggle("open");

          const body = document.createElement("div");
          body.className = "ag-category-body";
          matches.forEach(s => {
            const card = document.createElement("div");
            card.className = "ag-skill-card";
            card.innerHTML = \`
              <div class="ag-skill-top">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span class="ag-skill-name">\${s.command}</span>
                  \${s.isCustom ? \`<span class="ag-skill-custom-badge">Custom</span>\` : ''}
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  \${s.isCustom ? \`<button class="ag-skill-del-btn" title="Delete custom skill">🗑️</button>\` : ''}
                  <button class="ag-skill-use-btn">Use ↳</button>
                </div>
              </div>
              <div class="ag-skill-desc">\${s.desc}</div>
              <div class="ag-skill-tags">
                \${(s.tags || []).map(t => \`<span class="ag-skill-tag">#\${t}</span>\`).join("")}
              </div>
            \`;

            if (s.isCustom) {
              const delBtn = card.querySelector(".ag-skill-del-btn");
              if (delBtn) {
                delBtn.onclick = (e) => {
                  e.stopPropagation();
                  const curr = getCustomSkills().filter(item => item.command !== s.command);
                  saveCustomSkills(curr);
                  renderSkills(filterText);
                };
              }
            }

            card.querySelector(".ag-skill-use-btn").onclick = (e) => {
              e.stopPropagation();
              if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(s.command).catch(() => {});
              }
              const editor = document.querySelector('[data-lexical-editor="true"]') || document.querySelector('[aria-label="Message input"]');
              if (editor) {
                editor.focus();
                editor.dispatchEvent(new InputEvent("beforeinput", { bubbles: true, cancelable: true, inputType: "insertText", data: s.command }));
                toggleDrawer(false);
              }
            };
            body.appendChild(card);
          });
          box.appendChild(body);
          container.appendChild(box);
        });

        if (visibleCount === 0) {
          container.innerHTML = \`
            <div style="text-align: center; padding: 40px 20px; color: rgba(255,255,255,0.4);">
              <div style="font-size: 24px; margin-bottom: 8px;">🔍</div>
              <div style="font-size: 13px; font-weight: 600;">No matching skills found</div>
              <button class="ag-custom-btn-secondary" style="margin-top: 14px;" id="ag-quick-add-custom-btn">+ Create Custom Skill</button>
            </div>
          \`;
          const quickBtn = document.getElementById("ag-quick-add-custom-btn");
          if (quickBtn) quickBtn.onclick = () => switchView("settings");
        }
      }
      renderSkills();

      const searchInput = document.getElementById("ag-drawer-search");
      if (searchInput) {
        searchInput.oninput = (e) => renderSkills(e.target.value);
      }

      // Render Settings View (Custom Categories & Skills Manager)
      function renderSettings() {
        // 1. Render Category Chips
        const chipContainer = document.getElementById("ag-cats-chip-container");
        const customCats = getCustomCategories();
        if (chipContainer) {
          chipContainer.innerHTML = "";
          if (customCats.length === 0) {
            chipContainer.innerHTML = \`<span class="ag-custom-empty">No custom categories yet. Add one above!</span>\`;
          } else {
            customCats.forEach(cat => {
              const chip = document.createElement("div");
              chip.className = "ag-cat-chip";
              chip.innerHTML = \`<span>📁 \${cat}</span><span class="ag-chip-del" title="Delete category">✕</span>\`;
              chip.querySelector(".ag-chip-del").onclick = () => {
                const updated = getCustomCategories().filter(c => c !== cat);
                saveCustomCategories(updated);
                renderSettings();
              };
              chipContainer.appendChild(chip);
            });
          }
        }

        // 2. Populate Target Category Select
        const catSelect = document.getElementById("ag-custom-skill-cat-select");
        if (catSelect) {
          catSelect.innerHTML = "";
          if (customCats.length > 0) {
            const groupCustom = document.createElement("optgroup");
            groupCustom.label = "Custom Categories";
            customCats.forEach(cat => {
              const opt = document.createElement("option");
              opt.value = cat;
              opt.textContent = "📁 " + cat;
              groupCustom.appendChild(opt);
            });
            catSelect.appendChild(groupCustom);
          }
          const groupBuiltin = document.createElement("optgroup");
          groupBuiltin.label = "Built-in Categories";
          skillsData.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.category;
            opt.textContent = c.category;
            groupBuiltin.appendChild(opt);
          });
          catSelect.appendChild(groupBuiltin);
        }

        // 3. Render Custom Skills List
        const customSkillsList = document.getElementById("ag-custom-skills-list");
        const countBadge = document.getElementById("ag-custom-skills-count");
        const customSkills = getCustomSkills();
        if (countBadge) countBadge.textContent = String(customSkills.length);

        if (customSkillsList) {
          customSkillsList.innerHTML = "";
          if (customSkills.length === 0) {
            customSkillsList.innerHTML = \`<span class="ag-custom-empty">No custom skills created yet. Fill the form above to add your first!</span>\`;
          } else {
            customSkills.forEach(s => {
              const item = document.createElement("div");
              item.className = "ag-custom-skill-item";
              item.innerHTML = \`
                <div class="ag-custom-skill-top">
                  <div style="display:flex; align-items:center; gap:6px;">
                    <span style="font-family: monospace; font-size: 13px; font-weight:600; color:#f05b5d;">\${s.command}</span>
                    <span class="ag-custom-skill-badge">\${s.category}</span>
                  </div>
                  <button class="ag-skill-del-btn" title="Delete custom skill">🗑️</button>
                </div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.7);">\${s.desc}</div>
                <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                  \${(s.tags || []).map(t => \`<span class="ag-skill-tag">#\${t}</span>\`).join("")}
                </div>
              \`;
              item.querySelector(".ag-skill-del-btn").onclick = () => {
                const updated = getCustomSkills().filter(item => item.command !== s.command);
                saveCustomSkills(updated);
                renderSettings();
              };
              customSkillsList.appendChild(item);
            });
          }
        }
      }

      // Bind Add Category Button
      const addCatBtn = document.getElementById("ag-add-cat-btn");
      const catInput = document.getElementById("ag-custom-cat-input");
      if (addCatBtn && catInput) {
        addCatBtn.onclick = () => {
          const val = catInput.value.trim();
          if (!val) return;
          const existing = getCustomCategories();
          if (!existing.includes(val)) {
            existing.push(val);
            saveCustomCategories(existing);
            catInput.value = "";
            renderSettings();
          }
        };
        catInput.onkeydown = (e) => {
          if (e.key === "Enter") addCatBtn.click();
        };
      }

      // Bind Save Custom Skill Button
      const saveSkillBtn = document.getElementById("ag-save-skill-btn");
      if (saveSkillBtn) {
        saveSkillBtn.onclick = () => {
          const catSelect = document.getElementById("ag-custom-skill-cat-select");
          const cmdInput = document.getElementById("ag-custom-skill-cmd-input");
          const nameInput = document.getElementById("ag-custom-skill-name-input");
          const descInput = document.getElementById("ag-custom-skill-desc-input");
          const tagsInput = document.getElementById("ag-custom-skill-tags-input");
          const statusMsg = document.getElementById("ag-skill-status-msg");

          let cmd = (cmdInput?.value || "").trim();
          if (!cmd) {
            if (statusMsg) {
              statusMsg.style.display = "block";
              statusMsg.style.background = "rgba(255, 60, 60, 0.2)";
              statusMsg.style.color = "#ff6e70";
              statusMsg.textContent = "Please enter a slash command (e.g. /my-skill).";
            }
            return;
          }
          if (!cmd.startsWith("/")) cmd = "/" + cmd;

          const category = catSelect?.value || "Custom";
          const name = (nameInput?.value || "").trim() || cmd.replace("/", "");
          const desc = (descInput?.value || "").trim() || "Custom user skill.";
          const rawTags = (tagsInput?.value || "").split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
          if (!rawTags.includes("custom")) rawTags.push("custom");

          const customSkills = getCustomSkills().filter(s => s.command !== cmd);
          customSkills.push({
            category,
            command: cmd,
            name,
            desc,
            tags: rawTags
          });
          saveCustomSkills(customSkills);

          if (statusMsg) {
            statusMsg.style.display = "block";
            statusMsg.style.background = "rgba(46, 204, 113, 0.2)";
            statusMsg.style.color = "#2ecc71";
            statusMsg.textContent = \`✓ Saved \${cmd} successfully!\`;
            setTimeout(() => { statusMsg.style.display = "none"; }, 3000);
          }

          if (cmdInput) cmdInput.value = "";
          if (nameInput) nameInput.value = "";
          if (descInput) descInput.value = "";
          if (tagsInput) tagsInput.value = "";

          renderSettings();
        };
      }

      // Attach Sidebar Button
      function attachBtn() {
        let b = document.getElementById("antigravity-skills-nav-btn");
        if (b) return;
        const settingsBtn = document.querySelector('[data-testid="settings-button"]');
        if (settingsBtn && settingsBtn.parentElement) {
          b = document.createElement("div");
          b.id = "antigravity-skills-nav-btn";
          b.setAttribute("role", "button");
          b.tabIndex = 0;
          b.className = "flex-grow flex items-center gap-1.5 group px-2 py-1 rounded-lg cursor-pointer h-8 min-w-0 bg-transparent hover:bg-sidebar-muted text-secondary-foreground";
          b.innerHTML = \`
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0" style="color: var(--primary, #f05b5d);">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <span class="select-none truncate text-sm font-normal">Skills Hub</span>
            <span style="margin-left: auto; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 9999px; background: color-mix(in srgb, var(--primary, #f05b5d) 15%, transparent); color: var(--primary, #f05b5d); border: 1px solid color-mix(in srgb, var(--primary, #f05b5d) 30%, transparent);">/cmd</span>
          \`;
          b.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleDrawer();
          };
          settingsBtn.parentElement.insertBefore(b, settingsBtn);
          return;
        }
      }
      attachBtn();

      if (!window.__antigravity_skills_observer) {
        window.__antigravity_skills_observer = new MutationObserver(() => {
          if (!document.getElementById("antigravity-skills-nav-btn")) {
            attachBtn();
          }
        });
        window.__antigravity_skills_observer.observe(document.body || document.documentElement, {
          childList: true,
          subtree: true
        });
      }

      // Universal mouse wheel forwarder
      if (!window.__sidebar_wheel_handler) {
        window.__sidebar_wheel_handler = (e) => {
          if (e.target && e.target.closest("#antigravity-skills-drawer")) {
            const activeScroll = currentView === "settings" ? document.getElementById("ag-drawer-settings-view") : document.getElementById("ag-drawer-content");
            if (activeScroll) {
              e.preventDefault();
              activeScroll.scrollTop += e.deltaY;
            }
            return;
          }
          const scrollEl = document.querySelector(".relative.w-full.h-full.overflow-y-auto.overscroll-none.px-2");
          if (!scrollEl) return;
          const sr = scrollEl.getBoundingClientRect();
          if (e.clientX < 0 || e.clientX > sr.right + 20) return;

          if (e.target && scrollEl.contains(e.target)) {
            requestAnimationFrame(() => {
              scrollEl.dispatchEvent(new Event("scroll", { bubbles: true }));
            });
            return;
          }

          e.preventDefault();
          scrollEl.scrollTop += e.deltaY;
          scrollEl.dispatchEvent(new Event("scroll", { bubbles: true }));
        };
        window.addEventListener("wheel", window.__sidebar_wheel_handler, { passive: false });
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
