import {serializable as m, KeyValue} from './model'
import * as f from './factories'

// TODO: Finish this

export function convertRawModules(modules: KeyValue<m.Container>): KeyValue<f.ModuleFactory> {
  let moduleFactories: KeyValue<f.ModuleFactory> = {}
  // let moduleNames: KeyValue<boolean> = {}
  // Object.keys(modules).forEach(function(name) {
  //   moduleNames[name] = true
  // })
  //
  // let resolver = createResolver(modules, moduleFactories)
  //
  // Object.keys(modules).forEach(function(name) {
  //   convertRawTypeContainer(name, modules[name], resolver, moduleFactories)
  // })

  return moduleFactories
}

// export function convertRawModule(name: string, module: m.Container, moduleFactories: KeyValue<f.ModuleFactory>) {
//   let resolver = createResolver({ name: module }, moduleFactories)
//   convertRawTypeContainer(name, module, resolver, moduleFactories)
// }
//
// type Referencable = f.ClassConstructorFactory | f.InterfaceConstructorFactory | f.TypeAliasFactory<any, any> | f.EnumFactory<any> | f.ValueFactory<any, any> | f.ContainerFactory<any> | f.TypeParameterFactory<any>
//
// type Resolver = (reference: m.Reference, typeParameters: KeyValue<f.TypeParameterFactory<any>>) => Referencable
//
// function createResolver(modules: KeyValue<m.Container>, moduleFactories: KeyValue<f.ModuleFactory>): Resolver {
//   let typeCompletions: KeyValue<[any[], any][]> = {}
//   let resolver = function(reference: m.Reference, typeParameters: KeyValue<f.TypeParameterFactory<any>>): Referencable {
//     if (reference.module === '@') {
//       let typeParameter = typeParameters[reference.name]
//       if (!typeParameter) {
//         throw new Error('Cannot find type parameter: ' + reference.name)
//       }
//       return typeParameter
//     } else {
//       let split = reference.module.split(':')
//       let namespaces: string[]
//       let moduleName = split[0]
//       let moduleFactory = modules[moduleName]
//
//       if (moduleFactory) {
//         split.shift()
//         namespaces = split
//       } else if (moduleNames[moduleName]) {
//         moduleFactory = new f.ModuleFactory(moduleName)
//         modules[moduleName] = moduleFactory
//         split.shift()
//         namespaces = split
//       } else {
//         moduleFactory = modules['']
//         if (!moduleFactory) {
//           moduleFactory = new f.ModuleFactory('')
//           modules[''] = moduleFactory
//         }
//         namespaces = split
//       }
//       let typeContainerConstructor: f.AbstractContainerFactory<any> = moduleFactory
//       for (let i = 0; i < namespaces.length; i++) {
//         typeContainerConstructor = typeContainerConstructor.addNamespace(namespaces[i])
//       }
//       if (reference.name) {
//         return typeContainerConstructor.getChild(reference.name)
//       } else {
//         return typeContainerConstructor
//       }
//     }
//   }
//   return resolver
// }
//
// function convertRawTypeContainer(name: string, typeContainer: m.Container, resolver: Resolver, moduleFactories?: KeyValue<f.ModuleFactory>, parent?: f.AbstractContainerFactory<any>) {
//   let typeContainerFactory: f.AbstractContainerFactory<any>
//
//   if (parent) {
//     typeContainerFactory = parent.addNamespace(name)
//   } else {
//     if (!moduleFactories[name]) {
//       moduleFactories[name] = new f.ModuleFactory(name)
//     }
//     typeContainerFactory = moduleFactories[name]
//   }
//
//   Object.keys(typeContainer.classConstructors).forEach(function(name) {
//     let classConstructor = typeContainer.classConstructors[name]
//     convertRawClassConstructor(name, classConstructor, resolver, typeContainerFactory, {})
//   })
//   Object.keys(typeContainer.interfaceConstructors).forEach(function(name) {
//     let interfaceConstructor = typeContainer.interfaceConstructors[name]
//     convertRawInterfaceConstructor(name, interfaceConstructor, resolver, typeContainerFactory, {})
//   })
//   Object.keys(typeContainer.types).forEach(function(name) {
//     convertTypeAlias(name, typeContainer.types[name], resolver, typeContainerFactory, {})
//   })
//   Object.keys(typeContainer.namespaces).forEach(function(name) {
//     convertRawTypeContainer(name, typeContainer.namespaces[name], resolver, null, typeContainerFactory)
//   })
//   Object.keys(typeContainer.statics).forEach(function(name) {
//     let rawStaticMember = typeContainer.statics[name]
//     let staticConstuctor = typeContainerFactory.addStatic(name, rawStaticMember.valueKind)
//     if (staticConstuctor) {
//       staticConstuctor.type = convertRawType(rawStaticMember.type, resolver, {})
//     }
//   })
//   Object.keys(typeContainer.reexports).forEach(function(name) {
//     typeContainerFactory.setChild(name, <f.Factory<f.TypeContainerChildType>>resolver(typeContainer.reexports[name], {}))
//   })
// }
//
// function convertTypeAliasConstructor(name: string, typeAlias: m.TypeAliasConstructor, resolver: Resolver, containerFactory: f.AbstractContainerFactory<any>, typeParameters: KeyValue<f.TypeParameterFactory<any>>) {
//   let tac = containerFactory.addTypeAlias(name)
//   tac.type = convertRawType(typeAlias.type, resolver, typeParameters)
// }
//
// function convertTypeAlias(name: string, enumType: m.Enum, resolver: Resolver, containerFactory: f.AbstractContainerFactory<any>, typeParameters: KeyValue<f.TypeParameterFactory<any>>) {
//   let etc = containerFactory.addEnumType(name)
//   enumType.members.forEach(function(member) {
//     etc.addMember(member.name)
//   })
// }
//
// function convertRawClassConstructor(name: string, classConstructor: m.ClassConstructor, resolver: Resolver, containerFactory: f.AbstractContainerFactory<any>, typeParameters: KeyValue<f.TypeParameterFactory<any>>) {
//   let ccc = containerFactory.addClassConstructor(name)
//   if (classConstructor.typeParameters) {
//     typeParameters = convertRawTypeParameters(classConstructor.typeParameters, ccc, resolver, typeParameters)
//   }
//   convertRawCompositeType(classConstructor.instanceType, resolver, typeParameters, ccc.createInstanceType())
//   convertRawCompositeType(classConstructor.staticType, resolver, typeParameters, ccc.createStaticType())
//
//   if (classConstructor.extends) {
//     ccc.extends = <f.ClassFactory>convertRawType(classConstructor.extends, resolver, typeParameters)
//   }
//   if (classConstructor.implements) {
//     classConstructor.implements.forEach(function(extend) {
//       ccc.implements.push(<f.InterfaceFactory>convertRawType(extend, resolver, typeParameters))
//     })
//   }
//
//   if (classConstructor.decorators) {
//     convertRawDecorators(classConstructor.decorators, ccc, resolver, typeParameters)
//   }
// }
//
// function convertRawInterfaceConstructor(name: string, interfaceConstructor: m.InterfaceConstructor, resolver: Resolver, containerFactory: f.AbstractContainerFactory<any>, typeParameters: KeyValue<f.TypeParameterFactory<any>>) {
//   let icc = containerFactory.addInterfaceConstructor(name)
//   if (interfaceConstructor.typeParameters) {
//     typeParameters = convertRawTypeParameters(interfaceConstructor.typeParameters, icc, resolver, typeParameters)
//   }
//   convertRawCompositeType(interfaceConstructor.instanceType, resolver, typeParameters, icc.createInstanceType())
//
//   if (interfaceConstructor.extends) {
//     interfaceConstructor.extends.forEach(function(extend) {
//       icc.extends.push(<f.InterfaceFactory>convertRawType(extend, resolver, typeParameters))
//     })
//   }
// }
//
// function convertRawTypeParameters<P extends f.TypeConstructorFactory<any>>(typeParameters: m.TypeParameter[], parent: f.TypeConstructorFactory<P>, resolver: Resolver, parentTypeParameters: KeyValue<f.TypeParameterFactory<any>>): KeyValue<f.TypeParameterFactory<any>> {
//   let typeParameterFactories: KeyValue<f.TypeParameterFactory<any>> = {}
//   Object.keys(parentTypeParameters).forEach(function(key) {
//     typeParameterFactories[key] = parentTypeParameters[key]
//   })
//   typeParameters.forEach(function(rawTypeParameter) {
//     let typeParameterConstructor = parent.addTypeParameter(rawTypeParameter.name)
//     if (rawTypeParameter.extends) {
//       typeParameterConstructor.extends = convertRawType(rawTypeParameter.extends, resolver, parentTypeParameters)
//     }
//     typeParameterFactories[rawTypeParameter.name] = typeParameterConstructor
//   })
//   return typeParameterFactories
// }
//
// function convertRawCompositeType<C extends m.CompositeTypeTemplate<any, any, any>, MC extends f.AbstractMemberFactory<any, any, any>, FT extends f.AbstractFunctionTypeFactory<any, any, any>>(rawCompositeType: m.RawCompositeType, resolver: Resolver, typeParameters: m.KeyValue<f.TypeParameterFactory<any>>, compositeTypeConstructor?: f.AbstractCompositeTypeFactory<C, MC, FT>): f.AbstractCompositeTypeFactory<C, MC, FT> {
//   if (!compositeTypeConstructor) {
//     compositeTypeConstructor = <f.AbstractCompositeTypeFactory<C, MC, FT>><any> new f.CompositeTypeFactory<any>(null, false)
//   }
//
//   if (rawCompositeType.index) {
//     let indexConstructor = compositeTypeConstructor.createIndex(rawCompositeType.index.keyType)
//     indexConstructor.valueType = convertRawType(rawCompositeType.index.valueType, resolver, typeParameters)
//   }
//
//   Object.keys(rawCompositeType.members).forEach(function(name) {
//     let rawMember = rawCompositeType.members[name]
//     let memberConstructor = compositeTypeConstructor.addMember(name)
//     memberConstructor.type = convertRawType(rawMember.type, resolver, typeParameters)
//
//     if ((<m.RawDecoratedMember>rawMember).decorators) {
//       convertRawDecorators((<m.RawDecoratedMember>rawMember).decorators, memberConstructor, resolver, typeParameters)
//     }
//   })
//   if (rawCompositeType.calls) {
//     rawCompositeType.calls.forEach(function(call, i) {
//       compositeTypeConstructor.calls.push(<FT>convertRawType(call, resolver, typeParameters))
//     })
//   }
//
//   return compositeTypeConstructor
// }
//
// function convertRawType(rawType: m.RawType, resolver: Resolver, typeParameters: m.KeyValue<f.TypeParameterFactory<any>>): f.TypeFactory<any> {
//   if ((<m.TypeTemplate>rawType).typeKind) {
//     let typeTemplate = (<m.TypeTemplate>rawType)
//     switch (typeTemplate.typeKind) {
//       case m.TypeKind.PRIMITIVE:
//         return new f.PrimitiveTypeFactory((<m.PrimitiveType>rawType).primitiveTypeKind)
//       case m.TypeKind.FUNCTION:
//         let rawFunctionType = <m.RawFunctionType>rawType
//         let functionTypeConstructor = new f.DecoratedFunctionTypeFactory()
//         if (rawFunctionType.typeParameters) {
//           typeParameters = convertRawTypeParameters(rawFunctionType.typeParameters, functionTypeConstructor, resolver, typeParameters)
//         }
//         rawFunctionType.parameters.forEach(function(parameter) {
//           let parameterConstructor = functionTypeConstructor.parameter(parameter.name, parameter.optional)
//           parameterConstructor.type(convertRawType(parameter.type, resolver, typeParameters))
//           if ((<m.RawDecoratedParameter>parameter).decorators) {
//             convertRawDecorators((<m.RawDecoratedParameter>parameter).decorators, parameterConstructor, resolver, typeParameters)
//           }
//         })
//         if (rawFunctionType.type) {
//           functionTypeConstructor.type(convertRawType(rawFunctionType.type, resolver, typeParameters))
//         }
//         return functionTypeConstructor
//       case m.TypeKind.TUPLE:
//         let rawTupleType = <m.RawTupleType>rawType
//         let tupleTypeConstructor = new f.TupleTypeFactory(context)
//         rawTupleType.elements.forEach(function(element) {
//           tupleTypeConstructor.element(convertRawType(element, resolver, typeParameters))
//         })
//         return tupleTypeConstructor
//       case m.TypeKind.INTERSECTION:
//       case m.TypeKind.UNION:
//         let rawUnionOrIntersectionType = <m.RawUnionOrIntersectionType>rawType
//         let unionOrIntersectionTypeConstructor = new f.UnionOrIntersectionTypeFactory(typeTemplate.typeKind)
//         rawUnionOrIntersectionType.types.forEach(function(type) {
//           unionOrIntersectionTypeConstructor.type(convertRawType(type, resolver, typeParameters))
//         })
//         return unionOrIntersectionTypeConstructor
//       case m.TypeKind.COMPOSITE:
//         let rawCompositeType = <m.RawCompositeType>rawType
//         return convertRawCompositeType(rawCompositeType, resolver, typeParameters)
//       case m.TypeKind.TYPE_QUERY:
//         let rawTypeQuery = <m.RawTypeQuery>rawType
//         let typeQueryConstructor = new f.TypeQueryFactory(context)
//         if (rawTypeQuery.type) {
//           typeQueryConstructor.type(resolver(rawTypeQuery.type, typeParameters))
//         }
//         return typeQueryConstructor
//     }
//   } else {
//     if ((<m.RefinedReference>rawType).reference) {
//       let refined = <m.RefinedReference>rawType
//       let cc = <f.Factory<m.InterfaceConstructor | m.ClassConstructor>>resolver(<m.Reference>refined.reference, typeParameters)
//       let ctc = new f.ClosableTypeFactory(context)
//       ctc.parentConstructor(cc)
//       refined.typeArguments.forEach(function(typeArgument) {
//         ctc.typeArgument(convertRawType(typeArgument, resolver, typeParameters))
//       })
//       return ctc
//     } else {
//       return <f.Factory<m.ClassConstructor | m.InterfaceConstructor | m.Enum | m.TypeAlias<any>>>resolver(<m.Reference>rawType, typeParameters)
//     }
//   }
// }
//
// function convertRawExpression(rawExpression: m.RawExpression, resolver: Resolver, typeParameters: m.KeyValue<f.TypeParameterFactory<any>>): f.AbstractExpressionFactory<any> {
//   let expressionConstructor = f.expressionFactory(rawExpression.expressionKind)
//   switch (rawExpression.expressionKind) {
//     case m.ExpressionKind.PRIMITIVE:
//       (<f.StringExpressionFactory>expressionConstructor).value((<m.RawLiteralExpression<string>>rawExpression).value)
//       break
//     case m.ExpressionKind.BOOLEAN:
//       (<f.BooleanExpressionFactory>expressionConstructor).value((<m.RawLiteralExpression<boolean>>rawExpression).value)
//       break
//     case m.ExpressionKind.NUMBER:
//       (<f.NumberExpressionFactory>expressionConstructor).value((<m.RawLiteralExpression<number>>rawExpression).value)
//       break
//     case m.ExpressionKind.ENUM:
//       let eec = <f.EnumExpressionFactory>expressionConstructor
//       let ee = <m.EnumExpression>rawExpression
//       eec.enum(<f.Factory<m.Enum>>resolver(ee.enum, typeParameters))
//       eec.value(ee.value)
//       break
//     case m.ExpressionKind.ARRAY:
//       let rawArrayExpression = <m.RawArrayExpression>rawExpression
//       rawArrayExpression.elements.forEach(function(element) {
//         (<f.ArrayExpressionFactory>expressionConstructor).element(element.expressionKind).setValue(convertRawExpression(element, resolver, typeParameters))
//       })
//       break
//     case m.ExpressionKind.OBJECT:
//       let rawObjExp = <m.RawObjectExpression>rawExpression
//       let objectExpressionConstructor = <f.ObjectExpressionFactory>expressionConstructor
//       Object.keys(rawObjExp.properties).forEach(function(name) {
//         let expression = rawObjExp.properties[name]
//         objectExpressionConstructor.property(name, expression.expressionKind).setValue(expression)
//       })
//       break
//     case m.ExpressionKind.CLASS:
//       let rawClsExp = <m.RawClassExpression>rawExpression
//       let classExpressionConstructor = <f.ClassExpressionFactory>expressionConstructor
//       classExpressionConstructor.class(<f.Factory<m.ClassConstructor>>resolver(rawClsExp.class, typeParameters))
//       break
//     case m.ExpressionKind.COMPLEX:
//       break
//   }
//   return expressionConstructor
// }
//
// function convertRawDecorators<P extends m.Decorated>(decorators: m.Decorator[], parent: f.DecoratedFactory<P, any>, resolver: Resolver, typeParameters: KeyValue<f.TypeParameterFactory<any>>) {
//   decorators.forEach(function(decorator) {
//     let decoratorFactory = parent.addDecorator()
//     decoratorFactory.decoratorType(<f.Factory<m.TypeAlias<m.DecoratorType>>>resolver(decorator.decoratorType, typeParameters))
//     if (decorator.parameters) {
//       decorator.parameters.forEach(function(parameter) {
//         decoratorFactory.parameter(convertRawExpression(parameter, resolver, typeParameters))
//       })
//     }
//   })
// }
