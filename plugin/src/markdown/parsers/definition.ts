import type { CodeFiles, Platform } from '@/types'
import JSON5 from 'json5'

export type DemoLanguage = 'vue' | 'react' | 'html'
export interface SourceLocation { file: string, line?: number }
export interface DemoAttribute {
  name: string
  rawValue: string
  bound: boolean
  location: SourceLocation
}
export interface DemoDefinition {
  entries: Partial<Record<DemoLanguage, string>>
  files: Partial<Record<DemoLanguage, CodeFiles>>
  platforms: { stackblitz?: boolean | Platform, codesandbox?: boolean | Platform }
  ssg?: boolean
  wrapperComponentName?: string
  placeholderComponentName?: string
  props: Record<string, unknown>
  locations: Record<string, SourceLocation>
  location: SourceLocation
}

export function demoError(location: SourceLocation, attribute: string, message: string): never {
  throw new Error(`[vitepress-demo] ${location.file}${location.line ? `:${location.line}` : ''} (${attribute}): ${message}`)
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function literal(attribute: DemoAttribute): unknown {
  if (attribute.rawValue.trim() === 'undefined')
    return undefined
  try {
    return JSON5.parse(attribute.rawValue)
  }
  catch {
    return demoError(attribute.location, attribute.name, 'Expected a literal value; variables and JavaScript expressions are not supported.')
  }
}

export function defineDemo(attributes: DemoAttribute[], location: SourceLocation): DemoDefinition {
  const demo: DemoDefinition = {
    entries: {},
    files: {},
    platforms: {},
    props: {},
    locations: Object.create(null),
    location,
  }
  // Resolve overrides before validation: only the effective value matters.
  const knownNames = new Set([
    'vueFiles',
    'reactFiles',
    'htmlFiles',
    'codeFold',
    'codeMeta',
    'vueMeta',
    'reactMeta',
    'htmlMeta',
    'wrapperComponentName',
    'placeholderComponentName',
    'htmlWriteWay',
  ])
  const effective = new Map(attributes.map((attribute) => {
    const camelName = attribute.name.replace(/-([a-z0-9])/gi, (_, char: string) => char.toUpperCase())
    // Normalize plugin options while keeping custom data-/aria- attributes intact.
    const name = knownNames.has(camelName) ? camelName : attribute.name
    return [name, { ...attribute, name }] as const
  }))
  for (const [name, attribute] of effective) {
    demo.locations[name] = attribute.location
    let value = attribute.bound ? literal(attribute) : attribute.rawValue
    if (!attribute.bound && ['ssg', 'codeFold', 'stackblitz', 'codesandbox'].includes(name)) {
      const lowered = attribute.rawValue.trim().toLowerCase()
      if (['true', '1', 'yes'].includes(lowered))
        value = true
      else if (['false', '0', 'no'].includes(lowered))
        value = false
      else if ((name === 'ssg' || name === 'codeFold') && /^-?\d+(?:\.\d+)?$/.test(lowered))
        value = Boolean(Number(lowered))
    }
    const fail = (message: string) => demoError(attribute.location, name, message)
    if (name === 'vue' || name === 'react' || name === 'html') {
      if (typeof value !== 'string' || !value.trim())
        fail('Expected a non-empty file path.')
      demo.entries[name] = value as string
    }
    else if (name === 'vueFiles' || name === 'reactFiles' || name === 'htmlFiles') {
      const files = attribute.bound ? value : literal(attribute)
      const validPath = (item: unknown) => typeof item === 'string' && item.trim().length > 0
      if (!(Array.isArray(files) ? files.every(validPath) : isRecord(files) && Object.values(files).every(validPath)))
        fail('Expected string[] or Record<string, string> containing non-empty file paths.')
      demo.files[name.slice(0, -5) as DemoLanguage] = files as CodeFiles
    }
    else if (name === 'stackblitz' || name === 'codesandbox') {
      if (typeof value !== 'boolean' && !isRecord(value))
        fail('Expected a boolean or platform object.')
      if (isRecord(value)) {
        if ('show' in value && typeof value.show !== 'boolean')
          fail('Platform show must be a boolean.')
        if ('templates' in value && (!Array.isArray(value.templates) || !value.templates.every(template =>
          isRecord(template) && typeof template.scope === 'string' && isRecord(template.files)
          && Object.values(template.files).every(file => typeof file === 'string')))) {
          fail('Platform templates must contain a scope string and a files map of strings.')
        }
      }
      demo.platforms[name] = value as boolean | Platform
    }
    else if (name === 'wrapperComponentName' || name === 'placeholderComponentName') {
      if (typeof value !== 'string' || !/^[a-z][\w.-]*$/i.test(value))
        fail('Expected a component name.')
      demo[name] = value as string
    }
    else if (name === 'ssg' || name === 'codeFold') {
      if (typeof value === 'number')
        value = Boolean(value)
      if (value !== undefined && typeof value !== 'boolean')
        fail('Expected a boolean.')
      if (name === 'ssg')
        demo.ssg = value as boolean | undefined
      else
        demo.props.codeFold = value
    }
    else {
      if (['title', 'description', 'order', 'select', 'github', 'gitlab', 'scope', 'htmlWriteWay', 'background', 'codeMeta', 'vueMeta', 'reactMeta', 'htmlMeta'].includes(name)
        && typeof value !== 'string') {
        fail('Expected a string.')
      }
      if (name === 'select' && !['vue', 'react', 'html'].includes(value as string))
        fail('Expected vue, react or html.')
      if (name === 'htmlWriteWay' && !['write', 'srcdoc'].includes(value as string))
        fail('Expected write or srcdoc.')
      Object.defineProperty(demo.props, name, { value, enumerable: true, configurable: true })
    }
  }
  return demo
}
