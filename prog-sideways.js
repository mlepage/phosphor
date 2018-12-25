// Phosphor - a browser-based microcomputer
// Copyright (c) 2017-2018 Marc Lepage

'use strict';

module.exports = class ProgSideways {

  main() {
    console.log('prog-sideways main');
    this.t = 0;
  }

  draw() {
    let t = this.t < 120 ? this.t : 240-this.t;
    const P = this.P;
    P.clear(t);
    for (let i = 0; i < 1; ++i) {
      P.box(t+1, 2, 3, 4, 5);
      P.box(t+6, 7, 8, 9, 10);
      P.box(t+11, 12, 13, 14, 15);
      P.box(t+16, 17, 18, 19, 20);
      P.box(t+21, 22, 23, 24, 25);
      P.box(t+26, 27, 28, 29, 30);
      P.box(t+31, 32, 33, 34, 35);
      P.box(t+36, 37, 38, 39, 40);
      P.box(t+41, 42, 43, 44, 45);
      P.box(t+46, 47, 48, 49, 50);
      P.box(t+51, 52, 53, 54, 55);
      P.box(t+56, 57, 58, 59, 60);
    }
  }

  onKeyDown(e) {
    console.log('prog-sideways key', e);
  }

  update() {
    this.t = (this.t+1)%240;
    
    const P = this.P;
    const MEM = this.P.MEM;
    
    // Simulate work
    for (let i = 0; i < 0; ++i) {
      for (let y = 0; y < 160; ++y) {
        for (let x = 0; x < 240; ++x) {
          //P.poke([240*y+x], i);
          MEM[240*y+x] = i;
        }
      }
    }
  }

};
