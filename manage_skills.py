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
THEME_DIR = Path(__file__).resolve().parent
CATALOG_FILE = THEME_DIR / "skills_catalog.json"
DAEMON_FILE = THEME_DIR / "skills_drawer_daemon.js"
PATCH_FILE = THEME_DIR / "patch_app_asar.py"
SKILLS_DIR = Path.home() / ".agents/skills"
GEMINI_SKILLS_DIR = Path.home() / ".gemini/config/skills"
PROFILES_DIR = Path.home() / ".config/Antigravity-Profiles"

# Domain Category Matcher Rules
CATEGORY_RULES = [
    ("🧊 3D Modeling & Motion Video", ["blender", "3d", "model", "render", "shader", "hyperframes", "video", "motion", "mesh", "texture"]),
    ("🤖 AI APIs & Agent Systems", ["gemini-api", "gemini-live", "claude-council", "council", "multimodal", "omni-flash", "antigravity-sdk", "subagent", "brainstorming"]),
    ("🧪 Testing & Browser Automation", ["playwright", "test-driven", "systematic-debugging", "memory-leak", "cdp-daemon", "browser", "chrome-devtools", "a11y", "lcp", "webapp-testing", "troubleshooting"]),
    ("💻 Development & Architecture", ["roblox", "luau", "firebase", "react", "vercel", "mcp-builder", "chrome-extension", "android", "coding-standards", "security-best-practices"]),
    ("🎨 UI/UX & Frontend Design", ["banner-design", "brand", "canvas-design", "design-system", "frontend-design", "gsap", "stitch", "slides", "ui-animation", "ui-ux-pro-max", "web-design-guidelines", "design"]),
    ("⚡ Workflow & Productivity", ["git-commit", "pptimize", "deadlocked", "docx", "pdf", "pptx", "xlsx", "gcalendar", "gdocs", "gdrive", "ponytail", "token-optimizer", "prd", "plan", "superpowers", "find-skills", "skill-creator", "agy-customizations", "antigravity_guide", "automation", "run-workflow", "skills-manager"]),
]

def parse_skill_file(skill_path: Path):
    name = skill_path.parent.name
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
                    name = line.split(":", 1)[1].strip().strip('"').strip("'")
                elif line.startswith("description:"):
                    val = line.split(":", 1)[1].strip()
                    if val in [">", ">-", "|", "|-", ""]:
                        # Multi-line block
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

    clean_name = skill_path.parent.name
    tags = [t.lower() for t in clean_name.split("-") if len(t) > 1]
    tags.append("skill")
    return clean_name, name, desc, tags

def scan_all_skills():
    search_dirs = [
        SKILLS_DIR,
        Path.home() / ".gemini/config/plugins",
        Path.home() / ".gemini/antigravity-cli/builtin/skills",
    ]
    all_skills = {}
    for d in search_dirs:
        if not d.exists():
            continue
        for p in d.rglob("SKILL.md"):
            if "modules/" in str(p) or "references/" in str(p):
                continue
            folder_name = p.parent.name
            if folder_name not in all_skills:
                all_skills[folder_name] = p
    return all_skills

