import * as m from './model'
import * as f from './factories'

export function convertRawModules(openModules: m.Map<m.RawTypeContainer>): m.Map<m.Module> {
  let modules: m.Map<m.Module> = {}
  let moduleConstructors: m.Map<f.ModuleFactory> = {}
  let moduleNames: m.Map<boolean> = {}
  Object.keys(openModules).forEach(function(name) {
    moduleNames[name] = true
  })
  let context = <f.Context>{
    typeArgs: {},
    closedTypes: {},
    closedTypeCallbacks: [],
    isStarted: true
  }

  let resolver = createResolver(moduleConstructors, moduleNames, context)

  Object.keys(openModules).forEach(function(name) {
    convertRawTypeContainer(name, openModules[name], resolver, context, moduleConstructors)
  })

  Object.keys(moduleConstructors).forEach(function(name) {
    modules[name] = moduleConstructors[name].construct()
  })

  context.closedTypeCallbacks.forEach(function(cb) {
    cb()
  })

  return modules
}

export function convertRawModule(name: string, openModule: m.RawTypeContainer, modules: m.Map<m.Module>) {
  let moduleConstructors: m.Map<f.ModuleFactory> = {}
  let moduleNames: m.Map<boolean> = {}
  Object.keys(modules).forEach(function(name) {
    moduleNames[name] = true
  })
  moduleNames[name] = true

  let context = <f.Context>{
    typeArgs: {},
    closedTypes: {},
    closedTypeCallbacks: [],
    isStarted: true
  }
  let resolver = createResolver(moduleConstructors, moduleNames, context)
  convertRawTypeContainer(name, openModule, resolver, context, moduleConstructors)

  Object.keys(moduleConstructors).forEach(function(name) {
    modules[name] = moduleConstructors[name].construct()
  })

  context.closedTypeCallbacks.forEach(function(cb) {
    cb()
  })
}

type Referencable = f.Factory<f.TypeContainerChildType|m.TypeParameter<any>|m.TypeContainer>

type Resolver = (reference: m.Reference, typeParameters: m.Map<f.TypeParameterFactory<any>>) => Referencable

function createResolver(modules: m.Map<f.ModuleFactory>, moduleNames: m.Map<boolean>, context: f.Context): Resolver {
  let typeCompletions: m.Map<[any[], any][]> = {}
  let resolver = function(reference: m.Reference, typeParameters: m.Map<f.TypeParameterFactory<any>>): Referencable {
    if (reference.module === '@') {
      let typeParameter = typeParameters[reference.name]
      if (!typeParameter) {
        throw new Error('Cannot find type parameter: ' + reference.name)
      }
      return typeParameter
    } else {
      let split = reference.module.split(':')
      let namespaces: string[]
      let moduleName = split[0]
      let moduleFactory = modules[moduleName]

      if (moduleFactory) {
        split.shift()
        namespaces = split
      } else if (moduleNames[moduleName]) {
        moduleFactory = new f.ModuleFactory(moduleName, context)
        modules[moduleName] = moduleFactory
        split.shift()
        namespaces = split
      } else {
        moduleFactory = modules['']
        if (!moduleFactory) {
          moduleFactory = new f.ModuleFactory('', context)
          modules[''] = moduleFactory
        }
        namespaces = split
      }
      let typeContainerConstructor: f.AbstractTypeContainerFactory<any> = moduleFactory
      for (let i = 0; i < namespaces.length; i++) {
        typeContainerConstructor = typeContainerConstructor.namespace(namespaces[i])
      }
      if (reference.name) {
        return typeContainerConstructor.getChild(reference.name)
      } else {
        return typeContainerConstructor
      }
    }
  }
  return resolver
}

