Focus Mode Switcher
===========

Focus Mode Switcher is an extension for Gnome Shell that switches focus mode to sloppy (also known as "focus follow mouse") when specific apps goes fullscreen.

This extension was created as a workaround for DCV viewer bug where, when opened full screen on multiple screens it requires click when moving to a new screen to activate it. It uses an hardcoded constant called TARGET_APP_ID which is set in extension.js line 13.

**NOTE**
- Release versions 40.x support Gnome Shell from version 40 up to 44
- Release versions 45.x support Gnome Shell version 45 and newer

## Installation

### Manual
Download the latest release from [GitHub releases](https://github.com/dcvix/focus-mode-switcher/releases).
```shell
gnome-extensions install focus-mode-switcher@cortassa.net.shell-extension.zip
```

Once installed, the extension may not show up in the extensions list (especially with Wayland).
If that's the case, log out and log in.

Once installed you can enable the extension with the *Extensions* app or 
with the following command.

```shell
gnome-extensions enable focus-mode-switcher@cortassa.net
```

## Uninstall
```shell
gnome-extensions uninstall focus-mode-switcher@cortassa.net
```
or remove the extension with the GNOME Shell Extensions app.

