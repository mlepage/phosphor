// Phosphor - a browser-based microcomputer
// Copyright (c) 2017-2018 Marc Lepage

'use strict';

const floor = Math.floor, max = Math.max, random = Math.random;

// lhs is legal modes, rhs is canonical modes
const file_modes = {
  'r': 'r', 'rb': 'r',
  'w': 'w', 'wb': 'w',
  'a': 'a', 'ab': 'a',
  'r+': 'r+', 'rb+': 'r+', 'r+b': 'r+',
  'w+': 'w+', 'wb+': 'w+', 'w+b': 'w+',
  'a+': 'a+', 'ab+': 'a+', 'a+b': 'a+'
};

const files = {
elements:
`Hydrogen 1 H 1.008 -259.2 -252.8
Helium 2 He 4.0026 -272.2 -268.9
Lithium 3 Li 6.94 180.5 1342
Beryllium 4 Be 9.0122 1280 2970
Boron 5 B 10.81 2076 3927
Carbon 6 C 12.011 3652 4827
Nitrogen 7 N 14.007 -210 -195.8
Oxygen 8 O 15.999 -219 -183
Fluorine 9 F 18.998 -219.6 -188
Neon 10 Ne 20.180 -249 -246`,
dream:
`A boat beneath a sunny sky,
Lingering onward dreamily
In an evening of July--

Children three that nestle near,
Eager eye and willing ear,
Pleased a simple tale to hear--

Long has paled that sunny sky:
Echoes fade and memories die.
Autumn frosts have slain July.

Still she haunts me, phantomwise,
Alice moving under skies
Never seen by waking eyes.

Children yet, the tale to hear,
Eager eye and willing ear,
Lovingly shall nestle near.

In a Wonderland they lie,
Dreaming as the days go by,
Dreaming as the summers die:

Ever drifting down the stream--
Lingering in the golden gleam--
Life, what is it but a dream?`,
curious:
`So Alice began telling them her
adventures from the time when she first
saw the White Rabbit. She was a little
nervous about it just at first, the two 
creatures got so close to her, one on
each side, and opened their eyes and
mouths so very wide, but she gained
courage as she went on. Her listeners
were perfectly quiet till she got to
the part about her repeating "You are
old, Father William," to the
Caterpillar, and the words all coming
different, and then the Mock Turtle
drew a long breath, and said "That's
very curious."`,
hello:
`print 'Hello world'`,
greet:
`io.write('What is your name? ')
name = io.read()
print('Hello,', name)`
};

// P/ (root dir)
// P/file (contains inode)
// P/dir/ (not yet)
// P:123 (inode contains file contents)
// P.property
function initStorage(storage) {
  if (storage['P/'])
    return; // already initialized
  storage['P/'] = true;
  let next_inode = 0;
  for (let name in files) {
    if (files.hasOwnProperty(name)) {
      storage[`P/${name}`] = next_inode;
      storage[`P:${next_inode}`] = files[name];
      ++next_inode;
    }
  }
  storage['P.next_inode'] = next_inode;
}

