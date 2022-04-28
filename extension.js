/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */
'use strict'

const GETTEXT_DOMAIN = 'my-indicator-extension';
const ByteArray = imports.byteArray;

const { GObject, St, GLib, Gio } = imports.gi;

const Gettext = imports.gettext.domain(GETTEXT_DOMAIN);
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const utils = Me.imports.utils;

const Indicator = GObject.registerClass(
    class Indicator extends PanelMenu.Button {
        _init(settings) {
            super._init(0.0, _('Toggle imwheel settings'));

            this.imwInstalled = utils.checkInstalled();
            this.getIconName = () => {
                if (!this.imwInstalled) {
                    return 'dialog-error-symbolic';
                }
                
                return settings.get_string('current-mode') === 'touchpad' ? 'touchpad-enabled-symbolic' : 'input-mouse-symbolic'
            };

            this.icon = new St.Icon({
                icon_name: this.getIconName(),
                style_class: 'system-status-icon',
            });

            this.add_child(this.icon);
            
            this.toggleModes = () => {
                settings.set_string('current-mode', (settings.get_string('current-mode') === 'touchpad' ? 'mouse' : 'touchpad'));
                const success = utils.setServiceMode(settings.get_int(`${settings.get_string('current-mode')}-value`));

                if (success) {
                    this.icon.set_icon_name(this.getIconName());
                } else {
                    this.icon.set_icon_name('dialog-warning-symbolic');
                }
            }

            if (this.imwInstalled) {
                this.connect('button-press-event', this.toggleModes);
            }
        }
    }
);

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
        
        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }
    
    enable() {
        this.imwInstalled = utils.checkInstalled();
        
        const confFile = Gio.File.parse_name('~/.imwheelrc');
        this.confExists = confFile.query_exists(null);
        
        this.settings = ExtensionUtils.getSettings('org.gnome.shell.toggleimwheel_mijorus');
        
        this._indicator = new Indicator(this.settings);
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
        this.settings = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
