// extension.js
import Gio from 'gi://Gio';


export default class Extension {
    constructor(uuid) {
        this._uuid = uuid;
        this._wmSettings = null;
        this._mutterSettings = null;
        this._originalFocusMode = null;
        this._originalFocusChangeOnPointerRest = null;
        this._windowTrackers = new Map();
        
        this.TARGET_APP_ID = 'com.nicesoftware.DcvViewer';
    }

    enable() {
        // Get wm settings
        this._wmSettings = new Gio.Settings({
            schema: 'org.gnome.desktop.wm.preferences'
        });

        // Get mutter settings
        this._mutterSettings = new Gio.Settings({
            schema: 'org.gnome.mutter'
        });

        // Store the original focus mode
        this._originalFocusMode = this._wmSettings.get_string('focus-mode');

        // Set focus-change-on-pointer-rest to false to disable focus delay
        this._mutterSettings.set_boolean('focus-change-on-pointer-rest', false);

        // Store the original focus-change-on-pointer-rest setting (this setting adds a delay to sloppy mode window activation)
        this._originalFocusChangeOnPointerRest = this._mutterSettings.get_boolean('focus-change-on-pointer-rest');

        // Monitor existing windows
        const windows = global.get_window_actors();
        windows.forEach(windowActor => {
            const win = windowActor.get_meta_window();
            this._trackWindow(win);
        });

        // Monitor new windows being created
        const display = global.display;
        this._windowCreatedId = display.connect('window-created', (display, win) => {
            this._trackWindow(win);
        });
        
        log(`focus-mode-switcher: enabled`);
    }

    disable() {
        // Disconnect window-created signal
        if (this._windowCreatedId) {
            global.display.disconnect(this._windowCreatedId);
            this._windowCreatedId = null;
        }

        // Disconnect all window tracking signals
        this._windowTrackers.forEach((signalIds, win) => {
            signalIds.forEach(id => {
                try {
                    win.disconnect(id);
                } catch (e) {}
            });
        });
        this._windowTrackers.clear();

        // Restore original focus mode
        if (this._originalFocusMode && this._wmSettings) {
            this._wmSettings.set_string('focus-mode', this._originalFocusMode);
        }

        // Restore original focus-change-on-pointer-rest setting
        if (this._originalFocusChangeOnPointerRest !== null && this._mutterSettings) {
            this._mutterSettings.set_boolean('focus-change-on-pointer-rest', this._originalFocusChangeOnPointerRest);
        }

        this._wmSettings = null;
        this._mutterSettings = null;
        this._originalFocusMode = null;

        log(`focus-mode-switcher: disabled`);
    }

    _trackWindow(win) {

        log(`focus-mode-switcher: Checking window: ${win.get_gtk_application_id()}`);

        if (!win || !this._isTargetWindow(win)) {
            return;
        }

        // Already tracked
        if (this._windowTrackers.has(win)) {
            return;
        }

        log(`focus-mode-switcher: Tracking DCV window: ${win.get_gtk_application_id()}`);

        const signalIds = [];

        // Monitor fullscreen state changes
        const fullscreenId = win.connect('notify::fullscreen', () => {
            const isFullscreen = win.is_fullscreen();

            if (isFullscreen) {
                log(`focus-mode-switcher: DCV entered fullscreen - switching to sloppy mode`);
                this._wmSettings.set_string('focus-mode', 'sloppy');
            } else {
                log(`focus-mode-switcher: DCV exited fullscreen - restoring original mode`);
                this._wmSettings.set_string('focus-mode', this._originalFocusMode);
            }
        });
        signalIds.push(fullscreenId);

        // Clean up when window closes
        const unmanagedId = win.connect('unmanaged', () => {
            this._cleanupWindow(win);
        });
        signalIds.push(unmanagedId);

        this._windowTrackers.set(win, signalIds);
    }

    _cleanupWindow(win) {
        const signalIds = this._windowTrackers.get(win);
        if (signalIds) {
            signalIds.forEach(id => {
                try {
                    win.disconnect(id);
                } catch (e) {}
            });
            this._windowTrackers.delete(win);
        }
    }

    _isTargetWindow(win) {
        if (!win) return false;
        const appId = win.get_gtk_application_id();
        return appId === this.TARGET_APP_ID;
    }
}
