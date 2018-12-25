// Phosphor - a browser-based microcomputer
// Copyright (c) 2017-2018 Marc Lepage

'use strict';

const helptext =
`\x1bBhelp         \x1bAshow list of commands
\x1bBhelp \x1bCcmd     \x1bAshow help for command
\x1bBclear        \x1bAclear terminal
\x1bBlist         \x1bAlist files
\x1bBload \x1bCname    \x1bAload named file
\x1bBrun          \x1bArun loaded file
\x1bBrename \x1bCname  \x1bArename loaded file
\x1bBcopy \x1bCname    \x1bAcopy loaded file
\x1bBnew          \x1bAcreate new untitled file
\x1bBnew \x1bCname     \x1bAcreate new named file
\x1bBinfo         \x1bAshow loaded file info
\x1bBinfo \x1bCname    \x1bAshow named file info
\x1bBshow         \x1bAshow loaded file contents
\x1bBshow \x1bCname    \x1bAshow named file contents
\x1bBdelete       \x1bAdelete loaded file
\x1bBdelete \x1bCname  \x1bAdelete named file
`;
//\x1bBimport       \x1bA(coming soon)
//\x1bBexport       \x1bA(coming soon)

const yes = {
  'y': true,
  'yes': true
};

function affirmative(line) {
  return yes[line.trim().toLowerCase()] == true;
}

