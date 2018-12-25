// Phosphor - a browser-based microcomputer
// Copyright (c) 2018 Marc Lepage

'use strict';

const floor = Math.floor;

function str(n) {
  return `${n<10?' ':''}${n}`;
}

module.exports = class Palette {

  main() {
    this.border = true;
    this.label = true;
  }

  draw() {
    const P = this.P;
    const xm = this.border ? 1 : 0;
    const ym = this.border ? 1 : 0;
    const w = this.border ? 13 : 15;
    const h = this.border ? 38 : 40;
    P.clear();
    for (let y = 0, c = 0; y < 160; y+=40) {
      for (let x = 0; x < 240; x+=15, ++c) {
        P.box(x+xm, y+ym, w, h, c);
        if (this.label) {
          const fg = (12<=c&&c<=15)||(24<=c&&c<=31)||(40<=c&&c<=47)||(52<=c) ? 0 : 63;
          P.text(str(c), x+1, y+31, fg, c);
        }
      }
    }
  }

  onKeyDown(e) {
    switch (e.key) {
      case 'l':
        this.label = !this.label;
        break;
      case 'b':
        this.border = !this.border;
        break;
    }
  }

};
