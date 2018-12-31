// Phosphor - a browser-based microcomputer
// Copyright (c) 2017-2018 Marc Lepage

'use strict';

const TextBuffer = require('./text-buffer.js');

const max = Math.max, min = Math.min;
const fromCharCode = String.fromCharCode;

const BG_COLOR = 21;
const SELECT_COLOR = 27;

function clamp(val, min, max) {
  return val < min ? min : max < val ? max : val;
}

function updateSelection(editor, shift) {
  if (!shift) {
    editor.r0 = editor.r1 = editor.sr = editor.cr;
    editor.c0 = editor.c1 = editor.sc = editor.cc;
  } else if (editor.cr < editor.sr || editor.cr == editor.sr && editor.cc < editor.sc) {
    editor.r0 = editor.cr;
    editor.c0 = editor.cc;
    editor.r1 = editor.sr;
    editor.c1 = editor.sc;
  } else {
    editor.r0 = editor.sr;
    editor.c0 = editor.sc;
    editor.r1 = editor.cr;
    editor.c1 = editor.cc;
  }
  editor.select = editor.r0 != editor.r1 || editor.c0 != editor.c1;
}

module.exports = class TextEditor {

  constructor(...args) {
    this.buffer = new TextBuffer();

    const terminal = args[0] == 'terminal'; // terminal hacks
    this.cursorColor = terminal ? 28 : 63;
    this.bottomMargin = terminal ? 0 : 1;
    this.disableSelect = terminal;

    this.x = 0; // window on screen
    this.y = terminal ? 0 : 8; // position in pixels
    this.w = 40; // size in chars
    this.h = terminal ? 20 : 18;

    this.vr = 0; // view row and col
    this.vc = 0;

    this.cc = 0; // cursor row and col
    this.cr = 0;

    this.sr = 0; // selection row and col
    this.sc = 0;

    this.tc = 0; // target cursor col

    this.r0 = 0; // derived properties
    this.c0 = 0; // from selection to cursor
    this.r1 = 0; // but always in order
    this.c1 = 0;
    this.select = false;

    this.editable = true;
  }

  cursorDown(shift) {
    if (this.disableSelect)
      this.select = shift = false;
    if (this.select && !shift) {
      this.cr = this.r1;
      this.cc = this.c1;
      this.tc = this.cc;
    }
    if (this.cr+1 < this.buffer.getLineCount()) {
      ++this.cr;
      this.cc = min(this.tc, this.buffer.getLineLength(this.cr));
    } else {
      this.cc = this.buffer.getLineLength(this.cr);
    }
    updateSelection(this, shift);
    this.scrollToCursor();
  }

  cursorLeft(shift) {
    if (this.disableSelect)
      this.select = shift = false;
    if (this.select && !shift) {
      this.cr = this.r0;
      this.cc = this.c0;
    } else {
      if (this.cc-1 >= 0) {
        --this.cc;
      } else if (this.cr-1 >= 0) {
        --this.cr;
        this.cc = this.buffer.getLineLength(this.cr);
      }
    }
    updateSelection(this, shift);
    this.tc = this.cc;
    this.scrollToCursor();
  }

  cursorRight(shift) {
    if (this.disableSelect)
      this.select = shift = false;
    if (this.select && !shift) {
      this.cr = this.r1;
      this.cc = this.c1;
    } else {
      if (this.cc+1 <= this.buffer.getLineLength(this.cr)) {
        ++this.cc;
      } else if (this.cr+1 < this.buffer.getLineCount()) {
        ++this.cr;
        this.cc = 0;
      }
    }
    updateSelection(this, shift);
    this.tc = this.cc;
    this.scrollToCursor();
  }

  cursorUp(shift) {
    if (this.disableSelect)
      this.select = shift = false;
    if (this.select && !shift) {
      this.cr = this.r0;
      this.cc = this.c0;
      this.tc = this.cc;
    }
    if (this.cr-1 >= 0) {
      --this.cr;
      this.cc = min(this.tc, this.buffer.getLineLength(this.cr));
    } else {
      this.cc = 0;
    }
    updateSelection(this, shift);
    this.scrollToCursor();
  }

  draw(P) {
    const cc = this.cc;
    const cr = this.cr;
    const r0 = this.r0;
    const c0 = this.c0;
    const r1 = this.r1;
    const c1 = this.c1;
    const X = this.x + this.w*6;
    const Y = this.y + this.h*8;
    let ch, ch1, fg, bg;
    for (let y = this.y, r = this.vr; y < Y && r < this.buffer.getLineCount(); y+=8, ++r) {
      const line = this.buffer.getLine(r);
      const line1 = this.buffer.getLine(r, 1);
      for (let x = this.x, c = this.vc; x < X && c <= line.length; x+=6, ++c) {
        if (c < line.length) {
          ch = line.charCodeAt(c);
          ch1 = line1.charCodeAt(c);
          fg = ch1 & 0x3f;
          bg = (ch1>>8) & 0x3f;
        } else {
          ch = 32; // space
          fg = 63; // white
          bg = BG_COLOR;
        }
        if (this.editable && c == cc && r == cr) {
          bg = this.cursorColor;
          fg = BG_COLOR;
        } else if ((r0 < r || r0 == r && c0 <= c) && (r < r1 || r == r1 && c < c1)) {
          bg = SELECT_COLOR;
          fg = 0;
        } else if (c == line.length) {
          continue;
        }
        P.char(ch, x, y, fg, bg);
      }
    }
  }

  edit(text) {
    const re = /([ -~\n]+)|([\b])/g;
    let m;
    while (m = re.exec(text)) {
      if (m[1] !== undefined) {
        // printable text, newline
        this.buffer.setText(this.r0, this.c0, this.r1, this.c1, m[1]);
      } else if (m[2] !== undefined) {
        // single backspace
        const disableSelect = this.disableSelect;
        this.disableSelect = false;
        if (!this.select)
          this.cursorLeft(true);
        this.buffer.setText(this.r0, this.c0, this.r1, this.c1, '');
        this.disableSelect = disableSelect;
      }
      this.cr = this.buffer.getRow();
      this.cc = this.buffer.getCol();
      updateSelection(this, false);
    }
  }

  // TODO this is a hack
  fixCursorAfterReset() {
    this.cr = 0;
    this.cc = 0;
    updateSelection(this, false);
    this.scrollToCursor();
  }

  getText() {
    return this.buffer.getText();
  }

  isModified() {
    return this.buffer.isModified();
  }

  reset(text) {
    // TODO should filter out non-ASCII, handle backspace
    this.buffer.reset(text);
    this.cr = this.buffer.getRow();
    this.cc = this.buffer.getCol();
    updateSelection(this, false);
  }

  scrollToCursor() {
    this.vr = clamp(this.vr, this.cr+1+this.bottomMargin-this.h, this.cr);
    this.vc = clamp(this.vc, this.cc+2-this.w, max(this.cc-2, 0));
  }

  setTextColor(c1, c2) {
    this.buffer.setDefaultChar(fromCharCode((0xff00&(c2<<8))|(0x00ff&c1)), 1);
  }

};
