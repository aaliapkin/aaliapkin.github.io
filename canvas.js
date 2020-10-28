const config = {
    waveSpeed: 1,
    wavesToBlend: 4,
    wavesCount: 30,
    particleLimit: 1000,
    edgeMaxLength: 120,
    colorArray: [
        hexToRgb('1dd3b0'),
        hexToRgb('affc41'),
        hexToRgb('b2ff9e')
    ],
    bgcolor1: hexToRgb('3c1642'),
    bgcolor2: hexToRgb('086375'),
    particleSize: 4,
    bgColors: [
        { c1: { r: 60, g: 22, b: 66 }, c2: { r: 8, g: 99, b: 117 } },
        { c2: { r: 187, g: 148, b: 87 }, c1: { r: 111, g: 29, b: 27 } },
        { c1: { r: 141, g: 153, b: 174 }, c2: { r: 239, g: 35, b: 60 } },
        { c1: { r: 8, g: 99, b: 117 }, c2: { r: 60, g: 22, b: 66 } }
    ],
    shut: true
}

function hexToRgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return r + "," + g + "," + b;
}

class Mouse {

    x = undefined;
    y = undefined;
    dir = true;

    moveListener = (e) => {
        this.x = e.x;
        this.y = e.y;
    }

    outListener = (e) => {
        mouse.x = undefined;
        mouse.y = undefined;
    }

    clickListener = (e) => {
        this.dir = !this.dir;
    }

    init() {
        window.addEventListener('mousemove', this.moveListener);
        window.addEventListener('mouseout', this.outListener);
        window.addEventListener('click', this.clickListener);
    }

    getDist(point) {
        if (mouse.x !== undefined) {
            let mousedist = distance(point, this);
            return mousedist;
        }
        return Infinity;
    }

    getVectorTo(point) {
        return getVectorTo(point, this);
    }

}

const mouse = new Mouse();
mouse.init();

function mapclamp(x, in_start, in_end, out_start, out_end) {
    x = (x === undefined) ? in_end : x;
    x = (x > in_end) ? in_end : x;
    x = (x < in_start) ? in_start : x;
    out = out_start + ((out_end - out_start) / (in_end - in_start)) * (x - in_start);
    return out;
}

function distance(d1, d2 = { x: 0, y: 0 }) {
    return Math.sqrt((d2.x - d1.x) ** 2 + (d2.y - d1.y) ** 2);
}

function getVectorTo(origin, target) {
    const dist = distance(origin, target);
    if (dist === 0) {
        return { x: 0, y: 0 };
    }
    return {
        x: (target.x - origin.x) / dist,
        y: (target.y - origin.y) / dist
    }
}

function mapArrValue(arr, val, max) {
    let interval = max / (arr.length - 1);
    let i = Math.floor(val / interval);
    let w = (val % interval) / interval;
    let smoothstep = 3 * w ** 2 - 2 * w ** 3;
    let ret = arr[i] * (1 - smoothstep) + arr[i + 1] * smoothstep;
    if (ret === NaN) {
        debugger;
    }
    return ret;
}


class waveNoise {
    constructor() {
        this.waveSet = [];
    }
    addWaves(requiredWaves) {
        for (let i = 0; i <= requiredWaves; ++i) {
            let randomAngle = Math.random() * 360;
            this.waveSet.push(randomAngle);
        }
    }
    getWave() {
        let blendedWave = 0;
        for (let e of this.waveSet) {
            blendedWave += Math.sin(e / config.edgeMaxLength * Math.PI);
        }
        return (blendedWave / this.waveSet.length + 1) / 2;
    }
    update() {
        this.waveSet.forEach((e, i) => {
            let r = Math.random() * (i + 1) * config.waveSpeed;
            this.waveSet[i] = (e + r) % 360;
        });
    }
}


class WaveSet {

    constructor(count) {
        this.count = count;
        this.waves = [];

        for (let i = 0; i < this.count; ++i) {
            let wave = new waveNoise();
            wave.addWaves(config.wavesToBlend);
            this.waves.push(wave);
        }
    }

    update() {
        this.waves.forEach(e => { e.update() });
    }

    getWave(i) {
        return this.waves[i].getWave();
    }
}

const waveSet = new WaveSet(config.wavesCount);

class Particle {

    constructor(x, y, animation) {

        this.x = this.startx = x;
        this.y = this.starty = y;

        this.xwave = Math.floor(Math.random() * config.wavesCount);
        this.ywave = Math.floor(Math.random() * config.wavesCount);

        this.dx = Math.random() * 5 - 2.5;
        this.dy = Math.random() * 5 - 2.5;

        this.mass = Math.random();
        this.size = Math.random() * config.particleSize + config.particleSize / 2;
        this.color = Math.floor(Math.random() * config.colorArray.length);
        this.bruh = null;
        this.connections = [];
        this.maxLife = 10 + Math.random() * 20;
        this.life = this.maxLife;
        this.bright = 0;
        this.animation = animation;
    }

