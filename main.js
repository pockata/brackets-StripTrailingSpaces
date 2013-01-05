/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/** Simple extension that strips whitespace at the end of each line */
define(function (require, exports, module) {

	"use strict";

	// Brackets modules
	var	Commands        = brackets.getModule('command/Commands'),
		CommandManager  = brackets.getModule('command/CommandManager'),
		DocumentManager = brackets.getModule('document/DocumentManager'),
		EditorManager   = brackets.getModule('editor/EditorManager'),
		Menus           = brackets.getModule('command/Menus');

	// Extension variables
	var EXT_ID          = 'org.pockata.stripTrailingSpaces',
		settings        = require('settings'),
		shouldStrip     = !!settings.autostrip,
		strippedOnce    = false, // needed for documentSaved loop.
		menu            = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);


	// Strips whitespace from end of line
	function stripWhitespace(text) {
		// this is the best I came up with
		// I'm open to suggestions
		return text.replace(/[ \t]+$/gm, '');
	}

	// Strips whitespace from the current document
	function doStrip() {

		// get the full editor
		var editor = EditorManager.getCurrentFullEditor(),
			curDoc = editor.document;

		if (curDoc) {

			// strip the document text
			var stripped = stripWhitespace(curDoc.getText());

			// store current cursor and scroll positions
			var cursorPos = editor.getCursorPos(),
				scrollPos = editor.getScrollPos();

			// set the text
			curDoc.setText(stripped);

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
