// Phosphor - a browser-based microcomputer
// Copyright (c) 2017-2018 Marc Lepage

'use strict';

const Ui = require('./ui.js');

const floor = Math.floor;

const BG = 21;
const UI = 42;

module.exports = class CodeEditor {

  async main(...args) {
    const P = this.P;
    
    // TEMP
    for (let i = 0; i < 1024; ++i) {
      P.poke(0x10000+i, i%64);
    }
    
    new Ui(
      this,
      new Ui.Background(BG),
      new Ui.Grid(16, 16, 128, 128, 16, 16, // canvas
        'outline', 0,
        'draw', (x, y, w, h, i, j) => {
          P.box(x, y, w, h, P.peek(0x10000+i*8+j));
        }
      ),
      new Ui.Grid(152, 64, 80, 80, 8, 8, // sheet
        'outline', 0,
        'draw', (x, y, w, h, i, j) => { P.box(x, y, w, h, (i+2*j+3*x+5*y)%64); }
      ),
      new Ui.Grid(152, 16, 80, 20, 5, 5, // color picker
        'outline', 0,
        'draw', (x, y, w, h, i, j) => {
          P.box(x, y, w, h, floor(j/4)*16+i*4+(j%4));
          if (i == 3 && j == 15) {
            P.box(171, 16, 1, 20, 0);
            P.box(191, 16, 1, 20, 0);
            P.box(211, 16, 1, 20, 0);
          }
        },
        'pointerdown', (x, y, i, j) => {
          console.log(x, y, i, j);
        },
      ),
      new Ui.Grid(0, 8, 16, 144, 16, 16, // tools
        'draw', (x, y, w, h, i, j) => { P.box(x+4, y+4, w-8, h-8, (i+2*j+3*x+5*y)%64); }
      ),
      new Ui.Rect(0, 0, 240, 8, UI),
      new Ui.Rect(0, 152, 240, 8, UI),
    );
  }

};
