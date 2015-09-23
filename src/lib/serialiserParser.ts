import {serializable as m, TypeKind, KeyValue} from './model'

export function stringifyModuleReplacer(key: string, value: any): any {
  if (key === 'typeKind') {
    switch (<TypeKind>value) {
      case TypeKind.PRIMITIVE:
        return 'PRIMITIVE'
      case TypeKind.ENUM:
        return 'ENUM'
      case TypeKind.TYPE_QUERY:
        return 'TYPE_QUERY'
        case TypeKind.TYPE_ALIAS:
          return 'TYPE_ALIAS'
      case TypeKind.FUNCTION:
        return 'FUNCTION'
      case TypeKind.TUPLE:
        return 'TUPLE'
      case TypeKind.UNION:
        return 'UNION'
      case TypeKind.COMPOSITE:
        return 'COMPOSITE'
      case TypeKind.INTERFACE:
        return 'INTERFACE'
      case TypeKind.CLASS:
        return 'CLASS'
      case TypeKind.TYPE_PARAMETER:
        return 'TYPE_PARAMETER'
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
        return TypeKind.PRIMITIVE
      case 'ENUM':
        return TypeKind.ENUM
      case 'TYPE_QUERY':
        return TypeKind.TYPE_QUERY
      case 'FUNCTION':
        return TypeKind.FUNCTION
      case 'TUPLE':
        return TypeKind.TUPLE
      case 'UNION':
        return TypeKind.UNION
      case 'COMPOSITE':
        return TypeKind.COMPOSITE
      case 'INTERFACE':
        return TypeKind.INTERFACE
      case 'CLASS':
        return TypeKind.CLASS
      default:
        throw new Error('Unrecognised typeKind value: ' + value)
    }
  } else {
    return value
  }
}

export function stringifyModules(mods: KeyValue<m.Container>): string {
  return JSON.stringify(mods, stringifyModuleReplacer, '  ')
}

export function stringifyModule(mod: m.Container): string {
  return JSON.stringify(mod, stringifyModuleReplacer, '  ')
}

export function parseModules(modsString: string): KeyValue<m.Container> {
  return <KeyValue<m.Container>>JSON.parse(modsString, parseModuleReplacer)
}

export function parseModule(modString: string): m.Container {
  return <m.Container>JSON.parse(modString, parseModuleReplacer)
}