module.exports = class Shell {

  constructor() {
    // TODO find best way to create aliases for builtins
    const p = Object.getPrototypeOf(this);
    p.builtin_cat = p.builtin_show;
    p.builtin_del = p.builtin_delete;
    p.builtin_dir = p.builtin_list;
    p.builtin_ls = p.builtin_list;
    p.builtin_remove = p.builtin_delete;
    p.builtin_rm = p.builtin_delete;
  }

  async main(...args) {
    const P = this.P;
    
    const login = args[1] == 'login';
    const interactive = true; // TODO
    const prompt = '\x1bB>\x1bA ';
    
    if (login) {
      P.write(1, "\x1bBphosphor\x1bA            \x1bCtype 'help' for help\x1bA\n\n");
    }
    
    while (true) {
      if (interactive) {
        P.write(1, prompt);
      }
      const line = await P.read(0);
      //if (line === undefined) break; // only needed when reading from file
      await this.execute(line);
      // TODO handle check for exit (for scripts)
    }
  }

  async execute(line) {
    const args = line.match(/\S+/g);
    if (!args)
      return;
    const builtin = `builtin_${args[0]}`;
    if (this[builtin])
      return this[builtin](...args);
    this.P.write(1, '\x1bCcommand not found\x1bA\n');
  }

  async builtin_clear(...args) {
    const P = this.P;
    args.shift();
    if (args.length != 0) {
      P.write(1, '\x1bCtoo many args specified\x1bA\n');
      return;
    }
    P.write(1, '\x1bZ');
  }

  async builtin_copy(...args) {
    const P = this.P;
    args.shift();
    if (args.length != 1) {
      P.write(1, args.length == 0 ? '\x1bCno name specified\x1bA\n'
                                  : '\x1bCtoo many names specified\x1bA\n');
      return;
    }
    const name = args[0];
    let fd = P.open(name, 'r');
    if (fd != -1) {
      P.close(fd);
      P.write(1, `\x1bC${name} already exists\x1bA\n`);
      return;
    }
    let contents;
    fd = P.open(P.load(), 'r');
    if (fd != -1) {
      contents = await P.read(fd, 'a');
      P.close(fd);
    }
    fd = P.open(name, 'w');
    if (fd == -1) {
      P.write(1, '\x1bCproblem copying file\x1bA\n');
      return;
    }
    if (contents) {
      P.write(fd, contents);
    }
    P.close(fd);
    P.load(name);
    P.write(1, `\x1bB${name} created\x1bA\n`);
  }

  async builtin_delete(...args) {
    const P = this.P;
    args.shift();
    if (args.length > 1) {
      P.write(1, '\x1bCtoo many names specified\x1bA\n');
      return;
    }
    let name = P.load();
    if (args.length == 0 || name == args[0]) {
      P.write(1, `\x1bCdelete ${name}: are you sure?\x1bA `);
      const line = await P.read(0);
      if (!affirmative(line))
        return;
      P.delete(name);
      P.load(null);
      P.write(1, `\x1bB${name} deleted\x1bA\n`);
      return;
    }
    name = args[0];
    P.write(1, `\x1bCdelete ${name}: are you sure?\x1bA `);
    const line = await P.read(0);
    if (!affirmative(line))
      return;
    const r = P.delete(name);
    P.write(1, r == 0 ? `\x1bB${name} deleted\x1bA\n`
                      : '\x1bCno such file\x1bA\n');
  }

  async builtin_export(...args) {
    // TODO
  }

  async builtin_help(...args) {
    this.P.write(1, helptext);
  }

  async builtin_import(...args) {
    // TODO
  }

  async builtin_info(...args) {
    // TODO
  }

  async builtin_list(...args) {
    const P = this.P;
    args.shift();
    if (args.length != 0) {
      P.write(1, '\x1bCtoo many args specified\x1bA\n');
      return;
    }
    // TODO try to write in more than one output column
    const list = P.ls();
    for (let i = 0; i < list.length; ++i)
      P.write(1, list[i], '\n');
  }

  async builtin_load(...args) {
    const P = this.P;
    args.shift();
    if (args.length != 1) {
      P.write(1, args.length == 0 ? '\x1bCno name specified\x1bA\n'
                                  : '\x1bCtoo many names specified\x1bA\n');
      return;
    }
    const name = args[0];
    const r = P.load(name);
    P.write(1, r == 0 ? `\x1bB${name} loaded\x1bA\n`
                      : `\x1bC${name} not found\x1bA\n`);
  }

  async builtin_lua(...args) {
    const P = this.P;
    args.shift();
    // TODO support interactive mode
    if (args.length == 0) {
      P.write(1, '\x1bCno script specified\x1bA\n');
      return;
    }
    return P.spawn('lua', ...args)._.main_promise;
  }

  async builtin_new(...args) {
    const P = this.P;
    args.shift();
    if (args.length > 1) {
      P.write(1, '\x1bCtoo many names specified\x1bA\n');
      return;
    }
    if (args.length == 0) {
      const name = P.load(null);
      P.write(1, `\x1bB${name} created\x1bA\n`);
      return;
    }
    const name = args[0];
    let fd = P.open(name, 'r');
    if (fd != -1) {
      P.close(fd);
      P.write(1, `\x1bC${name} already exists\x1bA\n`);
      return;
    }
    fd = P.open(name, 'w');
    if (fd == -1) {
      P.write(1, '\x1bCproblem creating file\x1bA\n');
      return;
    }
    P.close(fd);
    P.load(name);
    P.write(1, `\x1bB${name} created\x1bA\n`);
  }

  async builtin_rename(...args) {
    const P = this.P;
    args.shift();
    if (args.length != 1) {
      P.write(1, args.length == 0 ? '\x1bCno name specified\x1bA\n'
                                  : '\x1bCtoo many names specified\x1bA\n');
      return;
    }
    const name = args[0];
    let fd = P.open(name, 'r');
    if (fd != -1) {
      P.close(fd);
      P.write(1, `\x1bC${name} already exists\x1bA\n`);
      return;
    }
    const loadname = P.load();
    let contents;
    fd = P.open(loadname, 'r');
    if (fd != -1) {
      contents = await P.read(fd, 'a');
      P.close(fd);
    }
    fd = P.open(name, 'w');
    if (fd == -1) {
      P.write(1, '\x1bCproblem renaming file\x1bA\n');
      return;
    }
    if (contents) {
      P.write(fd, contents);
    }
    P.close(fd);
    P.write(1, `\x1bB${loadname} renamed to ${name}\x1bA\n`);
    P.delete(loadname);
    P.load(name);
  }

  async builtin_run(...args) {
    const P = this.P;
    args.shift();
    return P.spawn('lua', P.load(), ...args)._.main_promise;
  }

  async builtin_show(...args) {
    const P = this.P;
    args.shift();
    if (args.length > 1) {
      P.write(1, '\x1bCtoo many names specified\x1bA\n');
      return;
    }
    const fd = P.open(args.length == 1 ? args[0] : P.load(), 'r');
    if (fd == -1) {
      if (args.length == 1)
        P.write(1, '\x1bCno such file\x1bA\n');
      return;
    }
    const contents = await P.read(fd, 'a');
    const nl = (contents.length == 0 || contents[contents.length-1] != '\n') ? '\n' : '';
    P.write(1, contents, nl);
  }

  async builtin_test(...args) {
    const P = this.P;
    args.shift();
    // HACK inject test files into filesystem
    const storage = window.localStorage;
    storage['P/test.lua'] = '1000000';
    storage['P/read.expect'] = '1000001';
    await fetch('./test/test.lua')
    .then(response => response.text())
    .then(data => {
      storage['P:1000000'] = data;
    });
    await fetch('./test/read.expect')
    .then(response => response.text())
    .then(data => {
      storage['P:1000001'] = data;
    });
    return P.spawn('lua', 'test.lua', ...args)._.main_promise;
  }

  async builtin_testfont() {
    const P = this.P;
    const n = Math.floor(Math.random()*4);
    switch (n) {
      case 0:
        P.write(1, '\x1bAwhite  \x1bBgreen  \x1bCamber  \x1bDred  \x1bA\n');
        break;
      case 1:
        P.write(1, '\x1bAsomething happened\n');
        P.write(1, '\x1bCwarning: maybe something bad?\n');
        P.write(1, '\x1bAanother thing happened\n');
        P.write(1, '\x1bCwarning: approaching limits\n');
        P.write(1, '\x1bDerror: limits exceeded\n');
        P.write(1, '\x1bAretrying the thing\n');
        break;
      case 2:
        P.write(1, '\x1bC--> open\n');
        P.write(1, '\x1bE  OK  \x1bB file opens\n');
        P.write(1, '\x1bE  OK  \x1bB file has permissions\n');
        P.write(1, '\x1bC--> spawn\n');
        P.write(1, '\x1bE  OK  \x1bB child spawns\n');
        P.write(1, '\x1bE  OK  \x1bB child has ppid\n');
        P.write(1, '\x1bF FAIL \x1bD child lacks parent FDs\n');
        break;
      case 3:
        P.write(1, '\x1bBABCDEFGHIJKLMNOPQRSTUVWXYZ   \x1bC!@#$%^&*()\n');
        P.write(1, '\x1bBabcdefghijklmnopqrstuvwxyz   \x1bD`~-=_+\\|/?\n');
        P.write(1, '\x1bC0123456789   w=(a+b)/(c-d)*(4*x[y]%3)-z\n');
        P.write(1, '\x1bBthe quick brown fox jumps over the\n');
        P.write(1, 'lazy dog \x1bCand then \x1bBthe quick onyx goblin\n');
        P.write(1, 'jumps over the lazy dwarf   \x1bD,. ;: !? \'"\n');
        P.write(1, '\x1bCsphinx of black quartz, judge my vow\n');
        P.write(1, '\x1bDIS THIS A DAGGER WHICH I SEE BEFORE ME?\n');
        break;
    }
  }

};
