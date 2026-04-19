'use client'

import { useEffect, useRef, useState } from 'react'

type ShaderId = 1 | 2 | 3 | 4 | 5

const SHADER_NAMES: Record<ShaderId, string> = {
  1: 'INTERFERENCE',
  2: 'HEX_GRID',
  3: 'VOID_NEBULA',
  4: 'DATA_STREAM',
  5: 'AURORA',
}

const VERT = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`

// Shared uniforms across all shaders:
// u_res: vec2 viewport size
// u_mouse: vec2 mouse (0-1, y flipped)
// u_time: float seconds
// u_click: vec2 last click position (0-1)
// u_click_age: float seconds since last click

const FRAGS: Record<ShaderId, string> = {

  // ─── 1: INTERFERENCE ────────────────────────────────────────────────────────
  // Two fixed sources + mouse source create moiré interference. Click adds a
  // radial burst wave that decays over time.
  1: `
precision highp float;
uniform vec2 u_res;
uniform vec2 u_mouse;
uniform float u_time;
uniform vec2 u_click;
uniform float u_click_age;

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float ar = u_res.x / u_res.y;
  vec2 p  = (uv - 0.5) * vec2(ar, 1.0);
  vec2 m  = (u_mouse - 0.5) * vec2(ar, 1.0);
  vec2 s1 = vec2(-0.35, -0.25);
  vec2 s2 = vec2( 0.40,  0.20);

  float w = sin(length(p - m)  * 22.0 - u_time * 2.8)
          + sin(length(p - s1) * 17.0 + u_time * 1.9)
          + sin(length(p - s2) * 19.0 - u_time * 1.4);

  // click ripple
  vec2 cp = (u_click - 0.5) * vec2(ar, 1.0);
  float cd = length(p - cp);
  float ripple = sin(cd * 38.0 - u_click_age * 12.0)
               * exp(-u_click_age * 1.8)
               * exp(-cd * 2.5) * 5.0;
  w = (w + ripple) / 4.0;

  vec3 bg  = vec3(0.040, 0.040, 0.042);
  vec3 red = vec3(1.000, 0.232, 0.232);
  vec3 cyn = vec3(0.404, 0.843, 0.882);
  vec3 col = bg + red * max(0.0,  w) * 0.35
                + cyn * max(0.0, -w) * 0.30;

  gl_FragColor = vec4(col, 1.0);
}`,

  // ─── 2: HEX_GRID ────────────────────────────────────────────────────────────
  // Hexagonal grid. Each cell's edge glows; colour cycles between red and cyan
  // based on distance from mouse. Click sends a pulse wave across the grid.
  2: `
precision highp float;
uniform vec2 u_res;
uniform vec2 u_mouse;
uniform float u_time;
uniform vec2 u_click;
uniform float u_click_age;

vec4 hexCoords(vec2 uv) {
  vec2 r = vec2(1.0, 1.732);
  vec2 h = r * 0.5;
  vec2 a = mod(uv,     r) - h;
  vec2 b = mod(uv - h, r) - h;
  vec2 gv = dot(a, a) < dot(b, b) ? a : b;
  float edge = 0.5 - max(abs(gv.x) * 0.866 + abs(gv.y) * 0.5, abs(gv.y));
  vec2  id   = uv - gv;
  return vec4(gv, id);
}

