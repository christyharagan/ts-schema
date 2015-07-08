import * as s from './schema'

function convertRef(schema:s.Schema, ref:s.RawReference): s.Type {
  let moduleName = ref.module
  if (moduleName) {
    let module = schema[moduleName]
    if (module) {
      let name = ref.name
      if (module.classes[name]) {
        return module.classes[name]
      } else if (module.interfaces[name]) {
        return module.interfaces[name]
      } else if (module.aliases[name]) {
        return module.aliases[name]
      }
    }
    return ref
  } else {
    return ref
  }
}

function convertRawExpression(schema:s.Schema, rawExpression:s.Expression):s.Expression {
  switch (rawExpression.expressionKind) {
    case s.ExpressionKind.STRING:
    case s.ExpressionKind.BOOLEAN:
    case s.ExpressionKind.NUMBER:
      return rawExpression
    case s.ExpressionKind.OBJECT:
      let rawObjectExpression = <s.ObjectExpression> rawExpression
      let objectExpression:s.ObjectExpression = {
        expressionKind: s.ExpressionKind.OBJECT,
        properties: {}
      }
      Object.keys(rawObjectExpression.properties).forEach(function(key){
        //TODO: Temporary hack around rawSchemaGenerator not handling enums and function calls...
        if (rawObjectExpression.properties[key] !== undefined) {
          objectExpression.properties[key] = convertRawExpression(schema, rawObjectExpression.properties[key])
        }
      })
      return rawObjectExpression
    case s.ExpressionKind.ARRAY:
      let rawArrayExpression = <s.ArrayExpression> rawExpression
      return <s.ArrayExpression> {
        expressionKind: s.ExpressionKind.ARRAY,
        elements: rawArrayExpression.elements.map(function(rawElement){
          return convertRawExpression(schema, rawElement)
        })
      }
    case s.ExpressionKind.CLASS:
      let rawClassExpression = <s.RawClassExpression> rawExpression
      return <s.ClassExpression> {
        expressionKind: s.ExpressionKind.CLASS,
        class: convertRawType(schema, <s.Class> convertRef(schema, {
          typeKind: null,
          module: rawClassExpression.module,
          name: rawClassExpression.name
        }))
      }
  }
}

function convertRawDecorators(schema:s.Schema, rawDecorators:s.Decorator[]):s.Decorator[] {
  return rawDecorators.map(function(rawDecorator){
    return <s.Decorator>{
      decorator: rawDecorator.decorator,
      parameters: rawDecorator.parameters.map(function(rawExpression){
        return convertRawExpression(schema, rawExpression)
      })
    }
  })
}

function convertRawTypeParameters(schema:s.Schema, rawTypeParameters:s.TypeParameter[]):s.TypeParameter[] {
  return rawTypeParameters.map(function(rawTypeParameter){
    let typeParameter:s.TypeParameter = {
      name: rawTypeParameter.name
    }
    if (rawTypeParameter.extends) {
      typeParameter.extends = convertRawType(schema, rawTypeParameter.extends)
    }
    return typeParameter
  })
}

function convertRawType(schema:s.Schema, rawType:s.Type):s.Type {
  switch(rawType.typeKind) {
    case s.TypeKind.STRING:
    case s.TypeKind.BOOLEAN:
    case s.TypeKind.NUMBER:
    case s.TypeKind.ANY:
      return rawType
    case s.TypeKind.ARRAY:
      let rawArrayType = <s.ArrayType>rawType
      return <s.ArrayType> {
        typeKind: s.TypeKind.ARRAY,
        element: convertRawType(schema, rawArrayType.element)
      }
    case s.TypeKind.FUNCTION:
      let rawFunctionType = <s.FunctionType>rawType
      let functionType = <s.FunctionType> {
        typeKind: s.TypeKind.FUNCTION,
        parameters: rawFunctionType.parameters.map(function(rawParameter){
          return <s.Parameter>{
            name: rawParameter.name,
            type: convertRawType(schema, rawParameter.type),
            decorators: convertRawDecorators(schema, rawParameter.decorators)
          }
        })
      }
      if (rawFunctionType.type) {
        functionType.type = convertRawType(schema, rawFunctionType.type)
      }
      if (rawFunctionType.typeParameters) {
        functionType.typeParameters = rawFunctionType.typeParameters.map(function(rawTypeParameter){
          let typeParameter:s.TypeParameter = {
            name: rawTypeParameter.name
          }
          if (rawTypeParameter.extends) {
            typeParameter.extends = convertRawType(schema, rawTypeParameter.extends)
          }
          return typeParameter
        })
      }

      return functionType
    case s.TypeKind.TUPLE:
      let rawTuple = <s.TupleType>rawType
      return <s.TupleType> {
        typeKind: s.TypeKind.TUPLE,
        elements: rawTuple.elements.map(function(rawType){
          return convertRawType(schema, rawType)
        })
      }
    case s.TypeKind.UNION:
      let rawUnion = <s.UnionType>rawType
      return <s.UnionType> {
        typeKind: s.TypeKind.TUPLE,
        types: rawUnion.types.map(function(rawType){
          return convertRawType(schema, rawType)
        })
      }
    case s.TypeKind.REFINED:
      let rawRefined = <s.RefinedType<s.RawReference>>rawType
      return <s.RefinedType<any>> {
        typeKind: s.TypeKind.REFINED,
        type: convertRef(schema, rawRefined.type),
        parameters: rawRefined.parameters.map(function(parameter){
          return convertRawType(schema, parameter)
        })
      }
    default:
      return convertRef(schema, <s.RawReference>rawType)
  }
}