function convertRawTypeContainer(name: string, rawTypeContainer: m.RawTypeContainer, resolver: Resolver, context: f.Context, moduleConstructors?: m.Map<f.ModuleFactory>, parent?: f.AbstractTypeContainerFactory<any>) {
  let typeContainerConstructor: f.AbstractTypeContainerFactory<any>

  if (parent) {
    typeContainerConstructor = parent.namespace(name)
  } else {
    if (!moduleConstructors[name]) {
      moduleConstructors[name] = new f.ModuleFactory(name, context)
    }
    typeContainerConstructor = moduleConstructors[name]
  }

  Object.keys(rawTypeContainer.classConstructors).forEach(function(name) {
    let classConstructor = rawTypeContainer.classConstructors[name]
    convertRawClassConstructor(name, classConstructor, resolver, context, typeContainerConstructor, {})
  })
  Object.keys(rawTypeContainer.interfaceConstructors).forEach(function(name) {
    let interfaceConstructor = rawTypeContainer.interfaceConstructors[name]
    convertRawInterfaceConstructor(name, interfaceConstructor, resolver, context, typeContainerConstructor, {})
  })
  Object.keys(rawTypeContainer.types).forEach(function(name) {
    convertTypeAlias(name, rawTypeContainer.types[name], resolver, context, typeContainerConstructor, {})
  })
  Object.keys(rawTypeContainer.namespaces).forEach(function(name) {
    convertRawTypeContainer(name, rawTypeContainer.namespaces[name], resolver, context, null, typeContainerConstructor)
  })
  Object.keys(rawTypeContainer.statics).forEach(function(name) {
    let rawStaticMember = rawTypeContainer.statics[name]
    let staticConstuctor = typeContainerConstructor.static(name, rawStaticMember.valueKind)
    if (staticConstuctor) {
      staticConstuctor.type(convertRawType(rawStaticMember.type, resolver, context, {}))
    }
  })
  Object.keys(rawTypeContainer.reexports).forEach(function(name) {
    typeContainerConstructor.setChild(name, <f.Factory<f.TypeContainerChildType>>resolver(rawTypeContainer.reexports[name], {}))
  })
}

function convertTypeAlias(name: string, rawTypeAlias: m.RawTypeAlias|m.RawEnumType, resolver: Resolver, context: f.Context, containerConstructor: f.AbstractTypeContainerFactory<any>, typeParameters: m.Map<f.TypeParameterFactory<any>>) {
  if (rawTypeAlias.typeKind === m.TypeKind.TYPE_ALIAS) {
    let rawAlias = <m.RawTypeAlias>rawTypeAlias
    let tac = containerConstructor.typeAlias(name)
    tac.type(convertRawType(rawAlias.type, resolver, context, typeParameters))
  } else {
    let rawEnumType = <m.RawEnumType>rawTypeAlias
    let etc = containerConstructor.enumType(name)
    rawEnumType.members.forEach(function(member) {
      etc.member(member.name)
    })
  }
}

function convertRawClassConstructor(name: string, rawClassConstructor: m.RawClassConstructor, resolver: Resolver, context: f.Context, containerConstructor: f.AbstractTypeContainerFactory<any>, typeParameters: m.Map<f.TypeParameterFactory<any>>) {
  let ccc = containerConstructor.classConstructor(name)
  if (rawClassConstructor.typeParameters) {
    typeParameters = convertRawTypeParameters(rawClassConstructor.typeParameters, ccc, resolver, context, typeParameters)
  }
  convertRawCompositeType(rawClassConstructor.instanceType, resolver, context, typeParameters, ccc.instanceType())
  convertRawCompositeType(rawClassConstructor.staticType, resolver, context, typeParameters, ccc.staticType())

  if (rawClassConstructor.extends) {
    ccc.extend(<f.Factory<m.Class|m.ClassConstructor>>convertRawType(rawClassConstructor.extends, resolver, context, typeParameters))
  }
  if (rawClassConstructor.implements) {
    rawClassConstructor.implements.forEach(function(extend) {
      ccc.implement(<f.Factory<m.Interface|m.InterfaceConstructor>>convertRawType(extend, resolver, context, typeParameters))
    })
  }

  if (rawClassConstructor.decorators) {
    convertRawDecorators(rawClassConstructor.decorators, ccc, resolver, typeParameters)
  }
}

function convertRawInterfaceConstructor(name: string, rawInterfaceConstructor: m.RawInterfaceConstructor, resolver: Resolver, context: f.Context, containerConstructor: f.AbstractTypeContainerFactory<any>, typeParameters: m.Map<f.TypeParameterFactory<any>>) {
  let icc = containerConstructor.interfaceConstructor(name)
  if (rawInterfaceConstructor.typeParameters) {
    typeParameters = convertRawTypeParameters(rawInterfaceConstructor.typeParameters, icc, resolver, context, typeParameters)
  }
  convertRawCompositeType(rawInterfaceConstructor.instanceType, resolver, context, typeParameters, icc.instanceType())

  if (rawInterfaceConstructor.extends) {
    rawInterfaceConstructor.extends.forEach(function(extend) {
      icc.extend(<f.Factory<m.Interface|m.InterfaceConstructor>>convertRawType(extend, resolver, context, typeParameters))
    })
  }
}

