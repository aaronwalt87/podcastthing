/** Controller lifecycle checks; not a substitute for visual browser review. */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const source = fs.readFileSync(new URL('../src/components/ui/ScrollScene.tsx', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX,
} }).outputText

function harness(kind = 'hero') {
  let effect, intersection, top = 80, clock = 0, nextFrame = 1
  const frames = new Map(), values = new Map(), events = new Map()
  // Each query keeps its own change listener for runtime preference tests.
  function media(matches) { return { matches, addEventListener(_, cb) { this.change = cb }, removeEventListener() { this.change = undefined } } }
  const reduced = media(false), wide = media(true)
  const node = {
    dataset: {}, style: { setProperty: (k, v) => values.set(k, v), removeProperty: k => values.delete(k) },
    getBoundingClientRect: () => ({ top, height: 1700 }),
    querySelector: () => ({ getBoundingClientRect: () => ({ top, height: 400 }) }),
  }
  const eventTarget = (prefix) => ({
    addEventListener: (name, cb) => events.set(prefix + name, cb),
    removeEventListener: name => events.delete(prefix + name),
  })
  const document = { hidden: false, ...eventTarget('doc:') }
  const exports = {}
  vm.runInNewContext(compiled, {
    exports, require: name => name === 'react' ? { useRef: () => ({ current: node }), useEffect: cb => { effect = cb } }
      : name === 'react/jsx-runtime' ? { jsx: () => null } : { default: { scene: 'scene' } },
    window: { innerHeight: 900, matchMedia: q => q.includes('reduced') ? reduced : wide, ...eventTarget('win:') },
    document, getComputedStyle: () => ({ getPropertyValue: () => '80px' }),
    requestAnimationFrame: cb => { const id = nextFrame++; frames.set(id, cb); return id },
    cancelAnimationFrame: id => frames.delete(id),
    IntersectionObserver: class { constructor(cb) { intersection = cb } observe() {} disconnect() {} },
    ResizeObserver: class { observe() {} disconnect() {} },
  })
  exports.default({ kind, children: null })
  const cleanup = effect()
  return {
    node, values, frames, reduced, wide, document, cleanup, events,
    scroll(value) { top = value; events.get('win:scroll')() },
    intersect(value) { intersection([{ isIntersecting: value }]) },
    visibility(value) { document.hidden = value; events.get('doc:visibilitychange')() },
    settle(dt = 1000 / 60) {
      let ticks = 0
      while (frames.size && ticks++ < 300) {
        clock += dt
        const pending = [...frames.values()]; frames.clear(); pending.forEach(cb => cb(clock))
      }
      assert(ticks < 300, 'Animation must settle instead of running forever')
    },
  }
}

const h = harness()
assert.equal(h.node.dataset.motion, 'on')
assert.equal(h.values.get('--scene-progress'), '0.0000')
h.scroll(-360); h.settle()
assert.equal(h.values.get('--scene-progress'), '0.5000', 'Midpoint must open the scene halfway')
h.scroll(-2500); h.settle(1000 / 120)
assert.equal(h.values.get('--scene-progress'), '1.0000', 'Fast scroll clamps to end')
h.scroll(120); h.settle()
assert.equal(h.values.get('--scene-progress'), '0.0000', 'Reverse scroll restores the assembly')
h.scroll(-360); h.visibility(true)
assert.equal(h.frames.size, 0, 'Hidden tabs stop scheduled frames')
h.visibility(false); h.settle()
assert.equal(h.values.get('--scene-progress'), '0.5000')
h.intersect(false); h.scroll(-800)
assert.equal(h.frames.size, 0, 'Offscreen scenes do not animate')
h.intersect(true); h.settle()
h.reduced.matches = true; h.reduced.change()
assert.equal(h.node.dataset.motion, 'off')
assert.equal(h.values.has('--scene-progress'), false)
h.scroll(-500); assert.equal(h.frames.size, 0)
h.wide.matches = false; h.reduced.matches = false; h.reduced.change()
h.scroll(765); h.settle()
assert.equal(h.values.get('--scene-progress'), '0.0000', 'Mobile starts when sculpture enters viewport')
h.scroll(140); h.settle()
assert.equal(h.values.get('--scene-progress'), '1.0000', 'Mobile completes without a pin')
h.cleanup(); assert.equal(h.events.size, 0); assert.equal(h.frames.size, 0)
const chapter = harness('chapter'); chapter.scroll(180); chapter.settle()
assert.equal(chapter.values.get('--scene-progress'), '1.0000')
chapter.cleanup()
console.log('Motion controller checks passed: progress, reversal, settling, visibility, reduced motion, mobile, cleanup.')
