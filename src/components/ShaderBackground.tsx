'use client'

import { useEffect, useRef } from 'react'

const VERT = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`

// Dark mode: green phosphor smoke on black
const FRAG_SMOKE = `
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
  return mix(mix(hash(i),           hash(i+vec2(1,0)), f.x),
             mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
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
  float ar = u_res.x / u_res.y;
  vec2 p   = vec2(uv.x * ar, uv.y);
  vec2 m   = vec2(u_mouse.x * ar, u_mouse.y);
  float t  = u_time * 0.055;

  vec2 diff = m - p;
  float md  = length(diff);
  vec2 flow = normalize(diff + 0.0001) * exp(-md * 2.0) * 0.18;

  vec2 q = p + flow;
  float n1 = fbm(q * 1.6 + vec2(t,        t * 0.65));
  float n2 = fbm(q * 2.4 + vec2(n1, n1)  - vec2(t * 0.5, 0.0));
  float smoke = fbm(q * 1.1 + vec2(n2, n1 * 0.7) + vec2(0.0, t * 0.28));

  float glow  = exp(-md * md * 2.2);
  float core  = exp(-md * md * 10.0);

  vec2  cp   = vec2(u_click.x * ar, u_click.y);
  float cd   = length(p - cp);
  float ring = exp(-abs(cd - u_click_age * 1.4) * 9.0) * exp(-u_click_age * 1.6);
  float burst= exp(-cd * 2.0) * exp(-u_click_age * 3.5);

  vec3 bg    = vec3(0.012, 0.016, 0.013);
  vec3 fog   = vec3(0.055, 0.075, 0.055);
  vec3 green = vec3(0.000, 1.000, 0.255);

  vec3 col = mix(bg, fog, pow(smoke, 1.8) * 0.65);
  col += green * glow  * 0.14;
  col += green * core  * smoke * 0.45;
  col += green * ring  * 0.55;
  col += green * burst * 0.80;

  float vign = 1.0 - dot((uv - 0.5) * 1.4, (uv - 0.5) * 1.4);
  col *= clamp(vign, 0.0, 1.0);

  gl_FragColor = vec4(col, 1.0);
}`

// Light mode: cool white base with teal (#0E7490) coastal mist and click bloom
const FRAG_LIGHT = `
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
  return mix(mix(hash(i),           hash(i+vec2(1,0)), f.x),
             mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
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
  float ar = u_res.x / u_res.y;
  vec2 p   = vec2(uv.x * ar, uv.y);
  vec2 m   = vec2(u_mouse.x * ar, u_mouse.y);
  float t  = u_time * 0.032;

  vec2 diff = m - p;
  float md  = length(diff);
  vec2 flow = normalize(diff + 0.0001) * exp(-md * 3.5) * 0.06;

  vec2 q = p + flow;
  float n1 = fbm(q * 1.4 + vec2(t,       t * 0.55));
  float n2 = fbm(q * 2.2 + vec2(n1, n1) - vec2(t * 0.4, 0.0));
  float mist = fbm(q * 0.9 + vec2(n2, n1 * 0.6) + vec2(0.0, t * 0.22));

  float glow  = exp(-md * md * 4.0);
  float core  = exp(-md * md * 18.0);

  vec2  cp    = vec2(u_click.x * ar, u_click.y);
  float cd    = length(p - cp);
  float ring  = exp(-abs(cd - u_click_age * 1.0) * 16.0) * exp(-u_click_age * 2.8);
  float burst = exp(-cd * 6.0) * exp(-u_click_age * 5.5);

  // teal #0E7490 = (0.055, 0.455, 0.565)
  vec3 bg   = vec3(0.975, 0.980, 0.985);
  vec3 haze = vec3(0.880, 0.930, 0.945);
  vec3 teal = vec3(0.055, 0.455, 0.565);

  vec3 col = mix(bg, haze, pow(mist, 2.6) * 0.32);
  col = mix(col, bg + teal * 0.08, glow * 0.20);
  col = mix(col, bg + teal * 0.14, core * 0.25);
  col += teal * ring  * 0.28;
  col += teal * burst * 0.20;

  col = clamp(col, 0.0, 1.0);

  float vign = 1.0 - dot((uv - 0.5) * 1.3, (uv - 0.5) * 1.3);
  col = mix(vec3(0.96, 0.965, 0.97), col, clamp(vign, 0.0, 1.0) * 0.85 + 0.15);

  gl_FragColor = vec4(col, 1.0);
}`

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
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const mouseRef   = useRef({ x: 0.5, y: 0.5 })
  const clickRef   = useRef({ x: 0.5, y: 0.5, age: 999 })
  const lightRef   = useRef(false)
  const rafRef     = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = (canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
    if (!gl) return

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)

    let prog = createProgram(gl, FRAG_SMOKE)
    let activeLight = false

    const applyOverlay = (light: boolean) => {
      if (overlayRef.current) {
        overlayRef.current.style.background = light
          ? 'rgba(240,250,255,0.05)'
          : 'rgba(5,8,5,0.60)'
      }
    }

    // Watch body class for light-mode toggle
    const observer = new MutationObserver(() => {
      lightRef.current = document.body.classList.contains('light-mode')
      applyOverlay(lightRef.current)
    })
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const start = performance.now()

    const render = () => {
      // Switch shader if light mode changed
      if (lightRef.current !== activeLight) {
        gl.deleteProgram(prog)
        prog = createProgram(gl, lightRef.current ? FRAG_LIGHT : FRAG_SMOKE)
        activeLight = lightRef.current
      }

      const now = (performance.now() - start) / 1000
      clickRef.current.age += 0.016

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
      observer.disconnect()
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('click', onClick)
      gl.deleteProgram(prog)
      gl.deleteBuffer(buf)
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ zIndex: -1 }}
      />
      <div
        ref={overlayRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0, background: 'rgba(5,8,5,0.60)' }}
      />
    </>
  )
}
