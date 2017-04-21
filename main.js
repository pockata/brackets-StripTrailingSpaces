/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/** Simple extension that strips whitespace at the end of each line */
define(function (require, exports, module) {

    "use strict";

    // Brackets modules
    var Commands            = brackets.getModule('command/Commands'),
        CommandManager      = brackets.getModule('command/CommandManager'),
        DocumentManager     = brackets.getModule('document/DocumentManager'),
        EditorManager       = brackets.getModule('editor/EditorManager'),
        PreferencesManager  = brackets.getModule("preferences/PreferencesManager"),
        StringUtils         = brackets.getModule('utils/StringUtils'),
        Menus               = brackets.getModule('command/Menus');

    // Extension variables
    var EXT_ID          = 'org.pockata.stripTrailingSpaces',
        settings        = require('settings'),
        preferences     = PreferencesManager.getExtensionPrefs(EXT_ID),
        shouldStrip     = preferences.get("autostrip"),
        strippedOnce    = false, // needed for documentSaved loop.
        menu            = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);

    // Strips whitespace from the current document
    function doStrip() {

        // get the full editor
        var editor = EditorManager.getActiveEditor(),
            curDoc = editor.document;

        if (curDoc) {

            var text = curDoc.getText(),
                regexp = /[ \t]+$/gm,
                linesToStrip = [],
                i = 0,
                match;

            // fill an array with line numbers to strip
            while ((match = regexp.exec(text)) !== null) {
                linesToStrip[i++] = StringUtils.offsetToLineNum(text, match.index);
            }

            // If no lines to strip, stop here
            if (!linesToStrip.length) {
                return false;
            }

            // store current cursor and scroll positions
            var cursorPos = editor.getCursorPos(),
                scrollPos = editor.getScrollPos();

            // set the text
            curDoc.batchOperation(function () {

                while (i--) {
                    // get a line for stripping
                    var ln = curDoc.getLine(linesToStrip[i]);

                    // replace the whole line with a stripped one
                    curDoc.replaceRange(ln.replace(/\s+$/, ''), {
                        'line': linesToStrip[i],
                        'ch': 0
                    }, {
                        'line': linesToStrip[i],
                        'ch': ln.length
                    });
                }
            });

            // restore cursor and scroll positons
            editor.setCursorPos(cursorPos);
            editor.setScrollPos(scrollPos.x, scrollPos.y);

            return true;
        }

        return false;
    }

    // Handles file save
    function handleSave() {

        // if menu item is not checked or
        // we have already stripped, stop here
        if (!shouldStrip || strippedOnce) {
            strippedOnce = false;
            return;
        }

        var stripped = doStrip();

        if (stripped) {

            // this prevents the infinite loop
            // an onBeforeSave event would be nice
            strippedOnce = true;

            // run a file save. It causes the loop
            // by firing documentSaved again. Better way?
            CommandManager.execute(Commands.FILE_SAVE);
        } else {
            strippedOnce = false;
        }
    }

    // Create menu item
    if (settings.createMenu) {

        // Register command
        var cmd = CommandManager.register('Strip trailing spaces', EXT_ID, function () {
            shouldStrip = !shouldStrip;
            preferences.set("autostrip", shouldStrip);
            cmd.setChecked(shouldStrip);
        });

        cmd.setChecked(shouldStrip);

        // Setup menu item
        menu.addMenuDivider(Menus.LAST);
        menu.addMenuItem(EXT_ID, null, Menus.LAST);
    }

    // Attach events
    $(DocumentManager).on("documentSaved", handleSave);

    if (settings.stripOnDocChange) {

        $(DocumentManager).on("currentDocumentChange", function () {

            // Check for an active editor
            var editor = EditorManager.getCurrentFullEditor();
            if (!editor) {
                return;
            }

            // strip if enabled and doc is not saved
            if (shouldStrip && editor.document.isDirty) {
                doStrip();
            }
        });
    }
});
