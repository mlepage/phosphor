// Phosphor - a browser-based microcomputer
// Copyright (c) 2017-2018 Marc Lepage

'use strict';

const TextEditor = require('./text-editor.js');

const BG_COLOR = 21;
const FG_COLOR = 42;
const UI_COLOR = 42;

module.exports = class CodeEditor {

  async main(...args) {
    this.editor = new TextEditor();
  }

  draw() {
    const P = this.P;
    P.clear(BG_COLOR);
    P.box(0, 0, 240, 8, UI_COLOR);
    P.box(0, 152, 240, 8, UI_COLOR);
    this.editor.draw(P);
  }

  onKeyDown(e) {
    if (e.key.length == 1) {
      const code = e.key.charCodeAt();
      if (32 <= code && code < 127) {
        this.editor.edit(e.key);
      }
    } else {
      switch (e.key) {
        case 'ArrowDown': this.editor.cursorDown(e.shiftKey); break;
        case 'ArrowLeft': this.editor.cursorLeft(e.shiftKey); break;
        case 'ArrowRight': this.editor.cursorRight(e.shiftKey); break;
        case 'ArrowUp': this.editor.cursorUp(e.shiftKey); break;
        case 'Backspace': this.editor.edit('\b'); break;
        case 'Enter': this.editor.edit('\n'); break;
      }
    }
  }

  async onResume() {
    const P = this.P;
    const name = P.load();
    const fd = P.open(name, 'r');
    if (fd != -1) {
      const contents = await P.read(fd, 'a');
      P.close(fd);
      this.editor.reset();
      this.editor.setTextColor(FG_COLOR, BG_COLOR);
      this.editor.edit(contents);
      this.editor.fixCursorAfterReset();
    } else {
      this.editor.reset();
      this.editor.setTextColor(FG_COLOR, BG_COLOR);
    }
  }

  onSuspend() {
    const P = this.P;
    if (!this.editor.isModified())
      return;
    const name = P.load();
    const fd = P.open(name, 'w');
    if (fd != -1) {
      const contents = this.editor.getText();
      P.write(fd, contents);
      P.close(fd);
    }
  }

};
