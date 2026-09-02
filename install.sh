#!/usr/bin/env bash
# ==============================================================================
# Google Antigravity 2.0 Dynamic Boxed Terminal Theme Installer
# ==============================================================================
# Automated installer for Antigravity custom theme & live-reloading engine.
# Repository: https://github.com/ypatil2006-coder/antigravity-custom-theme
# ==============================================================================

set -e

GREEN="\033[0;32m"
BLUE="\033[0;34m"
YELLOW="\033[1;33m"
RESET="\033[0m"

echo -e "${BLUE}======================================================${RESET}"
echo -e "${GREEN}  Google Antigravity 2.0 Boxed Terminal Theme Setup  ${RESET}"
echo -e "${BLUE}======================================================${RESET}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"
SYSTEMD_USER_DIR="$HOME/.config/systemd/user"
mkdir -p "$BIN_DIR" "$DESKTOP_DIR" "$SYSTEMD_USER_DIR" "$HOME/.gemini/antigravity"

echo -e "${YELLOW}[1/5] Installing launcher wrapper (~/.local/bin/antigravity)...${RESET}"
cat << 'EOF' > "$BIN_DIR/antigravity"
#!/bin/bash
exec /usr/bin/antigravity --remote-debugging-port=41013 "$@"
EOF
chmod +x "$BIN_DIR/antigravity"

echo -e "${YELLOW}[2/5] Configuring desktop entry with remote debugging...${RESET}"
if [ -f "/usr/share/applications/antigravity.desktop" ]; then
    sed 's|Exec=/usr/bin/antigravity|Exec=/home/'"$USER"'/.local/bin/antigravity|g' /usr/share/applications/antigravity.desktop > "$DESKTOP_DIR/antigravity.desktop"
    sed -i 's|Exec=antigravity|Exec=/home/'"$USER"'/.local/bin/antigravity|g' "$DESKTOP_DIR/antigravity.desktop"
else
    cat << EOF > "$DESKTOP_DIR/antigravity.desktop"
[Desktop Entry]
Name=Antigravity
Comment=Google Antigravity AI IDE
Exec=$BIN_DIR/antigravity %U
Icon=antigravity
Type=Application
StartupNotify=true
Categories=Development;IDE;
EOF
fi
update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true

echo -e "${YELLOW}[3/5] Configuring Hyprland window translucency (if applicable)...${RESET}"
if [ -d "$HOME/.config/hypr" ]; then
    HYPR_CONF="$HOME/.config/hypr/windowrules.conf"
    if [ -f "$HYPR_CONF" ] && ! grep -q "class:\^(antigravity|Antigravity)\$" "$HYPR_CONF"; then
        echo "windowrule = opacity 0.75 0.70, class:^(antigravity|Antigravity)$" >> "$HYPR_CONF"
        command -v hyprctl &>/dev/null && hyprctl reload 2>/dev/null || true
        echo -e "${GREEN}  ✓ Added opacity 0.75 0.70 rule to Hyprland windowrules.conf${RESET}"
    fi
fi

echo -e "${YELLOW}[4/5] Installing systemd background sync service...${RESET}"
cat << EOF > "$SYSTEMD_USER_DIR/antigravity-theme-sync.service"
[Unit]
Description=Google Antigravity Dynamic Theme Synchronizer
After=graphical-session.target

[Service]
Type=simple
ExecStart=/usr/bin/python3 $SCRIPT_DIR/sync_antigravity_theme.py --watch
Restart=always
RestartSec=3

[Install]
WantedBy=default.target
EOF

systemctl --user daemon-reload
systemctl --user enable antigravity-theme-sync.service 2>/dev/null || true

echo -e "${YELLOW}[5/5] Generating stylesheet & injecting theme into active instances...${RESET}"
python3 "$SCRIPT_DIR/sync_antigravity_theme.py"

echo -e "\n${GREEN}✓ Installation Complete!${RESET}"
echo -e "${BLUE}• Launch Antigravity from your app launcher (Super+D) or terminal ('antigravity')${RESET}"
echo -e "${BLUE}• Themes will sync automatically in real time whenever your wallpaper/palette changes.${RESET}\n"
