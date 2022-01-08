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

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('Toggle imwheel settings'));

        this.add_child(new St.Icon({
            icon_name: 'touchpad-enabled-symbolic',
            style_class: 'system-status-icon',
        }));

        this.connect('button-press-event', () => {
            const output = GLib.spawn_command_line_sync('pwd');
            // log(GLib.ByteArray.toString(output[1]));
        });
    }
});

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
        
        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }
    
    enable() {
        log(`enabling ${Me.metadata.name}`);
        const checkExists = GLib.spawn_command_line_sync('which imwheel');
        this.imwInstalled = (ByteArray.toString(checkExists[1])).length > 0;
        log(`imwheel is ${this.imwInstalled ? '' : 'not '}installed.`);
        
        const confFile = Gio.File.parse_name('~/.imwheelrc');
        this.confExists = confFile.query_exists(null);
        
        log(`imwheel configuration was${this.confExists ? '' : ' not'} found.`);
        this.settings = ExtensionUtils.getSettings('org.gnome.shell.toggleimwheel_mijorus');
        
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