function convertRawTypeParameters<P extends m.ParameterisedType>(rawTypeParameters: m.RawTypeParameter[], parent: f.ParameterisedTypeFactory<P>, resolver: Resolver, context: f.Context, typeParameters: m.Map<f.TypeParameterFactory<any>>): m.Map<f.TypeParameterFactory<any>> {
  let newTypeParameters: m.Map<f.TypeParameterFactory<any>> = {}
  Object.keys(typeParameters).forEach(function(key) {
    newTypeParameters[key] = typeParameters[key]
  })
  rawTypeParameters.forEach(function(rawTypeParameter) {
    let typeParameterConstructor = parent.typeParameter(rawTypeParameter.name)
    if (rawTypeParameter.extends) {
      typeParameterConstructor.extends(convertRawType(rawTypeParameter.extends, resolver, context, typeParameters))
    }
    newTypeParameters[rawTypeParameter.name] = typeParameterConstructor
  })
  return newTypeParameters
}

function convertRawCompositeType<P>(rawCompositeType: m.RawCompositeType, resolver: Resolver, context: f.Context, typeParameters: m.Map<f.TypeParameterFactory<any>>, compositeTypeConstructor?: f.AbstractCompositeTypeFactory<any, any>): f.AbstractCompositeTypeFactory<any, any> {
  if (!compositeTypeConstructor) {
    compositeTypeConstructor = new f.CompositeTypeFactory(false, context)
  }

  if (rawCompositeType.index) {
    let indexConstructor = compositeTypeConstructor.index(rawCompositeType.index.keyType)
    indexConstructor.valueType(convertRawType(rawCompositeType.index.valueType, resolver, context, typeParameters))
  }

  Object.keys(rawCompositeType.members).forEach(function(name) {
    let rawMember = rawCompositeType.members[name]
    let memberConstructor = compositeTypeConstructor.member(name)
    memberConstructor.type(convertRawType(rawMember.type, resolver, context, typeParameters))

    if ((<m.RawDecoratedMember>rawMember).decorators) {
      convertRawDecorators((<m.RawDecoratedMember>rawMember).decorators, <f.DecoratedMemberFactory<any>>memberConstructor, resolver, typeParameters)
    }
  })
  if (rawCompositeType.calls) {
    rawCompositeType.calls.forEach(function(call, i) {
      compositeTypeConstructor.call(<f.Factory<m.FunctionType>>convertRawType(call, resolver, context, typeParameters))
    })
  }

  return compositeTypeConstructor
}

function convertRawType(rawType: m.RawType, resolver: Resolver, context: f.Context, typeParameters: m.Map<f.TypeParameterFactory<any>>): f.Factory<f.TypeOrConstructableType> {
  if ((<m.TypeTemplate>rawType).typeKind) {
    switch ((<m.TypeTemplate>rawType).typeKind) {
      case m.TypeKind.PRIMITIVE:
        return new f.PrimitiveTypeFactory((<m.PrimitiveType>rawType).primitiveTypeKind, context)
      case m.TypeKind.FUNCTION:
        let rawFunctionType = <m.RawFunctionType>rawType
        let functionTypeConstructor = new f.DecoratedFunctionTypeFactory(context)
        if (rawFunctionType.typeParameters) {
          typeParameters = convertRawTypeParameters(rawFunctionType.typeParameters, functionTypeConstructor, resolver, context, typeParameters)
        }
        rawFunctionType.parameters.forEach(function(parameter) {
          let parameterConstructor = functionTypeConstructor.parameter(parameter.name, parameter.optional)
          parameterConstructor.type(convertRawType(parameter.type, resolver, context, typeParameters))
          if ((<m.RawDecoratedParameter>parameter).decorators) {
            convertRawDecorators((<m.RawDecoratedParameter>parameter).decorators, parameterConstructor, resolver, typeParameters)
          }
        })
        if (rawFunctionType.type) {
          functionTypeConstructor.type(convertRawType(rawFunctionType.type, resolver, context, typeParameters))
        }
        return functionTypeConstructor
      case m.TypeKind.TUPLE:
        let rawTupleType = <m.RawTupleType>rawType
        let tupleTypeConstructor = new f.TupleTypeFactory(context)
        rawTupleType.elements.forEach(function(element) {
          tupleTypeConstructor.element(convertRawType(element, resolver, context, typeParameters))
        })
        return tupleTypeConstructor
      case m.TypeKind.UNION:
        let rawUnionType = <m.RawUnionType>rawType
        let unionTypeConstructor = new f.UnionTypeFactory(context)
        rawUnionType.types.forEach(function(type) {
          unionTypeConstructor.type(convertRawType(type, resolver, context, typeParameters))
        })
        return unionTypeConstructor
      case m.TypeKind.COMPOSITE:
        let rawCompositeType = <m.RawCompositeType>rawType
        return convertRawCompositeType(rawCompositeType, resolver, context, typeParameters)
      case m.TypeKind.TYPE_QUERY:
        let rawTypeQuery = <m.RawTypeQuery>rawType
        let typeQueryConstructor = new f.TypeQueryFactory(context)
        if (rawTypeQuery.type) {
          typeQueryConstructor.type(resolver(rawTypeQuery.type, typeParameters))
        }
        return typeQueryConstructor
    }
  } else {
    if ((<m.RefinedReference>rawType).reference) {
      let refined = <m.RefinedReference>rawType
      let cc = <f.Factory<m.InterfaceConstructor|m.ClassConstructor>>resolver(<m.Reference>refined.reference, typeParameters)
      let ctc = new f.ClosableTypeFactory(context)
      ctc.parentConstructor(cc)
      refined.typeArguments.forEach(function(typeArgument) {
        ctc.typeArgument(convertRawType(typeArgument, resolver, context, typeParameters))
      })
      return ctc
    } else {
      return <f.Factory<m.ClassConstructor|m.InterfaceConstructor|m.EnumType|m.TypeAlias<any>>>resolver(<m.Reference>rawType, typeParameters)
    }
  }
}

