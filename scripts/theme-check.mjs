#!/usr/bin/env node

/**
 * Dependency-free theme guardrails. Run with `node scripts/theme-check.mjs`.
 * These inspect source and token contrast; they do not replace browser,
 * keyboard, screen-reader, reflow, or animation testing.
 */
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const css = await readFile(join(root, 'src/app/globals.css'), 'utf8')
const layout = await readFile(join(root, 'src/app/layout.tsx'), 'utf8')
const rootBlock = css.match(/:root\s*\{([\s\S]*?)\}/)?.[1]
assert(rootBlock, 'globals.css must define the canonical :root token set')
const tokens = Object.fromEntries(
  [...rootBlock.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(([, key, value]) => [key, value.trim()])
)

const failures = []
let checks = 0

function check(condition, message) {
  checks += 1
  if (!condition) failures.push(message)
}

function rgb(token, seen = new Set()) {
  const value = tokens[token] ?? token
  if (seen.has(value)) throw new Error(`Circular color token: ${token}`)
  seen.add(value)
  const reference = value.match(/^var\((--[\w-]+)\)$/)
  if (reference) return rgb(reference[1], seen)
  const hex = value.match(/^#([a-f\d]{6}|[a-f\d]{3})$/i)?.[1]
  if (!hex) throw new Error(`Contrast check needs an opaque hex color, got ${token}: ${value}`)
  const expanded = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex
  return expanded.match(/../g).map((c) => parseInt(c, 16) / 255)
}

function luminance(color) {
  const channels = color.map((n) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4))
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

function contrast(foreground, background, minimum = 4.5) {
  try {
    const [a, b] = [luminance(rgb(foreground)), luminance(rgb(background))].sort((x, y) => y - x)
    const ratio = (a + 0.05) / (b + 0.05)
    check(ratio >= minimum, `${foreground} on ${background}: ${ratio.toFixed(2)}:1; needs ${minimum}:1`)
    console.log(`${foreground} on ${background}: ${ratio.toFixed(2)}:1`)
  } catch (error) {
    check(false, error.message)
  }
}

// Each of these colors is used for normal-sized text, not just large headings.
for (const surface of ['--ink-950', '--ink-900', '--ink-850']) {
  for (const ink of ['--paper', '--paper-2', '--paper-3', '--ember']) contrast(ink, surface)
}
contrast('--on-ember', '--ember')
contrast('--ember', '--ink-950', 3) // Shared focus outline.

check(/\[hidden\]\s*\{[^}]*display\s*:\s*none\s*!important/.test(css), '[hidden] must beat display utilities')
check(/:focus-visible/.test(css), 'Visible keyboard focus styles must be present')
check(/prefers-reduced-motion\s*:\s*reduce/.test(css), 'A reduced-motion override must be present')
check(/prefers-contrast\s*:\s*more/.test(css), 'An increased-contrast override must be present')
check(/scroll-padding-top\s*:/.test(css) && /scroll-padding-bottom\s*:/.test(css), 'Fixed header/player need scroll padding')
check(/href="#main"/.test(layout) && /<main\s+id="main"\s+tabIndex=\{-1\}/.test(layout), 'Keep the skip link and focusable main landmark')
check(!/\[style\s*\*=/i.test(css), 'Do not layer palettes with inline-style substring selectors')

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? sourceFiles(path) : /\.(tsx?|css)$/.test(path) ? [path] : []
  }))
  return nested.flat()
}

for (const file of await sourceFiles(join(root, 'src'))) {
  const source = await readFile(file, 'utf8')
  const path = relative(root, file)
  check(!/#(?:00ff41|ff3b3b|67d7e1)\b/i.test(source), `Retired palette found in ${path}`)
  if (path.startsWith('src/components/')) {
    // Components consume CSS tokens. Next metadata/OG images are intentionally
    // outside this check because their output cannot inherit the page's CSS.
    check(!/#[a-f\d]{3,8}\b/i.test(source), `Raw hex color in component ${path}; use a theme token`)
  }
}

if (failures.length) {
  console.error(`\n${failures.length} of ${checks} static theme checks failed:`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  console.log(`\nPassed ${checks} static theme checks. Browser/accessibility verification still required.`)
}