def build_categorized_database():
    all_skills = scan_all_skills()
    categorized = {cat: [] for cat, _ in CATEGORY_RULES}
    categorized["📦 Other Utilities"] = []

    for folder_name, path in sorted(all_skills.items()):
        clean_key, disp_name, desc, tags = parse_skill_file(path)
        item = {
            "name": disp_name,
            "command": f"/{folder_name}",
            "desc": desc,
            "tags": tags,
            "path": str(path)
        }

        matched = False
        for cat, kws in CATEGORY_RULES:
            if folder_name in kws or any(k in folder_name for k in kws):
                categorized[cat].append(item)
                matched = True
                break

        if not matched:
            haystack = (disp_name + " " + desc + " " + folder_name).lower()
            for cat, kws in CATEGORY_RULES:
                if any(k in haystack for k in kws):
                    categorized[cat].append(item)
                    matched = True
                    break

        if not matched:
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
        pattern = r"const SKILLS_DATABASE = \[.*?\];\n\nfunction getInjectionPayload"
        new_text = re.sub(pattern, lambda _: f"const SKILLS_DATABASE = {clean_db_str};\n\nfunction getInjectionPayload", text, flags=re.DOTALL)
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
        import asyncio
        import websockets

        ports = []
        for pf in [Path.home() / ".config/Antigravity-Profiles/Account-1/DevToolsActivePort", Path("/tmp/antigravity-cdp-port")]:
            if pf.exists():
                val = pf.read_text().splitlines()[0].strip()
                if val.isdigit():
                    ports.append(int(val))

        async def _inject(url, code):
            async with websockets.connect(url) as ws:
                msg = {"id": 100, "method": "Runtime.evaluate", "params": {"expression": code, "returnByValue": True}}
                await ws.send(json.dumps(msg))
                await asyncio.sleep(0.1)

        # Extract payload
        d_text = DAEMON_FILE.read_text(encoding="utf-8")
        m = re.search(r"function getInjectionPayload\(\) \{\s+const skillsJson = JSON.stringify\(SKILLS_DATABASE\);\s+return `\s+(.*?)\s+`;\s+\}", d_text, re.DOTALL)
        if not m:
            return

        db_json = CATALOG_FILE.read_text(encoding="utf-8")
        payload = m.group(1).replace("${skillsJson}", db_json)

        for port in ports:
            try:
                res = urllib.request.urlopen(f"http://127.0.0.1:{port}/json", timeout=0.8)
                targets = json.loads(res.read().decode())
                pages = [t for t in targets if t.get("type") == "page"]
                for page in pages:
                    print(f"[✓] Live Antigravity instance detected on port {port}. Refreshing Skills Hub UI...")
                    asyncio.run(_inject(page["webSocketDebuggerUrl"], payload))
            except Exception:
                pass
    except Exception:
        pass

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
    GEMINI_SKILLS_DIR.mkdir(parents=True, exist_ok=True)
    symlink_path = GEMINI_SKILLS_DIR / name
    if symlink_path.is_symlink() or symlink_path.exists():
        symlink_path.unlink()
    symlink_path.symlink_to(target_dir)

    for prof in PROFILES_DIR.glob("Account-*"):
        agents_dir = prof / "HOME/.agents/skills"
        agents_dir.mkdir(parents=True, exist_ok=True)
        prof_symlink = agents_dir / name
        if prof_symlink.is_symlink() or prof_symlink.exists():
            prof_symlink.unlink()
        prof_symlink.symlink_to(target_dir)

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

        _, dname, desc, _ = parse_skill_file(guide_md)
        module_info.append((s_name, dname, desc))

        if (SKILLS_DIR / s_name).is_dir() and s_name != suite_name:
            shutil.rmtree(SKILLS_DIR / s_name)
        if (GEMINI_SKILLS_DIR / s_name).is_symlink():
            (GEMINI_SKILLS_DIR / s_name).unlink()

    modules_table = "\n".join([f"| `/{suite_name}:{s[0]}` | **{s[1]}** | {s[2][:80]}... | [`modules/{s[0]}/guide.md`](modules/{s[0]}/guide.md) |" for s in module_info])
    master_desc = f"Unified {suite_name.capitalize()} Master Suite consolidating: {', '.join([s[0] for s in module_info])}."

    master_skill_content = f"""---
name: {suite_name}
description: {master_desc}
---

# {suite_name.upper()} MASTER SKILL SUITE

This consolidated master skill unifies all `{suite_name}` sub-capabilities into a single high-efficiency entry point.

## 🧭 Capabilities & Sub-Modules

| Sub-Command | Name | Focus | Module Guide |
| :--- | :--- | :--- | :--- |
{modules_table}

## ⚡ Execution Protocol
When invoked as `/{suite_name}` or `/{suite_name}:<subcommand>`, inspect the corresponding guide in `modules/<sub-command>/guide.md` and adhere strictly to its rules.
"""
    (suite_dir / "SKILL.md").write_text(master_skill_content, encoding="utf-8")
    setup_symlinks(suite_name, suite_dir)
    print(f"[✓] Created master suite {suite_name} with {len(module_info)} modules.")

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