void main() {
  vec2 uv  = gl_FragCoord.xy / u_res;
  float ar = u_res.x / u_res.y;
  vec2 p   = (uv - 0.5) * vec2(ar, 1.0);
  vec2 m   = (u_mouse - 0.5) * vec2(ar, 1.0);

  float scale = 9.0;
  vec4 hx = hexCoords(p * scale);
  vec2 cell = hx.zw / scale;        // world-space hex centre

  float dm = length(cell - m);      // mouse distance
  float pulse = sin(u_time * 2.5 - dm * 10.0) * 0.5 + 0.5;
  pulse *= exp(-dm * 2.5);

  vec2 cp = (u_click - 0.5) * vec2(ar, 1.0);
  float dc = length(cell - cp);
  float click = sin(dc * 14.0 - u_click_age * 9.0)
              * exp(-u_click_age * 2.0)
              * exp(-dc * 2.0);

  // edge brightness from local gv
  float ed = 0.5 - max(abs(hx.x) * 0.866 + abs(hx.y) * 0.5, abs(hx.y));
  float edge = smoothstep(0.0, 0.06, ed) * (1.0 - smoothstep(0.06, 0.12, ed));
  float fill = smoothstep(0.35, 0.0, length(hx.xy));

  vec3 red = vec3(1.000, 0.232, 0.232);
  vec3 cyn = vec3(0.404, 0.843, 0.882);
  vec3 ec  = mix(cyn, red, pulse + click * 0.4);
  vec3 col = vec3(0.03)
           + ec * edge * (0.5 + pulse * 0.7 + max(0.0, click) * 0.6)
           + cyn * fill * 0.04;

  gl_FragColor = vec4(col, 1.0);
}`,

  // ─── 3: VOID_NEBULA ─────────────────────────────────────────────────────────
  // Fractal brownian motion nebula. Mouse tilts the view. Click creates a
  // brief bright flash at the click point.
  3: `
