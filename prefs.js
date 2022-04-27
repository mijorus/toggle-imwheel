'use strict';

const { GLib, Gio, Gtk } = imports.gi;

const ByteArray = imports.byteArray;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const utils = Me.imports.utils;


function init() {
}

function buildPrefsWidget() {
    this.imwInstalled = utils.checkInstalled();
    
    // Copy the same GSettings code from `extension.js`
    this.settings = ExtensionUtils.getSettings('org.gnome.shell.toggleimwheel_mijorus'); // Gio.Settings

    // Create a parent widget that we'll return from this function
    let prefsWidget = new Gtk.Box({ visible: true, orientation: 1, spacing: 6, 'margin-start': 10, 'margin-end': 10 });    
    
    const title = new Gtk.Label({
        label: this.imwInstalled ? `<b>Preferences</b>` : `<b>Warning: imwheel was not detected.</b>`,
        halign: Gtk.Align.START,
        use_markup: true,
        visible: true
    });

    const subtitle = new Gtk.Label({ 
        label: this.imwInstalled 
            ? `Set the amount of line a that single "step" should scroll` 
            : 'The program does not seem to be installed or it was installed manually and was not added to the PATH. \nPlease consider installing it from your package manager first.', 
        halign: Gtk.Align.START, 
        visible: true,
        hexpand: true
    });
    
    prefsWidget.append(title);
    prefsWidget.append(subtitle);

    let prefList = new Gtk.ListBox({ visible: true, 'selection_mode': 0 });
    for (const [key, value] of Object.entries({'mouse-value': 'Mouse mode', 'touchpad-value': 'Touchpad mode'})) {
        let prefsContainer = new Gtk.Box({ visible: true, orientation: 0, spacing: 20, 'margin-start': 10, 'margin-end': 10 });
    
        let toggleLabel = new Gtk.Label({ label: value, halign: Gtk.Align.START, visible: true });
        prefsContainer.append(toggleLabel);
    
        let entry = Gtk.SpinButton.new_with_range(0, 20, 1);
        prefsContainer.append(entry);
    
        // Bind the switch to the key
        this.settings.bind(key, entry, 'value', Gio.SettingsBindFlags.DEFAULT);
        prefList.append(prefsContainer);
    }

    if (this.imwInstalled) {
        prefsWidget.append(prefList);

        const applySettingsButton = new Gtk.Button({ label: 'Apply', halign: Gtk.Align.START, 'margin-top': 10 });
        applySettingsButton.get_style_context().add_class('suggested-action');
        applySettingsButton.connect('clicked', function() {
            utils.setServiceMode(`${settings.get_string('current-mode')}-value`);
        });

        prefsWidget.append(applySettingsButton);
    }


    // Return our widget which will be added to the window
    return prefsWidget;
}