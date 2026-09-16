import type { DemoAttribute, SourceLocation } from './definition'
import { demoError } from './definition'

/** Lexical operations only. Each syntax adapter owns its separators and decoding. */
export class AttributeScanner {
  pos = 0
  constructor(readonly source: string, readonly location: SourceLocation) {}

  locationAt(offset = this.pos): SourceLocation {
    return { ...this.location, line: this.location.line === undefined ? undefined : this.location.line + this.source.slice(0, offset).split('\n').length - 1 }
  }

  skipWhitespace() {
    while (/\s/.test(this.source[this.pos] || '') && this.pos < this.source.length)
      this.pos++
  }

  readName(): Pick<DemoAttribute, 'name' | 'bound' | 'location'> {
    const location = this.locationAt()
    const match = /^(:|v-bind:)?([A-Z_][\w:-]*)/i.exec(this.source.slice(this.pos))
    if (!match)
      demoError(location, 'attribute', 'Expected an attribute name.')
    this.pos += match[0].length
    return { name: match[2], bound: !!match[1], location }
  }

  readValue(name: string, html = false): string {
    const start = this.pos
    const location = this.locationAt()
    const opening = this.source[this.pos]
    if (opening === '"' || opening === '\'') {
      this.pos++
      const valueStart = this.pos
      while (this.pos < this.source.length) {
        const char = this.source[this.pos++]
        if (char === '\\') {
          this.pos++
          continue
        }
        if (char === opening)
          return this.source.slice(valueStart, this.pos - 1)
      }
      demoError(location, name, 'Unclosed quoted attribute value.')
    }
    // Unquoted structured container values may span lines.
    if (!html && (opening === '[' || opening === '{')) {
      const stack: string[] = []
      let quote = ''
      while (this.pos < this.source.length) {
        const char = this.source[this.pos++]
        if (quote) {
          if (char === '\\')
            this.pos++
          else if (char === quote)
            quote = ''
          continue
        }
        if (char === '"' || char === '\'') {
          quote = char
        }
        else if (char === '[' || char === '{') {
          stack.push(char === '[' ? ']' : '}')
        }
        else if (char === ']' || char === '}') {
          if (stack.pop() !== char)
            demoError(location, name, 'Mismatched brackets in attribute value.')
          if (!stack.length)
            return this.source.slice(start, this.pos)
        }
      }
      demoError(location, name, 'Unclosed structured attribute value.')
    }
    while (this.pos < this.source.length && !/\s/.test(this.source[this.pos])) {
      if (html && (this.source[this.pos] === '>' || this.source.startsWith('/>', this.pos)))
        break
      this.pos++
    }
    if (start === this.pos)
      demoError(location, name, 'Missing attribute value.')
    return this.source.slice(start, this.pos)
  }
}