function convertRawExpression(rawExpression: m.RawExpression, resolver: Resolver, typeParameters: m.Map<f.TypeParameterFactory<any>>): f.AbstractExpressionFactory<any> {
  let expressionConstructor = f.expressionFactory(rawExpression.expressionKind)
  switch (rawExpression.expressionKind) {
    case m.ExpressionKind.STRING:
      (<f.StringExpressionFactory>expressionConstructor).value((<m.RawLiteralExpression<string>>rawExpression).value)
      break
    case m.ExpressionKind.BOOLEAN:
      (<f.BooleanExpressionFactory>expressionConstructor).value((<m.RawLiteralExpression<boolean>>rawExpression).value)
      break
    case m.ExpressionKind.NUMBER:
      (<f.NumberExpressionFactory>expressionConstructor).value((<m.RawLiteralExpression<number>>rawExpression).value)
      break
    case m.ExpressionKind.ENUM:
      let eec = <f.EnumExpressionFactory>expressionConstructor
      let ee = <m.RawEnumExpression>rawExpression
      eec.enum(<f.Factory<m.EnumType>>resolver(ee.enum, typeParameters))
      eec.value(ee.value)
      break
    case m.ExpressionKind.ARRAY:
      let rawArrayExpression = <m.RawArrayExpression>rawExpression
      rawArrayExpression.elements.forEach(function(element) {
        (<f.ArrayExpressionFactory>expressionConstructor).element(element.expressionKind).setValue(convertRawExpression(element, resolver, typeParameters))
      })
      break
    case m.ExpressionKind.OBJECT:
      let rawObjExp = <m.RawObjectExpression>rawExpression
      let objectExpressionConstructor = <f.ObjectExpressionFactory>expressionConstructor
      Object.keys(rawObjExp.properties).forEach(function(name) {
        let expression = rawObjExp.properties[name]
        objectExpressionConstructor.property(name, expression.expressionKind).setValue(expression)
      })
      break
    case m.ExpressionKind.CLASS:
      let rawClsExp = <m.RawClassExpression>rawExpression
      let classExpressionConstructor = <f.ClassExpressionFactory>expressionConstructor
      classExpressionConstructor.class(<f.Factory<m.ClassConstructor>>resolver(rawClsExp.class, typeParameters))
      break
    case m.ExpressionKind.COMPLEX:
      break
  }
  return expressionConstructor
}

function convertRawDecorators<P extends m.Decorated>(rawDecorators: m.RawDecorator[], parent: f.DecoratedFactory<P>, resolver: Resolver, typeParameters: m.Map<f.TypeParameterFactory<any>>) {
  rawDecorators.forEach(function(decorator) {
    let decoratorConstructor = parent.decorator()
    decoratorConstructor.decoratorType(<f.Factory<m.TypeAlias<m.DecoratorType>>>resolver(decorator.decoratorType, typeParameters))
    if (decorator.parameters) {
      decorator.parameters.forEach(function(parameter) {
        decoratorConstructor.parameter(convertRawExpression(parameter, resolver, typeParameters))
      })
    }
  })
}
