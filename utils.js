'use strict'

const { GLib, Gio } = imports.gi;
const ByteArray = imports.byteArray;
const ExtensionUtils = imports.misc.extensionUtils;

/**
 * 
 * @param {string} value
 * @returns {boolean}
 */
function setServiceMode(value) {
    const confFile = Gio.File.parse_name('~/.imwheelrc');

    const text = `".*"\nNone,      Up,   Button4, ${value}\nNone,      Down, Button5, ${value}\nControl_L, Up,   Control_L|Button4\nControl_L, Down, Control_L|Button5\nShift_L,   Up,   Shift_L|Button4\nShift_L,   Down, Shift_L|Button5`;
    const [success, tag] = confFile.replace_contents(text, null, false,  Gio.FileCreateFlags.REPLACE_DESTINATION, null);

    if (success) {
        exec(['imwheel', '-kill', '-b', '"4 5"'], function(result, err) {
            if (err) {
                exec(['imwheel', '-kill'], function(fallbackResult, fallbackErr) {
                    if (fallbackErr) {
                        logError(fallbackErr)
                    }
                });
            }
        });
    }

    return success;
}

/**
 * 
 * @param {strings[]} command 
 * @param {(result, error) => void} callback 
 */
function exec(command, callback) {
    try {
        let proc = Gio.Subprocess.new(command, Gio.SubprocessFlags.NONE);
    
        proc.wait_check_async(null, (proc, result) => {
            try {
                if (proc.wait_check_finish(result)) {
                    callback(result, null);
                } else {
                    callback(null, 'the process failed');
                }
            } catch (e) {
                callback(null, e);
            }
        });
    } catch (e) {
        callback(null, e);
    }
}

function checkInstalled() {
    return (GLib.find_program_in_path('imwheel') !== null);
}