    update() {
        // Wandring around start position

        const start = {
            x: this.startx + waveSet.getWave(this.xwave) * 1000 - 500,
            y: this.starty + waveSet.getWave(this.ywave) * 1000 - 500
        };

        //Drag

        this.dx = this.dx * .99;
        this.dy = this.dy * .99;

        // Run from mouse

        let force1 = { x: 0, y: 0 };
        let mousedist = mouse.getDist(this);
        if (mousedist < 300) {
            let force1Module = mapclamp(mousedist, 0, 400, .05, 0);
            let force1dir = mouse.getVectorTo(this);
            if (mouse.dir == true) {
                force1 = {
                    x: force1Module * -force1dir.y + force1Module * force1dir.x,
                    y: force1Module * force1dir.x + force1Module * force1dir.y
                };
            } else {
                force1 = {
                    x: force1Module * force1dir.y + force1Module * force1dir.x,
                    y: force1Module * -force1dir.x + force1Module * force1dir.y
                };
            }
        }

        this.dx += force1.x;
        this.dy += force1.y;

        // Spring to start

        // const factor2 = mapclamp(distance(this, start), 0, 5000, 0, .05) * this.mass;
        // const startv = getVectorTo(this, start);
        // const force2 = {
        //     x: startv.x * factor2,
        //     y: startv.y * factor2
        // };

        // this.dx += force2.x;
        // this.dy += force2.y;

        // Between particles

        let force3 = { x: 0, y: 0 };
        if (this.bruh) {
            let factorn = mapclamp(100 / distance(this, this.bruh), 1, 0, .1, 0);
            let massfactor = this.bruh.mass;
            let vn = getVectorTo(this, this.bruh);
            force3.x = - vn.x * factorn * massfactor;
            force3.y = - vn.y * factorn * massfactor;
            if (force3.x == NaN || force3.y == NaN) {
                debugger;
            }
        }

        this.dx += force3.x;
        this.dy += force3.y;

        // To center         

        // let center = {
        //     x: this.animation.size.cx,
        //     y: this.animation.size.cy
        // };
        // let force4Module = mapclamp(Math.sqrt(distance(this, center)), 500, 0, .3, 0);
        // let force4dir = getVectorTo(this, center);
        // let force4 = {
        //     x: -force4dir.y * force4Module,
        //     y: force4dir.x * force4Module
        // };

        // this.dx += force4.x;
        // this.dy += force4.y;

        this.x += this.dx;
        this.y += this.dy;

        // OMG, What's that
        this.life -= 1 / 60;

        if (this.life > this.maxLife / 2) {
            this.bright = mapclamp(this.life, this.maxLife / 2, this.maxLife, 1, 0) * this.mass;
        }
        if (this.life < this.maxLife / 2) {
            this.bright = mapclamp(this.life, 0, this.maxLife / 2, 0, 1) * this.mass;
        }
        this.bright = Math.max(mapclamp(mouse.getDist(this), 0, 500, .6, 0), this.bright);
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = `rgba(${config.colorArray[this.color]}, ${this.bright})`;
        ctx.fill();
    }

    drawConnections(ctx) {
        for (const { bruh, dist } of this.connections) {
            const weight = mapclamp(dist, 0, this.animation.connectionMaxLength, 1, 0);
            const weight2 = Math.min(this.bright, bruh.bright);
            ctx.strokeStyle = `rgba(${config.colorArray[this.color]}, ${weight * weight2})`;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.bezierCurveTo(
                (bruh.x + 2 * this.x) / 3 + waveSet.getWave(this.ywave) * 100 - 50,
                (bruh.y + 2 * this.y) / 3 + waveSet.getWave(this.xwave) * 100 - 50,
                (2 * bruh.x + this.x) / 3 + waveSet.getWave(bruh.ywave) * 100 - 50,
                (2 * bruh.y + this.y) / 3 + waveSet.getWave(bruh.xwave) * 100 - 50,
                bruh.x,
                bruh.y);
            ctx.stroke();
        }
    }

}


class Animation {

    cnv = null;
    ctx = null;
    size = { w: 0, h: 0, cx: 0, cy: 0 };
    // particle spawn zone, slightly bigger than sreen
    spawn = { x: 0, y: 0, w: 0, h: 0 }; //TODO: remove
    particleCount = 0;
    particles = [];
    grad = config.bgColors[0];
    lastFrameTime = 0;
    fps = 60;
    fpsHistory = [];
    connectionMaxLength = config.edgeMaxLength;

    init() {
        this.createCanvas();
        this.createParticles();
        this.createConnections();
        this.updateAnimation();
    }

    createCanvas() {
        this.cnv = document.createElement(`canvas`);
        this.ctx = this.cnv.getContext(`2d`);
        this.setCanvasSize();
        document.body.appendChild(this.cnv);
        this.cnv.id = 'canvas';
        window.addEventListener(`resize`, () => { this.setCanvasSize() });
        window.addEventListener('scroll', () => { this.updateGradient(); });
    }

    updateGradient = () => {

        let maxy = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        ); // That's horsesh*t! That's incorrect!
        let y = window.pageYOffset;


