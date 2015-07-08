import * as s from './schema'

interface _Bindings {
  [name:string]:s.Type
}

interface Bindings {
  parentBindings?: Bindings
  bindings: _Bindings
}

function getBinding(bindings:Bindings, rawRef: s.RawReference):s.Type {
  let binding = bindings.bindings[rawRef.name]
  if (binding) {
    return binding
  } else if (bindings.parentBindings) {
    return getBinding(bindings.parentBindings, rawRef)
  } else {
    return rawRef
  }
}

function _flattenArrayType(bindings:Bindings, arrayType:s.ArrayType): s.ArrayType {
  return {
    typeKind: s.TypeKind.ARRAY,
    element: _flattenType(bindings, arrayType.element)
  }
}

function _flattenTupleType(bindings:Bindings, tupleType:s.TupleType): s.TupleType {
  return {
    typeKind: s.TypeKind.TUPLE,
    elements: tupleType.elements.map(function(type){
      return _flattenType(bindings, type)
    })
  }
}

function _flattenUnionType(bindings:Bindings, unionType:s.UnionType): s.UnionType {
  return {
    typeKind: s.TypeKind.UNION,
    types: unionType.types.map(function(type){
      return _flattenType(bindings, type)
    })
  }
}

function _flattenFunctionType(bindings:Bindings, functionType:s.FunctionType): s.FunctionType {
  let flattenedFunction:s.FunctionType = {
    typeKind: s.TypeKind.FUNCTION,
    parameters: functionType.parameters.map(function(parameter){
      let flattenedParameter:s.Parameter = {
        name: parameter.name,
        type: _flattenType(bindings, parameter.type)
      }
      if (parameter.decorators) {
        flattenedParameter.decorators = parameter.decorators
      }
      return flattenedParameter
    })
  }

  if (functionType.typeParameters) {
    flattenedFunction.typeParameters = functionType.typeParameters.map(function(typeParameter){
      let flattenedTypeParameter: s.TypeParameter = {
        name: typeParameter.name
      }
      if (typeParameter.extends) {
        flattenedTypeParameter.extends = _flattenType(bindings, typeParameter.extends)
      }
      return flattenedTypeParameter
    })
  }

  return flattenedFunction
}

function _flattenClass(bindings:Bindings, cls:s.Class): s.Class {
  return null
}

function _flattenInterface(bindings:Bindings, inter:s.Interface): s.Interface {
  return null
}

function _flattenTypeAlias(bindings:Bindings, typeAlias:s.TypeAlias<any>): s.TypeAlias<any> {
  let flattenedTypeAlias:s.TypeAlias<any> = {
    name: typeAlias.name,
    typeKind:s.TypeKind.ALIAS,
    type:_flattenType(bindings, typeAlias.type),
    container: typeAlias.container
  }
  if (typeAlias.typeParameters) {

  }
  return null
}

function _flattenRefinedType(bindings:Bindings, refinedType:s.RefinedType<any>): s.RefinedType<any> {
  return null
}

function _flattenType(bindings:Bindings, type:s.Type): s.Type {
  switch (type.typeKind) {
    case s.TypeKind.STRING:
    case s.TypeKind.NUMBER:
    case s.TypeKind.BOOLEAN:
    case s.TypeKind.ANY:
      return type
    case s.TypeKind.ARRAY:
      return _flattenArrayType(bindings, <s.ArrayType> type)
    case s.TypeKind.UNION:
      return _flattenUnionType(bindings, <s.UnionType> type)
    case s.TypeKind.TUPLE:
      return _flattenTupleType(bindings, <s.TupleType> type)
    case s.TypeKind.FUNCTION:
      return _flattenFunctionType(bindings, <s.FunctionType> type)
    case s.TypeKind.CLASS:
      return _flattenClass(bindings, <s.Class> type)
    case s.TypeKind.INTERFACE:
      return _flattenInterface(bindings, <s.Interface> type)
    case s.TypeKind.ALIAS:
      return _flattenTypeAlias(bindings, <s.TypeAlias<any>> type)
    case s.TypeKind.REFINED:
      return _flattenRefinedType(bindings, <s.RefinedType<any>> type)
  }
}

export function flattenContainer(container:s.Container, containerKind:s.ContainerKind):s.Container {
  let flattenedInterfaces:s.Interfaces = {}
  let flattenedClasses:s.Classes = {}
  let flattenedAliases:s.TypeAliases = {}
  let flattenedNamespaces:s.Namespaces = {}

  let flattenedContainer:s.Container = {
    containerKind:containerKind,
    name: container.name,
    interfaces:flattenedInterfaces,
    classes:flattenedClasses,
    aliases:flattenedAliases,
    namespaces:flattenedNamespaces
  }

  // Object.keys(container.interfaces).forEach(function(name){
  //   flattenedContainer.interfaces[name] = _flatten({bindings: {}}, container.interfaces[name])
  // })
  // Object.keys(container.classes).forEach(function(name){
  //   flattenedContainer.classes[name] = _flattenType({bindings: {}}, container.classes[name])
  // })
  // Object.keys(container.aliases).forEach(function(name){
  //   flattenedContainer.aliases[name] = flattenAlias(container.aliases[name])
  // })
  // Object.keys(container.namespaces).forEach(function(name){
  //   let namespace = <s.Namespace> flattenContainer(container.namespaces[name], s.ContainerKind.NAMESPACE)
  //   namespace.parent = container
  //   flattenedContainer.namespaces[name] = namespace
  // })

  return flattenedContainer
}

export function flattenModule(module:s.Module):s.Module {
  let flattenedModule = <s.Module> flattenContainer(module, s.ContainerKind.MODULE)
  flattenedModule.imports = module.imports

  return flattenedModule
}

export function flattenSchema(schema:s.Schema):s.Schema {
  let flattenedSchema:s.Schema = {}

  Object.keys(schema).forEach(function(moduleName){
    flattenSchema[moduleName] = flattenModule(schema[moduleName])
  })

  return flattenedSchema
}
