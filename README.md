 brackets-StripTrailingSpaces
=================

A [Brackets](http://brackets.io) extension to strip traling whitespace at the end of the line on document save.
The extension adds a menu item to the Edit menu to toggle the stripping.

## Install

via Brackets Extension Manager or the old way:
Open the extensions folder via `Help -> Show Extensions Folder` and clone the repository via

`git clone --depth 1 https://github.com/pockata/brackets-StripTrailingSpaces.git`


## Changelog

### 20.02.2020
Brackets 1.14.1 compatibility. Used new APIs for event subscription

### 21.04.2017
Brackets 1.9 compatibility. Replaced deprecated PreferencesManager methods

### 20.10.2013
Added to Brackets Extension registry
Preserve autostrip preference across Brackets restarts (merged pull request by [Zaggino](https://github.com/zaggino))

### 16.01.2013
Rewrote the stripping algorithm so it plays nice with Brackets' other features.
(Replaced setText with a series of replaceRange)

### 05.01.2013
Initial release
