// Phosphor - a browser-based microcomputer
// Copyright (c) 2017-2018 Marc Lepage

'use strict';

const max = Math.max, min = Math.min;

const fromCharCode = String.fromCharCode;

const BLACK = 0;
const DARK_RED = 32;
const DARK_YELLOW = 40;
const DARK_GREEN = 8;
const DARK_CYAN = 10;
const DARK_BLUE = 5;
const DARK_MAGENTA = 34;
const GRAY = 42;

const DARK_GRAY = 21;
const RED = 53;
const YELLOW = 57;
const GREEN = 25;
const CYAN = 26;
const BLUE = 27;
const MAGENTA = 54;
const WHITE = 63;
const PINK = 59;

const FG = WHITE;
const BG = DARK_GRAY;
const UI = GRAY;
const CURSOR = GRAY;
const SELECT = DARK_BLUE;

// syntax
const COMMENT = fromCharCode(43);
const DEFAULT = fromCharCode(54);
const IDENTIFIER = fromCharCode(WHITE);
const KEYWORD = fromCharCode(26);
const NUMBER = fromCharCode(58);
const STRING = fromCharCode(62);
const CONTROL = fromCharCode(25);

const keywords = {
  'and': KEYWORD, 'break': CONTROL, 'do': CONTROL, 'else': CONTROL,
  'elseif': CONTROL, 'end': CONTROL, 'false': NUMBER, 'for': CONTROL,
  'function': KEYWORD, 'goto': CONTROL, 'if': CONTROL, 'in': KEYWORD,
  'local': KEYWORD, 'nil': NUMBER, 'not': KEYWORD, 'or': KEYWORD,
  'repeat': CONTROL, 'return': CONTROL, 'then': CONTROL, 'true': NUMBER,
  'until': CONTROL, 'while': CONTROL
};

function highlight(editor, r, c0, c1, fg) {
  const mbuffer = editor.mbuffer;
  const cline = mbuffer[r];
  mbuffer[r] = cline.slice(0, c0) + fg.repeat(c1-c0) + cline.slice(c1);
}

