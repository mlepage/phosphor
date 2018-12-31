// Phosphor - a browser-based microcomputer
// Copyright (c) 2017-2018 Marc Lepage

'use strict';

// TEMP remove after adequate testing
function validate(buffer) {
  if (buffer.layers.length != buffer.defaults.length)
    alert('fail defaults length');
  const layer0 = buffer.layers[0];
  for (let layer of buffer.layers) {
    if (layer.length != layer0.length)
      alert('fail layer length');
    for (let i = 0; i < layer0.length; ++i) {
      if (layer[i].length != layer0[i].length)
        alert('fail line length');
    }
  }
}

// Layers of lines of text
// First layer is text characters (mandatory)
// Second layer is typically colours (fg in lower byte, bg in higher byte)
module.exports = class TextBuffer {

  constructor(...args) {
    this.reset('');
  }

  getCol() {
    return this.col;
  }

  getDefaultChar(layer) {
    return this.defaults[layer||0];
  }

  getLine(row, layer) {
    return this.layers[layer||0][row];
  }

  getLineCount() {
    return this.layers[0].length;
  }

  getLineLength(row) {
    return this.layers[0][row].length;
  }

  getRow() {
    return this.row;
  }

  getText() {
    return this.layers[0].join('\n');
  }

  isModified() {
    return this.modified;
  }

  reset(text) {
    this.layers = [ [ '' ], [ '' ] ];
    this.defaults = [ ' ', '\u00ff' ];
    if (text !== undefined)
      this.setText(0, 0, 0, 0, text);
    this.row = 0; // row of last change
    this.col = 0; // col of last change
    this.modified = false;
  }

  setDefaultChar(ch, layer) {
    this.defaults[layer||0] = ch;
  }

  setText(r0, c0, r1, c1, text) {
    validate(this);
    const lines = text.split('\n'); // one or more new lines to insert
    const affected = 1 + (r1 - r0); // one or more existing rows affected
    const r2 = r0 + (lines.length - 1); // end row after change
    let prefix, suffix;
    let i = -1;
    for (let layer of this.layers) {
      prefix = layer[r0].slice(0, c0);
      suffix = layer[r1].slice(c1);
      if (++i)
        lines.forEach((line, j) => lines[j] = this.defaults[i].repeat(line.length));
      layer.splice(r0, affected, ...lines);
      layer[r0] = prefix + layer[r0];
      layer[r2] += suffix;
    }
    this.row = r2;
    this.col = this.layers[0][r2].length - suffix.length;
    this.modified = true;
    validate(this);
  }

};