function convertRawClass(schema:s.Schema, rawClass:s.RawClass, cls:s.Class) {
  if (rawClass.typeParameters) {
    cls.typeParameters = convertRawTypeParameters(schema, rawClass.typeParameters)
  }
  if (rawClass.extends) {
    cls.extends = <s.Class> convertRawType(schema, rawClass.extends)
  }
  if (rawClass.implements) {
    cls.implements = rawClass.implements.map(function(rawImplements){
      return <s.Interface> convertRawType(schema, rawImplements)
    })
  }
  if (rawClass.decorators) {
    cls.decorators = convertRawDecorators(schema, rawClass.decorators)
  }
  Object.keys(rawClass.members).forEach(function(name){
    let rawMember = rawClass.members[name]
    let member = cls.members[name]
    member.type = convertRawType(schema, rawMember.type)
    if (rawMember.decorators) {
      member.decorators = convertRawDecorators(schema, rawMember.decorators)
    }
  })
}

function convertRawInterface(schema:s.Schema, rawInterface:s.RawInterface, inter:s.Interface) {
  if (rawInterface.typeParameters) {
    inter.typeParameters = convertRawTypeParameters(schema, rawInterface.typeParameters)
  }
  if (rawInterface.extends) {
    inter.extends = rawInterface.extends.map(function(rawExtends){
      return <s.Interface> convertRawType(schema, rawExtends)
    })
  }
  Object.keys(rawInterface.members).forEach(function(name){
    inter.members[name].type = convertRawType(schema, rawInterface.members[name].type)
  })
}

function convertRawAlias(schema:s.Schema, rawAlias:s.TypeAlias<any>, alias:s.TypeAlias<any>) {
  alias.type = convertRawType(schema, rawAlias.type)
  if (rawAlias.typeParameters) {
    alias.typeParameters = convertRawTypeParameters(schema, rawAlias.typeParameters)
  }
}

export function rawSchemaToSchema(rawSchema:s.RawSchema) : s.Schema {
  let schema:s.Schema = {}

  // Phase 1: Create bare Aliases, Classes and Interfaces
  rawSchema.forEach(function(rawModule){
    let module:s.Module = {
      name: rawModule.name,
      interfaces: {},
      containerKind: s.ContainerKind.MODULE,
      classes:{},
      aliases:{},
      namespaces:{},
      imports:{}
    }
    schema[rawModule.name] = module

    rawModule.types.forEach(function(rawType){
      switch(rawType.typeKind) {
        case s.TypeKind.CLASS:
          let rawClass = <s.RawClass>rawType
          let classMembers:s.ClassMembers = {}
          let cls = {
            typeKind: s.TypeKind.CLASS,
            container: module,
            members: classMembers,
            name: rawClass.name
          }

          Object.keys(rawClass.members).forEach(function(name){
            classMembers[name] = {
              parent: cls,
              name: name,
              type: null,
              decorators:null
            }
          })

          module.classes[rawClass.name] = cls
          if (rawClass.typeParameters) {
            module.classes[rawClass.name].typeParameters = rawClass.typeParameters.map(function(){
              return null
            })
          }
          break
        case s.TypeKind.INTERFACE:
          let rawInterface = <s.RawInterface>rawType
          let members:s.InterfaceMembers = {}
          let inter = {
            typeKind: s.TypeKind.INTERFACE,
            container: module,
            members: members,
            name: rawInterface.name
          }
          Object.keys(rawInterface.members).forEach(function(name){
            members[name] = {
              parent: inter,
              name: name,
              type: null
            }
          })

          module.interfaces[rawInterface.name] = inter
          if (rawInterface.typeParameters) {
            module.interfaces[rawInterface.name].typeParameters = rawInterface.typeParameters.map(function(){
              return null
            })
          }
          break
        case s.TypeKind.ALIAS:
          let rawAlias = <s.TypeAlias<any>>rawType
          module.aliases[rawAlias.name] = {
            typeKind: s.TypeKind.ALIAS,
            container: module,
            type: null,
            name: rawAlias.name
          }
          break
      }
    })
  })

  // Phase 2: Populate Aliases, Classes and Interfaces
  rawSchema.forEach(function(rawModule){
    let module = schema[rawModule.name]

    rawModule.types.forEach(function(rawType){
      switch(rawType.typeKind) {
        case s.TypeKind.CLASS:
          let rawClass = <s.RawClass>rawType
          convertRawClass(schema, rawClass, module.classes[rawClass.name])
          break
        case s.TypeKind.INTERFACE:
          let rawInterface = <s.RawInterface>rawType
          convertRawInterface(schema, rawInterface, module.interfaces[rawInterface.name])
          break
        case s.TypeKind.ALIAS:
          let rawAlias = <s.TypeAlias<any>>rawType
          convertRawAlias(schema, rawAlias, module.aliases[rawAlias.name])
          break
      }
    })
  })

  return schema
}
