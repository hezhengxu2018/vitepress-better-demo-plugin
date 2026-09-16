import type Token from 'markdown-it/lib/token'
import type { MarkdownRenderer } from 'vitepress'
import type { DemoAttribute, SourceLocation } from './definition'
import { defineDemo, demoError } from './definition'
import { AttributeScanner } from './scanner'

const metadataKey = 'vitepressDemoSource'
const placeholder = 'demo_attr_placeholder'
const installed = new WeakSet<MarkdownRenderer>()

/** Remove the Markdown wrappers seen before the opening fence, not the value text. */
function unwrapLine(line: string, prefix: string) {
  let offset = 0
  const markers = / {0,3}> ?|(?:[-+*]|\d+[.)])\s+|\s+/g
  for (const match of prefix.matchAll(markers)) {
    if (match[0].includes('>')) {
      const quote = /^\s*> ?/.exec(line.slice(offset))
      if (quote)
        offset += quote[0].length
    }
    else {
      let width = match[0].length
      while (width > 0 && /[ \t]/.test(line[offset] || '')) {
        offset++
        width--
      }
    }
  }
  return line.slice(offset)
}

export function installContainerSourceCapture(md: MarkdownRenderer) {
  if (installed.has(md))
    return
  installed.add(md)
  md.renderer.rules[placeholder] = () => ''
  md.core.ruler.after('block', 'vitepress_demo_source', (state) => {
    const lines = state.src.split('\n')
    for (const token of state.tokens) {
      if (token.type !== 'container_demo_open' || !token.map)
        continue
      const [start, end] = token.map
      const fenceOffset = lines[start].indexOf(token.markup)
      const prefix = lines[start].slice(0, fenceOffset)
      const source = lines.slice(start + 1, end).map(line => unwrapLine(line, prefix)).join('\n')
      token.meta = { ...token.meta, [metadataKey]: source }
    }
  })
}

export function parseContainerDemo(source: string, info: string, location: SourceLocation) {
  const attributes: DemoAttribute[] = []
  const description = info.trim().replace(/^demo\b/, '').trim()
  if (description)
    attributes.push({ name: 'description', rawValue: description, bound: false, location })
  const scanner = new AttributeScanner(source, { ...location, line: location.line === undefined ? undefined : location.line + 1 })
  scanner.skipWhitespace()
  const firstStart = scanner.pos
  const firstLine = source.slice(firstStart).split('\n')[0].trim()
  // Only the first non-empty line can be a shorthand Vue entry.
  if (firstLine && !/^(?::|v-bind:)?[A-Z_][\w:-]*(?:\s*=|\s+\S)/i.test(firstLine)) {
    const raw = firstLine.replace(/^(['"])(.*)\1$/, '$2')
    attributes.push({ name: 'vue', rawValue: raw.endsWith('.vue') ? raw : `${raw}.vue`, bound: false, location: scanner.locationAt() })
    scanner.pos += firstLine.length
  }
  while (scanner.pos < source.length) {
    scanner.skipWhitespace()
    if (scanner.pos === source.length)
      break
    const attribute = scanner.readName()
    const afterName = scanner.pos
    // Space-separated values belong to this line; '=' may be surrounded by spaces.
    while (/[ \t]/.test(source[scanner.pos] || ''))
      scanner.pos++
    let rawValue = 'true'
    if (source[scanner.pos] === '=') {
      scanner.pos++
      scanner.skipWhitespace()
      rawValue = scanner.readValue(attribute.name)
    }
    else if (scanner.pos > afterName && source[scanner.pos] && source[scanner.pos] !== '\n') {
      rawValue = scanner.readValue(attribute.name)
    }
    if (scanner.pos < source.length && !/\s/.test(source[scanner.pos]))
      demoError(scanner.locationAt(), attribute.name, 'Expected whitespace between attributes.')
    attributes.push({ ...attribute, rawValue })
  }
  return defineDemo(attributes, location)
}

export function readContainerDemo(tokens: Token[], index: number, location: SourceLocation) {
  const opening = tokens[index]
  let close = index + 1
  while (close < tokens.length && tokens[close].type !== 'container_demo_close') {
    if (tokens[close].type === 'container_demo_open')
      demoError({ ...location, line: tokens[close].map ? tokens[close].map![0] + 1 : location.line }, 'demo', 'Nested demo containers are not supported.')
    close++
  }
  const source = opening.meta?.[metadataKey]
  if (typeof source !== 'string' || close === tokens.length)
    demoError(location, 'demo', 'Container source is unavailable.')
  const definition = parseContainerDemo(source, opening.info, location)
  // Rendering suppression is separate from source extraction and parsing.
  for (let i = index + 1; i < close; i++) {
    tokens[i].type = placeholder
    tokens[i].hidden = true
    tokens[i].children = []
  }
  return definition
}
