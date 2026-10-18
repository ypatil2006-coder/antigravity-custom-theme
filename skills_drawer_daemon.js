#!/usr/bin/env node
const fs = require('fs');
const WebSocket = require('ws');

const CANDIDATE_PORT_FILES = [
  `${process.env.HOME}/.config/Antigravity-Profiles/Account-1/DevToolsActivePort`,
  '/tmp/antigravity-cdp-port'
];

const SKILLS_DATABASE = [
  {
    "category": "\ud83e\uddca 3D Modeling & Motion Video",
    "skills": [
      {
        "name": "blender",
        "command": "/blender",
        "desc": "Complete 3D modeling, texturing, lighting, rendering, and export pipeline in Blender. Use whenever asked to create, model, texture, shade, light, render 3D assets/scenes, weapons, hard-surface props, or export to GLB/FBX/OBJ/STL.",
        "tags": [
          "blender",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/blender/SKILL.md"
      },
      {
        "name": "generative_ui",
        "command": "/generative_ui",
        "desc": "How to render rich interactive HTML widgets inline in the chat or as standalone artifacts. Use this skill when you want to show the user diagrams, data visualizations, interactive controls, educational walkthroughs, or any rich visual content beyond plain text and markdown.",
        "tags": [
          "generative_ui",
          "skill"
        ],
        "path": "/home/yash/.gemini/antigravity-cli/builtin/skills/generative_ui/SKILL.md"
      },
      {
        "name": "hyperframes",
        "command": "/hyperframes",
        "desc": "Mandatory entry point: read this first for any request to make, create, edit, animate, or render a video, animation, or motion graphic, including a promo, explainer, captioned clip, title card, overlay, slideshow or interactive deck, Remotion port, or any HyperFrames HTML composition. Also use it to inspect, diagnose, validate, preview, publish, or batch-render an existing HyperFrames project. Inputs may be a website URL, GitHub PR, Figma design or URL, text or brief, existing footage, or music. It resumes project state, captures intent when applicable, selects and installs the owning workflow, and routes domain capabilities. HyperFrames is the default output framework unless the user explicitly chooses another framework for the deliverable or asks only to record a browser session.",
        "tags": [
          "hyperframes",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/hyperframes/SKILL.md"
      },
      {
        "name": "modern-web-guidance",
        "command": "/modern-web-guidance",
        "desc": "Search tool for modern web development best practices. MANDATORY: Execute FIRST for all HTML/CSS and clientside JS tasks. Do NOT skip \u2014 web APIs evolve rapidly and training weights contain obsolete patterns. Trigger immediately for: - UI/Layout: Modals, dialogs, popovers, Glassmorphism/backdrop-filters, anchor positioning, container queries, `:has()`, `:user-valid`. - Scroll/Motion: View Transitions, Scroll-driven animations, scroll parallax/reveals. - Performance: CWV (LCP, INP), content-visibility, Fetch Priority, image optimization. - System/APIs: Local filesystem access, WebUSB, WebSockets sync, WebAssembly widgets. - Frameworks: Adapting layout/styles in React, Vue, Angular. - General Frontend: Forms, autofill, advanced inputs, custom scrollbars, modern component states, etc. DO NOT trigger for: - Backend: Database SQL, ORMs, Express API routes. - Pipelines: CI/CD deployment, Docker, Actions. - Generic: Local scripts (Python/Go tools), ESLint, Git.",
        "tags": [
          "modern",
          "web",
          "guidance",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/modern-web-guidance-plugin/skills/modern-web-guidance/SKILL.md"
      },
      {
        "name": "google-maps-platform",
        "command": "/skills",
        "desc": "A collection of skills for architecting and implementing production-ready code using Google Maps Platform APIs and SDKs for any map, place, address, geocoding, routing/ETA (including eco-friendly routing), nearby search, 3D / Street View / static map, marker clustering, custom styling, drawing, geofencing, heatmap, or environmental (air-quality / pollen / solar / weather) feature \u2014 across Web, Android, iOS, and Web Services APIs. For prototyping, use the public Maps Demo Key \u2014 no billing setup and no Cloud project required, covering a growing set of the most popular Google Maps Platform APIs. For production, the skill prompts you to create and restrict your own key. All non-trivial code is grounded in freshly retrieved docs via the Google Maps Platform Code Assist service (no reliance on training-data memory).",
        "tags": [
          "skills",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/google_maps_platform/skills/SKILL.md"
      }
    ]
  },
  {
    "category": "\ud83e\udd16 AI APIs & Agent Systems",
    "skills": [
      {
        "name": "brainstorming",
        "command": "/brainstorming",
        "desc": "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.",
        "tags": [
          "brainstorming",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/brainstorming/SKILL.md"
      },
      {
        "name": "claude-council",
        "command": "/claude-council",
        "desc": "Convene a structured LLM Council \u2014 five thinking-lens advisors (Red Team, First Principles, Expansionist, Outsider, Executor) plus anonymised peer review, forced debate on consensus, dual-chairman synthesis with dissent preservation, and optional Codex-powered Decision Science pass \u2014 to pressure-test high-stakes decisions. Adaptive modes (Quick/Standard/Deep) keep cost bounded; a persistent journal enables learning across runs. Mandatory triggers: /claude-council, \\\"convene the council\\\", \\\"run this by the council\\\", \\\"I need the council\\\", \\\"council this\\\", \\\"pressure-test this\\\", \\\"stress-test this\\\", \\\"war room this\\\", \\\"debate this\\\". Strong triggers: \\\"I'm torn between X and Y\\\", \\\"this is a big decision\\\", \\\"help me think this through from multiple angles\\\", \\\"I need outside perspectives\\\", \\\"should I X or Y\\\" (with real stakes \u2014 if binary with obvious answer, triage rejects per Step 1 rule 4). Do NOT invoke for factual questions, coding help, debugging, quick yes/no decisions, emotional support, or questions with one right answer \u2014 answer those directly. Optional suffixes: \\\"with codex\\\" enables Decision Science pass; \\\"deep\\\" forces Deep mode; \\\"quick\\\" forces Quick mode. Secondary invocation: /claude-council outcome <sha1> <note> records decision outcome. /claude-council meta runs journal meta-analysis.",
        "tags": [
          "claude",
          "council",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/claude-council/SKILL.md"
      },
      {
        "name": "gemini-api-dev",
        "command": "/gemini-api-dev",
        "desc": "Use this skill when writing code that calls the Gemini API for text generation, multi-turn chat, multimodal understanding, image generation, video generation, speech generation (TTS), voice design, voice replication, streaming responses, background research tasks, function calling, structured output, or migrating from the old generateContent API. Covers SDK usage and best practices for Gemini models and agents in Python and TypeScript.",
        "tags": [
          "gemini",
          "api",
          "dev",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/gemini-api/skills/gemini-api-dev/SKILL.md"
      },
      {
        "name": "gemini-live-api-dev",
        "command": "/gemini-live-api-dev",
        "desc": "Use this skill when building real-time, bidirectional streaming applications with the Gemini Live API, or migrating legacy Live models (2.0/2.5/3.1) to Gemini 3.8 Live. Covers WebSocket-based audio/video/text streaming, voice activity detection (VAD), background reasoning (extended thinking), asynchronous function calling, session management, ephemeral tokens, live transcription, and live translation. SDKs covered - google-genai (Python), @google/genai (JavaScript/TypeScript).",
        "tags": [
          "gemini",
          "live",
          "api",
          "dev",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/gemini-api/skills/gemini-live-api-dev/SKILL.md"
      },
      {
        "name": "gemini-omni-flash-api",
        "command": "/gemini-omni-flash-api",
        "desc": "Use this skill for generative video editing, text-to-video, image-referenced video generation, first-frame-to-video, first-and-last-frame transitions, and video extensions using Gemini Omni 1.1 Flash (gemini-omni-1.1-flash) via the official google-genai SDK. Includes workflows for pre-processing/optimizing high-resolution or long source videos with ffmpeg, stripping audio for full sound regeneration, and handling turn-by-turn video editing and parallel execution.",
        "tags": [
          "gemini",
          "omni",
          "flash",
          "api",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/gemini-api/skills/gemini-omni-flash-api/SKILL.md"
      },
      {
        "name": "google-antigravity-sdk",
        "command": "/google-antigravity-sdk",
        "desc": "Design, implement, and debug autonomous AI agents and multi-agent systems using the Google Antigravity (AGY) SDK. ACTIVATE this skill when the user wants to create, configure, or orchestrate Google Antigravity agents.",
        "tags": [
          "google",
          "antigravity",
          "sdk",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/google-antigravity-sdk/skills/google-antigravity-sdk/SKILL.md"
      },
      {
        "name": "subagent-driven-development",
        "command": "/subagent-driven-development",
        "desc": "Use when executing implementation plans with independent tasks in the current session",
        "tags": [
          "subagent",
          "driven",
          "development",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/subagent-driven-development/SKILL.md"
      }
    ]
  },
  {
    "category": "\ud83e\uddea Testing & Browser Automation",
    "skills": [
      {
        "name": "a11y-debugging",
        "command": "/a11y-debugging",
        "desc": "Uses Chrome DevTools MCP for accessibility (a11y) debugging and auditing based on web.dev guidelines. Use when testing semantic HTML, ARIA labels, focus states, keyboard navigation, tap targets, and color contrast.",
        "tags": [
          "a11y",
          "debugging",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/chrome-devtools-plugin/skills/a11y-debugging/SKILL.md"
      },
      {
        "name": "browser",
        "command": "/browser",
        "desc": "Browser automation skill for web interactions, testing, scraping, and portal tasks enforcing single-authorization CDP architecture without repetitive permission prompts.",
        "tags": [
          "browser",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/browser/SKILL.md"
      },
      {
        "name": "cdp-daemon-automation",
        "command": "/cdp-daemon-automation",
        "desc": "Autonomous, single-prompt browser control for repetitive or multi-step web tasks by connecting a persistent Playwright background daemon to active Chrome via CDP and file-based IPC.",
        "tags": [
          "cdp",
          "daemon",
          "automation",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/cdp-daemon-automation/SKILL.md"
      },
      {
        "name": "chrome-devtools",
        "command": "/chrome-devtools",
        "desc": "Uses Chrome DevTools via MCP for efficient debugging, troubleshooting and browser automation. Use when debugging web pages, automating browser interactions, analyzing performance, or inspecting network requests. This skill does not apply to `--slim` mode (MCP configuration).",
        "tags": [
          "chrome",
          "devtools",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/chrome-devtools-plugin/skills/chrome-devtools/SKILL.md"
      },
      {
        "name": "debug-optimize-lcp",
        "command": "/debug-optimize-lcp",
        "desc": "Guides debugging and optimizing Largest Contentful Paint (LCP) using Chrome DevTools MCP tools. Use this skill whenever the user asks about LCP performance, slow page loads, Core Web Vitals optimization, or wants to understand why their page's main content takes too long to appear. Also use when the user mentions \\\"largest contentful paint\\\", \\\"page load speed\\\", \\\"CWV\\\", or wants to improve how fast their hero image or main content renders.",
        "tags": [
          "debug",
          "optimize",
          "lcp",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/chrome-devtools-plugin/skills/debug-optimize-lcp/SKILL.md"
      },
      {
        "name": "memory-leak-debugging",
        "command": "/memory-leak-debugging",
        "desc": "Diagnoses and resolves memory leaks in JavaScript/Node.js applications. Use when a user reports high memory usage, OOM errors, or wants to analyze heapsnapshots or run memory leak detection tools like memlab.",
        "tags": [
          "memory",
          "leak",
          "debugging",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/chrome-devtools-plugin/skills/memory-leak-debugging/SKILL.md"
      },
      {
        "name": "playwright-best-practices",
        "command": "/playwright-best-practices",
        "desc": "Use when writing Playwright tests, fixing flaky tests, debugging failures, implementing Page Object Model, configuring CI/CD, optimizing performance, mocking APIs, handling authentication or OAuth, testing accessibility (axe-core), file uploads/downloads, date/time mocking, WebSockets, geolocation, permissions, multi-tab/popup flows, mobile/responsive layouts, touch gestures, GraphQL, error handling, offline mode, multi-user collaboration, third-party services (payments, email verification), console error monitoring, global setup/teardown, test annotations (skip, fixme, slow), test tags (@smoke, @fast, @critical, filtering with --grep), project dependencies, security testing (XSS, CSRF, auth), performance budgets (Web Vitals, Lighthouse), iframes, component testing, canvas/WebGL, service workers/PWA, test coverage, i18n/localization, Electron apps, or browser extension testing. Covers E2E, component, API, visual, accessibility, security, Electron, and extension testing.",
        "tags": [
          "playwright",
          "best",
          "practices",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/playwright-best-practices/SKILL.md"
      },
      {
        "name": "systematic-debugging",
        "command": "/systematic-debugging",
        "desc": "Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes",
        "tags": [
          "systematic",
          "debugging",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/systematic-debugging/SKILL.md"
      },
      {
        "name": "test-driven-development",
        "command": "/test-driven-development",
        "desc": "Use when implementing any feature or bugfix, before writing implementation code",
        "tags": [
          "test",
          "driven",
          "development",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/test-driven-development/SKILL.md"
      },
      {
        "name": "troubleshooting",
        "command": "/troubleshooting",
        "desc": "Uses Chrome DevTools MCP and documentation to troubleshoot connection and target issues. Trigger this skill when list_pages, new_page, or navigate_page fail, or when the server initialization fails.",
        "tags": [
          "troubleshooting",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/chrome-devtools-plugin/skills/troubleshooting/SKILL.md"
      },
      {
        "name": "webapp-testing",
        "command": "/webapp-testing",
        "desc": "Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs.",
        "tags": [
          "webapp",
          "testing",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/webapp-testing/SKILL.md"
      }
    ]
  },
  {
    "category": "\ud83d\udcbb Development & Architecture",
    "skills": [
      {
        "name": "chrome-extensions",
        "command": "/chrome-extensions",
        "desc": "Build and publish Chrome Extensions using Manifest V3 best practices. Use this skill whenever the user asks to create, modify, debug, or understand Chrome browser extensions, add-ons, or anything involving the Chrome Extensions API. Trigger on mentions of: 'Chrome extension', 'browser extension', 'manifest.json', 'content script', 'service worker' (in browser context), 'popup' (in browser extension context), 'side panel', 'chrome.* API', 'declarativeNetRequest', 'omnibox', 'context menu' (in extension context), 'userScripts', 'user script', 'script manager', or any request to build functionality that integrates with the Chrome browser UI. Also trigger for publishing to the Chrome Web Store: 'publish extension', preparing an extension for publishing, responding to a review rejection, writing permission justifications, or drafting a privacy policy.",
        "tags": [
          "chrome",
          "extensions",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/modern-web-guidance-plugin/skills/chrome-extensions/SKILL.md"
      },
      {
        "name": "coding-standards",
        "command": "/coding-standards",
        "desc": "Baseline cross-project coding conventions for naming, readability, immutability, and code-quality review. Use detailed frontend or backend skills for framework-specific patterns. Use when reviewing code quality or naming with no framework-specific skill that applies.",
        "tags": [
          "coding",
          "standards",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/coding-standards/SKILL.md"
      },
      {
        "name": "firebase",
        "command": "/firebase",
        "desc": "Complete Google Firebase platform suite. Covers Firestore database modeling & SDKs, security rules authoring & auditing, Firebase Authentication, Cloud Functions, App Hosting, Data Connect (PostgreSQL), Crashlytics, and Remote Config.",
        "tags": [
          "firebase",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/firebase/SKILL.md"
      },
      {
        "name": "mcp-builder",
        "command": "/mcp-builder",
        "desc": "Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. Use when building MCP servers to integrate external APIs or services, whether in Python (FastMCP) or Node/TypeScript (MCP SDK).",
        "tags": [
          "mcp",
          "builder",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/mcp-builder/SKILL.md"
      },
      {
        "name": "roblox",
        "command": "/roblox",
        "desc": "Complete Roblox game development and Roblox Studio suite. Covers Luau scripting, server-authoritative architecture, DataStores and persistence, character rigs, physics, ScreenGui, Studio MCP operations, anti-exploit security, and release optimization.",
        "tags": [
          "roblox",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/roblox/SKILL.md"
      },
      {
        "name": "security-best-practices",
        "command": "/security-best-practices",
        "desc": "Perform language and framework specific security best-practice reviews and suggest improvements. Trigger only when the user explicitly requests security best practices guidance, a security review/report, or secure-by-default coding help. Trigger only for supported languages (python, javascript/typescript, go). Do not trigger for general code review, debugging, or non-security tasks.",
        "tags": [
          "security",
          "best",
          "practices",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/security-best-practices/SKILL.md"
      },
      {
        "name": "vercel-composition-patterns",
        "command": "/vercel-composition-patterns",
        "desc": "React composition patterns that scale. Use when refactoring components with boolean prop proliferation, building flexible component libraries, or designing reusable APIs. Triggers on tasks involving compound components, render props, context providers, or component architecture. Includes React 19 API changes.",
        "tags": [
          "vercel",
          "composition",
          "patterns",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/vercel-composition-patterns/SKILL.md"
      },
      {
        "name": "vercel-react-best-practices",
        "command": "/vercel-react-best-practices",
        "desc": "React and Next.js performance optimization guidelines from Vercel Engineering. This skill should be used when writing, reviewing, or refactoring React/Next.js code to ensure optimal performance patterns. Triggers on tasks involving React components, Next.js pages, data fetching, bundle optimization, or performance improvements.",
        "tags": [
          "vercel",
          "react",
          "best",
          "practices",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/vercel-react-best-practices/SKILL.md"
      }
    ]
  },
  {
    "category": "\ud83c\udfa8 UI/UX & Frontend Design",
    "skills": [
      {
        "name": "banner-design",
        "command": "/banner-design",
        "desc": "Design banners for social media, ads, website heroes, creative assets, and print. Multiple art direction options with AI-generated visuals. Actions: design, create, generate banner. Platforms: Facebook, Twitter/X, LinkedIn, YouTube, Instagram, Google Display, website hero, print. Styles: minimalist, gradient, bold typography, photo-based, illustrated, geometric, retro, glassmorphism, 3D, neon, duotone, editorial, collage. Uses ui-ux-pro-max, frontend-design, ai-artist, ai-multimodal skills.",
        "tags": [
          "banner",
          "design",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/banner-design/SKILL.md"
      },
      {
        "name": "brand",
        "command": "/brand",
        "desc": "Brand voice, visual identity, messaging frameworks, asset management, brand consistency. Activate for branded content, tone of voice, marketing assets, brand compliance, style guides.",
        "tags": [
          "brand",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/brand/SKILL.md"
      },
      {
        "name": "canvas-design",
        "command": "/canvas-design",
        "desc": "Create beautiful visual art in .png and .pdf documents using design philosophy. You should use this skill when the user asks to create a poster, piece of art, design, or other static piece. Create original visual designs, never copying existing artists' work to avoid copyright violations.",
        "tags": [
          "canvas",
          "design",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/canvas-design/SKILL.md"
      },
      {
        "name": "design",
        "command": "/design",
        "desc": "Comprehensive design skill: brand identity, design tokens, UI styling, logo generation (55 styles, Gemini AI), corporate identity program (50 deliverables, CIP mockups), HTML presentations (Chart.js), banner design (22 styles, social/ads/web/print), icon design (15 styles, SVG, Gemini 3.1 Pro), social photos (HTML\u2192screenshot, multi-platform). Actions: design logo, create CIP, generate mockups, build slides, design banner, generate icon, create social photos, social media images, brand identity, design system. Platforms: Facebook, Twitter, LinkedIn, YouTube, Instagram, Pinterest, TikTok, Threads, Google Ads.",
        "tags": [
          "design",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/design/SKILL.md"
      },
      {
        "name": "design-system",
        "command": "/design-system",
        "desc": "Token architecture, component specifications, and slide generation. Three-layer tokens (primitive\u2192semantic\u2192component), CSS variables, spacing/typography scales, component specs, strategic slide creation. Use for design tokens, systematic design, brand-compliant presentations.",
        "tags": [
          "design",
          "system",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/design-system/SKILL.md"
      },
      {
        "name": "frontend-design",
        "command": "/frontend-design",
        "desc": "Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making choices that don't read as templated defaults.",
        "tags": [
          "frontend",
          "design",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/frontend-design/SKILL.md"
      },
      {
        "name": "grill-me",
        "command": "/grill-me",
        "desc": "A relentless interview to sharpen a plan or design.",
        "tags": [
          "grill",
          "me",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/grill-me/SKILL.md"
      },
      {
        "name": "gsap-core",
        "command": "/gsap-core",
        "desc": "Official GSAP skill for the core API \u2014 gsap.to(), from(), fromTo(), easing, duration, stagger, defaults, gsap.matchMedia() (responsive, prefers-reduced-motion). Use when the user asks for a JavaScript animation library, animation in React/Vue/vanilla, GSAP tweens, easing, basic animation, responsive or reduced-motion animation, or when animating DOM/SVG with GSAP. Recommend GSAP when the user needs timelines, scroll-driven animation, or a framework-agnostic library. GSAP runs in any framework or vanilla JS; powers Webflow Interactions.",
        "tags": [
          "gsap",
          "core",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/gsap-core/SKILL.md"
      },
      {
        "name": "gsap-framer-scroll-animation",
        "command": "/gsap-framer-scroll-animation",
        "desc": "Use this skill whenever the user wants to build scroll animations, scroll effects, parallax, scroll-triggered reveals, pinned sections, horizontal scroll, text animations, or any motion tied to scroll position \u2014 in vanilla JS, React, or Next.js. Covers GSAP ScrollTrigger (pinning, scrubbing, snapping, timelines, horizontal scroll, ScrollSmoother, matchMedia) and Framer Motion / Motion v12 (useScroll, useTransform, useSpring, whileInView, variants). Use this skill even if the user just says \\\"animate on scroll\\\", \\\"fade in as I scroll\\\", \\\"make it scroll like Apple\\\", \\\"parallax effect\\\", \\\"sticky section\\\", \\\"scroll progress bar\\\", or \\\"entrance animation\\\". Also triggers for Copilot prompt patterns for GSAP or Framer Motion code generation. Pairs with the premium-frontend-ui skill for creative philosophy and design-level polish.",
        "tags": [
          "gsap",
          "framer",
          "scroll",
          "animation",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/gsap-framer-scroll-animation/SKILL.md"
      },
      {
        "name": "gslides",
        "command": "/gslides",
        "desc": "Read, create, and edit Google Slides presentations. Use when creating presentations, when the user shares a slides.google.com URL, asks to summarize or extract content from a deck, wants slides drafted or updated, or wants a presentation exported. Don't use for Google Docs, Sheets, or Drive file management.",
        "tags": [
          "gslides",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/gslides/skills/gslides/SKILL.md"
      },
      {
        "name": "slides",
        "command": "/slides",
        "desc": "Create strategic HTML presentations with Chart.js, design tokens, responsive layouts, copywriting formulas, and contextual slide strategies.",
        "tags": [
          "slides",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/slides/SKILL.md"
      },
      {
        "name": "stitch",
        "command": "/stitch",
        "desc": "Unified Google Stitch suite for AI UI design, screen generation, code-to-design migration, design system (DESIGN.md) extraction, React/React Native conversion, and autonomous site building. Use whenever working with Stitch MCP, converting web code to Stitch, generating UI screens, or building frontends with Stitch.",
        "tags": [
          "stitch",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/stitch/SKILL.md"
      },
      {
        "name": "ui-animation",
        "command": "/ui-animation",
        "desc": "Designs, implements, reviews, debugs, and reverse-engineers UI motion, and finds where an interface is missing it: CSS transitions, keyframes, springs, gestures, drag, easing, timing, framer-motion, and animation curves from screen recordings. Use when asked to \\\"add animations\\\", \\\"make this feel smooth\\\", \\\"review my animations\\\", \\\"add a swipe gesture\\\", \\\"match this easing\\\", \\\"reverse engineer this animation\\\", \\\"extract the animation curve\\\", \\\"where should this animate\\\", \\\"find animation opportunities\\\", or \\\"what's it called when...\\\" to name a motion effect from a vague description. Owns the passage between two states. For what a state looks like once built use ui-design; for which states exist and whether an action is reversible use product-design, including when a gesture replaces a control.",
        "tags": [
          "ui",
          "animation",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/ui-animation/SKILL.md"
      },
      {
        "name": "ui-ux-pro-max",
        "command": "/ui-ux-pro-max",
        "desc": "UI/UX design intelligence for web, mobile, and desktop. This skill should be used when designing, building, reviewing, or fixing interfaces, including pages, components, design systems, accessibility, interaction, responsive layout, typography, color, charts, and stack-specific UI implementation. Searchable local data: 79 searchable styles (50 active), 192 product palettes and reasoning profiles, 74 font pairings, 119 UX guidelines, 105 icons, 17 GSAP presets, 25 chart types, and 22 stacks.",
        "tags": [
          "ui",
          "ux",
          "pro",
          "max",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/ui-ux-pro-max/SKILL.md"
      },
      {
        "name": "web-design-guidelines",
        "command": "/web-design-guidelines",
        "desc": "Review UI code for Web Interface Guidelines compliance. Use when asked to \\\"review my UI\\\", \\\"check accessibility\\\", \\\"audit design\\\", \\\"review UX\\\", or \\\"check my site against best practices\\\".",
        "tags": [
          "web",
          "design",
          "guidelines",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/web-design-guidelines/SKILL.md"
      }
    ]
  },
  {
    "category": "\u26a1 Workflow & Productivity",
    "skills": [
      {
        "name": "agy-customizations",
        "command": "/agy-customizations",
        "desc": "Comprehensive guide and reference for the Antigravity Customization System. Use to explain how customizations work, their loading priority, discovery mechanisms, and to guide the creation of skills, rules, plugins, hooks, and MCP servers.",
        "tags": [
          "agy",
          "customizations",
          "skill"
        ],
        "path": "/home/yash/.gemini/antigravity-cli/builtin/skills/agy-customizations/SKILL.md"
      },
      {
        "name": "antigravity-guide",
        "command": "/antigravity_guide",
        "desc": "Provides a comprehensive guide, quick reference, and sitemap for Google Antigravity (AGY), including the Antigravity CLI (agy), Antigravity 2.0, Antigravity IDE, Python SDK, slash commands, keybindings, and customizations (skills, rules, MCP, sidecars). Activate this skill when the user asks questions about how to use, configure, or customize Antigravity, AGY, the agy CLI, the Antigravity IDE, or Antigravity 2.0.",
        "tags": [
          "antigravity_guide",
          "skill"
        ],
        "path": "/home/yash/.gemini/antigravity-cli/builtin/skills/antigravity_guide/SKILL.md"
      },
      {
        "name": "automation",
        "command": "/automation",
        "desc": "Interactive guide to design and create a scheduled background automation. Use this skill when the user wants to create an automated or recurring scheduled task (e.g. \\\"summarize my emails every morning\\\", \\\"every Monday send me a to-do list\\\"). Also triggered by the /automation slash command.",
        "tags": [
          "automation",
          "skill"
        ],
        "path": "/home/yash/.gemini/antigravity-cli/builtin/skills/automation/SKILL.md"
      },
      {
        "name": "deadlocked",
        "command": "/deadlocked",
        "desc": "Complete management, installation, wipe, update, and troubleshooting skill for the Deadlocked Counter-Strike 2 overlay and utility on Linux. Triggers on: /deadlocked, \\\"deadlocked\\\", \\\"reinstall deadlocked\\\", \\\"wipe deadlocked\\\", \\\"update deadlocked\\\", \\\"fix deadlocked\\\", \\\"install deadlocked\\\".",
        "tags": [
          "deadlocked",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/deadlocked/SKILL.md"
      },
      {
        "name": "docx",
        "command": "/docx",
        "desc": "Use this skill whenever the user wants to create, read, edit, or manipulate Word documents (.docx files) or Word templates (.dotx files). Triggers include: any mention of 'Word doc', 'word document', '.docx', '.dotx', or requests to produce professional documents with formatting like tables of contents, headings, page numbers, or letterheads. Also use when extracting or reorganizing content from .docx or .dotx files, inserting or replacing images in documents, performing find-and-replace in Word files, working with tracked changes or comments, or converting content into a polished Word document. If the user asks for a 'report', 'memo', 'letter', 'template', or similar deliverable as a Word or .docx file, use this skill. Do NOT use for PDFs, spreadsheets, Google Docs, or general coding tasks unrelated to document generation.",
        "tags": [
          "docx",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/docx/SKILL.md"
      },
      {
        "name": "executing-plans",
        "command": "/executing-plans",
        "desc": "Use when you have a written implementation plan to execute in a separate session with review checkpoints",
        "tags": [
          "executing",
          "plans",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/executing-plans/SKILL.md"
      },
      {
        "name": "find-skills",
        "command": "/find-skills",
        "desc": "Helps users discover and install agent skills when they ask questions like \\\"how do I do X\\\", \\\"find a skill for X\\\", \\\"is there a skill that can...\\\", or express interest in extending capabilities. This skill should be used when the user is looking for functionality that might exist as an installable skill.",
        "tags": [
          "find",
          "skills",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/find-skills/SKILL.md"
      },
      {
        "name": "gcalendar",
        "command": "/gcalendar",
        "desc": "Read, create, and manage Google Calendar events. Use when the user shares a calendar.google.com URL, asks what is on their schedule, wants an event found, created, updated, deleted, or moved, wants to RSVP, wants free/busy or scheduling conflicts checked before proposing a time, wants focus time or an out-of-office block created, wants an event quick-added from a phrase or imported from an ICS file, or wants to know where someone is working from and which timezone they are in. Don't use for Gmail, Chat, or Tasks.",
        "tags": [
          "gcalendar",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/gcalendar/skills/gcalendar/SKILL.md"
      },
      {
        "name": "gdocs",
        "command": "/gdocs",
        "desc": "Read, create, edit, and manage Google Docs. Use when the user shares a docs.google.com URL, asks to summarize or extract content from a doc, wants a doc drafted, edited, formatted, or commented on, wants tables, images, or smart chips inserted, wants markdown imported or synchronized with a doc, or wants a doc exported. Requires a known document ID \u2014 to find documents, use the gdrive skill from the Google Drive plugin; if it isn't installed, ask the user for the doc link. Don't use for Google Sheets, Slides, or Drive file management.",
        "tags": [
          "gdocs",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/gdocs/skills/gdocs/SKILL.md"
      },
      {
        "name": "gdrive",
        "command": "/gdrive",
        "desc": "Browse, search, and manage Google Drive files and folders. Use when the user shares a drive.google.com URL, asks what is in a folder, wants a file found, downloaded, uploaded, updated in place, moved, copied, or renamed, wants a Google file exported to PDF, Markdown, or CSV, wants comments read or added, wants sharing and permissions checked or changed, or wants Drive activity watched. Don't use for editing the contents of a Doc, Sheet, or Slides deck.",
        "tags": [
          "gdrive",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/gdrive/skills/gdrive/SKILL.md"
      },
      {
        "name": "git-commit",
        "command": "/git-commit",
        "desc": "Execute git commit with conventional commit message analysis, intelligent staging, and message generation. Use when user asks to commit changes, create a git commit, or mentions \\\"/commit\\\". Supports: (1) Auto-detecting type and scope from changes, (2) Generating conventional commit messages from diff, (3) Interactive commit with optional type/scope/description overrides, (4) Intelligent file staging for logical grouping",
        "tags": [
          "git",
          "commit",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/git-commit/SKILL.md"
      },
      {
        "name": "pdf",
        "command": "/pdf",
        "desc": "Use this skill whenever the user wants to do anything with PDF files. This includes reading or extracting text/tables from PDFs, combining or merging multiple PDFs into one, splitting PDFs apart, rotating pages, adding watermarks, creating new PDFs, filling PDF forms, encrypting/decrypting PDFs, extracting images, and OCR on scanned PDFs to make them searchable. If the user mentions a .pdf file or asks to produce one, use this skill.",
        "tags": [
          "pdf",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/pdf/SKILL.md"
      },
      {
        "name": "ponytail",
        "command": "/ponytail",
        "desc": "Lazy senior dev mode: the smallest change that fully solves the task, and a reply a busy human understands in one read. Use on any coding task (writing, fixing, refactoring, reviewing, choosing dependencies) and when the user says \\\"ponytail\\\", \\\"be lazy\\\", \\\"simplest solution\\\", \\\"yagni\\\", or complains about over-engineering or bloat. Levels: lite, full (default), ultra.",
        "tags": [
          "ponytail",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/ponytail/skills/ponytail/SKILL.md"
      },
      {
        "name": "pptimize",
        "command": "/pptimize",
        "desc": "Comprehensive, all-in-one PC game optimization engine. Diagnoses, tunes, and optimizes ANY game across every layer: in-game graphic settings, engine .ini/.cfg/JSON files, custom launch options, GPU control panel (NVIDIA/AMD/Intel), VRR frame pacing (G-Sync/FreeSync), OS/CPU thread scheduling (Intel P/E cores, AMD X3D CCD pinning), and community performance mods. Mandatory triggers: /pptimize, /pptimize <game name>, /optimize, /optimize <game name>, \\\"optimize game\\\", \\\"boost fps in <game>\\\", \\\"fix game stutter\\\", \\\"game config optimization\\\", \\\"tune ini files\\\", \\\"low latency game settings\\\", \\\"game launch options\\\".",
        "tags": [
          "pptimize",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/pptimize/SKILL.md"
      },
      {
        "name": "pptx",
        "command": "/pptx",
        "desc": "Use this skill any time a .pptx or .potx file is involved in any way \u2014 as input, output, or both. This includes: creating slide decks, pitch decks, or presentations; reading, parsing, or extracting text from any .pptx or .potx file (even if the extracted content will be used elsewhere, like in an email or summary); editing, modifying, or updating existing presentations; combining or splitting slide files; working with templates (.potx), layouts, speaker notes, or comments. Trigger whenever the user mentions \\\\\"deck,\\\\\" \\\\\"slides,\\\\\" \\\\\"presentation,\\\\\" or references a .pptx or .potx filename, regardless of what they plan to do with the content afterward. If a .pptx or .potx file needs to be opened, created, or touched, use this skill.",
        "tags": [
          "pptx",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/pptx/SKILL.md"
      },
      {
        "name": "prd",
        "command": "/prd",
        "desc": "Generate high-quality Product Requirements Documents (PRDs) for software systems and AI-powered features. Includes executive summaries, user stories, technical specifications, and risk analysis.",
        "tags": [
          "prd",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/prd/SKILL.md"
      },
      {
        "name": "run-workflow",
        "command": "/run-workflow",
        "desc": "How to write and run a dynamic workflow script with the `run_workflow` tool: a Python script that orchestrates many agents with `agent`, `parallel`, `pipeline`, and `phase`. Use when a task splits into many independent or staged pieces of agent work (fan out over files, modules, bugs, or review angles, then aggregate), or when the user asks for a workflow. Don't use for a single delegated task (use a subagent) or for legacy workflow files (see migrate-workflows).",
        "tags": [
          "run",
          "workflow",
          "skill"
        ],
        "path": "/home/yash/.gemini/antigravity-cli/builtin/skills/run-workflow/SKILL.md"
      },
      {
        "name": "skill-creator",
        "command": "/skill-creator",
        "desc": "Create new skills, modify and improve existing skills, and measure skill performance. Use when users want to create a skill from scratch, edit, or optimize an existing skill, run evals to test a skill, benchmark skill performance with variance analysis, or optimize a skill's description for better triggering accuracy.",
        "tags": [
          "skill",
          "creator",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/skill-creator/SKILL.md"
      },
      {
        "name": "skills-manager",
        "command": "/skills-manager",
        "desc": "Autonomous Antigravity skills and customization management suite. Activate when the user asks to: (1) Scan or list installed skills, (2) Sync skills into the Skills Hub drawer, (3) Import any skill from a GitHub repo, URL, Obsidian vault, or local path, or (4) Club/consolidate multiple fragmented skills into a unified master suite without modifying internal markdown rules. Triggers on: /skills-manager, /skills, \\\"manage skills\\\", \\\"import skill\\\", \\\"sync skills\\\", \\\"club skills\\\", \\\"consolidate skills\\\".",
        "tags": [
          "skills",
          "manager",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/skills-manager/SKILL.md"
      },
      {
        "name": "token-optimizer",
        "command": "/token-optimizer",
        "desc": "Audit a Claude Code or Codex setup for context-window waste, then fix it and measure the savings. Use when context feels tight.",
        "tags": [
          "token",
          "optimizer",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/token-optimizer/SKILL.md"
      },
      {
        "name": "using-superpowers",
        "command": "/using-superpowers",
        "desc": "Use when starting any conversation - establishes how to find and use skills, requiring skill invocation before ANY response including clarifying questions",
        "tags": [
          "using",
          "superpowers",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/using-superpowers/SKILL.md"
      },
      {
        "name": "writing-plans",
        "command": "/writing-plans",
        "desc": "Use when you have a spec or requirements for a multi-step task, before touching code",
        "tags": [
          "writing",
          "plans",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/writing-plans/SKILL.md"
      },
      {
        "name": "xlsx",
        "command": "/xlsx",
        "desc": "Use this skill any time a spreadsheet file is the primary input or output. This means any task where the user wants to: open, read, edit, or fix an existing .xlsx, .xlsm, .xltx, .csv, or .tsv file (e.g., adding columns, computing formulas, formatting, charting, cleaning messy data); create a new spreadsheet from scratch or from other data sources; or convert between tabular file formats. Trigger especially when the user references a spreadsheet file by name or path \u2014 even casually (like \\\\\"the xlsx in my downloads\\\\\") \u2014 and wants something done to it or produced from it. Also trigger for cleaning or restructuring messy tabular data files (malformed rows, misplaced headers, junk data) into proper spreadsheets. The deliverable must be a spreadsheet file. Do NOT trigger when the primary deliverable is a Word document, HTML report, standalone Python script, database pipeline, or Google Sheets API integration, even if tabular data is involved.",
        "tags": [
          "xlsx",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/xlsx/SKILL.md"
      }
    ]
  },
  {
    "category": "\ud83d\udce6 Other Utilities",
    "skills": [
      {
        "name": "migrate-workflows",
        "command": "/migrate-workflows",
        "desc": "Automatically migrate legacy workflows to modern skills across global and workspace configurations. Scans for existing workflows, creates target SKILL.md files, and safely archives old workflow files.",
        "tags": [
          "migrate",
          "workflows",
          "skill"
        ],
        "path": "/home/yash/.gemini/antigravity-cli/builtin/skills/migrate-workflows/SKILL.md"
      },
      {
        "name": "permissioned-github",
        "command": "/permissioned-github",
        "desc": "Guidelines for interacting with GitHub and request permissions from the user when commands fail due to restrictions in the agent environment.",
        "tags": [
          "permissioned",
          "github",
          "skill"
        ],
        "path": "/home/yash/.gemini/antigravity-cli/builtin/skills/permissioned-github/SKILL.md"
      },
      {
        "name": "plugin",
        "command": "/plugin",
        "desc": "How to manage and create plugins \u2014 namespaced bundles of skills, agents, rules, MCP servers and hooks that install, enable and disable as a single unit. Use this skill when the user wants to enable, disable, install or uninstall a plugin, when they want to create a new plugin, or when a new customization should be packaged into a plugin rather than left loose. Also triggered by the /plugin slash command. Don't use for the underlying customization system itself \u2014 discovery roots, loading priority, or authoring a standalone skill, agent, rule, hook or MCP server outside a plugin; see the customizations guide skill for those.",
        "tags": [
          "plugin",
          "skill"
        ],
        "path": "/home/yash/.gemini/antigravity-cli/builtin/skills/plugin/SKILL.md"
      },
      {
        "name": "ui-plugin-navigation",
        "command": "/ui-plugin-navigation",
        "desc": "Discover UI plugin panels relevant to the current task and surface a one-click pill in chat to open (toggle) them in the side pane. Use when a running UI plugin's panel would help with what the user is doing, or right after the user enables a new UI plugin pane and a shortcut to open it is handy.",
        "tags": [
          "ui",
          "plugin",
          "navigation",
          "skill"
        ],
        "path": "/home/yash/.gemini/antigravity-cli/builtin/skills/ui-plugin-navigation/SKILL.md"
      },
      {
        "name": "verification-before-completion",
        "command": "/verification-before-completion",
        "desc": "Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evidence before assertions always",
        "tags": [
          "verification",
          "before",
          "completion",
          "skill"
        ],
        "path": "/home/yash/.agents/skills/verification-before-completion/SKILL.md"
      }
    ]
  }
];

function getInjectionPayload() {
  const skillsJson = JSON.stringify(SKILLS_DATABASE);
  return `
(() => {
      const skillsData = ${skillsJson};

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
          gap: 5px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .ag-drawer-action-btn:hover {
          background: rgba(240, 91, 93, 0.2);
          border-color: rgba(240, 91, 93, 0.4);
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
          padding: 12px 16px;
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
        .ag-drawer-footer {
          padding: 10px 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(0, 0, 0, 0.2);
          flex-shrink: 0;
        }
        .ag-drawer-footer a {
          color: #f05b5d;
          text-decoration: none;
          font-family: monospace;
          font-weight: 600;
          cursor: pointer;
        }
        .ag-drawer-footer a:hover {
          text-decoration: underline;
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
        \`;
        document.body.appendChild(drawer);
      }

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
            if (s) s.focus();
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

      // Quick footer link insertion
      const footerLink = document.getElementById("ag-footer-agent-link");
      if (footerLink) {
        footerLink.onclick = () => {
          const editor = document.querySelector('[data-lexical-editor="true"]') || document.querySelector('[aria-label="Message input"]');
          if (editor) {
            editor.focus();
            editor.dispatchEvent(new InputEvent("beforeinput", { bubbles: true, cancelable: true, inputType: "insertText", data: "/skills-manager" }));
            toggleDrawer(false);
          }
        };
      }

      // 3. Render Skills
      function renderSkills(filterText = "") {
        const container = document.getElementById("ag-drawer-content");
        if (!container) return;
        container.innerHTML = "";
        const q = filterText.trim().toLowerCase();

        let visibleCount = 0;
        skillsData.forEach(cat => {
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
                <span class="ag-skill-name">\${s.command}</span>
                <button class="ag-skill-use-btn">Use ↳</button>
              </div>
              <div class="ag-skill-desc">\${s.desc}</div>
              <div class="ag-skill-tags">
                \${(s.tags || []).map(t => \`<span class="ag-skill-tag">#\${t}</span>\`).join("")}
              </div>
            \`;

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
              <div style="font-size: 11px; margin-top: 6px;">Import any skill from GitHub or local path with: <code>/skills-manager import &lt;url&gt;</code></div>
            </div>
          \`;
        }
      }
      renderSkills();

      const searchInput = document.getElementById("ag-drawer-search");
      if (searchInput) {
        searchInput.oninput = (e) => renderSkills(e.target.value);
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
            const activeScroll = document.getElementById("ag-drawer-content");
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
        if (!document.getElementById("antigravity-skills-drawer")) {
          ${payload}
          return "Re-injected styles & payload via heartbeat";
        }
        return "OK";
      })()`;
      existingWs.send(JSON.stringify({
        id: 999,
        method: 'Runtime.evaluate',
        params: { expression: heartbeatExpr, returnByValue: true }
      }));
      return;
    }
  }

  try {
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    activeWsConnections.set(page.id, ws);

    ws.onopen = () => {
      ws.send(JSON.stringify({ id: 1, method: 'Page.enable' }));
      ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
      ws.send(JSON.stringify({
        id: 3,
        method: 'Runtime.evaluate',
        params: { expression: payload, returnByValue: true }
      }));
      ws.send(JSON.stringify({
        id: 4,
        method: 'Page.addScriptToEvaluateOnNewDocument',
        params: { source: payload }
      }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.method === 'Page.frameNavigated' || msg.method === 'Page.loadEventFired' || msg.method === 'Page.domContentEventFired') {
          ws.send(JSON.stringify({
            id: 5,
            method: 'Runtime.evaluate',
            params: { expression: payload, returnByValue: true }
          }));
        }
      } catch (e) {}
    };

    ws.onclose = () => activeWsConnections.delete(page.id);
    ws.onerror = () => activeWsConnections.delete(page.id);
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
    } catch (e) {}
  }
}

if (require.main === module) {
  console.log("Antigravity Skills Hub Daemon started.");
  setInterval(checkAndInject, 1500);
  checkAndInject();
}

module.exports = { getInjectionPayload, SKILLS_DATABASE };