        let grad = {};
        let colors = config.bgColors;

        for (let prop1 of ['c1', 'c2']) {
            grad[prop1] = {};
            for (let prop2 of ['r', 'g', 'b']) {
                let arr = [];
                for (let i = 0; i < colors.length; ++i) {
                    arr.push(colors[i][prop1][prop2]);
                }
                grad[prop1][prop2] = mapArrValue(arr, y, maxy);
            }
        }
        this.grad = grad;
    }

    createParticles() {
        this.setParticlesCount(this.particleCount)
    }

    createParticle() {
        let x = this.spawn.x + Math.random() * this.spawn.w;
        let y = this.spawn.y + Math.random() * this.spawn.h;
        return new Particle(x, y, this);
    }

    setParticlesCount(count) {
        if (count < 0 || count > config.particleLimit) {
            return;
        }
        this.particleCount = count;
        this.connectionMaxLength = mapclamp(this.particleCount, 20, 400, 5 * config.edgeMaxLength, config.edgeMaxLength);

        if (config.shut !== true) {
            console.log('Setting particles count to ', this.particleCount, ', length of connection to ', this.connectionMaxLength);
        }

        if (this.particles.length > count) {
            this.particles.splice(count - 1, this.particles.length - 1);
        } else if (this.particles.length < count) {
            for (let i = 0; i < count - this.particles.length - 1; ++i) {
                this.particles.push(this.createParticle());
            }
        }
    }

    createConnections() {
        checki: for (let i = 0; i < this.particles.length; ++i) {
            let particle1 = this.particles[i];
            let minDist = Infinity;
            particle1.connections = [];
            for (let j = i + 1; j < this.particles.length; ++j) {
                let particle2 = this.particles[j];
                let dist = distance(particle1, particle2);
                if (dist > this.connectionMaxLength) {
                    continue;
                }
                if (dist < minDist) {
                    particle1.bruh = particle2;
                    particle2.bruh = particle1;
                    minDist = dist;
                }
                if (particle1.connections.length > 4) {
                    continue checki;
                }
                particle1.connections.push({ bruh: particle2, dist: dist });
            }
        }
    }

    updateParticles() {
        for (let i = 0; i < this.particles.length; ++i) {
            if (this.particles[i].life < 0 || this.particles[i].y > this.spawn.h ||
                this.particles[i].x > this.spawn.w || this.particles[i].x < this.spawn.x
                || this.particles[i].y < this.spawn.y) {
                this.particles[i] = this.createParticle();
            }
            this.particles[i].update();
        }
    }

    drawParticles() {
        this.particles.forEach((d) => {
            d.draw(this.ctx);
            d.drawConnections(this.ctx);
        });
    }

    setCanvasSize() {
        this.size.w = this.cnv.width = window.innerWidth;
        this.size.h = this.cnv.height = window.innerHeight;
        this.size.cx = this.size.w / 2;
        this.size.cy = this.size.h / 2;

        const delta = 50;
        this.spawn.x = -delta;
        this.spawn.y = -delta;
        this.spawn.w = this.size.w - this.spawn.x + delta;
        this.spawn.h = this.size.h - this.spawn.y + delta;
    }

    updateCanvas() {

        let sqs = Math.min(this.size.w, this.size.h) / 2;

        const grd = this.ctx.createLinearGradient(
            this.size.cx - sqs,
            this.size.cy - sqs,
            this.size.cx + sqs,
            this.size.cy + sqs
        );

        let col1 = `rgba(${this.grad.c1.r},${this.grad.c1.g},${this.grad.c1.b},1)`;
        let col2 = `rgba(${this.grad.c2.r},${this.grad.c2.g},${this.grad.c2.b},1)`;

        grd.addColorStop(0, col1);
        grd.addColorStop(1, col2);
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(0, 0, this.size.w, this.size.h);
    }

    calculateFps() {
        if (this.lastFrameTime == 0) {
            this.lastFrameTime = Date.now();
        } else {
            this.fpsHistory.push(1 / (Date.now() - this.lastFrameTime) * 1000);
            this.lastFrameTime = Date.now();
            if (this.fpsHistory.length > 20) {
                const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
                const avg = (sum / this.fpsHistory.length) || 0;
                this.fps = avg;
                this.fpsHistory = [];
                this.otimize();
                if (config.shut !== true) {
                    console.log('Animation fps ', this.fps);
                }
            }
        }
    }

    otimize() {
        if (this.fps < 40) {
            this.setParticlesCount(this.particleCount * .8);
        } else if (this.fps > 55) {
            this.setParticlesCount(this.particleCount * 1.2 + 10);
        }
    }

    updateAnimation() {
        waveSet.update();
        this.updateCanvas();
        if (this.particleCount > 0) {
            this.updateParticles();
            this.createConnections();
            this.drawParticles();
        }

        this.calculateFps();

        window.requestAnimationFrame(() => { this.updateAnimation() });
    }

}

window.onload = () => {
    new Animation().init();
};
