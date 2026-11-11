#!/usr/bin/env python3
"""
Antigravity Skills Hub & Customization Manager (manage_skills.py)
Automates:
  1. Scanning all skills across user, plugin, and built-in directories.
  2. Auto-categorizing skills into domains and updating the Skills Hub database.
  3. Importing skills from Git repositories, URLs, or local Obsidian vaults.
  4. Consolidating/clubbing multi-skill suites into modular unified skills.
  5. Live-syncing running Antigravity instances via Chrome DevTools Protocol.
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path

# Paths
REAL_HOME = Path(os.environ.get("REAL_HOME", "/home/yash"))
THEME_DIR = Path(__file__).resolve().parent
CATALOG_FILE = THEME_DIR / "skills_catalog.json"
DAEMON_FILE = THEME_DIR / "skills_drawer_daemon.js"
PATCH_FILE = THEME_DIR / "patch_app_asar.py"
SKILLS_DIR = Path.home() / ".agents/skills"
GEMINI_SKILLS_DIR = Path.home() / ".gemini/config/skills"
PROFILES_DIR = REAL_HOME / ".config/Antigravity-Profiles"

# Hackathon Speed Matrix Category Matcher Rules (with Cross-Listing Support)
CATEGORY_RULES = [
    ("💡 1. Ideate & Spec", [
        "autoskill", "auto", "brainstorming", "claude-council", "executing-plans", "grill-me", 
        "prd", "subagent-driven-development", "using-superpowers", "writing-plans",
        "diagram-design", "anatomy", "generative-ui", "generative_ui", "plan", "council", "superpower",
        "obsidian", "obsidian-", "json-canvas", "knap", "defuddle"
    ]),
    ("🎨 2. Frontend, UI & Motion", [
        "stitch", "frontend-design", "design", "ui-ux-pro-max", "generative-ui", "generative_ui",
        "gsap", "ui-animation", "hyperframes", "shaders", "blender", "brand", "web-design-guidelines", "ui-plugin-navigation",
        "diagram-design", "anatomy", "diagram", "ui-"
    ]),
    ("⚡ 3. Fullstack, AI & APIs", [
        "devrelay", "devrelay-", "gemini-api-dev", "gemini-live-api-dev", "gemini-omni-flash-api", "firebase",
        "vercel", "flutter", "dart", "google-maps-platform", "chrome-extensions",
        "mcp-builder", "coding-standards", "security-best-practices", "gcloud",
        "google-antigravity-sdk", "android-cli", "gemini-", "antigravity-sdk", "react", "mcp", "rea",
        "trader", "trader-skill", "finance", "stock", "portfolio", "trading"
    ]),
    ("🪲 4. Quick Debug & QA", [
        "ponytail", "systematic-debugging", "chrome-devtools", "playwright",
        "test-driven-development", "verification-before-completion",
        "rea", "reverse-engineer-anything", "reverse-engineering", "decompil",
        "debugging", "devtools", "test", "verification"
    ]),
    ("🏆 5. Pitch, Demo & Launch", [
        "devrelay", "devrelay-", "linkedin", "brag", "slides", "hyperframes", "design", "diagram-design", "anatomy", "gsap", "gemini-omni-flash-api",
        "docx", "pptx", "xlsx", "pdf", "gcalendar", "gdocs", "gdrive", "gslides",
        "git-commit", "commit", "presentation", "sheet", "doc", "launch", "video"
    ]),
    ("🎮 Game Dev & 3D (Separate)", [
        "godot", "gamedev", "roblox", "blender", "shaders", "pptimize", "deadlocked",
        "shader-dev", "game", "3d", "shader", "glsl", "render", "mesh"
    ]),
    ("⚙️ Agent & System Tools", [
        "autoskill", "auto", "automation", "browser", "cdp-daemon-automation", "token-optimizer",
        "skills-manager", "skill-creator", "agy-customizations", "antigravity-guide", "antigravity_guide",
        "plugin", "find-skills", "migrate-workflows", "permissioned-github", "run-workflow",
        "chrome-devtools", "gcloud", "firebase", "android-cli", "git-commit",
        "rea", "reverse-engineer-anything", "trader", "trader-skill",
        "workflow", "daemon", "skill", "customization", "guide"
    ]),
]

def parse_skill_file(skill_path: Path):
    name = skill_path.parent.name
    if name == "skills":
        name = skill_path.parent.parent.name
        if name.endswith("-plugin"):
            name = name.replace("-plugin", "")
    desc = ""
    tags = []
    try:
        text = skill_path.read_text(encoding="utf-8", errors="ignore")
        m = re.match(r"^---\s*\n(.*?)\n---", text, re.DOTALL)
        if m:
            front = m.group(1)
            lines = front.splitlines()
            for idx, line in enumerate(lines):
                if line.startswith("name:"):
                    raw_name = line.split(":", 1)[1].strip().strip('"').strip("'")
                    if raw_name:
                        name = raw_name
                elif line.startswith("description:"):
                    val = line.split(":", 1)[1].strip()
                    if val in [">", ">-", "|", "|-", ""]:
                        desc_parts = []
                        for nxt in lines[idx + 1:]:
                            if re.match(r"^[a-zA-Z0-9_-]+:", nxt):
                                break
                            desc_parts.append(nxt.strip())
                        desc = " ".join([p for p in desc_parts if p])
                    else:
                        desc = val.strip('"').strip("'")
        if not desc:
            for line in text.splitlines():
                line = line.strip()
                if line and not line.startswith("#") and not line.startswith("---") and not line.startswith("```"):
                    desc = line[:140]
                    break
    except Exception:
        desc = f"Antigravity agent capability for {name}."

    desc = desc.replace('"', '\\"').strip()
    if not desc or desc in [">", ">-", "|"]:
        desc = f"Antigravity agent capability for {name}."

    clean_name = name.replace("_", "-")
    tags = [t.lower() for t in clean_name.split("-") if len(t) > 1]
    tags.append("skill")
    return clean_name, name, desc, tags

def scan_all_skills():
    search_dirs = [
        SKILLS_DIR,
        GEMINI_SKILLS_DIR,
        Path("/home/yash/.agents/skills"),
        Path("/home/yash/.gemini/config/skills"),
        Path("/home/yash/.gemini/config/plugins"),
        Path("/home/yash/.gemini/antigravity/builtin/skills"),
        Path("/home/yash/.gemini/antigravity-cli/builtin/skills"),
        Path.home() / ".gemini/config/plugins",
        Path.home() / ".gemini/antigravity/builtin/skills",
        Path.home() / ".gemini/antigravity-cli/builtin/skills",
        Path.home() / ".gemini/antigravity-Account-1/builtin/skills",
        Path.home() / ".config/Antigravity-Profiles/Account-1/HOME/.agents/skills",
    ]
    all_skills = {}
    for d in search_dirs:
        if not d.exists():
            continue
        for p in d.rglob("SKILL.md"):
            if any(x in str(p) for x in ["modules/", "references/", "disabled_plugins/", "plugins_backup", "asar_extracted"]):
                continue
            clean_key, disp_name, desc, tags = parse_skill_file(p)
            if clean_key not in all_skills:
                all_skills[clean_key] = (p, disp_name, desc, tags)
    return all_skills

def build_categorized_database():
    all_skills = scan_all_skills()
    categorized = {cat: [] for cat, _ in CATEGORY_RULES}
    categorized["📦 Other Utilities"] = []

    for clean_key, (path, disp_name, desc, tags) in sorted(all_skills.items()):
        item = {
            "name": disp_name,
            "command": f"/{clean_key}",
            "desc": desc,
            "tags": tags,
            "path": str(path)
        }

        matched_cats = set()

        # 1. Exact keyword/identifier match across ALL categories (allows intentional duplicate cross-listing)
        for cat, kws in CATEGORY_RULES:
            if clean_key in kws or clean_key.replace("-", "_") in kws:
                categorized[cat].append(item)
                matched_cats.add(cat)

        # 2. Substring keyword match if not matched by exact keyword in any category
        if not matched_cats:
            for cat, kws in CATEGORY_RULES:
                if any(k in clean_key for k in kws):
                    categorized[cat].append(item)
                    matched_cats.add(cat)
                    break

        # 3. Haystack search fallback if still not matched
        if not matched_cats:
            haystack = (disp_name + " " + desc + " " + clean_key).lower()
            for cat, kws in CATEGORY_RULES:
                if any(k in haystack for k in kws):
                    categorized[cat].append(item)
                    matched_cats.add(cat)
                    break

        if not matched_cats:
            categorized["📦 Other Utilities"].append(item)

    database = []
    for cat, items in categorized.items():
        if items:
            database.append({
                "category": cat,
                "skills": items
            })
    return database

def cmd_scan(args):
    db = build_categorized_database()
    total = sum(len(c["skills"]) for c in db)
    print(f"\n⚡ Discovered {total} unique skills across {len(db)} categories:\n")
    for cat in db:
        print(f"{cat['category']} ({len(cat['skills'])} skills):")
        for s in cat['skills']:
            print(f"  • {s['command']:<30} - {s['desc'][:75]}...")
        print()

def cmd_sync(args):
    print("🔄 Scanning and building Skills Hub database...")
    db = build_categorized_database()
    total = sum(len(c["skills"]) for c in db)

    # Save to skills_catalog.json
    CATALOG_FILE.write_text(json.dumps(db, indent=2), encoding="utf-8")
    print(f"[✓] Saved catalog to {CATALOG_FILE} ({total} skills)")

    # Update skills_drawer_daemon.js
    if DAEMON_FILE.exists():
        text = DAEMON_FILE.read_text(encoding="utf-8")
        clean_db_str = json.dumps(db, indent=2)
        pattern = r"const SKILLS_DATABASE = \[.*?\];\n\nfunction getThemeCss"
        new_text = re.sub(pattern, lambda _: f"const SKILLS_DATABASE = {clean_db_str};\n\nfunction getThemeCss", text, flags=re.DOTALL)
        DAEMON_FILE.write_text(new_text, encoding="utf-8")
        print(f"[✓] Updated database in {DAEMON_FILE.name}")

    # Repack app.asar if requested or run patcher
    if getattr(args, "repack", False):
        print("📦 Repacking app.asar...")
        subprocess.run(["python3", str(PATCH_FILE)], check=True)

    # Live refresh via CDP
    live_refresh()
    print(f"\n🎉 Successfully synced {total} skills into Skills Hub!")

def live_refresh():
    try:
        node_script = """
        const { getInjectionPayload } = require('./skills_drawer_daemon.js');
        const fs = require('fs');
        const candidateFiles = [
          '/home/yash/.config/Antigravity-Profiles/Account-1/DevToolsActivePort',
          '/home/yash/.config/Antigravity-Profiles/Account-2/DevToolsActivePort',
          '/home/yash/.config/Antigravity-Profiles/Account-3/DevToolsActivePort',
          '/home/yash/.config/Antigravity-Profiles/Account-4/DevToolsActivePort',
          '/home/yash/.config/Antigravity-Profiles/Account-5/DevToolsActivePort',
          '/home/yash/.config/Antigravity-Profiles/Account-6/DevToolsActivePort',
          '/home/yash/.config/Antigravity/DevToolsActivePort',
          '/tmp/antigravity-cdp-port'
        ];
        async function run() {
          const payload = getInjectionPayload();
          for (const f of candidateFiles) {
            if (!fs.existsSync(f)) continue;
            const port = fs.readFileSync(f, 'utf8').split('\\n')[0].trim();
            if (!port || isNaN(port)) continue;
            try {
              const res = await fetch(`http://127.0.0.1:${port}/json`);
              const targets = await res.json();
              const pages = targets.filter(t => t.type === 'page');
              for (const p of pages) {
                const ws = new WebSocket(p.webSocketDebuggerUrl);
                await new Promise((resolve) => {
                  ws.onopen = () => {
                    ws.send(JSON.stringify({ id: 100, method: 'Runtime.evaluate', params: { expression: payload, returnByValue: true } }));
                    setTimeout(() => { ws.close(); resolve(); }, 150);
                  };
                  ws.onerror = () => resolve();
                });
                console.log(`[✓] Live Skills Hub refreshed on port ${port}`);
              }
            } catch (e) {}
          }
        }
        run();
        """
        subprocess.run(["node", "-e", node_script], cwd=str(THEME_DIR), check=False)
        subprocess.run(["systemctl", "--user", "restart", "antigravity-skills-hub.service"], check=False)
    except Exception as err:
        print(f"[!] Live refresh warning: {err}")

def cmd_import(args):
    source = args.source.strip()
    name = args.name

    if source.startswith("http://") or source.startswith("https://") or source.startswith("git@"):
        if source.endswith(".git") or "github.com" in source:
            if not name:
                name = source.rstrip("/").split("/")[-1].replace(".git", "")
            target_dir = SKILLS_DIR / name
            print(f"📥 Cloning Git repository: {source} -> {target_dir}...")
            if target_dir.exists():
                print(f"[!] Target {target_dir} already exists. Pulling latest changes...")
                subprocess.run(["git", "-C", str(target_dir), "pull"], check=False)
            else:
                subprocess.run(["git", "clone", "--depth", "1", source, str(target_dir)], check=True)
        else:
            if not name:
                name = "custom-imported-skill"
            target_dir = SKILLS_DIR / name
            target_dir.mkdir(parents=True, exist_ok=True)
            print(f"📥 Downloading markdown from {source}...")
            req = urllib.request.urlopen(source)
            content = req.read().decode("utf-8")
            (target_dir / "SKILL.md").write_text(content, encoding="utf-8")
    else:
        src_path = Path(source).expanduser().resolve()
        if not src_path.exists():
            print(f"Error: Path {src_path} does not exist.")
            sys.exit(1)
        if not name:
            name = src_path.name
        target_dir = SKILLS_DIR / name
        print(f"📥 Copying from local path: {src_path} -> {target_dir}...")
        if src_path.is_file():
            target_dir.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src_path, target_dir / "SKILL.md")
        else:
            if target_dir.exists():
                shutil.rmtree(target_dir)
            shutil.copytree(src_path, target_dir)

    skill_md = target_dir / "SKILL.md"
    if not skill_md.exists():
        mds = list(target_dir.glob("*.md"))
        if mds:
            shutil.copy2(mds[0], skill_md)
        else:
            skill_md.write_text(f"---\nname: {name}\ndescription: Custom imported skill {name}\n---\n# {name}\n\nImported skill.\n", encoding="utf-8")

    setup_symlinks(name, target_dir)
    print(f"[✓] Symlinked {name} into Antigravity discovery paths")

    cmd_sync(argparse.Namespace(repack=False))
    print(f"\n🎉 Successfully imported '{name}'! Available as /{name} in Antigravity.")

def setup_symlinks(name: str, target_dir: Path):
    target_dir = target_dir.resolve()
    dest_dirs = [
        GEMINI_SKILLS_DIR,
        REAL_HOME / ".gemini/config/skills",
        REAL_HOME / ".agents/skills"
    ]
    for prof in PROFILES_DIR.glob("Account-*"):
        dest_dirs.append(prof / "HOME/.agents/skills")
        dest_dirs.append(prof / "HOME/.gemini/config/skills")

    for dest in dest_dirs:
        if not dest.exists():
            try: dest.mkdir(parents=True, exist_ok=True)
            except Exception: continue
        symlink_path = dest / name
        try:
            if symlink_path.resolve() != target_dir:
                if symlink_path.is_symlink() or symlink_path.is_file():
                    symlink_path.unlink()
                elif symlink_path.is_dir():
                    shutil.rmtree(symlink_path)
                symlink_path.symlink_to(target_dir)
        except Exception:
            pass

def cmd_club(args):
    suite_name = args.suite_name
    skills_to_club = args.skills
    suite_dir = SKILLS_DIR / suite_name
    modules_dir = suite_dir / "modules"
    modules_dir.mkdir(parents=True, exist_ok=True)

    print(f"📦 Consolidating {len(skills_to_club)} skills into unified suite '{suite_name}'...")

    module_info = []
    for s_name in skills_to_club:
        s_path = SKILLS_DIR / s_name
        if not s_path.exists():
            s_path = GEMINI_SKILLS_DIR / s_name
        if not s_path.exists():
            s_path = REAL_HOME / ".agents/skills" / s_name
        if not s_path.exists():
            s_path = REAL_HOME / ".gemini/config/skills" / s_name
        if not s_path.exists():
            print(f"Warning: Skill '{s_name}' not found, skipping.")
            continue

        target_mod = modules_dir / s_name
        target_mod.mkdir(parents=True, exist_ok=True)

        for item in s_path.iterdir():
            dest = target_mod / item.name
            if item.is_dir():
                if dest.exists(): shutil.rmtree(dest)
                shutil.copytree(item, dest)
            else:
                shutil.copy2(item, dest)

        orig_skill = target_mod / "SKILL.md"
        guide_md = target_mod / "guide.md"
        if orig_skill.exists() and not guide_md.exists():
            orig_skill.rename(guide_md)

        # Extract markdown body (strip YAML frontmatter)
        body = ""
        guide_file = guide_md if guide_md.exists() else orig_skill
        if guide_file.exists():
            raw_text = guide_file.read_text(encoding="utf-8", errors="ignore")
            if raw_text.startswith("---"):
                parts = raw_text.split("---", 2)
                if len(parts) >= 3:
                    body = parts[2].strip()
                else:
                    body = raw_text.strip()
            else:
                body = raw_text.strip()

        _, dname, desc, _ = parse_skill_file(guide_file)
        module_info.append((s_name, dname, desc, body))

        # Clean up loose child folders and symlinks across all known directories
        cleanup_dirs = [
            SKILLS_DIR,
            GEMINI_SKILLS_DIR,
            REAL_HOME / ".agents/skills",
            REAL_HOME / ".gemini/config/skills"
        ]
        for prof in PROFILES_DIR.glob("Account-*"):
            cleanup_dirs.append(prof / "HOME/.agents/skills")
            cleanup_dirs.append(prof / "HOME/.gemini/config/skills")
            cleanup_dirs.append(prof / "HOME/.claude/skills")

        for c_dir in cleanup_dirs:
            p = c_dir / s_name
            if p.exists() and s_name != suite_name:
                try:
                    if p.is_symlink() or p.is_file():
                        p.unlink()
                    elif p.is_dir():
                        shutil.rmtree(p)
                except Exception:
                    pass

    modules_table = "\n".join([f"| `/{suite_name}:{s[0]}` | **{s[1]}** | {s[2][:80]}... | [`guide.md`](file://{suite_dir.resolve()}/modules/{s[0]}/guide.md) |" for s in module_info])
    master_desc = f"Unified {suite_name.capitalize()} Master Suite consolidating: {', '.join([s[0] for s in module_info])}."

    sections = []
    for s_name, dname, desc, body in module_info:
        sections.append(f"## 📦 Module: {dname} (`/{suite_name}:{s_name}`)\n\n> **Focus:** {desc}  \n> **Dedicated Module:** `modules/{s_name}/guide.md`\n\n{body}")

    combined_sections = "\n\n---\n\n".join(sections)

    master_skill_content = f"""---
