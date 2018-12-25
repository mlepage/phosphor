// Phosphor - a browser-based microcomputer
// Copyright (c) 2018 Marc Lepage

'use strict';

// ABCDEFGHIJKLMNOPQRSTUVWXYZ
// abcdefghijklmnopqrstuvwxyz

// https://damieng.com/blog/2011/02/20/typography-in-8-bits-system-fonts
// https://damieng.com/blog/2016/08/09/typography-in-bits-for-a-few-pixels-more

const floor = Math.floor;
const random = Math.random;

module.exports = class CharEditor {

  main() {
    this.ci = 0;
    this.cj = 0;
    this.pi = 0;
    this.pj = 0;
  }

  draw() {
    const P = this.P;
    P.clear(21);
    
    P.box(8+this.cj*9, 8+this.ci*9, 10, 10, 26);
    
    let a = 0x9600;
    for (let y = 0; y < 8; ++y) {
      for (let x = 0; x < 16; ++x) {
        for (let i = 0; i < 8; ++i) {
          let b = P.peek(a++);
          for (let j = 7; j >= 0; --j) {
            P.box(9+x*9+j, 9+y*9+i, 1, 1, b&1 == 1 ? 63 : 0);
            b >>= 1;
          }
        }
      }
    }
    
    P.box(159+this.pj*9, 8+this.pi*9, 10, 10, 26);
    
    a = 0x9600 + (this.ci*16+this.cj)*8;
    for (let i = 0; i < 8; ++i) {
      let b = P.peek(a++);
      for (let j = 7; j >= 0; --j) {
        P.box(160+j*9, 9+i*9, 8, 8, b&1 != 0 ? 63 : 0);
        b >>= 1;
      }
    }
    
    P.text('The quick brown fox jumps  3.14159', 0, 88);
    P.text(' over the lazy dog           26535', 0, 96);
    P.text('> Sphinx of black quartz, judge my vow', 0, 112);
    P.text('', 0, 120);
    P.text('The quick onyx goblin   More Wasabi?!#$', 0, 136);
    P.text(' jumps over the lazy dwarf  a+=3.14;t={}', 0, 144);
  }

  onKeyDown(e) {
    switch (e.key) {
      case 'i': this.pi = (this.pi+7)%8; break;
      case 'j': this.pj = (this.pj+7)%8; break;
      case 'k': this.pi = (this.pi+1)%8; break;
      case 'l': this.pj = (this.pj+1)%8; break;
      case 'e': this.ci = (this.ci+7)%8; break;
      case 's': this.cj = (this.cj+15)%16; break;
      case 'd': this.ci = (this.ci+1)%8; break;
      case 'f': this.cj = (this.cj+1)%16; break;
      case ' ': {
        const a = 0x9600 + (this.ci*16+this.cj)*8 + this.pi;
        let b = this.P.peek(a);
        b ^= 0x80>>this.pj;
        this.P.poke(a, b);
        break;
      }
      case '/': {
        const a = 0x9600 + (this.ci*16+this.cj)*8 + this.pi;
        let b = this.P.peek(a);
        let str = '';
        for (let s = 7; s >= 0; --s) {
          str += (b>>s)&1;
        }
        console.log(a, b, str);
        break;
      }
      case '\\': {
        let str = '[';
        for (let a = 0x9600; a < 0x9a00; ++a) {
          str += this.P.peek(a) + ',';
        }
        str += ']';
        console.log(str);
        break;
      }
    }
  }

};
