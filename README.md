# 🌌 Google Antigravity 2.0 Custom Theme & Dynamic Styling Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Antigravity](https://img.shields.io/badge/Antigravity-2.0%2B-blue.svg)](https://antigravity.google)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB.svg?logo=python&logoColor=white)](https://python.org)
[![Linux / Hyprland](https://img.shields.io/badge/Platform-Linux%20%7C%20Hyprland%20%7C%20Wayland-black.svg?logo=arch-linux)](https://archlinux.org)
[![Aesthetics](https://img.shields.io/badge/Style-Boxed%20Terminal%20%26%20Notched%20Legends-orange.svg)]()

> **The ultimate real-time dynamic theming engine and modular boxed terminal aesthetic for Google Antigravity (Antigravity 2.0 / Antigravity IDE).**  
> Seamlessly synchronize your Antigravity IDE colors with your desktop wallpaper (Material 3, Pywal, Matugen, Noctalia) with zero restarts via live Chrome DevTools Protocol (CDP) CSS injection.

---

## 📸 Overview & Visual Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                        SIDEBAR  │
│  [|]  <-  ->                                                                    │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │  + New Conversation                                                         │ │
│ │  🕒 Conversation History                                                    │ │
│ │  📁 PROJECTS                                                                │ │
│ │     • Arch Linux Maintainance                                               │ │
│ │                                                                             │ │
│ │  ⚙️ Settings (16px Radius Modal + Floating Inset Divider)                    │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│ MAIN                                                                            │
│ ┌──────────────────────────────────────┬─┬────────────────────────────────────┐ │
│ │ PROMPT                               │ │ Walkthrough: Dynamic Ecosystem     │ │
│ │ ┌──────────────────────────────────┐ │ │                                    │ │
│ │ │ Ask anything, @ to mention...    │ │ │ 1. Clean Modular Aesthetic         │ │
│ │ ├──────────────────────────────────┤ │ │ 2. Real-Time Color Synchronizer    │ │
│ │ │ 🔲 Local ▾         [Send ➔]      │ │ │ 3. Flawless Notched Outline Mask   │ │
│ │ └──────────────────────────────────┘ │ │                                    │ │
│ └──────────────────────────────────────┴─┴────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

- **🔲 Modular Boxed Terminal Aesthetics:** Transform Antigravity 2.0 into a unified, clean terminal suite interface with crisp 1px borders, custom padding, and JetBrains Mono typography.
- **🏷️ Flawless Notched Cutout Legends:** Custom simulated notched badges (`Sidebar`, `Main`, `Prompt`) with solid background masking that prevents border lines from cutting through text.
- **⚡ Real-Time Live Hot-Reloading:** Injects CSS dynamically into running Electron instances via Chrome DevTools Protocol (CDP) WebSocket without closing or reloading your active tabs.
- **🎨 Material 3 / Dynamic Wallpaper Sync:** Auto-detects palette changes from Matugen, Noctalia, Pywal, or custom `colors.json` files and syncs colors across all UI components instantly.
- **⚙️ Redesigned Settings Modal:** Features a sleek `16px` border-radius container, frosted glass backdrop blur, and an inset floating vertical divider with top/bottom breathing room.
- **📏 Workspace Split Pane Divider:** Clean `1px` floating separator between the chat and artifact/walkthrough views with interactive hover accent glow.
- **🚀 Persistent App Launcher Integration:** Includes a launcher wrapper so `Super+D` (Rofi / Wofi / App Launchers) automatically runs Antigravity with DevTools enabled.

---

## ⚡ Quick Installation

### Option 1: One-Line Automatic Install (Recommended)

```bash
git clone https://github.com/ypatil20066/antigravity-custom-theme.git ~/.config/antigravity-custom-theme
cd ~/.config/antigravity-custom-theme
chmod +x install.sh sync_antigravity_theme.py
./install.sh
```

### Option 2: Manual Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ypatil20066/antigravity-custom-theme.git
   cd antigravity-custom-theme
   ```

2. **Create the launcher wrapper (`~/.local/bin/antigravity`):**
   ```bash
   cat << 'EOF' > ~/.local/bin/antigravity
   #!/bin/bash
   exec /usr/bin/antigravity --remote-debugging-port=41013 "$@"
   EOF
   chmod +x ~/.local/bin/antigravity
   ```

3. **Update your desktop launcher entry (`~/.local/share/applications/antigravity.desktop`):**
   ```bash
   sed 's|Exec=/usr/bin/antigravity|Exec=/home/'"$USER"'/.local/bin/antigravity|g' /usr/share/applications/antigravity.desktop > ~/.local/share/applications/antigravity.desktop
   update-desktop-database ~/.local/share/applications
   ```

4. **Run the theme synchronizer:**
   ```bash
   python3 sync_antigravity_theme.py --watch
   ```

---

## ⚙️ Configuration & Theming

### Custom Colors File
By default, the script checks for Material 3 palettes in:
1. `~/.config/noctalia/colors.json`
2. `~/.config/matugen/colors.json`
3. `~/.cache/wal/colors.json`

You can also specify a custom JSON color palette directly:
```bash
python3 sync_antigravity_theme.py --colors /path/to/my-palette.json --watch
```

#### Sample `colors.json` Schema:
```json
{
  "mPrimary": "#f96553",
  "mSurface": "#291614",
  "mSurfaceVariant": "#452521",
  "mOnSurface": "#f3f2f2",
  "mOnSurfaceVariant": "#b6b0af",
  "mOutline": "#746260",
  "mError": "#d91f08"
}
```

---

## 🛠️ How It Works Under the Hood

1. **Electron CDP Remote Debugging:** Antigravity launches with `--remote-debugging-port=41013`.
2. **WebSocket CSS Injection:** `sync_antigravity_theme.py` queries `http://127.0.0.1:41013/json` and establishes a WebSocket connection to the renderer process.
3. **Live DOM Mutation:** Injects a `<style id="antigravity-boxed-theme-style">` and registers a `MutationObserver` + `Page.addScriptToEvaluateOnNewDocument` so the theme persists across reloads and new windows.
4. **Background Daemon:** A systemd user unit (`antigravity-theme-sync.service`) watches for palette modifications using file MD5 hashing, enabling instant wallpaper-to-IDE color updates.

---

## 🤝 Contributing

Contributions, feature requests, and theme variations are warmly welcomed!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AwesomeTheme`)
3. Commit your Changes (`git commit -m 'feat: add neon glow variant'`)
4. Push to the Branch (`git push origin feature/AwesomeTheme`)
5. Open a Pull Request

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

<p align="center">
  Crafted with ❤️ for the Linux Ricing & AI Developer Community.
</p>
