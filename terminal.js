// Phosphor - a browser-based microcomputer
// Copyright (c) 2017-2018 Marc Lepage

'use strict';

const TextEditor = require('./text-editor.js');

const BLACK = 0; // colors
const GREEN = 28;
const AMBER = 56;
const RED = 48;
const WHITE = 63;

/*
GENERAL NOTES

in unix a terminal is a file but here it's a process (that acts like a file)

if a read is active, then this.line will contain a line buffer and
onKeyDown will redirect to function edit which will either edit the line buffer
or resolve the read promise

r and c are positions on screen
l is line number (in buffer)
line is line string
triplet is three chars
c3 is c*3 (in row/line)
c1 and c2 are primary/secondary color

scroll position is line number at top of view
min scroll position is 0 (top of buffer at top of view)
max scroll position is max(buffer.length-H, 0) (bottom of buffer at bottom of view)

ESCAPE CODES
  
esc <n> U         cursor up
esc <n> D         cursor down
esc <n> L         cursor left
esc <n> R         cursor right
esc <l> <c> P     cursor position
                  cursor save
                  cursor restore

esc <n> F                         foreground color (0-63)
esc <r>,<g>,<b> F                 foreground color (rgb)
esc <n> B                         background color (0-63)
esc <r>,<g>,<b> B                 background color (rgb)
esc <f> <b> C                     both colors
esc <r>,<g>,<b>,<r>,<g>,<b> C     both colors (rgb)

erase in line (H)     ErH  ElH  EbH
erase in screen (V)   EdV  EuV  EbV  EaV

reset (Z for now)
alternate mode enable/disable (a/o)

scroll up/down (s/t)

show/hide cursor (i/j)
cursor color, blink rate (or not), block/underline/caret, etc.
*/

function write1(text) {
  const re = /([ -~\n\b]+)|(\x1b[A-Z])/g;
  let m;
  while (m = re.exec(text)) {
    if (m[1] !== undefined) {
      // printable text, newline, backspace
      this.editor.edit(m[1]);
    } else if (m[2] !== undefined) {
      // escape sequence
      switch (m[2][1]) {
        case 'A': this.editor.setTextColor(WHITE, BLACK); break;
        case 'B': this.editor.setTextColor(GREEN, BLACK); break;
        case 'C': this.editor.setTextColor(AMBER, BLACK); break;
        case 'D': this.editor.setTextColor(RED, BLACK); break;
        case 'E': this.editor.setTextColor(BLACK, GREEN); break;
        case 'F': this.editor.setTextColor(BLACK, AMBER); break;
        case 'Z': this.reset(); break;
      }
    }
  }
}

module.exports = class Terminal {

  async main(...args) {
    this.editor = new TextEditor('terminal');

    if (args[1] == 'login') {
      this.P.spawn('shell', 'login');
    }
  }

  close() {
    // TODO file op
  }

  cursorDown(n) {
  }

  cursorLeft(n) {
  }

  cursorRight(n) {
  }

  cursorUp(n) {
  }

  draw() {
    const P = this.P;
    P.clear(BLACK);
    this.editor.draw(P);
  }

  onKeyDown(e) {
    // TODO if there is any selection, any key entry will replace it and therefore
    // line entry may become incorrect (can't assume only a single key)
    if (e.key.length == 1) {
      const code = e.key.charCodeAt();
      if (32 <= code && code < 127) {
        this.editor.edit(e.key);
        if (this.line) {
          const prefix = this.line.buffer.slice(0, this.line.pos);
          const suffix = this.line.buffer.slice(this.line.pos);
          this.line.buffer = prefix + e.key + suffix;
          this.line.pos++;
        }
      }
    } else {
      switch (e.key) {
        case 'ArrowDown':
          if (!this.line)
            this.editor.cursorDown(e.shiftKey);
          break;
        case 'ArrowLeft':
          if (this.line) {
            if (this.line.pos > 0) {
              this.editor.cursorLeft(e.shiftKey);
              this.line.pos--;
            }
          } else {
            this.editor.cursorLeft(e.shiftKey);
          }
          break;
        case 'ArrowRight':
          if (this.line) {
            if (this.line.pos < this.line.buffer.length) {
              this.editor.cursorRight(e.shiftKey);
              this.line.pos++;
            }
          } else {
            this.editor.cursorRight(e.shiftKey);
          }
          break;
        case 'ArrowUp':
          if (!this.line)
            this.editor.cursorUp(e.shiftKey);
          break;
        case 'Backspace':
          if (this.line) {
            if (this.line.pos > 0) {
              this.editor.edit('\b');
              const prefix = this.line.buffer.slice(0, this.line.pos-1);
              const suffix = this.line.buffer.slice(this.line.pos);
              this.line.buffer = prefix + suffix;
              this.line.pos--;
            }
          } else {
            this.editor.edit('\b');
          }
          break;
        case 'Enter':
          if (this.line) {
            while (this.line.pos++ < this.line.buffer.length) {
              console.log('cursorRight');
              this.editor.cursorRight();
            }
          }
          this.editor.edit('\n');
          if (this.line) {
            this.line.resolve(this.line.buffer);
            delete this.line;
          }
          break;
      }
    }
  }

  async read() {
    return new Promise(resolve => {
      this.line = {
        buffer: '',
        pos: 0,
        resolve: resolve
      }
    });
  }

  reset() {
    this.editor.reset('');
  }

  scrollDown(n) {
  }

  scrollUp(n) {
  }

  seek() {
    // TODO file op
  }

  write(...args) {
    args.forEach(write1, this);
    this.editor.scrollToCursor();
  }

};
