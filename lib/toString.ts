import * as m from './model'
import {posix as path} from 'path'

export function typeToString(type: m.OpenType): string {
  if ((<m.Type>type).typeKind) {
    switch ((<m.Type>type).typeKind) {
      case m.TypeKind.FUNCTION:
        return functionTypeToString(<m.FunctionType>type)
      case m.TypeKind.CLASS:
        return classToString(<m.Class>type)
      case m.TypeKind.INTERFACE:
        return interfaceToString(<m.Interface>type)
      case m.TypeKind.TUPLE:
        return tupleTypeToString(<m.TupleType>type)
      case m.TypeKind.UNION:
        return unionTypeToString(<m.UnionType>type)
      case m.TypeKind.PRIMITIVE:
        return primitiveTypeToString(<m.PrimitiveType>type)
    }
  } else {
    let typeParameter = <m.TypeParameter<any>> type
    return '@' + typeParameter.name
  }
}

export function typeContainerToString(typeContainer: m.TypeContainer): string {
  let str = typeContainer.name
  while (typeContainer.typeContainerKind === m.TypeContainerKind.NAMESPACE) {
    typeContainer = (<m.Namespace>typeContainer).parent
    if (typeContainer.name !== '') {
      str = typeContainer.name + ':' + str
    }
  }
  return str
}

export function classConstructorToString(classConstructor: m.ClassConstructor): string {
  return typeContainerToString(classConstructor.parent) + ':' + classConstructor.name
}

export function interfaceConstructorToString(interfaceConstructor: m.InterfaceConstructor): string {
  return typeContainerToString(interfaceConstructor.parent) + ':' + interfaceConstructor.name
}

export function primitiveTypeToString(type: m.PrimitiveType): string {
  switch (type.primitiveTypeKind) {
    case m.PrimitiveTypeKind.STRING:
      return 'string'
    case m.PrimitiveTypeKind.BOOLEAN:
      return 'boolean'
    case m.PrimitiveTypeKind.NUMBER:
      return 'number'
    case m.PrimitiveTypeKind.ANY:
      return 'any'
  }
}

export function functionTypeToString(type: m.FunctionType): string {
  let str = '('
  if (type.parameters.length > 0) {
    str += `${type.parameters[0].name}:${typeToString(type.parameters[0].type) }`
    for (let i = 1; i < type.parameters.length; i++) {
      str += `,${type.parameters[0].name}:${typeToString(type.parameters[0].type) }`
    }
  }
  return str + `)=>(${type.type ? typeToString(type.type) : 'void'})`
}

export function tupleTypeToString(type: m.TupleType): string {
  let str = '['
  str += typeToString(type.elements[0])
  for (let i = 1; i < type.elements.length; i++) {
    str += ',' + typeToString(type.elements[i])
  }
  return str + ']'
}

export function unionTypeToString(type: m.UnionType): string {
  let str = typeToString(type.types[0])
  for (let i = 1; type.types.length; i++) {
    str += '|' + typeToString(type.types[i])
  }
  return str
}

function typeArgsToString(typeArgs: m.OpenType[]): string {
  if (typeArgs && typeArgs.length > 0) {
    let str = '<'
    str += typeToString(typeArgs[0])
    for (let i = 1; i < typeArgs.length; i++) {
      str += ',' + typeToString(typeArgs[i])
    }
    return str + '>'
  } else {
    return ''
  }
}

export function classToString(type: m.Class): string {
  let str = classConstructorToString(type.typeConstructor)
  str += typeArgsToString(type.typeArguments)
  return str
}

export function interfaceToString(type: m.Interface): string {
  let str = interfaceConstructorToString(type.typeConstructor)
  str += typeArgsToString(type.typeArguments)
  return str
}
