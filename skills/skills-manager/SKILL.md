---
name: skills-manager
description: 'Autonomous Antigravity skills and customization management suite. Activate when the user asks to: (1) Scan or list installed skills, (2) Sync skills into the Skills Hub drawer, (3) Import any skill from a GitHub repo, URL, Obsidian vault, or local path, or (4) Club/consolidate multiple fragmented skills into a unified master suite without modifying internal markdown rules. Triggers on: /skills-manager, /skills, "manage skills", "import skill", "sync skills", "club skills", "consolidate skills".'
license: MIT
---

# ⚡ Antigravity Skills Manager & Hub Orchestrator

Autonomous management protocol for discovering, categorizing, importing, consolidating, and synchronizing agent skills in Google Antigravity 2.0.

---

## 🛠️ Automated CLI Engine (`manage_skills.py`)

All skills management tasks can be executed autonomously via the bundled Python utility:
**Path:** `/home/yash/Projects/antigravity-custom-theme/manage_skills.py` (or `./manage_skills.py`)

```bash
# 1. Scan and list all installed skills across all locations
python3 manage_skills.py scan

# 2. Sync all skills to catalog, daemon, and live Antigravity GUI
python3 manage_skills.py sync

# 3. Import from Git repository (GitHub / GitLab)
python3 manage_skills.py import https://github.com/owner/custom-skill-repo --name my-skill

# 4. Import from Obsidian Vault or local folder
python3 manage_skills.py import "/path/to/Obsidian Vault/Skills/MySkill" --name my-skill

# 5. Club multiple skills into a single consolidated suite
python3 manage_skills.py club suite-name skill1 skill2 skill3
```

---

## 🧭 Discovery & Discovery Paths

Antigravity discovers skills across three primary tiers:
1. **User Global Skills**: `~/.agents/skills/<name>/SKILL.md`
2. **Antigravity App Discovery Symlinks**: `~/.gemini/config/skills/<name>`
3. **Plugin Skills**: `~/.gemini/config/plugins/<plugin>/skills/<name>/SKILL.md`
4. **Profile Sandboxes**: `~/.config/Antigravity-Profiles/Account-*/HOME/.agents/skills/<name>`

Whenever a skill is added, imported, or consolidated, it **must** be symlinked into `~/.gemini/config/skills/` and profile homes so that Antigravity's language server registers it under `/customizations/installed` and in slash command autocomplete.

---

## 📥 Universal Skill Import Protocol

When the user asks to import a skill by name, command, URL, or repository:

### 1. From a GitHub / Git Repository
```bash
python3 /home/yash/Projects/antigravity-custom-theme/manage_skills.py import "https://github.com/<owner>/<repo>.git" --name <skill-name>
```
*Behind the scenes:*
- Clones repo into `~/.agents/skills/<skill-name>/`
- Verifies `SKILL.md` exists and has valid YAML frontmatter
- Symlinks to `~/.gemini/config/skills/<skill-name>`
- Triggers instant live sync into the Skills Hub drawer

### 2. From an Obsidian Vault or Local Folder
```bash
python3 /home/yash/Projects/antigravity-custom-theme/manage_skills.py import "/path/to/vault/notes/<SkillFolder>" --name <skill-name>
```
*Behind the scenes:*
- Copies directory to `~/.agents/skills/<skill-name>/`
- Ensures `SKILL.md` exists (creates one from note contents if missing)
- Symlinks to `~/.gemini/config/skills/<skill-name>` and profile homes
- Updates Skills Hub database

### 3. From a Direct Raw Markdown URL / Gist
```bash
python3 /home/yash/Projects/antigravity-custom-theme/manage_skills.py import "https://raw.githubusercontent.com/.../SKILL.md" --name <skill-name>
```

---

## 📦 The Skill Consolidation Blueprint ("Clubbing")

Antigravity slash commands and autocomplete have display limits. When multi-skill ecosystems (such as Blender, Stitch, Roblox, Firebase, HyperFrames, Ponytail) have 5 to 10 separate skills, they consume too much command space.

### The Golden Rule of Consolidation
> **NEVER modify or truncate internal markdown logic, prompt instructions, or code.**  
> Move all sub-skills into clean modular sub-guides under `modules/<sub-skill>/guide.md`.

### Step-by-Step Consolidation Workflow:
1. **Create Master Suite Directory**:
   `mkdir -p ~/.agents/skills/<suite-name>/modules/`
2. **Move Sub-Skills Verbatim**:
   Move each loose skill directory into `~/.agents/skills/<suite-name>/modules/<sub-skill>/`.  
   Rename its primary `SKILL.md` to `guide.md` to prevent duplicate global discovery.
3. **Author Master `SKILL.md`**:
   Write a single high-level router `SKILL.md` at `~/.agents/skills/<suite-name>/SKILL.md`:
   - Comprehensive description covering all sub-capabilities.
   - Clean markdown routing table linking to `modules/<sub-skill>/guide.md`.
   - Execution protocol directing the agent to read the exact sub-module guide when invoked.
4. **Clean Loose Symlinks**:
   Remove individual child symlinks from `~/.gemini/config/skills/`.
5. **Symlink Master Suite**:
   Create a single symlink `~/.gemini/config/skills/<suite-name> -> ~/.agents/skills/<suite-name>`.
6. **Sync Skills Hub**:
   Run `python3 manage_skills.py sync` to register the unified suite.

---

## ⚡ Examples of Automated Execution

### Example A: User says "Import the tailwind-v4 skill from github"
```bash
python3 /home/yash/Projects/antigravity-custom-theme/manage_skills.py import https://github.com/example/tailwind-v4-skill --name tailwind-v4
```

### Example B: User says "Club all my docker skills into a devops suite"
```bash
python3 /home/yash/Projects/antigravity-custom-theme/manage_skills.py club devops docker-compose dockerfile kubernetes-deploy
```

### Example C: User says "Sync all skills to the skills hub"
```bash
python3 /home/yash/Projects/antigravity-custom-theme/manage_skills.py sync
```
