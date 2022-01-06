import { Canvas, Numbers, Colors, Random, Noise, UI, Vector, repeat } from "/toolkit/index.js";
// import noise from './../toolkit/noise.js';

let ui = UI.init(true);

ui.resetableInputs([
  ['w', 'number', () => document.documentElement.clientWidth - document.getElementById('ui').clientWidth - 20],
  ['h', 'number', () => document.documentElement.clientHeight - 50],
  ['t', 'range', () => 1, {min: 1, max: 5, step: 0.001}],
  ['seed', 'range', () => (0.48341511178903285 || Math.random()), { min: 0, max: 1, step: 0.001 }],
  ['res', 'range', () => 12, {min: 1, max: 50}],
  ['noiseRes', 'range', () => 15, {min: 1, max: 50}],
  ['showGrid', 'range', () => 1, {min: 0, max: 1}],
  ['steps', 'range', () => 100, { min: 1, max: 100, step: 1 }],
  ['particles', 'range', () => 50, {min: 1, max: 1000}],

])

function clearAndDraw() {
  clear();
  draw();
}

ui.onChange(clearAndDraw);

ui.addButton('Draw', clearAndDraw);


function clear() {
  document.querySelectorAll('.piece').forEach(element => element.remove());
}


class Particle {
  constructor(c, v) {
    this.c = c;
    this.v = v;
  }

  get x() {
    return this.c.x;
  }

  get y() {
    return this.c.y;
  }

  set x(val) {
    this.c.x = val;
  }

  set y(val) {
    this.c.y = val;
  }

  update() {
    this.c.x += this.v[0];
    this.c.y += this.v[1];

    this.v = Vector.v2(0, 0);
  }

  addForce(f) {
    this.v = Vector.v2(this.v.x + f.x, this.v.y + f.y);
  }
}

function draw() {
  const w = ui.getValue('w');
  const h = ui.getValue('h');
  const t = ui.getValue('t');
  const steps = ui.getValue('steps');
  const showGrid = ui.getValue('showGrid') == 1;

  const res = Math.max(1, ui.getValue('res'));
  const noiseRes = Math.max(1, ui.getValue('noiseRes'));
  const particles = ui.getValue('particles');


  const seed = ui.getValue('seed');
  Noise.seed(seed);

  const ctx = Canvas.create2D("", w, h);

  Canvas.drawRect(ctx, [0, 0], w, h, { fill: 'rgba(0,0,0,0)' });

  const angleAt = (x, y, z = t) => Numbers.map(Noise.perlin3(x / noiseRes, y / noiseRes, z), -1, 1, 0, Math.PI * 2);
  const vectorAt = (x, y, z = t) => Vector.fromAngle(angleAt(x, y, z));


  if (showGrid) {
    for(let x = 0; x < Math.floor(w / res); x++) {
      for(let y = 0; y < Math.floor(h / res); y++) {
        const x1 = x * res;
        const y1 = y * res;

        let v = vectorAt(x, y)

        Canvas.drawLine(ctx, [x1, y1], [x1 + v.x * 10, y1 + v.y * 10], {
          stroke: 'white',
          lineWidth: 1,
        });

        //Canvas.drawCircle(ctx, [x1, y1], 1, { fill: Numbers.map(Noise.perlin2(x / 10, y / 10), -1, 1, 0, 1) > 0.5 ? '#fff' : '#000' });
      }
    }
  }

  for (let p = 0; p < particles; p++) {
    let isEven = p % 2 == 0;

    let particle = new Particle(
      Vector.v2(0, isEven ? p : (w/res) - p),
      Vector.v2(0, 0)
    );

    let log = [];

    for (let s = 0; s < steps; s++) {
      const x = particle.x;
      const y = particle.y;


      const f = vectorAt(x, y);

      log.push({ x: particle.x, y: particle.y, w: w/res, h: h/res, fx: f.x, fy: f.y })

      particle.addForce(f);
      particle.update();

      let x2 = particle.x;
      let y2 = particle.y;


      Canvas.drawLine(ctx, [x * res, y * res], [x2 * res, y2 * res], {
        stroke: 'red',
        lineWidth: 5,
      });

      
      if (particle.x > (w / res)) {
        console.log(s, 'hit x > w!');
        particle.x = 1;
      }
      if (particle.y > (h / res)) {
        console.log(s, 'hit y > h!');
        particle.y = 1;
      }

      if (particle.x < 0) {
        console.log(s, 'hit x < 0!');
        particle.x = (w / res) - 1;
      }
      if (particle.y < 0) {
        console.log(s, 'hit y < 0!');
        particle.y = (h / res) - 1;
      }
    }

    console.table(log);
  }
}

draw(document.documentElement.clientWidth, document.documentElement.clientHeight);
