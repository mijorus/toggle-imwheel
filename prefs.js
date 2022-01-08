'use strict';

const { GLib, Gio, Gtk } = imports.gi;

const ByteArray = imports.byteArray;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();


function init() {
}

function buildPrefsWidget() {
    const checkExists = GLib.spawn_command_line_sync('which imwheel');
    this.imwInstalled = (ByteArray.toString(checkExists[1])).length > 0;
    
    // Copy the same GSettings code from `extension.js`
    this.settings = ExtensionUtils.getSettings('org.gnome.shell.toggleimwheel_mijorus'); // Gio.Settings

    // Create a parent widget that we'll return from this function
    let prefsWidget = new Gtk.Box({ visible: true, orientation: 1, spacing: 6, 'margin-start': 10, 'margin-end': 10 });    
    
    const title = new Gtk.Label({
        label: this.imwInstalled ? `<b>Preferences</b>` : `<b>Warning: imwheel was not detected. The configuration will be created but will have not effect</b>`,
        halign: Gtk.Align.START,
        use_markup: true,
        visible: true
    });

    const subtitle = new Gtk.Label({ 
        label: this.imwInstalled 
            ? `Set the amount of line a that single "wheel step" should scroll` 
            : 'The program does not seem to be installed or it was installed manually and was not added to the PATH. \nPlease consider installing it from your package manager first.', 
        halign: Gtk.Align.START, 
        visible: true 
    });
    
    prefsWidget.append(title);
    prefsWidget.append(subtitle);

    let prefList = new Gtk.ListBox({ visible: true, 'selection_mode': 0 });
    for (const [key, value] of Object.entries({'mouse-value': 'Mouse mode', 'touchpad-value': 'Touchpad mode'})) {
        let prefsContainer = new Gtk.Box({ visible: true, orientation: 0, spacing: 20, 'margin-start': 10 });
    
        let toggleLabel = new Gtk.Label({ label: value, halign: Gtk.Align.START, visible: true });
        prefsContainer.append(toggleLabel);
    
        let entry = Gtk.SpinButton.new_with_range(0, 20, 1);
        prefsContainer.append(entry);
    
        // Bind the switch to the key
        this.settings.bind(key, entry, 'value', Gio.SettingsBindFlags.DEFAULT);
        prefList.append(prefsContainer);
    }

    prefsWidget.append(prefList);


    // Return our widget which will be added to the window
    return prefsWidget;
}