name: {suite_name}
description: >-
  {master_desc}
---

# {suite_name.upper()} UNIFIED MASTER SUITE

This consolidated master skill unifies all `{suite_name}` sub-capabilities into a self-contained, fully detailed engineering standard.

---

## 🧭 Capabilities & Sub-Modules

| Sub-Command | Name | Focus | Module Guide |
| :--- | :--- | :--- | :--- |
{modules_table}

---

{combined_sections}
"""
    (suite_dir / "SKILL.md").write_text(master_skill_content, encoding="utf-8")
    setup_symlinks(suite_name, suite_dir)
    print(f"[✓] Created self-contained master suite {suite_name} with {len(module_info)} embedded modules.")

    cmd_sync(argparse.Namespace(repack=False))
    print(f"\n🎉 Successfully consolidated into /{suite_name}!")

def main():
    parser = argparse.ArgumentParser(description="Antigravity Skills Hub & Customization Manager")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    parser_scan = subparsers.add_parser("scan", help="Scan and list all installed skills")
    parser_scan.set_defaults(func=cmd_scan)

    parser_sync = subparsers.add_parser("sync", help="Sync skills to Skills Hub database and live instance")
    parser_sync.add_argument("--repack", action="store_true", help="Also repack app.asar via patch_app_asar.py")
    parser_sync.set_defaults(func=cmd_sync)

    parser_import = subparsers.add_parser("import", help="Import a skill from Git repo, URL, or local path")
    parser_import.add_argument("source", help="Git repo URL, markdown URL, or local Obsidian vault folder")
    parser_import.add_argument("--name", help="Custom skill name/command (optional)")
    parser_import.set_defaults(func=cmd_import)

    parser_club = subparsers.add_parser("club", help="Club multiple skills into a single consolidated master suite")
    parser_club.add_argument("suite_name", help="Name of the master suite (e.g. 'blender', 'stitch')")
    parser_club.add_argument("skills", nargs="+", help="Names of existing skills to consolidate")
    parser_club.set_defaults(func=cmd_club)

    args = parser.parse_args()
    if not hasattr(args, "func"):
        parser.print_help()
        sys.exit(1)
    args.func(args)

if __name__ == "__main__":
    main()