function highlightLine(editor, r) {
  const line = editor.buffer[r];
  let m, re;
  
  highlight(editor, r, 0, line.length, DEFAULT);

  re = /[\(\)\[\]]+/g;
  while (m = re.exec(line)) {
    highlight(editor, r, m.index, m.index+m[0].length, IDENTIFIER);
  }
  
  re = /\d+/g;
  while (m = re.exec(line)) {
    highlight(editor, r, m.index, m.index+m[0].length, NUMBER);
  }
  
  re = /[A-Za-z_]\w*/g;
  while (m = re.exec(line)) {
    const c = (m.index == 0 && m[0] == 'end') ? KEYWORD: (keywords[m[0]] || IDENTIFIER);
    highlight(editor, r, m.index, m.index+m[0].length, c);
  }
  
  // adapted from https://stackoverflow.com/questions/4568410/match-comments-with-regex-but-not-inside-a-quote#41867753
  re = /"((?:\\"|[^"])*)"|'((?:\\'|[^'])*)'|(--.*|\/\*[\s\S]*?\*\/)/g;
  while (m = re.exec(line)) {
    if (m[2]) {
      highlight(editor, r, m.index, m.index+m[0].length, STRING);
    } else if (m[3]) {
      highlight(editor, r, m.index, m.index+m[0].length, COMMENT);
    }
  }
}

function opt(arg, d) {
  return (arg !== undefined) ? arg : d;
}

function updateHighlight(editor, r0, r1) {
  for (let r = r0; r <= r1; ++r) {
    highlightLine(editor, r);
  }
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

function clamp(val, min, max) {
  return val < min ? min : max < val ? max : val;
}

module.exports = class CodeEditor {

  async main(...args) {
    this.buffer = [ '' ]; // lines containing characters
    this.mbuffer = [ '' ]; // lines containing markup
    
    this.cr = 0; // cursor row (zero-based)
    this.cc = 0; // cursor column (zero-based)
    this.sr = 0; // select row (zero-based)
    this.sc = 0; // select column (zero-based)
    this.vr = 0; // view row (zero-based)
    this.vc = 0; // view column (zero-based)
    this.tc = 0; // target column (zero-based)
    
    this.select = false;
    this.r0 = 0;
    this.c0 = 0;
    this.r1 = 0;
    this.c1 = 0;
  }

  cursorDown(shift) {
    if (this.select && !shift) {
      this.cr = this.r1;
      this.cc = this.c1;
      this.tc = this.cc;
    }
    if (this.cr+1 < this.buffer.length) {
      ++this.cr;
      this.cc = min(this.tc, this.buffer[this.cr].length);
    } else {
      this.cc = this.buffer[this.cr].length;
    }
    updateSelection(this, shift);
    this.scrollToCursor();
  }

  cursorLeft(shift) {
    if (this.select && !shift) {
      this.cr = this.r0;
      this.cc = this.c0;
    } else {
      if (this.cc-1 >= 0) {
        --this.cc;
      } else if (this.cr-1 >= 0) {
        --this.cr;
        this.cc = this.buffer[this.cr].length;
      }
    }
    updateSelection(this, shift);
    this.scrollToCursor();
    this.tc = this.cc;
  }

  cursorRight(shift) {
    if (this.select && !shift) {
      this.cr = this.r1;
      this.cc = this.c1;
    } else {
      if (this.cc+1 <= this.buffer[this.cr].length) {
        ++this.cc;
      } else if (this.cr+1 < this.buffer.length) {
        ++this.cr;
        this.cc = 0;
      }
    }
    updateSelection(this, shift);
    this.scrollToCursor();
    this.tc = this.cc;
  }

  cursorUp(shift) {
    if (this.select && !shift) {
      this.cr = this.r0;
      this.cc = this.c0;
      this.tc = this.cc;
    }
    if (this.cr-1 >= 0) {
      --this.cr;
      this.cc = min(this.tc, this.buffer[this.cr].length);
    } else {
      this.cc = 0;
    }
    updateSelection(this, shift);
    this.scrollToCursor();
  }

  draw() {
    const P = this.P;
    const buffer = this.buffer;
    const mbuffer = this.mbuffer;
    const cr = this.cr;
    const cc = this.cc;
    const r0 = this.r0;
    const c0 = this.c0;
    const r1 = this.r1;
    const c1 = this.c1;
    P.clear(BG);
    P.box(0, 0, 240, 8, UI);
    P.box(0, 152, 240, 8, UI);
    P.text(`${cr+1}:${cc+1}`, 0, 152, BG, UI);
    for (let y = 8, r = this.vr; y < 152 && r < buffer.length; y+=8, ++r) {
      const line = buffer[r];
      const cline = mbuffer[r];
      for (let x = 0, c = this.vc; x < 240 && c <= line.length; x+=6, ++c) {
        let ch, fg, bg;
        if (c < line.length) {
          ch = line.charCodeAt(c);
          fg = cline.charCodeAt(c);
        } else {
          ch = 32;
          fg = FG;
        }
        if (c == cc && r == cr) {
          bg = CURSOR;
        } else if ((r0 < r || r0 == r && c0 <= c) && (r < r1 || r == r1 && c < c1)) {
          bg = SELECT;
        } else {
          bg = BG;
        }
        P.char(ch, x, y, fg, bg);
      }
    }
  }

  edit(r0, c0, r1, c1, text) {
    const buffer = this.buffer;
    const lines = text.split('\n');
    lines[0] = buffer[r0].slice(0, c0) + lines[0];
    lines[lines.length-1] += buffer[r1].slice(c1);
    buffer.splice(r0, r1-r0+1, ...lines);
    lines.forEach((str, i) => lines[i] = DEFAULT.repeat(str.length));
    this.mbuffer.splice(r0, r1-r0+1, ...lines);
    updateHighlight(this, r0, r0+lines.length-1);
    this.scrollToCursor();
    this.dirty = true;
  }

  onKeyDown(e) {
    if (e.key.length == 1) {
      const code = e.key.charCodeAt();
      if (e.key == '\\') {
        console.log(this); // TEMP
      } else if (32 <= code && code < 127) {
        this.edit(this.r0, this.c0, this.r1, this.c1, e.key);
        this.cr = this.r0;
        this.cc = this.c0;
        this.select = false;
        this.cursorRight();
      }
    } else {
      switch (e.key) {
        case 'ArrowDown': this.cursorDown(e.shiftKey); break;
        case 'ArrowLeft': this.cursorLeft(e.shiftKey); break;
        case 'ArrowRight': this.cursorRight(e.shiftKey); break;
        case 'ArrowUp': this.cursorUp(e.shiftKey); break;
        case 'Backspace': {
          if (!this.select) {
            this.cursorLeft(true);
          }
          this.edit(this.r0, this.c0, this.r1, this.c1, '');
          this.cr = this.r0;
          this.cc = this.c0;
          updateSelection(this, false);
          break;
        }
        case 'Enter': {
          this.edit(this.r0, this.c0, this.r1, this.c1, '\n');
          this.cr = this.r0;
          this.cc = this.c0;
          this.select = false;
          this.cursorRight();
          break;
        }
      }
    }
  }

  async onResume() {
    const P = this.P;
    const name = P.load();
    const fd = P.open(name, 'r');
    console.log('onResume', name, fd);
    if (fd != -1) {
      const contents = await P.read(fd, 'a');
      P.close(fd);
      this.buffer = [''];
      this.mbuffer = [''];
      this.edit(0, 0, 0, 0, contents);
    }
    // TODO reset all state appropriately
    this.dirty = false;
  }

  onSuspend() {
    const P = this.P;
    if (!this.dirty)
      return;
    const name = P.load();
    const fd = P.open(name, 'w');
    console.log('onSuspend', name, fd);
    if (fd != -1) {
      const contents = this.buffer.join('\n');
      P.write(fd, contents);
      P.close(fd);
    }
  }

  scrollDown(n) {
    const vr = this.vr + opt(n, 1);
    if (vr < this.buffer.length) {
      this.vr = vr;
    }
  }

  scrollLeft(n) {
    const vc = this.vc - opt(n, 1);
    if (vc >= 0) {
      this.vc = vc;
    }
  }

  scrollRight(n) {
    const vc = this.vc + opt(n, 1);
    if (vc <= 40) { // TODO need max horizontal scroll
      this.vc = vc;
    }
  }

  scrollToCursor() {
    this.vr = clamp(this.vr, this.cr-16, this.cr);
    this.vc = clamp(this.vc, this.cc-38, max(this.cc-4, 0));
  }

  scrollUp(n) {
    const vr = this.vr - opt(n, 1);
    if (vr >= 0) {
      this.vr = vr;
    }
  }

};
