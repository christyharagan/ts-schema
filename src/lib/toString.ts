import {reflective as m, TypeKind, PrimitiveTypeKind, ContainerKind} from './model'

export function typeToString(type: m.Type): string {
    switch ((<m.Type>type).typeKind) {
      case TypeKind.FUNCTION:
        return functionTypeToString(<m.FunctionType>type)
      case TypeKind.CLASS:
        return classToString(<m.Class>type)
      case TypeKind.INTERFACE:
        return interfaceToString(<m.Interface>type)
      case TypeKind.TUPLE:
        return tupleTypeToString(<m.TupleType>type)
      case TypeKind.UNION:
        return unionTypeToString(<m.UnionOrIntersectionType>type)
      case TypeKind.INTERSECTION:
        return intersectionTypeToString(<m.UnionOrIntersectionType>type)
      case TypeKind.PRIMITIVE:
        return primitiveTypeToString(<m.PrimitiveType>type)
      case TypeKind.TYPE_PARAMETER:
        let typeParameter = <m.TypeParameter<any>> type
        return '@' + typeParameter.name
  }
}

export function containerToString(container: m.Container): string {
  let str = container.name
  while (container.containerKind === ContainerKind.NAMESPACE) {
    container = (<m.Namespace>container).parent
    if (container.name !== '') {
      str = container.name + ':' + str
    }
  }
  return str
}

export function typeAliasConstructorToString(typeAliasConstructor: m.TypeAliasConstructor<any>):string {
  return containerToString(typeAliasConstructor.parent) + ':' + typeAliasConstructor.name
}

export function classConstructorToString(classConstructor: m.ClassConstructor): string {
  return containerToString(classConstructor.parent) + ':' + classConstructor.name
}

export function interfaceConstructorToString(interfaceConstructor: m.InterfaceConstructor): string {
  return containerToString(interfaceConstructor.parent) + ':' + interfaceConstructor.name
}

export function primitiveTypeToString(type: m.PrimitiveType): string {
  switch (type.primitiveTypeKind) {
    case PrimitiveTypeKind.STRING:
      return 'string'
    case PrimitiveTypeKind.BOOLEAN:
      return 'boolean'
    case PrimitiveTypeKind.NUMBER:
      return 'number'
    case PrimitiveTypeKind.ANY:
      return 'any'
    case PrimitiveTypeKind.SYMBOL:
      return 'symbol'
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

export function unionTypeToString(type: m.UnionOrIntersectionType): string {
  let str = typeToString(type.types[0])
  for (let i = 1; type.types.length; i++) {
    str += '|' + typeToString(type.types[i])
  }
  return str
}

export function intersectionTypeToString(type: m.UnionOrIntersectionType): string {
  let str = typeToString(type.types[0])
  for (let i = 1; type.types.length; i++) {
    str += '&' + typeToString(type.types[i])
  }
  return str
}

function typeArgsToString(typeArgs: m.Type[]): string {
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
