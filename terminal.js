// Phosphor - a browser-based microcomputer
// Copyright (c) 2017-2018 Marc Lepage

'use strict';

const floor = Math.floor;
const max = Math.max;
const min = Math.min;
const random = Math.random;

const fromCharCode = String.fromCharCode;

const W = 40;
const H = 20;

const BLACK = 0;
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

function opt(arg, d) {
  return (arg !== undefined) ? arg : d;
}

module.exports = class Terminal {

  async main(...args) {
    this.reset();
    
    if (args[1] == 'login') {
      this.P.spawn('shell', 'login');
    }
  }

  close() {
    // TODO file op
  }

  cursorDown(n) {
    const r = min(this.r+opt(n, 1), H-1);
    if (this.r != r || this.c == W) {
      this.r = r;
      this.c = min(this.c, W-1);
    }
  }

  cursorLeft(n) {
    const c = max(this.c-opt(n, 1), 0);
    if (this.c != c) {
      this.c = c;
    }
  }

  cursorRight(n) {
    const c = min(this.c+opt(n, 1), W-1);
    if (this.c != c) {
      this.c = c;
    }
  }

  cursorUp(n) {
    const r = max(this.r-opt(n, 1), 0);
    if (this.r != r || this.c == W) {
      this.r = r;
      this.c = min(this.c, W-1);
    }
  }

  draw() {
    const P = this.P;
    const buffer = this.buffer;
    P.clear(this.c2);
    for (let y = 0, r = this.s; y < 160 && r < buffer.length; y+=8, ++r) {
      const line = buffer[r];
      for (let x = 0, i = 0; i < line.length; x+=6, i+=3) {
        P.text(line[i], x, y, line.charCodeAt(i+1), line.charCodeAt(i+2));
      }
    }
    const l = max(buffer.length-H, 0) + this.r;
    const r = l-this.s;
    if (r < H) {
      const c = min(this.c, W-1);
      let ch = ' ';
      let c1 = this.c1;
      if (l < buffer.length) {
        const line = buffer[l];
        const i = c*3;
        if (i < line.length) {
          ch = line[i];
          c1 = line.charCodeAt(i+1);
        }
      }
      P.text(ch, c*6, r*8, c1, GREEN);
    }
  }

  edit(ch) {
    const line = this.line;
    if (ch == '\n') {
      this.write1(ch);
      line.resolve(line.buffer);
      delete this.line;
    } else if (ch == '\x7f') {
      if (line.pos > 0) {
        const before = line.buffer.slice(0, line.pos-1);
        const after = line.buffer.slice(line.pos);
        this.cursorLeft();
        // TODO for now directly edit text buffer (assume editing last line)
        // but should use clearLine function or write1('escape sequence')
        this.buffer[this.buffer.length-1] = this.buffer[this.buffer.length-1].slice(0, this.c*3);
        if (after) {
          this.write1(after);
          this.cursorLeft(after.length);
        }
        line.buffer = before + after;
        line.pos--;
      }
    } else {
      const before = line.buffer.slice(0, line.pos);
      const after = line.buffer.slice(line.pos);
      this.write1(ch);
      if (after) {
        this.write1(after);
        this.cursorLeft(after.length);
      }
      line.buffer = before + ch + after;
      line.pos++;
    }
  }

  editCursorLeft() {
    const line = this.line;
    if (line.pos > 0) {
      --line.pos;
      this.cursorLeft();
    }
  }

  editCursorRight() {
    const line = this.line;
    if (line.pos < line.buffer.length) {
      ++line.pos;
      this.cursorRight();
    }
  }

  editHistoryDown() {
  }

  editHistoryUp() {
  }

  onKeyDown(e) {
    // TODO probably should if/else on this.line first
    if (e.key.length == 1) {
      const code = e.key.charCodeAt();
      if (e.key == '\\') {
        console.log(this.buffer); // TEMP
      } else if (e.key == '[') {
        this.scrollUp(); // TEMP
      } else if (e.key == ']') {
        this.scrollDown(); // TEMP
      } else if (32 <= code && code < 127) {
        this.line ? this.edit(e.key) : this.write1(e.key);
      }
    } else {
      switch (e.key) {
        case 'ArrowDown': this.line ? this.editHistoryDown() : this.cursorDown(); break;
        case 'ArrowLeft': this.line ? this.editCursorLeft() : this.cursorLeft(); break;
        case 'ArrowRight': this.line ? this.editCursorRight() : this.cursorRight(); break;
        case 'ArrowUp': this.line ? this.editHistoryUp() : this.cursorUp(); break;
        case 'Backspace': this.line ? this.edit('\x7f') : this.write1('\x7f'); break;
        case 'Enter': this.line ? this.edit('\n') : this.write1('\n'); break;
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
    // Format is lines of strings containing triplets (ch, fg, bg)
    this.buffer = [''];

    this.c1 = 63; // primary (fg) color
    this.c2 = 0; // secondary (bg) color
    
    this.r = 0; // cursor row (zero-based)
    this.c = 0; // cursor column (zero-based)
    this.s = 0; // scroll position (zero-based)
  }

  scrollDown(n) {
    const s = min(this.s+opt(n, 1), max(this.buffer.length-H, 0));
    if (this.s != s) {
      this.s = s;
    }
    console.log('scroll', this.s);
  }

  scrollUp(n) {
    const s = max(this.s-opt(n, 1), 0);
    if (this.s != s) {
      this.s = s;
    }
    console.log('scroll', this.s);
  }

  seek() {
    // TODO file op
  }

  write(...args) {
    args.forEach(this.write1, this);
  }

  write1(str) {
    const buffer = this.buffer;
    let c1 = this.c1;
    let c2 = this.c2;
    let l = max(buffer.length-H, 0) + this.r;
    let c = this.c;
    for (let i = 0; i < str.length; ++i) {
      const code = str.charCodeAt(i);
      if (32 <= code && code < 127) {
        if (c == W) { // auto right margin (am)
          ++l;
          if (this.r+1 < H) ++this.r;
          c = 0;
        }
        const triplet = fromCharCode(code, c1, c2);
        while (buffer.length <= l) {
          buffer.push('');
        }
        const line = buffer[l];
        const length = line.length;
        const c3 = c*3;
        if (c3 < length) {
          buffer[l] = line.slice(0, c3) + triplet + line.slice(c3+3);
        } else if (c3 > length) {
          buffer[l] += fromCharCode(32, c1, c2).repeat(c-length/3) + triplet;
        } else {
          buffer[l] += triplet;
        }
        ++c;
      } else if (code == 10) {
        ++l;
        if (this.r+1 < H) ++this.r;
        while (buffer.length <= l) {
          buffer.push('');
        }
        c = 0;
      } else if (code == 127) {
        // TODO backspace
        console.log('backspace');
      } else if (code == 27) {
        // TEMP color magic, for now assume always a valid sequence
        const cmd = str[++i];
        switch (cmd) {
          case 'A': c1 = WHITE; c2 = 0; break; // white
          case 'B': c1 = GREEN; c2 = 0; break; // green
          case 'C': c1 = AMBER; c2 = 0; break; // amber
          case 'D': c1 = RED; c2 = 0; break; // red
          case 'E': c1 = 0; c2 = GREEN; break; // reverse green
          case 'F': c1 = 0; c2 = AMBER; break; // reverse red
          case 'Z': this.reset(); break;
        }
      } else {
        console.log(`terminal: ignoring ${code}`);
      }
    }
    this.s = max(buffer.length-H, 0); // TEMP always scroll to bottom
    this.c = c;
    this.c1 = c1; // TEMP color magic
    this.c2 = c2; // TEMP color magic
  }

};