const charset = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,16,16,16,0,16,0,0,40,40,0,0,0,0,0,0,40,124,40,40,124,40,0,0,16,60,80,56,20,120,16,0,0,68,8,16,32,68,0,0,32,80,32,84,72,52,0,0,16,16,0,0,0,0,0,0,8,16,16,16,16,16,8,0,32,16,16,16,16,16,32,0,16,84,56,84,16,0,0,0,0,16,16,124,16,16,0,0,0,0,0,0,0,16,32,0,0,0,0,56,0,0,0,0,0,0,0,0,0,16,0,0,0,4,8,16,32,64,0,0,56,76,84,100,68,56,0,0,16,48,16,16,16,56,0,0,56,68,8,16,32,124,0,0,56,68,24,4,68,56,0,0,8,24,40,124,8,8,0,0,124,64,120,4,68,56,0,0,56,64,120,68,68,56,0,0,124,4,8,8,16,16,0,0,56,68,56,68,68,56,0,0,56,68,68,60,4,56,0,0,0,0,16,0,0,16,0,0,0,0,16,0,0,16,32,0,0,8,16,32,16,8,0,0,0,0,124,0,124,0,0,0,0,32,16,8,16,32,0,0,56,68,8,16,0,16,0,0,56,76,84,88,64,56,0,0,56,68,68,124,68,68,0,0,120,68,120,68,68,120,0,0,56,68,64,64,68,56,0,0,120,68,68,68,68,120,0,0,124,64,120,64,64,124,0,0,124,64,120,64,64,64,0,0,56,68,64,76,68,56,0,0,68,68,124,68,68,68,0,0,124,16,16,16,16,124,0,0,60,4,4,4,68,56,0,0,68,72,80,112,72,68,0,0,64,64,64,64,64,124,0,0,68,108,84,84,68,68,0,0,68,100,84,76,68,68,0,0,56,68,68,68,68,56,0,0,120,68,68,120,64,64,0,0,56,68,68,68,72,52,0,0,120,68,68,120,68,68,0,0,60,64,56,4,4,120,0,0,124,16,16,16,16,16,0,0,68,68,68,68,68,56,0,0,68,68,40,40,16,16,0,0,68,84,84,40,40,40,0,0,68,40,16,16,40,68,0,0,68,68,40,16,16,16,0,0,124,8,16,32,64,124,0,0,24,16,16,16,16,16,24,0,0,64,32,16,8,4,0,0,48,16,16,16,16,16,48,0,16,40,0,0,0,0,0,0,0,0,0,0,0,0,124,0,32,16,0,0,0,0,0,0,0,56,4,60,68,60,0,0,64,88,100,68,68,120,0,0,0,56,64,64,68,56,0,0,4,60,68,68,76,52,0,0,0,56,68,124,64,56,0,0,28,32,124,32,32,32,0,0,0,60,68,76,52,4,120,0,64,88,100,68,68,68,0,0,16,0,112,16,16,124,0,0,8,0,56,8,8,8,112,0,64,68,72,112,72,68,0,0,112,16,16,16,16,124,0,0,0,104,84,84,84,68,0,0,0,88,100,68,68,68,0,0,0,56,68,68,68,56,0,0,0,88,100,68,68,120,64,0,0,60,68,68,76,52,4,0,0,88,100,64,64,64,0,0,0,60,64,56,4,120,0,0,16,124,16,16,16,12,0,0,0,68,68,68,76,52,0,0,0,68,68,40,40,16,0,0,0,68,84,84,40,40,0,0,0,68,40,16,40,68,0,0,0,68,68,76,52,4,120,0,0,124,8,16,32,124,0,0,8,16,16,32,16,16,8,0,16,16,16,16,16,16,0,0,32,16,16,8,16,16,32,0,0,0,32,84,8,0,0,0,0,0,0,0,0,0,0,]

const vertexShaderSrc = `
  attribute vec4 a_position;
  attribute vec2 a_texcoord;
  varying vec2 v_texcoord;
  
  void main() {
    gl_Position = vec4(a_position.xy, 0, 1);
    v_texcoord = a_texcoord;
  }
`;

