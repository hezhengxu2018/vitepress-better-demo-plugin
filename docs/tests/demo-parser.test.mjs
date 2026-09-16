/* eslint-disable test/no-import-node-test -- Use the built-in runner without another test framework. */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { after, test } from 'node:test'
import container from 'markdown-it-container'
import { createMarkdownRenderer } from 'vitepress'
import { createDemoContainer, vitepressDemoPlugin } from 'vitepress-better-demo-plugin'

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'demo-parser-'))
const demoDir = path.join(root, 'en/demos')
fs.mkdirSync(path.join(demoDir, 'query-form-item'), { recursive: true })
const entry = 'query-form-item/transfer-clear-on-data-change.vue'
const helper = 'query-form-item/mock-user-request.ts'
const sources = {
  [entry]: '<template><div>Preview</div></template>',
  [helper]: 'export const users = []',
  'empty.ts': '',
  '__under_score__.ts': 'export const markdown = true',
  'owner\'s.ts': 'export const owner = true',
  'a&b.ts': 'export const amp = true',
}
for (const [filename, code] of Object.entries(sources))
  fs.writeFileSync(path.join(demoDir, filename), code)
after(() => fs.rmSync(root, { recursive: true, force: true }))

async function renderer(reverse = false, config = {}) {
  const md = await createMarkdownRenderer(root)
  const options = { demoDir, autoImportWrapper: false, ...config }
  const plugins = [
    () => md.use(container, 'demo', createDemoContainer(md, options)),
    () => md.use(vitepressDemoPlugin, options),
  ]
  for (const install of reverse ? plugins.reverse() : plugins)
    install()
  return md
}
const md = await renderer()
function render(source, renderer = md) {
  const env = { path: path.join(root, 'guide/example.md'), sfcBlocks: { scripts: [] } }
  const html = renderer.render(source, env)
  const files = [...html.matchAll(/\sfiles="([^"]+)"/g)].map(match => JSON.parse(decodeURIComponent(match[1])))
  return { html, files, script: env.sfcBlocks.scripts.map(script => script.content).join('\n') }
}
function block(body, info = '') {
  return `:::demo ${info}\n${body}\n:::`
}
const filesAttr = `:vueFiles="['${entry}', '${helper}']"`