precision highp float;
uniform vec2 u_res;
uniform vec2 u_mouse;
uniform float u_time;
uniform vec2 u_click;
uniform float u_click_age;

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.35));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i),             hash(i+vec2(1,0)), f.x),
             mix(hash(i+vec2(0,1)),   hash(i+vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p  = p * 2.1 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float t  = u_time * 0.07;
  vec2 m   = u_mouse - 0.5;
  vec2 p   = uv + m * 0.12;

  float n1 = fbm(p * 2.0 + vec2(t,        t * 0.6));
  float n2 = fbm(p * 3.0 + vec2(n1, n1 * 0.5) - vec2(t * 0.4, 0.0));
  float n3 = fbm(p * 1.5 + vec2(n2 * 0.8, n2)  + vec2(0.0, t * 0.25));

  float flash = exp(-length(uv - u_click) * 3.5) * exp(-u_click_age * 3.5);

  vec3 bg  = vec3(0.018, 0.018, 0.025);
  vec3 red = vec3(1.000, 0.232, 0.232);
  vec3 cyn = vec3(0.404, 0.843, 0.882);
  vec3 pur = vec3(0.500, 0.180, 0.800);

  vec3 col = bg;
  col += red * pow(n3, 3.0) * 0.65;
  col += cyn * pow(max(0.0, n1 - 0.38), 2.0) * 0.45;
  col += pur * pow(max(0.0, n2 - 0.48), 2.0) * 0.35;
  col += vec3(1.0, 0.92, 0.75) * flash * 0.9;
  col  = pow(max(col, vec3(0.0)), vec3(0.85));

  gl_FragColor = vec4(col, 1.0);
}`,

  // ─── 4: DATA_STREAM ─────────────────────────────────────────────────────────
  // Vertical columns of glowing "data" lines fall at random speeds. Mouse X
  // attracts streams; nearby columns turn red. Click detonates an explosion.
  4: `
precision highp float;
uniform vec2 u_res;
uniform vec2 u_mouse;
uniform float u_time;
uniform vec2 u_click;
uniform float u_click_age;

float hash(float n) { return fract(sin(n) * 43758.5453); }

void main() {
  vec2 uv  = gl_FragCoord.xy / u_res;
  float ar = u_res.x / u_res.y;

  float cols = 55.0;
  float col  = floor(uv.x * cols);
  float speed  = hash(col)         * 0.7 + 0.35;
  float offset = hash(col + 100.0);
  float len    = hash(col + 200.0) * 0.35 + 0.08;

  float head = mod(offset + u_time * speed * 0.45, 1.2) - 0.1;

  float mcol    = u_mouse.x;
  float colDist = abs(uv.x - mcol) * ar;
  float mi      = exp(-colDist * colDist * 10.0);

  float sp = uv.y - head;

  float glow  = exp(-sp * sp / (len * len) * 1800.0);
  float trail = (sp < 0.0) ? smoothstep(0.0, len, -sp) * exp(sp * 2.5) : 0.0;

  vec2 cp    = u_click;
  float cd   = length(uv - cp) * 2.0;
  float burst = exp(-cd * cd * 2.5) * exp(-u_click_age * 5.0);

  vec3 cyn = vec3(0.404, 0.843, 0.882);
  vec3 red = vec3(1.000, 0.232, 0.232);
  vec3 sc  = mix(cyn, red, hash(col + 300.0) * mi * 1.5);

  vec3 col3 = vec3(0.028);
  col3 += sc  * glow  * (0.9 + mi * 0.7);
  col3 += sc  * trail * 0.12;
  col3 += vec3(1.0, 0.82, 0.6) * burst;

  gl_FragColor = vec4(col3, 1.0);
}`,

  // ─── 5: AURORA ──────────────────────────────────────────────────────────────
  // Horizontal aurora bands built from layered sine noise. Mouse Y shifts band
  // centres; mouse X modulates phase. Click fires a vertical lightning discharge.
  5: `
precision highp float;
uniform vec2 u_res;
uniform vec2 u_mouse;
uniform float u_time;
uniform vec2 u_click;
uniform float u_click_age;

float noise(float x) {
  return sin(x * 1.70) * 0.500
       + sin(x * 3.10 + 0.80) * 0.250
       + sin(x * 7.30 + 2.10) * 0.125
       + sin(x * 13.7 + 4.50) * 0.063;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float t  = u_time * 0.28;
  float mx = u_mouse.x;
  float my = u_mouse.y;

  float warp = noise(uv.x * 3.2 + t + mx * 0.6) * 0.09;
  float y = uv.y + warp;

  vec3 col = vec3(0.018, 0.018, 0.025);

  // Band 0 – cyan
  {
    float ctr = 0.25 + noise(0.0 + t * 0.18 + mx * 0.4) * 0.12 + (my - 0.5) * 0.08;
    float b   = exp(-pow((y - ctr) * 9.0,  2.0)) * (noise(uv.x * 4.0  + t * 1.1) * 0.5 + 0.5);
    col += vec3(0.404, 0.843, 0.882) * b * 0.45;
  }
  // Band 1 – purple
  {
    float ctr = 0.38 + noise(1.4 + t * 0.22 + mx * 0.3) * 0.13 + (my - 0.5) * 0.10;
    float b   = exp(-pow((y - ctr) * 11.0, 2.0)) * (noise(uv.x * 5.5  + t * 0.9) * 0.5 + 0.5);
    col += vec3(0.600, 0.150, 0.900) * b * 0.38;
  }
  // Band 2 – red
  {
    float ctr = 0.50 + noise(2.8 + t * 0.16 + mx * 0.5) * 0.11 + (my - 0.5) * 0.09;
    float b   = exp(-pow((y - ctr) * 10.0, 2.0)) * (noise(uv.x * 6.0  + t * 1.3) * 0.5 + 0.5);
    col += vec3(1.000, 0.232, 0.232) * b * 0.40;
  }
  // Band 3 – teal
  {
    float ctr = 0.63 + noise(4.2 + t * 0.20 + mx * 0.4) * 0.12 + (my - 0.5) * 0.11;
    float b   = exp(-pow((y - ctr) * 8.0,  2.0)) * (noise(uv.x * 3.5  + t * 0.7) * 0.5 + 0.5);
    col += vec3(0.200, 0.800, 0.650) * b * 0.35;
  }
  // Band 4 – amber
  {
    float ctr = 0.76 + noise(5.6 + t * 0.25 + mx * 0.3) * 0.10 + (my - 0.5) * 0.07;
    float b   = exp(-pow((y - ctr) * 12.0, 2.0)) * (noise(uv.x * 7.0  + t * 1.5) * 0.5 + 0.5);
    col += vec3(1.000, 0.580, 0.150) * b * 0.32;
  }

  // Lightning
  float ldx = abs(uv.x - u_click.x);
  float ldy = abs(uv.y - u_click.y);
  float lightning = exp(-ldx * 18.0) * exp(-ldy * 4.0) * exp(-u_click_age * 3.5);
  col += vec3(0.90, 0.95, 1.00) * lightning * 0.9;

  col = pow(max(col, vec3(0.0)), vec3(0.88));
  gl_FragColor = vec4(col, 1.0);
}`,
}

// ─────────────────────────────────────────────────────────────────────────────

function createShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  return s
}

function createProgram(gl: WebGLRenderingContext, fragSrc: string): WebGLProgram {
  const prog = gl.createProgram()!
  gl.attachShader(prog, createShader(gl, gl.VERTEX_SHADER, VERT))
  gl.attachShader(prog, createShader(gl, gl.FRAGMENT_SHADER, fragSrc))
  gl.linkProgram(prog)
  return prog
}

export default function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [shaderId, setShaderId] = useState<ShaderId>(1)

  // Mutable refs — safe to read inside the RAF loop without stale closure issues
  const mouseRef     = useRef({ x: 0.5, y: 0.5 })
  const clickRef     = useRef({ x: 0.5, y: 0.5, age: 999 })
  const shaderIdRef  = useRef<ShaderId>(shaderId)
  const rafRef       = useRef(0)

  useEffect(() => { shaderIdRef.current = shaderId }, [shaderId])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = (canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
    if (!gl) return

    // Full-screen quad
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)

    let prog = createProgram(gl, FRAGS[shaderIdRef.current])
    let currentShader = shaderIdRef.current

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const start = performance.now()
    let clickAge = 999

    const render = () => {
      // Rebuild program if shader switched
      if (shaderIdRef.current !== currentShader) {
        gl.deleteProgram(prog)
        prog = createProgram(gl, FRAGS[shaderIdRef.current])
        currentShader = shaderIdRef.current
      }

      const now   = (performance.now() - start) / 1000
      clickAge = clickRef.current.age + 0.016
      clickRef.current.age = clickAge

      gl.useProgram(prog)

      const a = gl.getAttribLocation(prog, 'a')
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.enableVertexAttribArray(a)
      gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0)

      gl.uniform2f(gl.getUniformLocation(prog, 'u_res'),       canvas.width, canvas.height)
      gl.uniform2f(gl.getUniformLocation(prog, 'u_mouse'),     mouseRef.current.x, mouseRef.current.y)
      gl.uniform1f(gl.getUniformLocation(prog, 'u_time'),      now)
      gl.uniform2f(gl.getUniformLocation(prog, 'u_click'),     clickRef.current.x, clickRef.current.y)
      gl.uniform1f(gl.getUniformLocation(prog, 'u_click_age'), clickRef.current.age)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / window.innerWidth, y: 1 - e.clientY / window.innerHeight }
    }
    const onClick = (e: MouseEvent) => {
      clickRef.current = { x: e.clientX / window.innerWidth, y: 1 - e.clientY / window.innerHeight, age: 0 }
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('click', onClick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('click', onClick)
      gl.deleteProgram(prog)
      gl.deleteBuffer(buf)
    }
  }, []) // runs once; shader swaps happen inside the RAF loop via shaderIdRef

  return (
    <>
      {/* Shader canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ zIndex: -1 }}
      />

      {/* Dark overlay so content stays readable */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0, background: 'rgba(8, 8, 8, 0.74)' }}
      />

      {/* Shader selector — floats above AudioPlayerBar (z-50) */}
      <div
        className="fixed right-4 flex flex-col gap-1.5"
        style={{ bottom: '88px', zIndex: 51 }}
      >
        {([1, 2, 3, 4, 5] as ShaderId[]).map((id) => (
          <button
            key={id}
            onClick={() => setShaderId(id)}
            title={SHADER_NAMES[id]}
            className="w-7 h-7 flex items-center justify-center text-xs transition-all duration-150"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              background: shaderId === id ? '#FF3B3B' : '#1c1b1b',
              color:      shaderId === id ? '#410003' : '#67d7e1',
              border:     `1px solid ${shaderId === id ? '#FF3B3B' : '#353534'}`,
              boxShadow:  shaderId === id ? '0 0 8px rgba(255,59,59,0.5)' : undefined,
            }}
          >
            {`0${id}`}
          </button>
        ))}
      </div>
    </>
  )
}
