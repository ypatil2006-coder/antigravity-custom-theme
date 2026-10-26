#!/usr/bin/env node
const fs = require('fs');
const WebSocket = globalThis.WebSocket || require('ws');

const CANDIDATE_PORT_FILES = [
  '/home/yash/.config/Antigravity-Profiles/Account-1/DevToolsActivePort',
  '/home/yash/.config/Antigravity-Profiles/Account-2/DevToolsActivePort',
  '/home/yash/.config/Antigravity-Profiles/Account-3/DevToolsActivePort',
  '/home/yash/.config/Antigravity-Profiles/Account-4/DevToolsActivePort',
  '/home/yash/.config/Antigravity-Profiles/Account-5/DevToolsActivePort',
  '/home/yash/.config/Antigravity-Profiles/Account-6/DevToolsActivePort',
  '/home/yash/.config/Antigravity/DevToolsActivePort',
  '/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.config/Antigravity/DevToolsActivePort',
  '/home/yash/.config/Antigravity-Profiles/Account-2/HOME/.config/Antigravity/DevToolsActivePort',
  '/home/yash/.config/Antigravity-Profiles/Account-3/HOME/.config/Antigravity/DevToolsActivePort',
  '/tmp/antigravity-cdp-port'
];

const SKILLS_DATABASE = [
  {
    "category": "\ud83d\udca1 1. Ideate & Spec",
    "skills": [
      {
        "name": "anatomy",
        "command": "/anatomy",
        "desc": "Build interactive isometric SVG figures and diagrams with precise solid parts, realistic shaders, and motion. Use for technical drawings, interactive explainers, or architecture illustrations.",
        "tags": [
          "anatomy",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/anatomy/SKILL.md"
      },
      {
        "name": "brainstorming",
        "command": "/brainstorming",
        "desc": "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.",
        "tags": [
          "brainstorming",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/brainstorming/SKILL.md"
      },
      {
        "name": "claude-council",
        "command": "/claude-council",
        "desc": "Convene an LLM Council with five thinking lenses (Red Team, First Principles, Expansionist, Outsider, Executor) to pressure-test high-stakes architectural and design decisions. Triggers on /claude-council.",
        "tags": [
          "claude",
          "council",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/claude-council/SKILL.md"
      },
      {
        "name": "diagram-design",
        "command": "/diagram-design",
        "desc": "Design architecture diagrams, flowcharts, sequence diagrams, and system maps with .drawio, Mermaid, and Excalidraw support. Triggers on /diagram-design.",
        "tags": [
          "diagram",
          "design",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/diagram-design/SKILL.md"
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
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/executing-plans/SKILL.md"
      },
      {
        "name": "generative_ui",
        "command": "/generative-ui",
        "desc": "How to render rich interactive HTML widgets inline in the chat or as standalone artifacts. Use this skill when you want to show the user diagrams, data visualizations, interactive controls, educational walkthroughs, or any rich visual content beyond plain text and markdown.",
        "tags": [
          "generative",
          "ui",
          "skill"
        ],
        "path": "/home/yash/.gemini/antigravity/builtin/skills/generative_ui/SKILL.md"
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
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/grill-me/SKILL.md"
      },
      {
        "name": "prd",
        "command": "/prd",
        "desc": "Generate high-quality Product Requirements Documents (PRDs) for software systems and AI-powered features. Includes executive summaries, user stories, technical specifications, and risk analysis.",
        "tags": [
          "prd",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/prd/SKILL.md"
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
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/subagent-driven-development/SKILL.md"
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
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/using-superpowers/SKILL.md"
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
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/writing-plans/SKILL.md"
      }
    ]
  },
  {
    "category": "\ud83c\udfa8 2. Frontend, UI & Motion",
    "skills": [
      {
        "name": "anatomy",
        "command": "/anatomy",
        "desc": "Build interactive isometric SVG figures and diagrams with precise solid parts, realistic shaders, and motion. Use for technical drawings, interactive explainers, or architecture illustrations.",
        "tags": [
          "anatomy",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/anatomy/SKILL.md"
      },
      {
        "name": "blender",
        "command": "/blender",
        "desc": "Complete 3D modeling, texturing, lighting, rendering, and export pipeline in Blender. Use whenever asked to create, model, texture, shade, light, render 3D assets/scenes, weapons, hard-surface props, or export to GLB/FBX/OBJ/STL.",
        "tags": [
          "blender",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/blender/SKILL.md"
      },
      {
        "name": "brand",
        "command": "/brand",
        "desc": "Brand voice, visual identity, messaging frameworks, asset management, brand consistency. Activate for branded content, tone of voice, marketing assets, brand compliance, style guides.",
        "tags": [
          "brand",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/brand/SKILL.md"
      },
      {
        "name": "design",
        "command": "/design",
        "desc": "Comprehensive Master Design Suite: brand identity, UI design tokens, component specifications, logo generation, corporate identity programs (CIP), banner design (social, ads, web, print), canvas visual art (.png/.pdf), and technical diagram design (architecture, flowcharts, schemas).",
        "tags": [
          "design",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/design/SKILL.md"
      },
      {
        "name": "diagram-design",
        "command": "/diagram-design",
        "desc": "Design architecture diagrams, flowcharts, sequence diagrams, and system maps with .drawio, Mermaid, and Excalidraw support. Triggers on /diagram-design.",
        "tags": [
          "diagram",
          "design",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/diagram-design/SKILL.md"
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
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/frontend-design/SKILL.md"
      },
      {
        "name": "generative_ui",
        "command": "/generative-ui",
        "desc": "How to render rich interactive HTML widgets inline in the chat or as standalone artifacts. Use this skill when you want to show the user diagrams, data visualizations, interactive controls, educational walkthroughs, or any rich visual content beyond plain text and markdown.",
        "tags": [
          "generative",
          "ui",
          "skill"
        ],
        "path": "/home/yash/.gemini/antigravity/builtin/skills/generative_ui/SKILL.md"
      },
      {
        "name": "gsap",
        "command": "/gsap",
        "desc": "Unified Gsap Master Suite consolidating: gsap-core, gsap-framer-scroll-animation.",
        "tags": [
          "gsap",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/gsap/SKILL.md"
      },
      {
        "name": "hyperframes",
        "command": "/hyperframes",
        "desc": "Mandatory entry point: read this first for any request to make, create, edit, animate, or render a video, animation, or motion graphic, including a promo, explainer, captioned clip, title card, overlay, slideshow or interactive deck, Remotion port, or any HyperFrames HTML composition. Also use it to inspect, diagnose, validate, preview, publish, or batch-render an existing HyperFrames project. Inputs may be a website URL, GitHub PR, Figma design or URL, text or brief, existing footage, or music. It resumes project state, captures intent when applicable, selects and installs the owning workflow, and routes domain capabilities. HyperFrames is the default output framework unless the user explicitly chooses another framework for the deliverable or asks only to record a browser session.",
        "tags": [
          "hyperframes",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/hyperframes/SKILL.md"
      },
      {
        "name": "quickgo-database",
        "command": "/quickgo-database",
        "desc": "Query the QuickGO and Evidence & Conclusion Ontology (ECO) REST API. Use this when you need to map genes to biological processes, molecular functions, or cellular components, find genes associated with a specific pathway/GO term, or explore the Gene Ontology hierarchy. Do not use for querying drug targets (use OpenTargets) or mechanistic signaling pathway diagrams (use KEGG).",
        "tags": [
          "quickgo",
          "database",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/quickgo_database/SKILL.md"
      },
      {
        "name": "shaders",
        "command": "/shaders",
        "desc": "Comprehensive GLSL shader techniques for creating stunning visual effects \u2014 ray marching, SDF modeling, fluid simulation, particle systems, procedural generation, lighting, post-processing, and more. Use when asked to write, debug, optimize, or explain shaders, GLSL, WebGL, ShaderToy, post-processing, ray marching, SDFs, or procedural visual effects. Triggers on: /shaders, /shader-dev, \\\"shader\\\", \\\"shaders\\\", \\\"glsl\\\", \\\"raymarching\\\", \\\"sdf\\\".",
        "tags": [
          "shaders",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/shaders/SKILL.md"
      },
      {
        "name": "stitch",
        "command": "/stitch",
        "desc": "Unified Google Stitch suite for AI UI design, screen generation, code-to-design migration, design system (DESIGN.md) extraction, React/React Native conversion, and autonomous site building. Use whenever working with Stitch MCP, converting web code to Stitch, generating UI screens, or building frontends with Stitch.",
        "tags": [
          "stitch",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/stitch/SKILL.md"
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
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/ui-animation/SKILL.md"
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
        "path": "/home/yash/.gemini/antigravity/builtin/skills/ui-plugin-navigation/SKILL.md"
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
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/ui-ux-pro-max/SKILL.md"
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
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/web-design-guidelines/SKILL.md"
      }
    ]
  },
  {
    "category": "\u26a1 3. Fullstack, AI & APIs",
    "skills": [
      {
        "name": "android-cli",
        "command": "/android-cli",
        "desc": "Provides instructions for installing and using the `android` CLI. The `android` command-line tool is a critical tool for Android development and helps you create new Android projects, run Android apps on devices, manage and interact with Android virtual devices (including screenshots and UI inspection), manage Android SDK components, look up official Android documentation, and discover and install official Android skills.",
        "tags": [
          "android",
          "cli",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/android-cli-plugin/skills/SKILL.md"
      },
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
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/coding-standards/SKILL.md"
      },
      {
        "name": "dart",
        "command": "/dart",
        "desc": "Unified Dart 3 Programming Master Suite. Covers pattern matching, static analysis, unit testing, test mocks, package conflicts, primary constructors, FFI assets, ffigen, CLI app architecture, coverage, and effective documentation.",
        "tags": [
          "dart",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/flutter/skills/dart/SKILL.md"
      },
      {
        "name": "devrelay",
        "command": "/devrelay",
        "desc": "Unified DevRelay Master Suite consolidating devrelay-challenges, devrelay-community-wisdom, devrelay-knowledge, devrelay-mlh-submissions, devrelay-navigator, devrelay-offers, devrelay-publishing, devrelay-sessions, and devrelay-sponsor-skills. Comprehensive gateway for DEV (dev.to) discussions, pattern wisdom, MLH hackathons, sponsor perks and promo credits, project submissions, session preservation, and authoritative developer knowledge.",
        "tags": [
          "devrelay",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/devrelay/SKILL.md"
      },
      {
        "name": "firebase",
        "command": "/firebase",
        "desc": "Complete Google Firebase platform suite. Covers Firestore database modeling & SDKs, security rules authoring & auditing, Firebase Authentication, Cloud Functions, App Hosting, Data Connect (PostgreSQL), Crashlytics, and Remote Config.",
        "tags": [
          "firebase",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/firebase/SKILL.md"
      },
      {
        "name": "flutter",
        "command": "/flutter",
        "desc": "Unified Flutter Development Master Suite. Covers responsive layout design, declarative routing (go_router), widget testing, integration testing, HTTP networking, JSON serialization, architecture best practices, localization, widget previews, and fixing layout overflows.",
        "tags": [
          "flutter",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/flutter/skills/flutter/SKILL.md"
      },
      {
        "name": "gcloud",
        "command": "/gcloud",
        "desc": "Provides safety-critical validation, guardrails, and data reduction for gcloud CLI operations across Google Cloud Platform (GCP) services and infrastructure. Use when planning, generating, constructing, proposing, describing, or executing any gcloud CLI commands - including when answering questions about gcloud syntax, or formatting flags. Don't use when writing Google Cloud client library code or raw REST/gRPC API requests.",
        "tags": [
          "gcloud",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/google-cloud-developer/skills/gcloud/SKILL.md"
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
        "name": "google-maps-platform",
        "command": "/google-maps-platform",
        "desc": "A collection of skills for architecting and implementing production-ready code using Google Maps Platform APIs and SDKs for any map, place, address, geocoding, routing/ETA (including eco-friendly routing), nearby search, 3D / Street View / static map, marker clustering, custom styling, drawing, geofencing, heatmap, or environmental (air-quality / pollen / solar / weather) feature \u2014 across Web, Android, iOS, and Web Services APIs. For prototyping, use the public Maps Demo Key \u2014 no billing setup and no Cloud project required, covering a growing set of the most popular Google Maps Platform APIs. For production, the skill prompts you to create and restrict your own key. All non-trivial code is grounded in freshly retrieved docs via the Google Maps Platform Code Assist service (no reliance on training-data memory).",
        "tags": [
          "google",
          "maps",
          "platform",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/google_maps_platform/skills/SKILL.md"
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
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/mcp-builder/SKILL.md"
      },
      {
        "name": "reactome-database",
        "command": "/reactome-database",
        "desc": "Query the Reactome database (Analysis and Content Services). Use when the user asks about pathway analysis, gene list enrichment, retrieving results by token, finding unmapped or not-found identifiers, mapping identifiers, reaction participants (inputs, outputs), pathway hierarchy (including top-level pathways), diagram export, cross-reference mapping, or searching the knowledgebase.",
        "tags": [
          "reactome",
          "database",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/reactome_database/SKILL.md"
      },
      {
        "name": "retrieving-developer-knowledge",
        "command": "/retrieving-developer-knowledge",
        "desc": "Searches, retrieves, and synthesizes official Google developer documentation across Google Cloud, AI/Gemini, Android, Chrome, Web, Flutter, Go, Firebase, and other Google developer platforms. Integrates with the Developer Knowledge MCP server (search_documents, get_documents, answer_query) or the Developer Knowledge REST API fallback. Use when searching for gcloud CLI commands, API syntax, IAM permissions, official documentation, architectural comparisons, or product choice overviews. Don't use for local filesystem lookups or non-Google documentation.",
        "tags": [
          "retrieving",
          "developer",
          "knowledge",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/google-cloud-developer/skills/retrieving-developer-knowledge/SKILL.md"
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
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/security-best-practices/SKILL.md"
      },
      {
        "name": "vercel",
        "command": "/vercel",
        "desc": "Unified Vercel Master Suite consolidating: vercel-composition-patterns, vercel-react-best-practices.",
        "tags": [
          "vercel",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/vercel/SKILL.md"
      }
    ]
  },
  {
    "category": "\ud83e\udeb2 4. Quick Debug & QA",
    "skills": [
      {
        "name": "chrome-devtools",
        "command": "/chrome-devtools",
        "desc": "Master Chrome DevTools Suite for browser automation, network inspection, performance audits, accessibility (a11y) compliance, cookie/auth debugging, Core Web Vitals (LCP), and memory leak diagnosis via Chrome DevTools Protocol MCP.",
        "tags": [
          "chrome",
          "devtools",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/chrome-devtools-plugin/skills/chrome-devtools/SKILL.md"
      },
      {
        "name": "playwright",
        "command": "/playwright",
        "desc": "Unified Playwright Master Suite consolidating: playwright-best-practices, webapp-testing.",
        "tags": [
          "playwright",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/playwright/SKILL.md"
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
        "name": "systematic-debugging",
        "command": "/systematic-debugging",
        "desc": "Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes",
        "tags": [
          "systematic",
          "debugging",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/systematic-debugging/SKILL.md"
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
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/test-driven-development/SKILL.md"
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
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/verification-before-completion/SKILL.md"
      }
    ]
  },
  {
    "category": "\ud83c\udfc6 5. Pitch, Demo & Launch",
    "skills": [
      {
        "name": "anatomy",
        "command": "/anatomy",
        "desc": "Build interactive isometric SVG figures and diagrams with precise solid parts, realistic shaders, and motion. Use for technical drawings, interactive explainers, or architecture illustrations.",
        "tags": [
          "anatomy",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/anatomy/SKILL.md"
      },
      {
        "name": "android-device-hub",
        "command": "/android-device-hub",
        "desc": "Instructions for working with the Android Device Hub sidecar, which lists, starts, stops, creates and removes Android Virtual Devices (AVDs), lists physical devices connected to adb, and lets the user mirror and control any of them (video, touch, keyboard, mouse wheel) in the Device Hub pane. Also explains how to inspect and interact with the screen the user is mirroring, with `android layout`, `android screen` and `adb`.",
        "tags": [
          "android",
          "device",
          "hub",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/android-cli-plugin/skills/device-hub/SKILL.md"
      },
      {
        "name": "brag",
        "command": "/brag",
        "desc": "Turn the current project website into a short, polished, shareable launch video using Hyperframes. Use when someone says \\\"/brag\\\", \\\"let's brag about this\\\", \\\"make a launch video\\\", \\\"turn this into a video\\\", or wants to share what they built. Reads the project code directly \u2014 no live URL or screenshots needed.",
        "tags": [
          "brag",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/brag/SKILL.md"
      },
      {
        "name": "design",
        "command": "/design",
        "desc": "Comprehensive Master Design Suite: brand identity, UI design tokens, component specifications, logo generation, corporate identity programs (CIP), banner design (social, ads, web, print), canvas visual art (.png/.pdf), and technical diagram design (architecture, flowcharts, schemas).",
        "tags": [
          "design",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/design/SKILL.md"
      },
      {
        "name": "devrelay",
        "command": "/devrelay",
        "desc": "Unified DevRelay Master Suite consolidating devrelay-challenges, devrelay-community-wisdom, devrelay-knowledge, devrelay-mlh-submissions, devrelay-navigator, devrelay-offers, devrelay-publishing, devrelay-sessions, and devrelay-sponsor-skills. Comprehensive gateway for DEV (dev.to) discussions, pattern wisdom, MLH hackathons, sponsor perks and promo credits, project submissions, session preservation, and authoritative developer knowledge.",
        "tags": [
          "devrelay",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/devrelay/SKILL.md"
      },
      {
        "name": "diagram-design",
        "command": "/diagram-design",
        "desc": "Design architecture diagrams, flowcharts, sequence diagrams, and system maps with .drawio, Mermaid, and Excalidraw support. Triggers on /diagram-design.",
        "tags": [
          "diagram",
          "design",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/diagram-design/SKILL.md"
      },
      {
        "name": "docx",
        "command": "/docx",
        "desc": "Use this skill whenever the user wants to create, read, edit, or manipulate Word documents (.docx files) or Word templates (.dotx files). Triggers include: any mention of 'Word doc', 'word document', '.docx', '.dotx', or requests to produce professional documents with formatting like tables of contents, headings, page numbers, or letterheads. Also use when extracting or reorganizing content from .docx or .dotx files, inserting or replacing images in documents, performing find-and-replace in Word files, working with tracked changes or comments, or converting content into a polished Word document. If the user asks for a 'report', 'memo', 'letter', 'template', or similar deliverable as a Word or .docx file, use this skill. Do NOT use for PDFs, spreadsheets, Google Docs, or general coding tasks unrelated to document generation.",
        "tags": [
          "docx",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/docx/SKILL.md"
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
        "name": "git-commit",
        "command": "/git-commit",
        "desc": "Execute git commit with conventional commit message analysis, intelligent staging, and message generation. Use when user asks to commit changes, create a git commit, or mentions \\\"/commit\\\". Supports: (1) Auto-detecting type and scope from changes, (2) Generating conventional commit messages from diff, (3) Interactive commit with optional type/scope/description overrides, (4) Intelligent file staging for logical grouping",
        "tags": [
          "git",
          "commit",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/git-commit/SKILL.md"
      },
      {
        "name": "gsap",
        "command": "/gsap",
        "desc": "Unified Gsap Master Suite consolidating: gsap-core, gsap-framer-scroll-animation.",
        "tags": [
          "gsap",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/gsap/SKILL.md"
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
        "name": "huashu-motion",
        "command": "/huashu-motion",
        "desc": "Motion graphics, launch videos and explainers as editable code. A director picks the motion language for your product; you point at frames to change them. \u52a8\u753b\u3001\u53d1\u5e03\u7247\u3001\u89e3\u8bf4\u89c6\u9891\uff0c\u6307\u7740\u753b\u9762\u6539\u3002",
        "tags": [
          "huashu",
          "motion",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/huashu-motion/SKILL.md"
      },
      {
        "name": "hyperframes",
        "command": "/hyperframes",
        "desc": "Mandatory entry point: read this first for any request to make, create, edit, animate, or render a video, animation, or motion graphic, including a promo, explainer, captioned clip, title card, overlay, slideshow or interactive deck, Remotion port, or any HyperFrames HTML composition. Also use it to inspect, diagnose, validate, preview, publish, or batch-render an existing HyperFrames project. Inputs may be a website URL, GitHub PR, Figma design or URL, text or brief, existing footage, or music. It resumes project state, captures intent when applicable, selects and installs the owning workflow, and routes domain capabilities. HyperFrames is the default output framework unless the user explicitly chooses another framework for the deliverable or asks only to record a browser session.",
        "tags": [
          "hyperframes",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/hyperframes/SKILL.md"
      },
      {
        "name": "linkedin",
        "command": "/linkedin",
        "desc": "Unified LinkedIn Master Suite for content ops, viral post drafting, AI tell humanizing, comment crafting, profile optimization, hook reverse-engineering, and content calendar planning. Covers 12 specialized modules, 20 hook formulas (F1-F20), 10 founder angles (A1-A10), 2026 algorithm heuristics, and automated or manual publishing. Triggers on /linkedin, write linkedin post, linkedin comment, humanize linkedin, optimize linkedin profile, linkedin hook, linkedin planner, linkedin repurpose.",
        "tags": [
          "linkedin",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/linkedin/SKILL.md"
      },
      {
        "name": "literature-search-arxiv",
        "command": "/literature-search-arxiv",
        "desc": "Search for scientific papers, preprints, and publications on arXiv. Extract metadata, abstracts, and download full-text PDFs or HTML versions of papers. Use when the user asks to find research papers, literature, or specific arXiv IDs.",
        "tags": [
          "literature",
          "search",
          "arxiv",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/literature_search_arxiv/SKILL.md"
      },
      {
        "name": "literature-search-europepmc",
        "command": "/literature-search-europepmc",
        "desc": "Search Europe PMC for scientific literature and download open-access full texts and PDFs. Retrieve full-text XML/plain text by PMCID, get citation lists and bibliography.",
        "tags": [
          "literature",
          "search",
          "europepmc",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/literature_search_europepmc/SKILL.md"
      },
      {
        "name": "literature-search-openalex",
        "command": "/literature-search-openalex",
        "desc": "Query the OpenAlex scholarly database for research papers, authors, institutions, topics, sources, publishers, funders, geo-locations, and keywords. Use when searching academic papers, resolving DOIs, downloading open-access PDFs, finding an author's publications, aggregating bibliometric data (citation counts, h-index, impact factor), exploring the research taxonomies, or performing DOI lookups.",
        "tags": [
          "literature",
          "search",
          "openalex",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/literature_search_openalex/SKILL.md"
      },
      {
        "name": "pdf",
        "command": "/pdf",
        "desc": "Use this skill whenever the user wants to do anything with PDF files. This includes reading or extracting text/tables from PDFs, combining or merging multiple PDFs into one, splitting PDFs apart, rotating pages, adding watermarks, creating new PDFs, filling PDF forms, encrypting/decrypting PDFs, extracting images, and OCR on scanned PDFs to make them searchable. If the user mentions a .pdf file or asks to produce one, use this skill.",
        "tags": [
          "pdf",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/pdf/SKILL.md"
      },
      {
        "name": "pptx",
        "command": "/pptx",
        "desc": "Use this skill any time a .pptx or .potx file is involved in any way \u2014 as input, output, or both. This includes: creating slide decks, pitch decks, or presentations; reading, parsing, or extracting text from any .pptx or .potx file (even if the extracted content will be used elsewhere, like in an email or summary); editing, modifying, or updating existing presentations; combining or splitting slide files; working with templates (.potx), layouts, speaker notes, or comments. Trigger whenever the user mentions \\\\\"deck,\\\\\" \\\\\"slides,\\\\\" \\\\\"presentation,\\\\\" or references a .pptx or .potx filename, regardless of what they plan to do with the content afterward. If a .pptx or .potx file needs to be opened, created, or touched, use this skill.",
        "tags": [
          "pptx",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/pptx/SKILL.md"
      },
      {
        "name": "predictingthepast",
        "command": "/predictingthepast",
        "desc": "Ancient text restoration, attribution, dating, contextualization, and embedding via Aeneas (Latin) / Ithaca (Ancient Greek). Use when asked to \\\"restore\\\", \\\"attribute\\\", \\\"date\\\", \\\"contextualize\\\", \\\"find parallels\\\", \\\"where was it written\\\", \\\"when was it written\\\", \\\"embed\\\", or \\\"analyze\\\" an ancient text, inscription, or epigraphic document, or when the user mentions \\\"Aeneas\\\", or \\\"Ithaca\\\".",
        "tags": [
          "predictingthepast",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/predictingthepast/SKILL.md"
      },
      {
        "name": "pymol",
        "command": "/pymol",
        "desc": "Visualize, analyze, and render protein and molecular structures using PyMOL. Use when the user wants to create images of protein structures, perform structural alignments or superposition, measure distances or contacts, highlight binding sites or active site residues, color by B-factor/pLDDT, or analyze protein-ligand interactions. Do not use for docking, molecular dynamics, or sequence-only analysis.",
        "tags": [
          "pymol",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/pymol/SKILL.md"
      },
      {
        "name": "slides",
        "command": "/slides",
        "desc": "Create strategic HTML presentations with Chart.js, design tokens, responsive layouts, copywriting formulas, and contextual slide strategies.",
        "tags": [
          "slides",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/slides/SKILL.md"
      },
      {
        "name": "xlsx",
        "command": "/xlsx",
        "desc": "Use this skill any time a spreadsheet file is the primary input or output. This means any task where the user wants to: open, read, edit, or fix an existing .xlsx, .xlsm, .xltx, .csv, or .tsv file (e.g., adding columns, computing formulas, formatting, charting, cleaning messy data); create a new spreadsheet from scratch or from other data sources; or convert between tabular file formats. Trigger especially when the user references a spreadsheet file by name or path \u2014 even casually (like \\\\\"the xlsx in my downloads\\\\\") \u2014 and wants something done to it or produced from it. Also trigger for cleaning or restructuring messy tabular data files (malformed rows, misplaced headers, junk data) into proper spreadsheets. The deliverable must be a spreadsheet file. Do NOT trigger when the primary deliverable is a Word document, HTML report, standalone Python script, database pipeline, or Google Sheets API integration, even if tabular data is involved.",
        "tags": [
          "xlsx",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/xlsx/SKILL.md"
      }
    ]
  },
  {
    "category": "\ud83c\udfae Game Dev & 3D (Separate)",
    "skills": [
      {
        "name": "biomolecular-structure-viewer",
        "command": "/biomolecular-structure-viewer",
        "desc": "Interactive 3D biomolecular structure viewer via Mol*. Renders 3D molecular structures from local workspace files (.cif, .mmcif, .pdb) or conversation artifacts, and manages user 3D annotations and highlighted residues. Use when the user asks to visualise a protein or nucleic acid, display a 3D structure, or asks about 3D biomolecular structure annotations and highlighted residues.",
        "tags": [
          "biomolecular",
          "structure",
          "viewer",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/biomolecular_structure_viewer/SKILL.md"
      },
      {
        "name": "blender",
        "command": "/blender",
        "desc": "Complete 3D modeling, texturing, lighting, rendering, and export pipeline in Blender. Use whenever asked to create, model, texture, shade, light, render 3D assets/scenes, weapons, hard-surface props, or export to GLB/FBX/OBJ/STL.",
        "tags": [
          "blender",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/blender/SKILL.md"
      },
      {
        "name": "compose-preview",
        "command": "/compose-preview",
        "desc": "Instructions for the Android Compose Preview sidecar, which renders Jetpack Compose @Preview functions with `android preview render` and shows them in the Android Compose Preview pane. Use it when the user wants to see a Compose preview, or to review the result of UI changes \u2014 re-render after changing the code so that the pane shows the result.",
        "tags": [
          "compose",
          "preview",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/android-cli-plugin/skills/compose-preview/SKILL.md"
      },
      {
        "name": "deadlocked",
        "command": "/deadlocked",
        "desc": "Complete management, installation, wipe, update, and troubleshooting skill for the Deadlocked Counter-Strike 2 overlay and utility on Linux. Triggers on: /deadlocked, \\\"deadlocked\\\", \\\"reinstall deadlocked\\\", \\\"wipe deadlocked\\\", \\\"update deadlocked\\\", \\\"fix deadlocked\\\", \\\"install deadlocked\\\".",
        "tags": [
          "deadlocked",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/deadlocked/SKILL.md"
      },
      {
        "name": "foldseek-structural-search",
        "command": "/foldseek-structural-search",
        "desc": "Performs 3D structural searches of proteins against various databases (PDB, AlphaFold, CATH, MGnify, etc.) using the Foldseek API. Use ONLY when the user provides a physical 3D coordinate file (.cif, .mmcif, or .pdb) and wants to find structurally similar proteins. Do NOT use if the user only provides a protein sequence, gene name, or UniProt ID.",
        "tags": [
          "foldseek",
          "structural",
          "search",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/foldseek_structural_search/SKILL.md"
      },
      {
        "name": "gamedev",
        "command": "/gamedev",
        "desc": "Unified Multi-Engine Game Development Master Suite. Auto-fingerprints project context and provides modular guides for Unreal Engine 5, Unity 6, Godot 4, Bevy, Phaser, Three.js, Love2D, and Pygame, covering game AI, physics tuning, game feel, UI/UX, proc-gen, and shipping (Steam & itch.io).",
        "tags": [
          "gamedev",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/gamedev/SKILL.md"
      },
      {
        "name": "godot",
        "command": "/godot",
        "desc": "The complete Godot 4.3+ & 4.7 Game Development Master Suite. Covers 2D/3D gameplay mechanics, character controllers (CharacterBody2D/3D), typed GDScript, TileMapLayer, multiplayer networking, UI/HUD, camera systems, procedural world generation, particles, Godot shaders, and 27 ready-to-run genre architectures.",
        "tags": [
          "godot",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/godot/SKILL.md"
      },
      {
        "name": "pdb-database",
        "command": "/pdb-database",
        "desc": "Use when you want to search for or download experimentally-determined 3D structures for biomolecules (proteins, nucleic acids, bound ligands). Supports searching by sequence similarity, structure similarity, chemical and other attributes. Also use to get metadata about biomolecular structure experiments.",
        "tags": [
          "pdb",
          "database",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/pdb_database/SKILL.md"
      },
      {
        "name": "pptimize",
        "command": "/pptimize",
        "desc": "Comprehensive, all-in-one PC game optimization engine. Diagnoses, tunes, and optimizes ANY game across every layer: in-game graphic settings, engine .ini/.cfg/JSON files, custom launch options, GPU control panel (NVIDIA/AMD/Intel), VRR frame pacing (G-Sync/FreeSync), OS/CPU thread scheduling (Intel P/E cores, AMD X3D CCD pinning), and community performance mods. Mandatory triggers: /pptimize, /pptimize <game name>, /optimize, /optimize <game name>, \\\"optimize game\\\", \\\"boost fps in <game>\\\", \\\"fix game stutter\\\", \\\"game config optimization\\\", \\\"tune ini files\\\", \\\"low latency game settings\\\", \\\"game launch options\\\".",
        "tags": [
          "pptimize",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/pptimize/SKILL.md"
      },
      {
        "name": "roblox",
        "command": "/roblox",
        "desc": "Complete Roblox game development and Roblox Studio suite. Covers Luau scripting, server-authoritative architecture, DataStores and persistence, character rigs, physics, ScreenGui, Studio MCP operations, anti-exploit security, and release optimization.",
        "tags": [
          "roblox",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/roblox/SKILL.md"
      },
      {
        "name": "shaders",
        "command": "/shaders",
        "desc": "Comprehensive GLSL shader techniques for creating stunning visual effects \u2014 ray marching, SDF modeling, fluid simulation, particle systems, procedural generation, lighting, post-processing, and more. Use when asked to write, debug, optimize, or explain shaders, GLSL, WebGL, ShaderToy, post-processing, ray marching, SDFs, or procedural visual effects. Triggers on: /shaders, /shader-dev, \\\"shader\\\", \\\"shaders\\\", \\\"glsl\\\", \\\"raymarching\\\", \\\"sdf\\\".",
        "tags": [
          "shaders",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/shaders/SKILL.md"
      }
    ]
  },
  {
    "category": "\u2699\ufe0f Agent & System Tools",
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
        "path": "/home/yash/.gemini/antigravity/builtin/skills/agy-customizations/SKILL.md"
      },
      {
        "name": "android-cli",
        "command": "/android-cli",
        "desc": "Provides instructions for installing and using the `android` CLI. The `android` command-line tool is a critical tool for Android development and helps you create new Android projects, run Android apps on devices, manage and interact with Android virtual devices (including screenshots and UI inspection), manage Android SDK components, look up official Android documentation, and discover and install official Android skills.",
        "tags": [
          "android",
          "cli",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/android-cli-plugin/skills/SKILL.md"
      },
      {
        "name": "antigravity-guide",
        "command": "/antigravity-guide",
        "desc": "Provides a comprehensive guide, quick reference, and sitemap for Google Antigravity (AGY), including the Antigravity CLI (agy), Antigravity 2.0, Antigravity IDE, Python SDK, slash commands, keybindings, and customizations (skills, rules, MCP, sidecars). Activate this skill when the user asks questions about how to use, configure, or customize Antigravity, AGY, the agy CLI, the Antigravity IDE, or Antigravity 2.0.",
        "tags": [
          "antigravity",
          "guide",
          "skill"
        ],
        "path": "/home/yash/.gemini/antigravity/builtin/skills/antigravity_guide/SKILL.md"
      },
      {
        "name": "automation",
        "command": "/automation",
        "desc": "Interactive guide to design and create a scheduled background automation. Use this skill when the user wants to create an automated or recurring scheduled task (e.g. \\\"summarize my emails every morning\\\", \\\"every Monday send me a to-do list\\\"). Also triggered by the /automation slash command.",
        "tags": [
          "automation",
          "skill"
        ],
        "path": "/home/yash/.gemini/antigravity/builtin/skills/automation/SKILL.md"
      },
      {
        "name": "browser",
        "command": "/browser",
        "desc": "Browser automation skill for web interactions, testing, scraping, and portal tasks enforcing single-authorization CDP architecture without repetitive permission prompts.",
        "tags": [
          "browser",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/browser/SKILL.md"
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
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/cdp-daemon-automation/SKILL.md"
      },
      {
        "name": "chrome-devtools",
        "command": "/chrome-devtools",
        "desc": "Master Chrome DevTools Suite for browser automation, network inspection, performance audits, accessibility (a11y) compliance, cookie/auth debugging, Core Web Vitals (LCP), and memory leak diagnosis via Chrome DevTools Protocol MCP.",
        "tags": [
          "chrome",
          "devtools",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/chrome-devtools-plugin/skills/chrome-devtools/SKILL.md"
      },
      {
        "name": "ensembl-database",
        "command": "/ensembl-database",
        "desc": "Query the Ensembl database to resolve gene, transcript, and protein IDs, fetch genomic or protein sequences, retrieve gene structures (exons), and get variant consequence and effect predictions (VEP). Use this skill as a primary ID translator, genomic sequence database and variant effect prediction tool.",
        "tags": [
          "ensembl",
          "database",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/ensembl_database/SKILL.md"
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
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/find-skills/SKILL.md"
      },
      {
        "name": "finding-google-skills",
        "command": "/finding-google-skills",
        "desc": "Google platform decision and setup guidance, loaded on demand from Google's skill catalog. Use when a developer is choosing or setting up part of their stack, such as where to run a service, a database, storage, messaging, authentication, analytics, ads, or AI model serving, and a Google product is a reasonable candidate - whether or not a vendor is named - or when a request names a Google product or API. Brings in the matching Google skill so the answer can weigh Google options, their trade-offs, and when they are not the right fit. Skip when the stack is already settled on another provider and no Google product is named, or the task involves no platform choice.",
        "tags": [
          "finding",
          "google",
          "skills",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/google-cloud-developer/skills/finding-google-skills/SKILL.md"
      },
      {
        "name": "firebase",
        "command": "/firebase",
        "desc": "Complete Google Firebase platform suite. Covers Firestore database modeling & SDKs, security rules authoring & auditing, Firebase Authentication, Cloud Functions, App Hosting, Data Connect (PostgreSQL), Crashlytics, and Remote Config.",
        "tags": [
          "firebase",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/firebase/SKILL.md"
      },
      {
        "name": "gcloud",
        "command": "/gcloud",
        "desc": "Provides safety-critical validation, guardrails, and data reduction for gcloud CLI operations across Google Cloud Platform (GCP) services and infrastructure. Use when planning, generating, constructing, proposing, describing, or executing any gcloud CLI commands - including when answering questions about gcloud syntax, or formatting flags. Don't use when writing Google Cloud client library code or raw REST/gRPC API requests.",
        "tags": [
          "gcloud",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/google-cloud-developer/skills/gcloud/SKILL.md"
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
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/git-commit/SKILL.md"
      },
      {
        "name": "google-cloud-recipe-onboarding",
        "command": "/google-cloud-recipe-onboarding",
        "desc": "Guides a developer's first steps on Google Cloud, covering account creation, billing setup, project management, and deploying a first resource. Use when a new developer wants to initialize their first Google Cloud project, configure billing, and verify deployment. Don't use for enterprise organization setup (use Google Cloud Setup guided flow for that instead). Don't use for complex multi-project architectures.",
        "tags": [
          "google",
          "cloud",
          "recipe",
          "onboarding",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/google-cloud-developer/skills/google-cloud-recipe-onboarding/SKILL.md"
      },
      {
        "name": "migrate-workflows",
        "command": "/migrate-workflows",
        "desc": "Automatically migrate legacy workflows to modern skills across global and workspace configurations. Scans for existing workflows, creates target SKILL.md files, and safely archives old workflow files.",
        "tags": [
          "migrate",
          "workflows",
          "skill"
        ],
        "path": "/home/yash/.gemini/antigravity/builtin/skills/migrate-workflows/SKILL.md"
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
        "path": "/home/yash/.gemini/antigravity/builtin/skills/permissioned-github/SKILL.md"
      },
      {
        "name": "plugin",
        "command": "/plugin",
        "desc": "How to manage and create plugins \u2014 namespaced bundles of skills, agents, rules, MCP servers and hooks that install, enable and disable as a single unit. Use this skill when the user wants to enable, disable, install or uninstall a plugin, when they want to create a new plugin, or when a new customization should be packaged into a plugin rather than left loose. Also triggered by the /plugin slash command. Don't use for the underlying customization system itself \u2014 discovery roots, loading priority, or authoring a standalone skill, agent, rule, hook or MCP server outside a plugin; see the customizations guide skill for those.",
        "tags": [
          "plugin",
          "skill"
        ],
        "path": "/home/yash/.gemini/antigravity/builtin/skills/plugin/SKILL.md"
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
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/skill-creator/SKILL.md"
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
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/skills-manager/SKILL.md"
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
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/token-optimizer/SKILL.md"
      },
      {
        "name": "ucsc-conservation-and-tfbs",
        "command": "/ucsc-conservation-and-tfbs",
        "desc": "Fetch Evolutionary Conservation scores (phyloP, phastCons) and Transcription Factor Binding Sites (TFBS) from the UCSC Genome Browser. Use when analyzing whether genomic variants or regions are evolutionarily conserved, functionally important, or bounded by TF regulators across major projects (ENCODE, JASPAR, ReMap).",
        "tags": [
          "ucsc",
          "conservation",
          "and",
          "tfbs",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/ucsc_conservation_and_tfbs/SKILL.md"
      },
      {
        "name": "uniprot-database",
        "command": "/uniprot-database",
        "desc": "Access protein metadata, function, taxonomy, and sequences across UniProtKB, UniParc, and UniRef. Use when searching for proteins, mapping identifiers, or retrieving functional annotations and publications. Don't use for sequence alignment, protein folding, or sequence similarity search (use specialized skills for those tasks).",
        "tags": [
          "uniprot",
          "database",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/uniprot_database/SKILL.md"
      },
      {
        "name": "uv",
        "command": "/uv",
        "desc": "Checks whether the uv Python package manager is installed and installs it if missing. Ensures uv is on PATH. Use when another skill requires uv as a prerequisite.",
        "tags": [
          "uv",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/uv/SKILL.md"
      },
      {
        "name": "workflow-skill-creator",
        "command": "/workflow-skill-creator",
        "desc": "Distills a completed user workflow or interaction into a reusable agent skill. Use when the user asks to turn their workflow, interaction, or multi-step process into a skill, or when they say \\\"make this a skill\\\", \\\"create a skill from what we just did\\\", \\\"package this workflow\\\" or similar. Do not use for creating skills from scratch without an existing workflow (use a generic skill-creator for that).",
        "tags": [
          "workflow",
          "skill",
          "creator",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/workflow_skill_creator/SKILL.md"
      }
    ]
  },
  {
    "category": "\ud83d\udce6 Other Utilities",
    "skills": [
      {
        "name": "alphafold-database-fetch-and-analyze",
        "command": "/alphafold-database-fetch-and-analyze",
        "desc": "Retrieve and analyze AlphaFold predicted structures for a protein. Use when the user provides a specific UniProt Accession ID and wants structural confidence metrics (pLDDT), domain boundary analysis, or disorder assessment. Do not use if the user only has a protein name, gene name, or amino acid sequence \u2014 ask for a UniProt ID first.",
        "tags": [
          "alphafold",
          "database",
          "fetch",
          "and",
          "analyze",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/alphafold_database_fetch_and_analyze/SKILL.md"
      },
      {
        "name": "alphagenome-atlas-website-links",
        "command": "/alphagenome-atlas-website-links",
        "desc": "Constructs deep-links and URLs for the AlphaGenome Atlas website. Supports generating single-variant exploration links (1-based VCF-style coordinates), genomic locus views (1-based closed chr:start-end), candidate summary tables, and AlphaGenome reference vs. alternate predictions. Use when visualizing, exploring, charting, or linking genetic variants and genomic loci on the AlphaGenome Atlas, or when asked to inspect, view, or link predictions for a genomic variant. Don't use for computing raw AlphaGenome variant predictions directly without Atlas URLs (use alphagenome-single-variant-analysis or alphagenome-variant-impact-score).",
        "tags": [
          "alphagenome",
          "atlas",
          "website",
          "links",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/alphagenome_atlas_website_links/SKILL.md"
      },
      {
        "name": "alphagenome-single-variant-analysis",
        "command": "/alphagenome-single-variant-analysis",
        "desc": "Analyzes genetic variant effects on gene expression (RNA-seq), chromatin accessibility (DNASE), histone marks (ChIP), and transcription factors using the AlphaGenome API. Use when the user asks about non-coding variant effects, pathogenicity, clinical significance, disease associations, functional effects, gene expression changes, splicing disruption, or regulatory effects in promoters and enhancers. Also use for resolving biological terms to tissue/cell-type ontologies (UBERON/CL) or analyzing variants in chr:pos:ref>alt format.",
        "tags": [
          "alphagenome",
          "single",
          "variant",
          "analysis",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/alphagenome_single_variant_analysis/SKILL.md"
      },
      {
        "name": "alphagenome-variant-impact-score",
        "command": "/alphagenome-variant-impact-score",
        "desc": "Score, annotate, and analyze the functional impact of genetic variants using AlphaGenome Variant Impact (AVI) scores. Query variants in chr:pos:ref>alt format, annotate VCF/tabular callsets, perform saturation mutagenesis window scans (1-based closed chr:start-end), and extract GENCODE v46 GTF gene/exon/junction coordinates all via the AlphaGenome Atlas API.",
        "tags": [
          "alphagenome",
          "variant",
          "impact",
          "score",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/alphagenome_variant_impact_score/SKILL.md"
      },
      {
        "name": "chembl-database",
        "command": "/chembl-database",
        "desc": "Query the ChEMBL database for bioactive molecules, drug targets, bioactivity data, approved drugs, and chemical structures. Use when the user asks about compounds, targets, IC50/Ki values, drug mechanisms, or structure searches.",
        "tags": [
          "chembl",
          "database",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/chembl_database/SKILL.md"
      },
      {
        "name": "clinical-trials-database",
        "command": "/clinical-trials-database",
        "desc": "Query ClinicalTrials.gov via APIv2. Use when you want to search for trials by condition, drug, location, status, or phase; retrieve trial details by NCT ID; check eligibility/inclusion criteria; count trials across conditions or time periods; identify a sponsor's trial portfolio; find recruiting trials for patient matching.",
        "tags": [
          "clinical",
          "trials",
          "database",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/clinical_trials_database/SKILL.md"
      },
      {
        "name": "clinvar-database",
        "command": "/clinvar-database",
        "desc": "Use when needing clinical significance, pathogenicity classifications (e.g., Pathogenic, Benign, VUS), clinical evidence rationales, or finding \\\"hard positive\\\" benchmark controls for human genomic variants.",
        "tags": [
          "clinvar",
          "database",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/clinvar_database/SKILL.md"
      },
      {
        "name": "credentials",
        "command": "/credentials",
        "desc": "Instructions for handling API keys and credentials safely, verifying their presence, and prompting the user to add them if missing using a safe protocol.",
        "tags": [
          "credentials",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/credentials/SKILL.md"
      },
      {
        "name": "dbsnp-database",
        "command": "/dbsnp-database",
        "desc": "Use when you want to look up, map, and search for short genetic variants (SNPs, indels) in NCBI's dbSNP database. Resolves between rsIDs, genomic coordinates in VCF format, and HGVS strings. For an rsID, returns variant type, gene associations, clinical significance, allele frequencies, and genomic coordinates (GRCh38).",
        "tags": [
          "dbsnp",
          "database",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/dbsnp_database/SKILL.md"
      },
      {
        "name": "embl-ebi-ols",
        "command": "/embl-ebi-ols",
        "desc": "Query and search the EMBL-EBI Ontology Lookup Service (OLS) for biomedical ontology terms, definitions, and hierarchies across 250+ ontologies (e.g., GO, DOID, HP). Use when the user asks to search for terms, retrieve details, navigate hierarchies (parents, children, ancestors), look up properties and individuals, get autocomplete suggestions, or access ontology metadata and statistics.",
        "tags": [
          "embl",
          "ebi",
          "ols",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/embl_ebi_ols/SKILL.md"
      },
      {
        "name": "encode-ccres-database",
        "command": "/encode-ccres-database",
        "desc": "Query the ENCODE Registry of cis-Regulatory Elements (cCREs) via the SCREEN GraphQL API, or make custom queries to the ENCODE Portal REST API for experiments and files (ChIP-seq peaks, etc.). Use when you want to query regulatory annotations or raw experimental data across human cell types.",
        "tags": [
          "encode",
          "ccres",
          "database",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/encode_ccres_database/SKILL.md"
      },
      {
        "name": "gnomad-database",
        "command": "/gnomad-database",
        "desc": "Query the Genome Aggregation Database (gnomAD). Use when determining the rarity or allele frequency of specific genetic variants, retrieving gene constraint metrics (pLI, LOEUF) to assess loss-of-function intolerance, finding variants in a genomic region or gene, or querying structural variants. Don't use for analyzing individual patient genomes, tracking somatic mutations in cancer (use COSMIC), or requesting raw sequencing reads (use ENA).",
        "tags": [
          "gnomad",
          "database",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/gnomad_database/SKILL.md"
      },
      {
        "name": "google-cloud-recipe-auth",
        "command": "/google-cloud-recipe-auth",
        "desc": "Provides expert guidance on Identity and Access Management (IAM) and authenticating and authorizing to Google Cloud services and APIs, covering human users, service identities, Application Default Credentials (ADC), and best practices for secure access.",
        "tags": [
          "google",
          "cloud",
          "recipe",
          "auth",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/google-cloud-developer/skills/google-cloud-recipe-auth/SKILL.md"
      },
      {
        "name": "gtex-database",
        "command": "/gtex-database",
        "desc": "Use when you want to retrieve quantitative RNA expression data and variant eQTL information from the GTEx (Genotype-Tissue Expression) Project across 54 non-diseased tissue sites.",
        "tags": [
          "gtex",
          "database",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/gtex_database/SKILL.md"
      },
      {
        "name": "huashu-art-motion",
        "command": "/huashu-art-motion",
        "desc": "\u827a\u672f\u4e0e\u89c6\u9891\u52a8\u753b\uff1a\u62c6\u89e3\u590d\u523b\u52a8\u753b\uff1b36\u79cd\u65e2\u6709\u5b9e\u505a\u98ce\u683c\uff0b16\u79cd\u53ef\u8fc1\u79fb\u7814\u7a76\u914d\u65b9\uff1b9\u79cd\u89e3\u8bf4\u52a8\u753b\u8bed\u6cd5\uff0c8\u79cd\u53ef\u6309\u53e3\u64ad\u53c2\u6570\u6e32\u7247\u6bb5\uff1b\u542b\u53e3\u64ad\u6574\u7247\u53c2\u8003\u4ee3\u7801\u53ca\u6846\u666f\u68c0\u67e5\uff1b\u4eba\u7528AI\u751f\u5e27\uff1b\u53ef\u9009\u5df2\u6709\u5f55\u97f3\u3001\u7cfb\u7edf\u58f0\u97f3\u4e0e\u8bed\u97f3\u590d\u523b\uff0c\u6309\u9700\u914d\u7f6e\u3002",
        "tags": [
          "huashu",
          "art",
          "motion",
          "skill"
        ],
        "path": "/home/yash/.config/Antigravity-Profiles/Account-1/HOME/.agents/skills/huashu-art-motion/SKILL.md"
      },
      {
        "name": "human-protein-atlas-database",
        "command": "/human-protein-atlas-database",
        "desc": "Use when you want to retrieve semi-quantitative protein expression and spatial localisation data from the Human Protein Atlas (HPA).",
        "tags": [
          "human",
          "protein",
          "atlas",
          "database",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/human_protein_atlas_database/SKILL.md"
      },
      {
        "name": "interpro-database",
        "command": "/interpro-database",
        "desc": "Identify domains, families, and sites in proteins; find all proteins in a family or sharing a domain; explore species distribution for a domain; annotate genomes with protein families and GO terms. InterPro combines 14 databases (e.g., Pfam, CDD) into one searchable resource. InterPro-N significantly expands annotation and sequence coverage with deep learning. Includes domain architecture (IDA) search.",
        "tags": [
          "interpro",
          "database",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/interpro_database/SKILL.md"
      },
      {
        "name": "jaspar-database",
        "command": "/jaspar-database",
        "desc": "Query the JASPAR database for Transcription Factor (TF) binding profiles. Use when retrieving Position Frequency Matrices (PFMs) or Position Weight Matrices (PWMs) for specific TFs, resolving gene symbols to JASPAR Matrix IDs, or getting TF metadata. Supports multiple output formats (MEME, TRANSFAC, PFM, JASPAR, YAML).",
        "tags": [
          "jaspar",
          "database",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/jaspar_database/SKILL.md"
      },
      {
        "name": "literature-search-biorxiv",
        "command": "/literature-search-biorxiv",
        "desc": "Browse, filter, and download life sciences, biology, and medical preprints from bioRxiv and medRxiv. Supports fetching paper metadata by DOI, and browsing by date range with category and keyword filters. Keyword filtering is local, so date ranges MUST be narrow (1-4 weeks) with a category to prevent timeouts.",
        "tags": [
          "literature",
          "search",
          "biorxiv",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/literature_search_biorxiv/SKILL.md"
      },
      {
        "name": "modern-web-guidance",
        "command": "/modern-web-guidance",
        "desc": "Search tool for modern web development best practices, Web APIs, CSS/DOM, layout, performance, and accessibility.",
        "tags": [
          "modern",
          "web",
          "guidance",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/modern-web-guidance-plugin/skills/modern-web-guidance/SKILL.md"
      },
      {
        "name": "ncbi-sequence-fetch",
        "command": "/ncbi-sequence-fetch",
        "desc": "Retrieve protein and nucleotide sequences from NCBI databases using E-utilities. Supports direct accession lookup, CDS translation, gene+organism search, locus lookup, PubMed-linked sequences, patent protein extraction, and organism+length fallback search. Use when you need to fetch biological sequences by accession, gene name, locus tag, PubMed ID, or patent number.",
        "tags": [
          "ncbi",
          "sequence",
          "fetch",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/ncbi_sequence_fetch/SKILL.md"
      },
      {
        "name": "openfda-database",
        "command": "/openfda-database",
        "desc": "Query, search, and download data from the openFDA API for drugs, devices, foods, tobacco, cosmetics, animal and veterinary products, substances, and transparency data. Use for FDA adverse events, recalls, labeling, approvals, shortages, 510(k) clearances, NDC lookups, and any FDA safety or regulatory data query across all 28 API endpoints.",
        "tags": [
          "openfda",
          "database",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/openfda_database/SKILL.md"
      },
      {
        "name": "opentargets-database",
        "command": "/opentargets-database",
        "desc": "Query Open Targets Platform for target-disease associations, drug target discovery, tractability/safety data, genetics/omics evidence, known drugs, for therapeutic target identification.",
        "tags": [
          "opentargets",
          "database",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/opentargets_database/SKILL.md"
      },
      {
        "name": "protein-sequence-msa",
        "command": "/protein-sequence-msa",
        "desc": "Performs multiple sequence alignment of proteins with EBI Clustal Omega. Use when you need to align multiple sequences to assess similarity, domain conservation, or key residue conservation. Supports up to 4000 sequences and a maximum file size of 4 MB. Do not use to search for homologous proteins in a database (use MMseqs2, BLAST), align non-protein sequences (DNA, RNA), perform structural alignment (use Foldseek, PyMOL), or if you only have a single sequence.",
        "tags": [
          "protein",
          "sequence",
          "msa",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/protein_sequence_msa/SKILL.md"
      },
      {
        "name": "protein-sequence-similarity-search",
        "command": "/protein-sequence-similarity-search",
        "desc": "Searches for homologous protein sequences using MMseqs2 (fast, default) or BLAST (comprehensive, fallback). Trigger this whenever the user provides a protein sequence or FASTA file and asks to find homologues, sequence matches, or wants to infer protein function based on sequence similarity, but not when the user wants to infer protein function based on structural similarity.",
        "tags": [
          "protein",
          "sequence",
          "similarity",
          "search",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/protein_sequence_similarity_search/SKILL.md"
      },
      {
        "name": "pubchem-database",
        "command": "/pubchem-database",
        "desc": "Query PubChem, search by name/CID/SMILES, retrieve properties, similarity/substructure searches, bioactivity, for cheminformatics. Use when a user asks about a specific chemical, drug, or molecule.",
        "tags": [
          "pubchem",
          "database",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/pubchem_database/SKILL.md"
      },
      {
        "name": "pubmed-database",
        "command": "/pubmed-database",
        "desc": "Search PubMed for scientific literature, including published clinical trials. Fetch abstracts and full text. Link published research to biological databases (gene, protein, nucleotide, PubChem) to discover associations between papers and specific compounds or genes. Verify medical spelling, match raw citations, and cache result sets for bulk processing. Interfaces NCBI E-utilities and PMC BioC APIs.",
        "tags": [
          "pubmed",
          "database",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/pubmed_database/SKILL.md"
      },
      {
        "name": "string-database",
        "command": "/string-database",
        "desc": "Query the STRING database for protein-protein interactions (PPIs), functional enrichment, and homology. Use when the user asks about interactions between specific proteins, interaction evidence, confidence scores, protein interaction partners, or pathway enrichments.",
        "tags": [
          "string",
          "database",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/string_database/SKILL.md"
      },
      {
        "name": "unibind-database",
        "command": "/unibind-database",
        "desc": "Queries the UniBind database for experimentally validated transcription factor (TF) binding sites. Use when retrieving direct TF-DNA interaction datasets, downloading binding site coordinates (BED/FASTA) for local analysis, or listing available datasets by species, cell line, or TF name. Don't use to query specific intervals, locations, genes, motif models or expression data.",
        "tags": [
          "unibind",
          "database",
          "skill"
        ],
        "path": "/home/yash/.gemini/config/plugins/science/skills/unibind_database/SKILL.md"
      }
    ]
  }
];

function getThemeCss() {
  const candidateThemeFiles = [
    '/home/yash/Projects/antigravity-custom-theme/antigravity-boxed-terminal.css',
    '/home/yash/.gemini/antigravity/antigravity-boxed-terminal.css'
  ];
  for (const f of candidateThemeFiles) {
    try {
      if (fs.existsSync(f)) {
        const c = fs.readFileSync(f, 'utf8');
        if (c && c.length > 100) return c;
      }
    } catch (_) {}
  }
  return '';
}

function getInjectionPayload() {
  const skillsJson = JSON.stringify(SKILLS_DATABASE);
  const themeCss = getThemeCss();
  return `
(() => {
      const skillsData = ${skillsJson};
      const themeCss = ${JSON.stringify(themeCss)};

      // 0. Ensure Boxed Terminal Theme Style is active across all instances
      if (themeCss) {
        let themeEl = document.getElementById("antigravity-boxed-theme-style");
        if (!themeEl) {
          themeEl = document.createElement("style");
          themeEl.id = "antigravity-boxed-theme-style";
          (document.head || document.documentElement).appendChild(themeEl);
        }
        if (themeEl.textContent !== themeCss) {
          themeEl.textContent = themeCss;
        }
      }

      // Cleanup old instance if present
      if (window.__antigravity_skills_observer) {
        try { window.__antigravity_skills_observer.disconnect(); } catch (_) {}
        window.__antigravity_skills_observer = null;
      }
      if (window.__ag_skills_btn_timer) {
        clearInterval(window.__ag_skills_btn_timer);
        window.__ag_skills_btn_timer = null;
      }
      const oldDrawer = document.getElementById("antigravity-skills-drawer");
      if (oldDrawer) oldDrawer.remove();
      const oldBackdrop = document.getElementById("antigravity-skills-backdrop");
      if (oldBackdrop) oldBackdrop.remove();
      const oldBtn = document.getElementById("antigravity-skills-nav-btn");
      if (oldBtn) oldBtn.remove();

      // 1. Inject Style
      let style = document.getElementById("antigravity-ui-enhancements");
      if (!style) {
        style = document.createElement("style");
        style.id = "antigravity-ui-enhancements";
        document.head.appendChild(style);
      }
      style.textContent = \`
        html, body {
          overflow: hidden !important;
          width: 100vw !important;
          height: 100vh !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
          margin: 0 !important;
          padding: 0 !important;
          overscroll-behavior: none !important;
        }
        #root {
          overflow: hidden !important;
          width: 100vw !important;
          height: 100vh !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
        }
        div[role="listbox"]:empty,
        div[role="menu"]:empty {
          display: none !important;
          border: none !important;
          width: 0 !important;
          height: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        div.shrink-0:has(> [data-testid="title-menu-bar"]),
        div.shrink-0:has(div[style*="app-region: drag"]) {
          display: none !important;
        }
        div.bg-sidebar .overflow-y-auto,
        .flex-1.min-h-0.overflow-y-auto.flex.flex-col {
          overflow-y: auto !important;
          scrollbar-width: thin !important;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent !important;
        }
        div.bg-sidebar .overflow-y-auto::-webkit-scrollbar,
        .flex-1.min-h-0.overflow-y-auto.flex.flex-col::-webkit-scrollbar {
          display: block !important;
          width: 5px !important;
        }
        div.bg-sidebar .overflow-y-auto::-webkit-scrollbar-track,
        .flex-1.min-h-0.overflow-y-auto.flex.flex-col::-webkit-scrollbar-track {
          background: transparent !important;
        }
        div.bg-sidebar .overflow-y-auto::-webkit-scrollbar-thumb,
        .flex-1.min-h-0.overflow-y-auto.flex.flex-col::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2) !important;
          border-radius: 9999px !important;
        }
        div.bg-sidebar .overflow-y-auto::-webkit-scrollbar-thumb:hover,
        .flex-1.min-h-0.overflow-y-auto.flex.flex-col::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4) !important;
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
          width: 480px;
          max-width: 90vw;
          background: rgba(var(--ag-surface-rgb, 41, 35, 20), 0.88);
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
          border-left: 1.5px solid var(--primary, #e4be67);
          box-shadow: -12px 0 45px rgba(0, 0, 0, 0.75), inset 1px 0 0 rgba(255, 255, 255, 0.08);
          z-index: 999995;
          display: flex;
          flex-direction: column;
          transform: translateX(100%) !important;
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease, visibility 0.28s !important;
          pointer-events: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          color: var(--foreground, #f3f2f2);
          font-family: var(--font-mono, "JetBrainsMono Nerd Font", monospace);
          box-sizing: border-box;
        }
        #antigravity-skills-drawer.open {
          transform: translateX(0) !important;
          pointer-events: auto !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        .ag-drawer-header {
          padding: 14px 18px;
          border-bottom: 1px solid rgba(var(--ag-primary-rgb, 228, 190, 103), 0.25);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(0, 0, 0, 0.25);
          flex-shrink: 0;
        }
        .ag-drawer-title {
          font-size: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--primary, #e4be67);
          font-family: var(--font-mono, "JetBrainsMono Nerd Font", monospace);
        }
        .ag-drawer-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ag-drawer-action-btn {
          background: rgba(var(--ag-primary-rgb, 228, 190, 103), 0.08);
          border: 1px solid rgba(var(--ag-primary-rgb, 228, 190, 103), 0.25);
          color: var(--foreground, #f3f2f2);
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: var(--font-mono, "JetBrainsMono Nerd Font", monospace);
        }
        .ag-drawer-action-btn:hover {
          background: rgba(var(--ag-primary-rgb, 228, 190, 103), 0.2);
          border-color: var(--primary, #e4be67);
          color: var(--primary, #e4be67);
        }
        .ag-drawer-close-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: var(--muted-foreground, #b6b4af);
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
          background: rgba(var(--ag-primary-rgb, 228, 190, 103), 0.2);
          border-color: var(--primary, #e4be67);
          color: var(--primary, #e4be67);
        }
        .ag-drawer-search-wrap {
          padding: 12px 18px;
          border-bottom: 1px solid rgba(var(--ag-primary-rgb, 228, 190, 103), 0.15);
          background: rgba(0, 0, 0, 0.15);
          flex-shrink: 0;
        }
        .ag-drawer-search {
          width: 100%;
          background: rgba(0, 0, 0, 0.45);
          border: 1px solid rgba(var(--ag-outline-rgb, 115, 108, 94), 0.4);
          border-radius: 6px;
          padding: 8px 12px;
          color: var(--foreground, #f3f2f2);
          font-size: 12px;
          outline: none;
          box-sizing: border-box;
          font-family: var(--font-mono, "JetBrainsMono Nerd Font", monospace);
          transition: all 0.2s ease;
        }
        .ag-drawer-search:focus {
          border-color: var(--primary, #e4be67);
          box-shadow: 0 0 10px rgba(var(--ag-primary-rgb, 228, 190, 103), 0.3);
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
          scrollbar-color: rgba(var(--ag-primary-rgb, 228, 190, 103), 0.4) transparent !important;
        }
        .ag-drawer-content::-webkit-scrollbar {
          display: block !important;
          width: 6px !important;
        }
        .ag-drawer-content::-webkit-scrollbar-track {
          background: transparent !important;
        }
        .ag-drawer-content::-webkit-scrollbar-thumb {
          background: rgba(var(--ag-primary-rgb, 228, 190, 103), 0.4) !important;
          border-radius: 9999px !important;
        }
        .ag-drawer-content::-webkit-scrollbar-thumb:hover {
          background: var(--primary, #e4be67) !important;
        }
        .ag-category-box {
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.2);
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
          font-size: 12px;
          font-weight: 600;
          color: var(--foreground, #f3f2f2);
          background: rgba(var(--ag-surface-variant-rgb, 69, 58, 33), 0.3);
          font-family: var(--font-mono, "JetBrainsMono Nerd Font", monospace);
          border-bottom: 1px solid transparent;
        }
        .ag-category-header:hover {
          background: rgba(var(--ag-surface-variant-rgb, 69, 58, 33), 0.5);
          color: #fff;
        }
        .ag-category-box.open .ag-category-header {
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .ag-category-chevron {
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-block;
          color: var(--primary, #e4be67);
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
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 6px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .ag-skill-card:hover {
          border-color: rgba(var(--ag-primary-rgb, 228, 190, 103), 0.35);
          background: rgba(var(--ag-surface-variant-rgb, 69, 58, 33), 0.25);
        }
        .ag-skill-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ag-skill-name {
          font-family: var(--font-mono, "JetBrainsMono Nerd Font", monospace);
          font-size: 13px;
          font-weight: 700;
          color: var(--primary, #e4be67);
        }
        .ag-skill-usage-badge {
          font-size: 10px;
          font-weight: 700;
          color: var(--primary, #e4be67);
          background: rgba(var(--ag-primary-rgb, 228, 190, 103), 0.15);
          border: 1px solid rgba(var(--ag-primary-rgb, 228, 190, 103), 0.35);
          border-radius: 9999px;
          padding: 1px 6px;
          display: inline-flex;
          align-items: center;
          gap: 2px;
          white-space: nowrap;
          user-select: none;
          font-family: var(--font-mono, "JetBrainsMono Nerd Font", monospace);
        }
        .ag-skill-use-btn {
          background: var(--primary, #e4be67);
          color: #101010;
          border: none;
          border-radius: 4px;
          padding: 3px 10px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: var(--font-mono, "JetBrainsMono Nerd Font", monospace);
        }
        .ag-skill-use-btn:hover {
          opacity: 0.9;
          transform: scale(1.03);
        }
        .ag-skill-desc {
          font-size: 11.5px;
          color: var(--muted-foreground, #b6b4af);
          line-height: 1.45;
        }
        .ag-skill-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .ag-skill-tag {
          font-size: 10px;
          color: var(--primary, #e4be67);
          background: rgba(var(--ag-primary-rgb, 228, 190, 103), 0.08);
          border: 1px solid rgba(var(--ag-primary-rgb, 228, 190, 103), 0.15);
          padding: 1px 5px;
          border-radius: 4px;
          font-family: var(--font-mono, "JetBrainsMono Nerd Font", monospace);
        }
        .ag-drawer-footer {
          padding: 10px 16px;
          border-top: 1px solid rgba(var(--ag-primary-rgb, 228, 190, 103), 0.15);
          font-size: 11px;
          color: var(--muted-foreground, #b6b4af);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(0, 0, 0, 0.35);
          flex-shrink: 0;
          font-family: var(--font-mono, "JetBrainsMono Nerd Font", monospace);
        }
        .ag-drawer-footer a {
          color: var(--primary, #e4be67);
          text-decoration: none;
          font-family: var(--font-mono, "JetBrainsMono Nerd Font", monospace);
          font-weight: 700;
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

      // Usage tracking helpers
      function getUsageMap() {
        try {
          const raw = localStorage.getItem("antigravity_skill_usage");
          return raw ? JSON.parse(raw) : {};
        } catch (_) {
          return {};
        }
      }

      function recordSkillUsage(cmd) {
        if (!cmd) return;
        const normalized = cmd.trim();
        try {
          const map = getUsageMap();
          map[normalized] = (map[normalized] || 0) + 1;
          localStorage.setItem("antigravity_skill_usage", JSON.stringify(map));
        } catch (_) {}
      }

      function toggleDrawer(open) {
        const d = document.getElementById("antigravity-skills-drawer");
        const b = document.getElementById("antigravity-skills-backdrop");
        const btn = document.getElementById("antigravity-skills-nav-btn");
        if (!d) return;
        const isCurrentlyOpen = d.classList.contains("open");
        const shouldOpen = open !== undefined ? open : !isCurrentlyOpen;
        if (shouldOpen) {
          const s = document.getElementById("ag-drawer-search");
          renderSkills(s ? s.value : "");
          d.classList.add("open");
          if (b) b.classList.add("open");
          if (btn) btn.classList.add("active");
          setTimeout(() => {
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
        if ((e.ctrlKey && e.shiftKey && (e.key === "S" || e.key === "s")) ||
            (e.altKey && (e.key === "s" || e.key === "S"))) {
          e.preventDefault();
          e.stopPropagation();
          toggleDrawer();
        }
        if (e.key === "Escape") toggleDrawer(false);
      });

      // Quick footer link insertion
      const footerLink = document.getElementById("ag-footer-agent-link");
      if (footerLink) {
        footerLink.onclick = () => {
          recordSkillUsage("/skills-manager");
          const editor = document.querySelector('[data-lexical-editor="true"]') || document.querySelector('[aria-label="Message input"]');
          if (editor) {
            editor.focus();
            editor.dispatchEvent(new InputEvent("beforeinput", { bubbles: true, cancelable: true, inputType: "insertText", data: "/skills-manager" }));
            toggleDrawer(false);
          }
        };
      }

      // Track commands typed directly in message input
      if (!window.__ag_skill_input_tracker) {
        window.__ag_skill_input_tracker = (e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            const editor = document.querySelector('[data-lexical-editor="true"]') || document.querySelector('[aria-label="Message input"]');
            if (editor && editor.textContent) {
              const text = editor.textContent.trim();
              const firstWord = text.split(/\s+/)[0];
              if (firstWord.startsWith("/")) {
                recordSkillUsage(firstWord);
              }
            }
          }
        };
        window.addEventListener("keydown", window.__ag_skill_input_tracker, true);
      }

      // 3. Render Skills (Sorted by usage count descending in each category)
      function renderSkills(filterText = "") {
        const container = document.getElementById("ag-drawer-content");
        if (!container) return;
        container.innerHTML = "";
        const q = filterText.trim().toLowerCase();
        const usageMap = getUsageMap();

        let visibleCount = 0;
        skillsData.forEach(cat => {
          let matches = cat.skills.filter(s => !q || s.name.toLowerCase().includes(q) || s.command.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q) || (s.tags && s.tags.some(t => t.toLowerCase().includes(q))));
          if (matches.length === 0) return;
          visibleCount++;

          // Sort within this category by usage count descending, then alphabetically by name
          matches.sort((a, b) => {
            const countA = usageMap[a.command] || 0;
            const countB = usageMap[b.command] || 0;
            if (countB !== countA) {
              return countB - countA;
            }
            return a.name.localeCompare(b.name);
          });

          const box = document.createElement("div");
          const isOpen = Boolean(q);
          box.className = isOpen ? "ag-category-box open" : "ag-category-box";
          box.innerHTML = \`<div class="ag-category-header"><span>\${cat.category}</span><span class="ag-category-chevron">▾</span></div>\`;
          box.querySelector(".ag-category-header").onclick = () => box.classList.toggle("open");

          const body = document.createElement("div");
          body.className = "ag-category-body";
          matches.forEach(s => {
            const count = usageMap[s.command] || 0;
            const badgeHtml = count > 0 
              ? \`<span class="ag-skill-usage-badge" title="Used \${count} times">★ \${count}</span>\` 
              : "";

            const card = document.createElement("div");
            card.className = "ag-skill-card";
            card.innerHTML = \`
              <div class="ag-skill-top">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span class="ag-skill-name">\${s.command}</span>
                  \${badgeHtml}
                </div>
                <button class="ag-skill-use-btn">Use ↳</button>
              </div>
              <div class="ag-skill-desc">\${s.desc}</div>
              <div class="ag-skill-tags">
                \${(s.tags || []).map(t => \`<span class="ag-skill-tag">#\${t}</span>\`).join("")}
              </div>
            \`;

            card.querySelector(".ag-skill-use-btn").onclick = (e) => {
              e.stopPropagation();
              recordSkillUsage(s.command);
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

      // Attach Sidebar Button (Self-Healing)
      function attachBtn() {
        const settingsBtn = document.querySelector('[data-testid="settings-button"]');
        if (!settingsBtn || !settingsBtn.parentElement) return;

        let b = document.getElementById("antigravity-skills-nav-btn");
        if (b) {
          if (b.parentElement === settingsBtn.parentElement) {
            if (b.nextElementSibling !== settingsBtn) {
              settingsBtn.parentElement.insertBefore(b, settingsBtn);
            }
            return;
          }
          b.remove();
          b = null;
        }

        b = document.createElement("div");
        b.id = "antigravity-skills-nav-btn";
        b.setAttribute("role", "button");
        b.tabIndex = 0;
        b.className = "flex-grow flex items-center gap-1.5 group px-2 py-1 rounded-lg cursor-pointer h-8 min-w-0 bg-transparent hover:bg-sidebar-muted text-secondary-foreground";
        b.innerHTML = \`
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0" style="color: var(--primary, #e4be67);">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          <span class="select-none truncate text-sm font-normal">Skills Hub</span>
          <span style="margin-left: auto; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 9999px; background: rgba(var(--ag-primary-rgb, 228, 190, 103), 0.15); color: var(--primary, #e4be67); border: 1px solid rgba(var(--ag-primary-rgb, 228, 190, 103), 0.3);">/cmd</span>
        \`;
        b.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleDrawer();
        };
        settingsBtn.parentElement.insertBefore(b, settingsBtn);
      }
      attachBtn();

      if (!window.__antigravity_skills_observer) {
        window.__antigravity_skills_observer = new MutationObserver(() => {
          attachBtn();
        });
        window.__antigravity_skills_observer.observe(document.body || document.documentElement, {
          childList: true,
          subtree: true
        });
      }
      if (!window.__ag_skills_btn_timer) {
        window.__ag_skills_btn_timer = setInterval(attachBtn, 1000);
      }

      // Universal Terminal Font & Geometry Sync Enforcer (16px, JetBrainsMono Nerd Font)
      function enforceTerminalFont(targetFontSize = 16) {
        try {
          const desiredFont = '"JetBrainsMono Nerd Font", "JetBrains Mono", monospace';
          const terms = document.querySelectorAll('.terminal, .xterm');
          if (!terms || terms.length === 0) return;
          for (const term of terms) {
            let curr = term.parentElement;
            let fiber = null;
            while (curr && !fiber) {
              const key = Object.keys(curr).find(k => k.startsWith('__reactFiber'));
              if (key) fiber = curr[key];
              curr = curr.parentElement;
            }
            if (!fiber) continue;
            let f = fiber;
            let termObj = null;
            let pFiber = null;
            while (f) {
              let s = f.memoizedState;
              while (s) {
                if (s.memoizedState && s.memoizedState._publicOptions) {
                  termObj = s.memoizedState;
                }
                s = s.next;
              }
              if (f.type && (f.type.name === 'C4b' || (f.memoizedProps && f.memoizedProps.process))) {
                pFiber = f;
              }
              f = f.return;
            }
            if (!termObj) continue;

            const core = termObj._core;
            let changed = false;
            if (termObj.options.fontSize !== targetFontSize) {
              termObj.options.fontSize = targetFontSize;
              changed = true;
            }
            if (termObj.options.fontFamily !== desiredFont) {
              termObj.options.fontFamily = desiredFont;
              changed = true;
            }

            // Prototype patch for future terminal tabs
            const proto = Object.getPrototypeOf(termObj);
            if (proto && !proto.__ag_font_patched) {
              proto.__ag_font_patched = true;
              const origOpen = proto.open;
              proto.open = function(...args) {
                try {
                  if (this.options) {
                    this.options.fontSize = targetFontSize;
                    this.options.fontFamily = desiredFont;
                  }
                } catch (e) {}
                const res = origOpen.apply(this, args);
                try {
                  if (this.options) {
                    this.options.fontSize = targetFontSize;
                    this.options.fontFamily = desiredFont;
                  }
                  setTimeout(() => {
                    if (this._core && this._core._viewport && this._core._viewport._sync) this._core._viewport._sync();
                    if (this.scrollToBottom) this.scrollToBottom();
                    if (this.refresh) this.refresh(0, this.rows - 1);
                  }, 100);
                } catch (e) {}
                return res;
              };
            }

            // Dynamically calculate and sync cols/rows
            const container = term.parentElement;
            if (container && core && core._renderService && core._renderService.dimensions && core._renderService.dimensions.css) {
              const cellW = core._renderService.dimensions.css.cell.width;
              const cellH = core._renderService.dimensions.css.cell.height;
              if (cellW > 0 && cellH > 0) {
                const availW = container.clientWidth || term.clientWidth;
                const availH = container.clientHeight || term.clientHeight;
                const targetCols = Math.max(20, Math.floor(availW / cellW));
                const targetRows = Math.max(5, Math.floor((availH - 4) / cellH));
                if (termObj.cols !== targetCols || termObj.rows !== targetRows) {
                  termObj.resize(targetCols, targetRows);
                  changed = true;
                }
              }
            }

            // Synchronize VS Code ScrollableElement and xterm viewport
            if (core && core._viewport && core._viewport._sync) {
              core._viewport._sync();
            }

            // Notify backend PTY process of current geometry
            if (pFiber && pFiber.memoizedProps && pFiber.memoizedProps.process && typeof pFiber.memoizedProps.process.resize === 'function') {
              const proc = pFiber.memoizedProps.process;
              if (!proc.lastSentResize || proc.lastSentResize.cols !== termObj.cols || proc.lastSentResize.rows !== termObj.rows) {
                proc.resize(termObj.cols, termObj.rows);
              }
            }

            // Sync viewport bounds on mouse wheel so scrollHeight is never stale
            if (!term.__ag_wheel_sync) {
              term.__ag_wheel_sync = true;
              term.addEventListener('wheel', () => {
                if (termObj._core && termObj._core._viewport && termObj._core._viewport._sync) {
                  termObj._core._viewport._sync();
                }
              }, { passive: true });
            }

            if (changed && termObj.refresh) {
              termObj.refresh(0, termObj.rows - 1);
            }
          }
        } catch (err) {}
      }
      window.__enforceTerminalFont = enforceTerminalFont;
      enforceTerminalFont(16);

      // Anti-Glitch: Zero Horizontal Shift Lock (Permanently keeps sidebar in view)
      function lockHorizontalScroll() {
        try {
          if (window.scrollX !== 0) window.scrollTo(0, window.scrollY);
          if (document.documentElement && document.documentElement.scrollLeft !== 0) document.documentElement.scrollLeft = 0;
          if (document.body && document.body.scrollLeft !== 0) document.body.scrollLeft = 0;
          const root = document.getElementById('root');
          if (root && root.scrollLeft !== 0) root.scrollLeft = 0;
          const rws = document.querySelector('[class*="relative"][class*="w-screen"]');
          if (rws && rws.scrollLeft !== 0) rws.scrollLeft = 0;
          const ws = document.querySelector('.h-screen.w-screen');
          if (ws && ws.scrollLeft !== 0) ws.scrollLeft = 0;
        } catch (e) {}
      }
      window.__lockHorizontalScroll = lockHorizontalScroll;
      lockHorizontalScroll();

      // Antigravity Hovercard & Ghost Tooltip Purger
      function enforceSidebarTooltips() {
        if (window.__ag_tooltip_enforced) return;
        window.__ag_tooltip_enforced = true;

        function purgeGhostTooltips() {
          try {
            const pos = Array.from(document.querySelectorAll('[data-base-ui-tooltip-positioner], div[data-side][class*="z-[7000]"], [data-closed], [data-ending-style]'));
            for (const p of pos) {
              if (p.hasAttribute && (p.hasAttribute('data-closed') || p.hasAttribute('data-ending-style') || p.querySelector?.('[data-closed]'))) {
                p.style.setProperty('display', 'none', 'important');
                p.style.setProperty('opacity', '0', 'important');
                p.style.setProperty('visibility', 'hidden', 'important');
                p.style.setProperty('pointer-events', 'none', 'important');
              }
            }
          } catch (e) {}
        }

        function hideAllTooltips() {
          try {
            const pos = document.querySelectorAll('[data-base-ui-tooltip-positioner], div[data-side][class*="z-[7000]"], [data-closed], [data-ending-style]');
            for (const p of pos) {
              p.style.setProperty('display', 'none', 'important');
              p.style.setProperty('opacity', '0', 'important');
              p.style.setProperty('visibility', 'hidden', 'important');
              p.style.setProperty('pointer-events', 'none', 'important');
            }
          } catch (e) {}
        }

        const obs = new MutationObserver((mutations) => {
          purgeGhostTooltips();
          lockHorizontalScroll();
        });
        obs.observe(document.body || document.documentElement, { childList: true, subtree: true });

        window.addEventListener('wheel', (e) => {
          if (e.target && e.target.closest && e.target.closest('[data-sidebar-scroll-container], [role="navigation"]')) {
            hideAllTooltips();
          }
        }, { passive: true, capture: true });

        document.addEventListener('pointerenter', (e) => {
          if (e.target && e.target.closest && (e.target.closest('[data-pane-id]') || e.target.closest('.flex-1.flex.min-h-0.relative') || e.target.closest('[data-testid="conversation-row-sidebar"]'))) {
            hideAllTooltips();
          }
        }, { capture: true, passive: true });

        document.addEventListener('pointerleave', (e) => {
          if (e.target && (e.target.hasAttribute?.('data-sidebar-scroll-container') || e.target.getAttribute?.('role') === 'navigation')) {
            hideAllTooltips();
          }
        }, { capture: true, passive: true });

        window.addEventListener('scroll', lockHorizontalScroll, { capture: true, passive: true });
        window.addEventListener('focusin', () => {
          hideAllTooltips();
          lockHorizontalScroll();
          requestAnimationFrame(lockHorizontalScroll);
        }, { capture: true, passive: true });
      }
      window.__enforceSidebarTooltips = enforceSidebarTooltips;
      enforceSidebarTooltips();

      // Dedicated Close Split Screen Button Enforcer
      function enforceCloseSplitButton() {
        try {
          const root = document.querySelector('.h-screen.w-screen') || document.body;
          if (root && !window.__ag_aux_observer) {
            window.__ag_aux_observer = new MutationObserver(() => {
              if (window.__enforceCloseSplitButton) window.__enforceCloseSplitButton();
            });
            window.__ag_aux_observer.observe(root, { attributes: true, attributeFilter: ['style'] });
          }

          const auxBtn = document.querySelector('[data-testid="toggle-aux-sidebar"]');
          if (!auxBtn || !auxBtn.parentElement) return;

          const auxWidth = getComputedStyle(root).getPropertyValue('--aux-pane-width').trim();
          const isSplitOpen = auxWidth && auxWidth !== '0px' && auxWidth !== '0' && !auxWidth.startsWith('0px');

          let closeBtn = document.getElementById('ag-close-split-btn');
          if (!isSplitOpen) {
            if (closeBtn) closeBtn.style.display = 'none';
            return;
          }

          if (closeBtn) {
            closeBtn.style.display = 'inline-flex';
            if (closeBtn.parentElement !== auxBtn.parentElement) {
              auxBtn.parentElement.appendChild(closeBtn);
            }
            return;
          }

          closeBtn = document.createElement('button');
          closeBtn.id = 'ag-close-split-btn';
          closeBtn.className = auxBtn.className;
          closeBtn.setAttribute('aria-label', 'Close Split Screen');
          closeBtn.setAttribute('title', 'Close Split Screen (Ctrl+Shift+B)');
          closeBtn.style.cssText = 'app-region: no-drag; margin-left: 2px; color: var(--foreground); cursor: pointer; display: inline-flex; border: 1px solid rgba(221, 195, 155, 0.25); border-radius: 8px;';
          closeBtn.innerHTML = '<span class="relative flex items-center justify-center" style="width: 18px; height: 18px;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span>';
          closeBtn.onclick = (e) => {
            e.stopPropagation();
            const target = document.querySelector('[data-testid="toggle-aux-sidebar"]');
            if (target) target.click();
          };
          auxBtn.parentElement.appendChild(closeBtn);
        } catch (e) {}

        // Enforce close button on Pane 2 when in multi-conversation split
        try {
          const path = window.location.pathname || '';
          const isSplitUrl = path.includes('+');
          const pane2 = document.querySelector('[data-pane-id="pane-2"]');
          if (pane2 && isSplitUrl) {
            let p2CloseBtn = document.getElementById('ag-close-pane-2-btn');
            const cluster = pane2.querySelector('div.flex.items-center.justify-end.shrink-0 > div.flex.items-center.gap-1');
            if (cluster && !p2CloseBtn) {
              p2CloseBtn = document.createElement('button');
              p2CloseBtn.id = 'ag-close-pane-2-btn';
              p2CloseBtn.className = 'inline-flex items-center font-medium transition-colors select-none outline-none cursor-pointer justify-center disabled:opacity-50 h-7 w-7 shrink-0 flex items-center justify-center rounded-lg group bg-transparent text-secondary-foreground hover:text-foreground hover:bg-secondary focus-visible:text-foreground focus-visible:bg-secondary';
              p2CloseBtn.setAttribute('aria-label', 'Remove From Split');
              p2CloseBtn.setAttribute('title', 'Close Split Screen (Remove Pane)');
              p2CloseBtn.style.cssText = 'app-region: no-drag; color: var(--foreground); cursor: pointer; border: 1px solid rgba(221, 195, 155, 0.3); border-radius: 6px;';
              p2CloseBtn.innerHTML = '<span class="relative flex items-center justify-center" style="width: 18px; height: 18px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 -960 960 960" fill="currentColor"><path d="M480-437.85L277.08-234.92q-8.31,8.31-20.88,8.5t-21.27-8.5T226.23-256t8.69-21.08L437.85-480L234.92-682.92q-8.31-8.31-8.5-20.88t8.5-21.27T256-733.77t21.08,8.69L480-522.15L682.92-725.08q8.31-8.31 20.88-8.5t21.27,8.5T733.77-704t-8.69,21.08L522.15-480L725.08-277.08q8.31,8.31 8.5,20.88t-8.5,21.27T704-226.23t-21.08-8.69L480-437.85Z"></path></svg></span>';
              p2CloseBtn.onclick = (e) => {
                e.stopPropagation();
                const parts = path.split('/c/')[1]?.split('+');
                if (parts && parts[0]) {
                  history.pushState({}, '', '/c/' + parts[0]);
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              };
              const overviewBtn = cluster.querySelector('[data-testid="toggle-overview-panel"]');
              if (overviewBtn) {
                cluster.insertBefore(p2CloseBtn, overviewBtn);
              } else {
                cluster.appendChild(p2CloseBtn);
              }
            }
          } else {
            const p2CloseBtn = document.getElementById('ag-close-pane-2-btn');
            if (p2CloseBtn) p2CloseBtn.remove();
          }
        } catch (e) {}
      }
      enforceCloseSplitButton();
      window.__enforceCloseSplitButton = enforceCloseSplitButton;

      // Native Drag-to-Split Gesture Stabilizer
      function enforceDragToSplit() {
        try {
          if (!window.__ag_drag_to_split_installed) {
            window.__ag_drag_to_split_installed = true;

            // 1. Ensure splitView feature flag is enabled in localStorage
            try {
              let overrides = JSON.parse(localStorage.getItem('jetski.developer.customFlagOverrides') || '{}');
              if (!overrides['enable-split-view']) {
                overrides['enable-split-view'] = true;
                localStorage.setItem('jetski.developer.customFlagOverrides', JSON.stringify(overrides));
              }
            } catch (e) {}

            // 2. Prevent native HTML5 dragstart from intercepting custom pointer drag
            window.addEventListener('dragstart', (e) => {
              if (e.target && e.target.closest && e.target.closest('[data-sidebar-row-id]')) {
                e.preventDefault();
              }
            }, true);

            // 3. Track drag motion to prevent accidental navigation on mouse release
            window.__convoDragActive = false;
            let startX = 0, startY = 0, isTracking = false;

            window.addEventListener('pointerdown', (e) => {
              if (e.button === 0 && e.target && e.target.closest && e.target.closest('[data-sidebar-row-id]')) {
                isTracking = true;
                startX = e.clientX;
                startY = e.clientY;
              }
            }, true);

            window.addEventListener('pointermove', (e) => {
              if (isTracking) {
                let dx = Math.abs(e.clientX - startX);
                let dy = Math.abs(e.clientY - startY);
                if (dx > 5 || dy > 5) {
                  window.__convoDragActive = true;
                }
              }
            }, true);

            window.addEventListener('pointerup', (e) => {
              isTracking = false;
              if (window.__convoDragActive) {
                setTimeout(() => {
                  window.__convoDragActive = false;
                }, 300);
              }
            }, true);

            window.addEventListener('pointercancel', (e) => {
              isTracking = false;
              setTimeout(() => {
                window.__convoDragActive = false;
              }, 100);
            }, true);

            // 4. Block link navigation when a drag was performed
            window.addEventListener('click', (e) => {
              if (window.__convoDragActive) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
              }
            }, true);
          }
        } catch (e) {}
      }
      enforceDragToSplit();
      window.__enforceDragToSplit = enforceDragToSplit;

      // Sync terminal geometry on window resize with zero CPU overhead
      if (!window.__ag_resize_attached) {
        window.__ag_resize_attached = true;
        window.addEventListener("resize", () => {
          if (window.__enforceTerminalFont) {
            window.__enforceTerminalFont(16);
          }
          if (window.__enforceCloseSplitButton) {
            window.__enforceCloseSplitButton();
          }
        }, { passive: true });
        window.addEventListener("click", () => {
          setTimeout(() => {
            if (window.__enforceCloseSplitButton) window.__enforceCloseSplitButton();
          }, 100);
        }, { passive: true });
        window.addEventListener("popstate", () => {
          setTimeout(() => {
            if (window.__enforceCloseSplitButton) window.__enforceCloseSplitButton();
          }, 100);
        }, { passive: true });
      }

      if (window.__ag_terminal_timer) {
        clearInterval(window.__ag_terminal_timer);
        window.__ag_terminal_timer = null;
      }

      if (window.__sidebar_wheel_handler) {
        window.removeEventListener("wheel", window.__sidebar_wheel_handler);
        window.__sidebar_wheel_handler = null;
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
      const currentThemeCss = getThemeCss();
      const heartbeatExpr = `(() => {
        let reinjected = false;
        if (!document.getElementById("antigravity-skills-drawer") || !document.getElementById("antigravity-skills-nav-btn")) {
          ${payload}
          return "Re-injected full payload via heartbeat";
        }
        const expectedCss = ${JSON.stringify(currentThemeCss)};
        if (expectedCss) {
          let themeEl = document.getElementById("antigravity-boxed-theme-style");
          if (!themeEl) {
            themeEl = document.createElement("style");
            themeEl.id = "antigravity-boxed-theme-style";
            (document.head || document.documentElement).appendChild(themeEl);
            themeEl.textContent = expectedCss;
            reinjected = true;
          } else if (themeEl.textContent !== expectedCss) {
            themeEl.textContent = expectedCss;
            reinjected = true;
          }
        }
        if (window.__enforceTerminalFont) {
          window.__enforceTerminalFont(16);
        }
        return reinjected ? "Re-injected boxed theme" : "OK";
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

  await Promise.allSettled(ports.map(async (port) => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 600);
      const res = await fetch(`http://127.0.0.1:${port}/json`, { signal: controller.signal });
      clearTimeout(timer);
      const targets = await res.json();
      const pages = targets.filter(t => t.type === 'page');
      for (const page of pages) {
        setupPageConnection(page, payload);
      }
    } catch (e) {}
  }));
}

if (require.main === module) {
  console.log("Antigravity Skills Hub Daemon started.");
  setInterval(checkAndInject, 3000);
  checkAndInject();
}

module.exports = { getInjectionPayload, SKILLS_DATABASE };