test('both public syntaxes produce the same preview and file data', () => {
  const html = render(`<demo vue="${entry}" ${filesAttr} />`)
  const fenced = render(block(`vue="${entry}"\n${filesAttr}`))
  assert.deepEqual(fenced.files, html.files)
  assert.equal(fenced.html, html.html)
  assert.equal(fenced.script, html.script)
  assert.match(fenced.html, /#vue/)
})

test('the reported input works with blank lines and relative file paths', () => {
  const result = render(block(`\nquery-form-item/transfer-clear-on-data-change\n\n:vueFiles="['../../en/demos/${entry}', '../../en/demos/${helper}']"\n`))
  assert.equal(Object.keys(result.files[0].vue).length, 2)
  assert.match(result.script, /transfer-clear-on-data-change.vue/)
})

test('space syntax, same-line attributes, object aliases and trailing commas', () => {
  const result = render(block(`vue ${entry}\ntitle="Example" description="Two files"\n:vueFiles="{\n 'Demo.vue': '${entry}',\n 'users.ts': '${helper}',\n}"`))
  assert.deepEqual(Object.keys(result.files[0].vue), ['Demo.vue', 'users.ts'])
})

test('multiline double quoted JSON and unquoted structured values', () => {
  for (const value of [`'${JSON.stringify([entry, helper], null, 2)}'`, `[\n '${entry}',\n '${helper}',\n]`]) {
    const result = render(block(`${entry}\n:vueFiles=${value}`))
    assert.equal(Object.keys(result.files[0].vue).length, 2)
  }
})

test('literal strings, escapes and Markdown punctuation survive', () => {
  const result = render(block(`${entry}\n:vueFiles='["__under_score__.ts", "owner\\\'s.ts", "a&b.ts"]'\ndescription="*bold* [link](url) &quot;"`))
  assert.deepEqual(Object.keys(result.files[0].vue), ['__under_score__.ts', 'owner\'s.ts', 'a&b.ts'])
  assert.match(result.html, /\*bold\* \[link\]\(url\) &amp;quot;/)
})

test('HTML entities decode once while container values stay literal', () => {
  const html = render(`<demo vue="${entry}" description="&amp;quot; &apos; &#x41;" ${filesAttr} />`).html
  assert.match(html, /&amp;quot; &#39; A/)
  const fenced = render(block(`${entry}\ndescription="&amp;quot;"`)).html
  assert.match(fenced, /&amp;amp;quot;/)
})

test('empty files retain tabs', () => {
  const result = render(block(`${entry}\n:vueFiles="['empty.ts']"`))
  assert.equal(result.files[0].vue['empty.ts'].code, '')
})

test('explicit entry and description override shorthand and header; last attribute wins', () => {
  const result = render(block(`does-not-exist\nvue="${entry}"\ndescription="first"\ndescription=""`, 'Header description'))
  assert.match(result.html, /&quot;description&quot;:&quot;&quot;/)
  assert.doesNotMatch(result.script, /does-not-exist/)
})

test('container source survives lists and blockquotes', () => {
  const source = block(`${entry}\n\n${filesAttr}`)
  for (const wrapped of [
    source.split('\n').map(line => `> ${line}`).join('\n'),
    source.split('\n').map((line, i) => `${i ? '  ' : '- '}${line}`).join('\n'),
    source.split('\n').map((line, i) => `> ${i ? '  ' : '- '}${line}`).join('\n'),
    source.split('\n').map((line, i) => `${i ? '  ' : '- '}> ${line}`).join('\n'),
  ]) {
    assert.equal(Object.keys(render(wrapped).files[0].vue).length, 2, wrapped)
  }
})

test('both registration orders and multiple demos are independent', async () => {
  const reverse = await renderer(true, { stackblitz: { show: false } })
  const source = `${block(`${entry}\n:stackblitz="true"\n${filesAttr}`)}\n\n${block(`${entry}\n${filesAttr}`)}`
  const result = render(source, reverse)
  assert.equal(result.files.length, 2)
  assert.deepEqual([...result.html.matchAll(/stackblitz="([^"]+)"/g)].map(match => JSON.parse(decodeURIComponent(match[1])).show), [true, false])
})

test('unknown literal props and undefined remain supported', () => {
  const result = render(block(`${entry}\n:data="{ enabled: true, count: 2 }"\n:optional="undefined"`))
  assert.match(result.html, /&quot;enabled&quot;:true/)
  assert.doesNotMatch(result.html, /&quot;optional&quot;/)
})

test('strict errors contain source and attribute', () => {
  const invalid = [
    [':vueFiles="files"', 'vueFiles'],
    [':vueFiles="[1]"', 'vueFiles'],
    [':vueFiles="null"', 'vueFiles'],
    [':vueFiles="{ bad: false }"', 'vueFiles'],
    [':vueFiles="[\'a.ts\'"', 'vueFiles'],
    ['title="unfinished', 'title'],
    [':title="123"', 'title'],
    [':stackblitz="{show: 1}"', 'stackblitz'],
    [':foo="globalThis.sideEffect = true"', 'foo'],
  ]
  for (const [attr, name] of invalid) {
    assert.throws(() => render(block(`${entry}\n${attr}`)), error => error.message.includes('example.md:3') && error.message.includes(`(${name})`), attr)
  }
})

test('missing and unreadable paths fail instead of removing tabs', () => {
  for (const file of ['missing.ts', 'query-form-item']) {
    assert.throws(() => render(block(`${entry}\n:vueFiles="['${file}']"`)), error =>
      error.message.includes('(vueFiles)') && error.message.includes(path.join(demoDir, file)))
  }
  assert.throws(() => render('<demo vue="missing.vue" />'), /\(vue\).*missing.vue/)
})

test('nested demo containers fail explicitly', () => {
  assert.throws(() => render(`::::demo\n${entry}\n:::demo\n${entry}\n:::\n::::`), /Nested demo containers/)
})

test('unrelated containers and commented HTML demos are left alone', () => {
  assert.doesNotThrow(() => render(':::demonstration\nhello\n:::'))
  assert.equal(render('<!-- <demo vue="missing.vue" /> -->').files.length, 0)
})

test('multiple HTML demos inside one block preserve surrounding HTML', () => {
  const result = render(`<section>\n<demo\n vue="${entry}"\n ${filesAttr}\n/>\n<demo\n vue="${entry}"\n ${filesAttr}\n></demo>\n</section>`)
  assert.equal(result.files.length, 2)
  assert.match(result.html, /^<section>/)
  assert.match(result.html, /<\/section>/)
  assert.doesNotMatch(result.html, /<\/demo>/)
})

test('HTML invalid attributes fail with the same diagnostics', () => {
  for (const attr of [':vueFiles="[false]"', ':vueFiles="files"', 'title="unfinished'])
    assert.throws(() => render(`<demo vue="${entry}" ${attr} />`), /example.md:1.*\((?:vueFiles|title)\)/)
})

test('v-bind, unbound file lists and special alias keys work', () => {
  for (const attr of [
    `v-bind:vueFiles="['${helper}']"`,
    `vueFiles="['${helper}']"`,
    `:vueFiles="{'__proto__': '${helper}'}"`,
  ]) {
    const result = render(block(`${entry}\n${attr}`))
    assert.equal(Object.values(result.files[0].vue)[0].code, sources[helper])
  }
})

test('paths use realPath when demoDir is unset', async () => {
  const local = await renderer(false, { demoDir: undefined })
  const env = { path: path.join(root, 'rewritten.md'), realPath: path.join(demoDir, 'index.md'), sfcBlocks: { scripts: [] } }
  const result = local.render(block(`${entry}\n${filesAttr}`), env)
  assert.match(result, /mock-user-request.ts/)
})

test('upstream SSG defaults and per-demo overrides survive the parser split', async () => {
  for (const useContainer of [false, true]) {
    const source = attr => useContainer ? block(`${entry}\n${attr}`) : `<demo vue="${entry}" ${attr} />`
    const ssg = await renderer(false, { ssg: true })
    const enabled = render(source(''), ssg)
    assert.doesNotMatch(enabled.html, /ClientOnly|placeholder_visible|null/)
    assert.doesNotMatch(enabled.script, /await import/)
    assert.match(enabled.script, /import Temp.*Ssg from/)
    const disabled = render(source('ssg="false"'), ssg)
    assert.match(disabled.html, /ClientOnly/)
    assert.match(disabled.script, /await import/)
    assert.doesNotMatch(render(source('ssg')).html, /ClientOnly/)
  }
})

test('upstream codeFold defaults, kebab-case overrides and platform booleans work', async () => {
  const configured = await renderer(false, { codeFold: false })
  assert.match(render(block(entry), configured).html, /&quot;codeFold&quot;:false/)
  assert.match(render(block(`${entry}\ncode-fold="true"`), configured).html, /&quot;codeFold&quot;:true/)
  assert.match(render(block(`${entry}\n:codeFold="true"\n:code-fold="false"`), configured).html, /&quot;codeFold&quot;:false/)
  for (const value of ['true', 'yes', '1']) {
    const html = render(`<demo vue="${entry}" stackblitz="${value}" />`).html
    const platform = JSON.parse(decodeURIComponent(/stackblitz="([^"]+)"/.exec(html)[1]))
    assert.equal(platform.show, true)
  }
  assert.throws(() => render(block(`${entry}\n:code-fold="{}"`)), /\(codeFold\).*boolean/)
})

test('upstream highlighting meta precedence and Twoslash slots are retained', async () => {
  const configured = await renderer(false, { codeMeta: 'global', vueMeta: 'language' })
  const seen = []
  configured.renderer.rules.fence = (tokens, index) => {
    seen.push(tokens[index].info.trim())
    return '<pre>highlighted</pre>'
  }
  render(block(entry), configured)
  assert.equal(seen.pop(), 'vue language')
  render(block(`${entry}\ncode-meta="attribute"`), configured)
  assert.equal(seen.pop(), 'vue attribute')
  const twoslash = render(block(`${entry}\ncodeMeta="attribute"\nvue-meta="twoslash"`), configured)
  assert.equal(seen.pop(), 'vue twoslash')
  assert.match(twoslash.html, /<template #code-vue><pre>highlighted<\/pre><\/template>/)
  assert.doesNotMatch(twoslash.html, /data-vp-demo-lang/)
  const multi = render(block(`${entry}\n${filesAttr}\nvue-meta="twoslash"`), configured)
  assert.ok(Object.values(multi.files[0].vue).every(file => file.html === '<pre>highlighted</pre>' && !file.htmlDomKey))
  assert.doesNotMatch(multi.html, /<template #code-vue>/)
})

test('plugin aliases do not rewrite custom data and aria attributes', () => {
  const result = render(block(`${entry}\n:vue-files="['${helper}']"\ndata-label="123"\naria-label="Demo"`))
  assert.equal(Object.keys(result.files[0].vue).length, 1)
  assert.match(result.html, /&quot;data-label&quot;:&quot;123&quot;/)
  assert.match(result.html, /&quot;aria-label&quot;:&quot;Demo&quot;/)
})