const fragmentShaderSrc = `
  precision mediump float;
  uniform sampler2D u_texture;
  varying vec2 v_texcoord;
  
  void main() {
    float p = mod(texture2D(u_texture, v_texcoord).r*255.0, 64.0);
    float b = mod(p, 4.0); p -= b; p /= 4.0;
    float g = mod(p, 4.0); p -= g; p /= 4.0;
    float r = p;    
    gl_FragColor = vec4(r/3.0, g/3.0, b/3.0, 1);
  }
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    return shader;
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (gl.getProgramParameter(program, gl.LINK_STATUS))
    return program;
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

module.exports = class Phosphor {

  constructor(canvas) {
    const mem = new Uint8Array(0x20000); // 128K

    const storage = window.localStorage;
    initStorage(storage);

    const file_table = [];
    
    const process_table = [];
    let next_pid = 1;
    
    const vc_table = [];
    let esc_vc = 1;
    
    const system = process_table[0] = {
      _: {
        pid: 0,
        ppid: 0,
        program: this,
        main_promise: null, // promise for resolving main
        fd_table: []
      }
    };
    
    let current = null; // current process (can be null)
    let interval = null; // used for update (can be null)
    
    let loaded = null; // name of loaded program (can be null)

    let error = null; // error string (can be null)

    const SPECIAL = {}; // privileged cookie
    
    // -----------------------
    
    const File = class File {
      constructor(inode, mode) {
        this.key = `P:${inode}`;
        this.mode = mode;
        this.offset = 0;
      }
      close() {
        //console.log('File.close', ...args);
      }
      // Returns undefined if error, empty string if eof for 'a', null if not a number for 'n',
      // null for eof
      async read(...args) {
        //console.log('File.read', ...args);
        if (this.mode == 'w' || this.mode == 'a') {
          error = `can't read in ${this.mode == 'w' ? 'write' : 'append'}-only mode`;
          return undefined;
        }
        const fmt = args[0];
        let s = storage[this.key].slice(this.offset);
        if (fmt == 'a') {
          this.offset += s.length;
          return s;
        } else if (s.length == 0) {
          return null; // eof
        } else if (fmt == undefined || fmt == 'l' || fmt == 'L') {
          let i = s.indexOf('\n');
          if (i != -1) {
            (fmt == 'L') ? i++ : this.offset++;
            s = s.slice(0, i);
          }
          this.offset += s.length;
          return s;
        } else if (fmt == 'n') {
          // TODO this needs a better parser: more formats, eat prefix
          let m = /^([ \n]*)/.exec(s);
          if (m) {
            this.offset += m[0].length;
            s = s.slice(m[0].length)
          }
          m = /^([-]?[0-9]+(?:[.][0-9]+)?)/.exec(s);
          if (m == null)
            m = /^([-]?[.][0-9]+)/.exec(s);
          if (m == null) {
            error = 'not a number';
            return null;
          }
          s = m[0];
          this.offset += s.length;
          return parseFloat(s);
        } else if (typeof(fmt) == 'number') {
          // TODO "bad argument #1 to 'read' (number has no integer representation)"
          const n = parseInt(fmt);
          s = s.slice(0, n);
          this.offset += s.length;
          return s;
        } else {
          error = 'bad format specifier';
          return undefined;
        }
        // POSIX returns 0 but string is more useful
      }
      seek(...args) {
        //console.log('File.seek', ...args);
        // TODO handle not enough args?
        const offset = args.shift();
        const whence = args.shift();
        switch (whence) {
          case 'set':
            this.offset = offset;
            break;
          case 'cur':
            this.offset += offset;
            break;
          case 'end':
            this.offset = storage[this.key].length + offset;
            break;
        }
        // TODO handle errors (e.g. offset goes negative)
        return this.offset; // POSIX returns 0 but offset is more useful
      }
      write(...args) {
        //console.log('File.write', ...args);
        if (this.mode == 'r') {
          error = "can't write in read-only mode";
          return undefined;
        }
        const contents = storage[this.key];
        if (this.mode[0] == 'a')
          this.offset = contents.length;
        const written = args.join('');
        const head = contents.slice(0, this.offset);
        const gap = '\0'.repeat(max(this.offset - contents.length, 0));
        const tail = contents.slice(this.offset + written.length);
        storage[this.key] = head + gap + written + tail;
        this.offset += written.length;
        return written.length;
      }
    };

    // -----------------------
    
    // TODO for now load charset here
    for (let i = 0; i < charset.length; ++i) {
      mem[0x9600+i] = charset[i];
    }
    
    // -----------------------
    
    let scale = 3; // TODO scale must be able to change
    
    const spe = {};
    
    function shadowPointerEvent(e) {
      const rect = e.target.getBoundingClientRect();
      spe.x = floor((e.clientX - rect.left) / scale);
      spe.y = floor((e.clientY - rect.top) / scale);
      return spe;
    }

    // -----------------------
    
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);
    const program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);
    
    const positions = [
      -1, 1, // top left
      1, -1, // bottom right
      1, 1, // top right
      -1, 1, // top left
      -1, -1, // bottom left
      1, -1 // bottom right
    ];
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    const texcoords = [
      0, 0, // top left
      1, 1, // bottom right
      1, 0, // top right
      0, 0, // top left
      0, 1, // bottom left
      1, 1 // bottom right
    ];
    const texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
    
    const texcoordLocation = gl.getAttribLocation(program, 'a_texcoord');
    gl.enableVertexAttribArray(texcoordLocation);
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);
    
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0);
    
    canvas.style.outline = 'none'; // no focus outline
    canvas.setAttribute('tabindex', '0'); // allow focus
    canvas.focus();
    
    let frames = 0;
    let framesNow = performance.now();
    let updates = 0;
    let updatesNow = performance.now();
    
    const draw = () => {
      const program = current && current._.program;
      if (program && program.draw) {
        program.draw();
      } else {
        for (let i = 0; i < 38400; ++i) {
          mem[i] = floor(random()*64);
        }
      }
      
      gl.texImage2D(gl.TEXTURE_2D, texture, gl.LUMINANCE, 240, 160, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, mem);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      
      ++frames;
      const now = performance.now();
      if (framesNow + 1000 <= now) {
        console.log('fps: ' + frames);
        frames = 0;
        framesNow = now;
      }
    }
    
    const update = () => {
      const program = current && current._.program;
      if (program && program.update) {
        program.update();
      }
      
      ++updates;
      const now = performance.now();
      if (updatesNow + 1000 <= now) {
        console.log('ups: ' + updates);
        updates = 0;
        updatesNow = now;
      }
      
      requestAnimationFrame(draw);
    };
    
    canvas.addEventListener('focus', (e) => {
      console.log('focus', e);
    });
    
    canvas.addEventListener('keydown', (e) => {
      if (e.key == 'Escape') {
        system.vc(current == vc_table[0] ? esc_vc : 0);
        return;
      } else if (e.ctrlKey) {
        if (e.altKey) {
          switch (e.code) {
            case 'Backquote': system.vc(0); break;
            case 'Digit1': system.vc(1); break;
            case 'Digit2': system.vc(2); break;
            case 'Digit3': system.vc(3); break;
            case 'Digit4': system.vc(4); break;
            case 'Digit5': system.vc(5); break;
            case 'Digit6': system.vc(6); break;
            case 'Digit0': system.vc(10); break;
          }
        }
        return;
      }
      const program = current && current._.program;
      if (program && program.onKeyDown) {
        program.onKeyDown(e);
        requestAnimationFrame(draw);
      }
    });
    
    canvas.addEventListener('pointerdown', (e) => {
      const program = current && current._.program;
      if (program && program.onPointerDown) {
        program.onPointerDown(shadowPointerEvent(e));
        requestAnimationFrame(draw);
      }
    });
    
    //canvas.addEventListener('pointermove', (e) => {
    //  console.log('pointermove', e);
    //});
    
    canvas.addEventListener('pointerup', (e) => {
      const program = current && current._.program;
      if (program && program.onPointerUp) {
        program.onPointerUp(shadowPointerEvent(e));
        requestAnimationFrame(draw);
      }
    });
    
    canvas.addEventListener('resize', (e) => {
      console.log('resize', e);
    });
    
    system.boot = function() {
      system.vc(0);
    };
    
    system.box = function(x, y, w, h, c) {
      for (let i = y; i < y+h; ++i) {
        mem.fill(c, i*240+x, i*240+x+w);
      }
    };
    
    system.char = function(ch, x, y, c1, c2) {
      if (c1 == undefined) c1 = 42; // temp
      if (c2 == undefined) c2 = 21; // temp
      let a = 0x9600 + ch*8;
      for (let i = 0; i < 8; ++i) {
        const b = mem[a++];
        for (let j = 0; j < 6; ++j) {
          mem[(y+i)*240+(x+j)] = ((b&(0x80>>j))!=0) ? c1 : c2;
        }
      }
    };
    
    system.clear = function(c) {
      if (c == undefined)
        c = 0;
      mem.fill(c, 0, 0x9600);
    };
    
    system.close = function() {
      // TODO close file (handle)
    };
    
    system.delete = function(name) {
      // TODO should probably delete name but have refcounted inode
      let inode = storage[`P/${name}`];
      if (inode == undefined) {
        error = 'no such file';
        return -1;
      }
      delete storage[`P/${name}`];
      delete storage[`P:${inode}`];
      return 0;
};
    
    system.error = function() {
      return error;
    };
    
    // load() --> returns loaded name (could be untitled)
    // load(name) --> loads program, returns 0 if successful, -1 if failure
    // load(null) --> unloads back to blank
    system.load = function(name) {
      if (name === null) {
        loaded = null;
        console.log('CLEARED LOADED');
      }
      if (name == undefined) {
        console.log('GETTING LOADED');
        for (let i = 0; !loaded; ++i) {
          console.log('UNTITLED', i);
          let name = (i == 0) ? 'untitled' : `untitled-${i}`;
          if (!storage[`P/${name}`])
            loaded = name;
        }
        return loaded;
      }
      // TODO ensure handle empty string or other bad arg
      if (!storage[`P/${name}`])
        return -1;
      loaded = name;
      return 0;
    };
    
    system.ls = function() {
      const list = [];
      for (let key in storage)
        if (storage.hasOwnProperty(key) && /^P\/[^\/]+$/.test(key))
          list.push(key.slice(2));
      return list;
    }
    
    system.open = function(name, mode) {
      //console.log('system.open', name, mode)
      let file;
      if (name === SPECIAL) {
        file = {
          term: mode, // HACK stuff terminal object into file
          async read(...args) {
            return this.term.read(...args);
          },
          write(...args) {
            this.term.write(...args);
            // TODO redraw? only if terminal is in active vc?
            requestAnimationFrame(draw);
          }
        };
      } else {
        if (mode == undefined) {
          mode = 'r';
        } else {
          mode = file_modes[mode];
          if (mode == undefined) {
            error = "bad arg #2 to 'open' (invalid mode)";
            return -1;
          }
        }
        if (/[^a-zA-Z0-9._\-]/.test(name) || name == '') {
          error = "bad arg #1 to open (invalid name)";
          return -1;
        }
        let inode = storage[`P/${name}`];
        if (inode == undefined) {
          if (mode[0] == 'r') {
            error = 'no such file';
            return -1;
          }
          inode = storage['P.next_inode'];
          storage['P.next_inode'] = parseInt(inode) + 1;
          storage[`P:${inode}`] = '';
          storage[`P/${name}`] = inode;
        } else if (mode[0] == 'w') {
          storage[`P:${inode}`] = '';
        }
        file = new File(inode, mode);
      }
      file_table.push(file);
      return this._.fd_table.push(file) - 1;
    };
    
    system.peek = function(addr) {
      return mem[addr];
    };
    
    system.ps = function() {
      console.log('process list', process_table);
    };
    
    system.poke = function(addr, val) {
      // TODO checking
      mem[addr] = val;
    };
    
    system.read = async function(fd, ...args) {
      //console.log('system.read', fd, ...args);
      const file = this._.fd_table[fd];
      return file.read(...args);
    };
    
    // TODO implement this sensibly
    system.rect = function(x, y, w, h, c1, c2) {
      if (c1 != undefined) {
        this.box(x, y, w, h, c1);
      }
      if (c2 != undefined) {
        this.box(x, y, w, 1, c2);
        this.box(x, y, 1, h, c2);
        this.box(x+w-1, y, 1, h, c2);
        this.box(x, y+h-1, w, 1, c2);
      }
    };
    
    system.seek = function(fd, ...args) {
      const file = this._.fd_table[fd];
      return file.seek(...args);
    };
    
    system.spawn = function(...args) {
      console.log('spawn', args);
      const name = args[0];
      const M = require(`./${name}.js`); // TODO does require memoize?
      const program = new M();
      const process = Object.create(this);
      process._ = {
        pid: next_pid++,
        ppid: this._.pid,
        program: program,
        fd_table: []
      };
      process_table[process._.pid] = process;
      program.P = process;
      if (name == 'terminal') {
        // Special case: use self as file descriptors
        process.open(SPECIAL, program); // stdin
        process.open(SPECIAL, program); // stdout
        process.open(SPECIAL, program); // stderr
      } else {
        // Copy file descriptors of parent
        process._.fd_table = this._.fd_table.slice();
      }
      process._.main_promise = new Promise((resolve, reject) => {
        resolve(program.main ? program.main(...args) : 0);
      });
      return process;
    };
    
    system.text = function(str, x, y, c1, c2) {
      if (c1 == undefined) c1 = 42; // temp
      if (c2 == undefined) c2 = 21; // temp
      const W = 6;
      for (let idx = 0; idx != str.length; ++idx, x+=W) {
        let a = 0x9600 + str.charCodeAt(idx)*8;
        for (let i = 0; i < 8; ++i) {
          const b = mem[a++];
          for (let j = 0; j < W; ++j) {
            mem[(y+i)*240+(x+j)] = ((b&(0x80>>j))!=0) ? c1 : c2;
          }
        }
      }
    };
    
    system.vc = function(id) {
      console.log('vc', id);
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      if (current && current._.program.onSuspend)
        current._.program.onSuspend();
      if (!vc_table[id]) {
        switch (id) {
          case 0: vc_table[id] = system.spawn('terminal', 'login'); break;
          case 1: vc_table[id] = system.spawn('code-editor'); break;
          case 2: vc_table[id] = system.spawn('sprite-editor'); break;
          case 3: vc_table[id] = system.spawn('palette'); break;
          case 4: vc_table[id] = system.spawn('prog-around'); break;
          case 5: vc_table[id] = system.spawn('prog-sideways'); break;
          case 6: vc_table[id] = system.spawn('char-editor'); break;
          case 10: vc_table[id] = system.spawn('terminal'); break;
        }
      }
      current = vc_table[id];
      if (id != 0)
        esc_vc = id;
      if (current._.program.onResume)
        current._.program.onResume();
      if (current._.program.update) {
        // TODO reckon time of next update and use timer not interval
        interval = setInterval(update, 1000/58);
      } else {
        requestAnimationFrame(draw);
      }
    };
    
    system.write = function(fd, ...args) {
      //console.log('system.write', fd, ...args);
      const file = this._.fd_table[fd];
      return file.write(...args);
    };
    
    system.boot();
  }

};
