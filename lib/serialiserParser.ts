import * as m from './model'

export function stringifyModuleReplacer(key: string, value: any): any {
  if (key === 'typeKind') {
    switch (<m.TypeKind>value) {
      case m.TypeKind.PRIMITIVE:
        return 'PRIMITIVE'
      case m.TypeKind.ENUM:
        return 'ENUM'
      case m.TypeKind.TYPE_QUERY:
        return 'TYPE_QUERY'
      case m.TypeKind.FUNCTION:
        return 'FUNCTION'
      case m.TypeKind.TUPLE:
        return 'TUPLE'
      case m.TypeKind.UNION:
        return 'UNION'
      case m.TypeKind.COMPOSITE:
        return 'COMPOSITE'
      case m.TypeKind.INTERFACE:
        return 'INTERFACE'
      case m.TypeKind.CLASS:
        return 'CLASS'
    }
    return undefined
  } else {
    return value
  }
}

export function parseModuleReplacer(key: string, value: any): any {
  if (key === 'typeKind') {
    switch ((<string>value).toUpperCase()) {
      case 'PRIMITIVE':
        return m.TypeKind.PRIMITIVE
      case 'ENUM':
        return m.TypeKind.ENUM
      case 'TYPE_QUERY':
        return m.TypeKind.TYPE_QUERY
      case 'FUNCTION':
        return m.TypeKind.FUNCTION
      case 'TUPLE':
        return m.TypeKind.TUPLE
      case 'UNION':
        return m.TypeKind.UNION
      case 'COMPOSITE':
        return m.TypeKind.COMPOSITE
      case 'INTERFACE':
        return m.TypeKind.INTERFACE
      case 'CLASS':
        return m.TypeKind.CLASS
      default:
        throw new Error('Unrecognised typeKind value: ' + value)
    }
  } else {
    return value
  }
}

export function stringifyModules(mods: m.Map<m.RawTypeContainer>): string {
  return JSON.stringify(mods, stringifyModuleReplacer, '  ')
}

export function stringifyModule(mod: m.RawTypeContainer): string {
  return JSON.stringify(mod, stringifyModuleReplacer, '  ')
}

export function parseModules(modsString: string): m.Map<m.RawTypeContainer> {
  return <m.Map<m.RawTypeContainer>>JSON.parse(modsString, parseModuleReplacer)
}

export function parseModule(modString: string): m.RawTypeContainer {
  return <m.RawTypeContainer>JSON.parse(modString, parseModuleReplacer)
}
