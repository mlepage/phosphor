// Phosphor - a browser-based microcomputer
// Copyright (c) 2018 Marc Lepage

'use strict';

// Depth first mostly spatial search
// Return true if node handled event
function handle(node, event, name) {
  if (!node.hit(event.x, event.y)) {
    return false;
  }
  if (node.children) {
    for (let i = 0; i < node.children.length; ++i) {
      const child = node.children[i];
      if (handle(child, event, name)) {
        return true;
      }
    }
  }
  const handler = node[name];
  if (handler) {
    handler.call(node, event);
  }
  return true;
}

module.exports = class Ui {

  constructor(...args) {
    const target = args.shift();
    const P = target.P;
    const root = new Node();
    args.forEach((node) => root.addChild(node));
    target.draw = () => root.draw(P);
    target.onPointerDown = (e) => handle(root, e, 'onPointerDown');
    target.onPointerUp = (e) => handle(root, e, 'onPointerUp');
  }

};

class Node {
  constructor() {
  }

  addChild(child) {
    if (!this.children) {
      this.children = [];
    }
    this.children.push(child);
  }

  draw(P) {
    if (this.children) {
      this.children.forEach((node) => node.draw(P));
    }
  }

  hit(x, y) {
    return true;
  }
};

class Background extends Node {
  constructor(bg) {
    super();
    this.bg = bg;
  }

  draw(P) {
    P.clear(this.bg);
    super.draw(P);
  }

  hit(x, y) {
    return false;
  }
};

class Grid extends Node {
  constructor(...args) {
    super();
    this.x = args.shift();
    this.y = args.shift();
    this.w = args.shift();
    this.h = args.shift();
    this.iw = args.shift();
    this.ih = args.shift();
    
    out: while (true) {
      switch (args[0]) {
        case 'draw': args.shift(); this._draw = args.shift(); break;
        case 'outline': args.shift(); this.outline = args.shift(); break;
        default: break out;
      }
    }
  }

  draw(P) {
    if (this.outline !== undefined) {
      P.rect(this.x-1, this.y-1, this.w+2, this.h+2, null, this.outline);
    }
    for (let y = this.y, i = 0; y < this.y+this.h; y+=this.ih, ++i) {
      for (let x = this.x, j = 0; x < this.x+this.w; x+=this.iw, ++j) {
        this._draw(x, y, this.iw, this.ih, i, j);
      }
    }
    super.draw();
  }

  hit(x, y) {
    return this.x <= x && x < this.x+this.w && this.y <= y && y < this.y+this.h;
  }

  onPointerDown(e) {
    console.log('grid.onPointerDown', this);
  }

  onPointerUp(e) {
    console.log('grid.onPointerUp', this);
  }
};

class Rect extends Node {
  constructor(...args) {
    super();
    this.x = args.shift();
    this.y = args.shift();
    this.w = args.shift();
    this.h = args.shift();
    this.c1 = args.shift();
    this.c2 = args.shift();
  }

  draw(P) {
    P.rect(this.x, this.y, this.w, this.h, this.c1, this.c2);
    super.draw();
  }

  hit(x, y) {
    return this.x <= x && x < this.x+this.w && this.y <= y && y < this.y+this.h;
  }
};

module.exports.Background = Background;
module.exports.Grid = Grid;
module.exports.Rect = Rect;
