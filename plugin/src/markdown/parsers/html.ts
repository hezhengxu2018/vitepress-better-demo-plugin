import type { DemoAttribute, DemoDefinition, SourceLocation } from './definition'
import { decodeHTMLAttribute } from 'entities'
import { defineDemo, demoError } from './definition'
import { AttributeScanner } from './scanner'

export const demoTag = /<demo(?=[\s/>])/

export function parseHtmlDemo(content: string, location: SourceLocation) {
  const match = demoTag.exec(content)
  if (!match)
    demoError(location, 'demo', 'Expected a <demo> tag.')
  const scanner = new AttributeScanner(content, location)
  scanner.pos = match.index + 5
  const attributes: DemoAttribute[] = []
  while (scanner.pos < content.length) {
    const before = scanner.pos
    scanner.skipWhitespace()
    if (content.startsWith('/>', scanner.pos) || content[scanner.pos] === '>') {
      const selfClosing = content.startsWith('/>', scanner.pos)
      let end = scanner.pos + (selfClosing ? 2 : 1)
      if (!selfClosing) {
        const closing = /^\s*<\/demo\s*>/.exec(content.slice(end))
        if (closing)
          end += closing[0].length
      }
      return { definition: defineDemo(attributes, location), end }
    }
    if (before === scanner.pos)
      demoError(scanner.locationAt(), 'attribute', 'Expected whitespace between attributes.')
    const attribute = scanner.readName()
    const afterName = scanner.pos
    scanner.skipWhitespace()
    let rawValue = 'true'
    if (content[scanner.pos] === '=') {
      scanner.pos++
      scanner.skipWhitespace()
      rawValue = decodeHTMLAttribute(scanner.readValue(attribute.name, true))
    }
    else {
      scanner.pos = afterName
    }
    attributes.push({ ...attribute, rawValue })
  }
  return demoError(scanner.locationAt(), 'demo', 'Unclosed <demo> tag.')
}

/** An HTML block can contain several demos and ordinary HTML around them. */
export function renderHtmlDemos(content: string, location: SourceLocation, render: (definition: DemoDefinition) => string) {
  let result = ''
  let offset = 0
  while (offset < content.length) {
    const match = demoTag.exec(content.slice(offset))
    if (!match)
      break
    const start = offset + match.index
    result += content.slice(offset, start)
    const demoLocation = {
      ...location,
      line: location.line === undefined ? undefined : location.line + content.slice(0, start).split('\n').length - 1,
    }
    const { definition, end } = parseHtmlDemo(content.slice(start), demoLocation)
    result += render(definition)
    offset = start + end
  }
  return result + content.slice(offset)
}
