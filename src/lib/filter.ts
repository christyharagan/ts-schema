import * as m from './model'
import * as f from './factories'

export function filterModules(moduleNames: string[]|((moduleName: string) => boolean), modules: m.KeyValue<f.ModuleFactory>): m.KeyValue<f.ModuleFactory> {
  // TODO: Temporary hack to get a demo ready
  return modules
  // let filteredModules: m.KeyValue<f.ModuleFactory> = {}
  //
  // function processTypeContainer(container: f.ContainerFactory) {
  //   Object.keys(container.classConstructors).forEach(function(clsName) {
  //     processClass(container.classConstructors[clsName])
  //   })
  //
  //   Object.keys(container.interfaceConstructors).forEach(function(intName) {
  //     processInterface(container.interfaceConstructors[intName])
  //   })
  //
  //   Object.keys(container.enums).forEach(function(name) {
  //     processEnum(container.enums[name])
  //   })
  //
  //   Object.keys(container.typeAliasConstructors).forEach(function(name) {
  //     processTypeAliasConstructor(container.typeAliasConstructors[name])
  //   })
  //
  //   Object.keys(container.namespaces).forEach(function(name) {
  //     processTypeContainer(container.namespaces[name])
  //   })
  //
  //   Object.keys(container.values).forEach(function(name) {
  //     processValue(container.values[name])
  //   })
  // }
  //
  // function processDecorator(decorator: f.DecoratorFactory<any>) {
  //   copy(decorator.decoratorType)
  //   if (decorator.parameters) {
  //     decorator.parameters.forEach(function(parameter) {
  //       processExpression(parameter)
  //     })
  //   }
  // }
  //
  // function processValue(value: f.ValueFactory<any>) {
  //
  // }
  //
  // function processEnum(e: f.EnumFactory) {
  //   processType(e)
  //   // TODO Process initializers
  // }
  //
  // function processTypeAliasConstructor(typeAliasConstructor: f.TypeAliasConstructorFactory<any>) {
  //   processType(typeAliasConstructor.type)
  // }
  //
  // function processExpression(expr: f.ExpressionFactory<any>) {
  //   switch (expr.expressionKind) {
  //     case m.ExpressionKind.CLASS_REFERENCE:
  //       copy((<f.ClassReferenceExpressionFactory>expr).classReference)
  //       break
  //     case m.ExpressionKind.OBJECT:
  //       let obj = <m.RawObjectExpression>expr
  //       Object.keys(obj.properties).forEach(function(name) {
  //         processExpression(obj.properties[name])
  //       })
  //       break
  //     case m.ExpressionKind.ARRAY:
  //       let arr = <m.RawArrayExpression>expr
  //       arr.elements.forEach(function(expr) {
  //         processExpression(expr)
  //       })
  //       break
  //   }
  // }
  //
  // function processClass(cls: f.ClassConstructorFactory) {
  //   processType(cls.instanceType)
  //   processType(cls.staticType)
  //
  //   if (cls.extends) {
  //     processType(cls.extends)
  //   }
  //   if (cls.implements) {
  //     cls.implements.forEach(function(type) {
  //       processType(type)
  //     })
  //   }
  //   if (cls.typeParameters) {
  //     cls.typeParameters.forEach(function(typeParameter) {
  //       if (typeParameter.extends) {
  //         processType(typeParameter.extends)
  //       }
  //     })
  //   }
  //
  //   if (cls.decorators) {
  //     cls.decorators.forEach(function(decorator) {
  //       processDecorator(decorator)
  //     })
  //   }
  // }
  //
  // function processInterface(int: f.InterfaceConstructorFactory) {
  //   processType(int.instanceType)
  //
  //   if (int.extends) {
  //     int.extends.forEach(function(type) {
  //       processType(type)
  //     })
  //   }
  //   if (int.typeParameters) {
  //     int.typeParameters.forEach(function(typeParameter) {
  //       if (typeParameter.extends) {
  //         processType(typeParameter.extends)
  //       }
  //     })
  //   }
  // }
  //
  // function processType(ref: f.TypeFactory<any>) {
  //   if ((<m.TypeTemplate>ref).typeKind) {
  //     let type = <m.TypeTemplate>ref
  //     switch (type.typeKind) {
  //       case m.TypeKind.TYPE_QUERY:
  //         if ((<m.RawTypeQuery>ref).type) {
  //           copyReference((<m.RawTypeQuery>ref).type)
  //         }
  //         break
  //       case m.TypeKind.FUNCTION:
  //         let f = <m.RawFunctionType>ref
  //         f.parameters.forEach(function(parameter) {
  //           if ((<m.RawDecoratedParameter>parameter).decorators) {
  //             (<m.RawDecoratedParameter>parameter).decorators.forEach(processDecorator)
  //           }
  //           processType(parameter.type)
  //         })
  //         if (f.typeParameters) {
  //           f.typeParameters.forEach(function(typeParameter) {
  //             if (typeParameter.extends) {
  //               processType(typeParameter.extends)
  //             }
  //           })
  //         }
  //         if (f.type) {
  //           processType(f.type)
  //         }
  //         break
  //       case m.TypeKind.TUPLE:
  //         (<m.RawTupleType>ref).elements.forEach(function(type) {
  //           processType(type)
  //         })
  //         break
  //       case m.TypeKind.UNION:
  //         (<m.RawUnionType>ref).types.forEach(function(type) {
  //           processType(type)
  //         })
  //         break
  //       case m.TypeKind.COMPOSITE:
  //         let composite = <m.RawCompositeType>ref
  //         Object.keys(composite.members).forEach(function(name) {
  //           let member = composite.members[name]
  //           processType(member.type)
  //           if ((<m.RawDecoratedMember>member).decorators) {
  //             (<m.RawDecoratedMember>member).decorators.forEach(processDecorator)
  //           }
  //         })
  //         if (composite.index) {
  //           processType(composite.index.valueType)
  //         }
  //         if (composite.calls) {
  //           composite.calls.forEach(processType)
  //         }
  //         break
  //     }
  //   } else if ((<m.RefinedReference>ref).reference) {
  //     let rr = <m.RefinedReference>ref
  //     copy(rr.reference)
  //     rr.typeArguments.forEach(function(typeArg) {
  //       processType(typeArg)
  //     })
  //   } else {
  //     copy(ref)
  //   }
  // }
  //
  // function copy(factory:f.Factory<any>) {
  //   switch (factory.modelKind) {
  //     case m.ModelKind.CLASS_CONSTRUCTOR:
  //     case m.ModelKind.INTERFACE_CONSTRUCTOR:
  //     case m.ModelKind.TYPE_ALIAS_CONSTRUCTOR:
  //     case m.ModelKind.VALUE:
  //       return copyContained(<f.ContainedFactory<any>>factory)
  //     case m.ModelKind.TYPE:
  //       if ((<f.TypeFactory<any>>factory).typeKind === m.TypeKind.ENUM) {
  //         return copyContained(<f.ContainedFactory<any>>factory)
  //       }
  //   }
  // }
  //
  // function copyContained(ref: f.ContainedFactory<any>) {
  //   let parent = ref.parent
  //   let parents = [parent]
  //   while (parent.containerKind === m.ContainerKind.NAMESPACE) {
  //     parent = ref.parent
  //     parents.splice(0, 0, parent)
  //   }
  //   let filteredContainer:f.ContainerFactory = filteredModules[parent[0].name]
  //   if (!filteredContainer) {
  //     filteredContainer = new f.ModuleFactory(parent[0].name)
  //     filteredModules[parent[0].name] = <f.ModuleFactory>filteredContainer
  //   }
  //   for (let i = 1; i < parents.length; i++) {
  //     filteredContainer = filteredContainer.addNamespace(parents[i].name)
  //   }
  //   switch (ref.modelKind) {
  //     case m.ModelKind.CLASS_CONSTRUCTOR:
  //       let filteredClass = filteredContainer.addClassConstructor(ref.name)
  //       let cc = <f.ClassConstructorFactory>ref
  //       filteredClass.implements = cc.implements
  //       filteredClass.extends = cc.extends
  //       cc.instanceType
  //     case m.ModelKind.INTERFACE_CONSTRUCTOR:
  //     case m.ModelKind.TYPE_ALIAS_CONSTRUCTOR:
  //     case m.ModelKind.TYPE:
  //     case m.ModelKind.VALUE:
  //   }
  // }
  //
  // function copyComposite(orig:f.DecoratedCompositeTypeFactory<any>, filtered:f.DecoratedCompositeTypeFactory<any>) {
  //   Object.keys(orig.members).forEach(function(name){
  //     let member = orig.members[name]
  //     let fMember = filtered.addMember(name)
  //     fMember.type = member.type
  //   })
  // }
  //
  // // function copyReference(ref: m.Reference) {
  // //   let split = ref.module.split(':')
  // //   let namespaces: string[]
  // //   let moduleName = split[0]
  // //
  // //   if (split.length > 1) {
  // //     split.shift()
  // //     namespaces = split
  // //   }
  // //
  // //   if (ref.module !== '@') {
  // //     let refMod = modules[moduleName]
  // //     if (!refMod) {
  // //       refMod = modules[''].namespaces[moduleName]
  // //     }
  // //     let mod = refMod
  // //     let _mod = filteredModules[moduleName]
  // //     if (!_mod) {
  // //       _mod = createRawTypeContainer()
  // //       filteredModules[moduleName] = <m.RawTypeContainer>_mod
  // //     }
  // //     if (namespaces) {
  // //       for (let i = 0; i < namespaces.length; i++) {
  // //         mod = mod.namespaces[namespaces[i]]
  // //         _mod = _mod.namespaces[namespaces[i]]
  // //         if (!_mod) {
  // //           let __mod = _mod
  // //           _mod = createRawTypeContainer()
  // //           __mod.namespaces[namespaces[i]] = <m.RawTypeContainer>_mod
  // //         }
  // //       }
  // //     }
  // //     if (mod.classConstructors[ref.name]) {
  // //       if (!_mod.classConstructors[ref.name]) {
  // //         _mod.classConstructors[ref.name] = mod.classConstructors[ref.name]
  // //         processClass(mod.classConstructors[ref.name])
  // //       }
  // //     } else if (mod.interfaceConstructors[ref.name]) {
  // //       if (!_mod.interfaceConstructors[ref.name]) {
  // //         _mod.interfaceConstructors[ref.name] = mod.interfaceConstructors[ref.name]
  // //         processInterface(mod.interfaceConstructors[ref.name])
  // //       }
  // //     } else if (mod.types[ref.name]) {
  // //       if (!_mod.types[ref.name]) {
  // //         _mod.types[ref.name] = mod.types[ref.name]
  // //         processTypeAlias(mod.types[ref.name])
  // //       }
  // //     } else if (mod.statics[ref.name]) {
  // //       if (!_mod.statics[ref.name]) {
  // //         _mod.statics[ref.name] = mod.statics[ref.name]
  // //         processType(mod.statics[ref.name].type)
  // //       }
  // //     } else if (mod.reexports[ref.name]) {
  // //       if (!_mod.reexports[ref.name]) {
  // //         _mod.reexports[ref.name] = mod.reexports[ref.name]
  // //         copyReference(mod.reexports[ref.name])
  // //       }
  // //     } else {
  // //       throw new Error('Cannot find entity ' + ref.module + ':' + ref.name)
  // //     }
  // //   }
  // // }
  //
  // if ((<((moduleName: string) => boolean)>moduleNames).bind) {
  //   let f = <((moduleName: string) => boolean)>moduleNames
  //   Object.keys(modules).forEach(function(moduleName) {
  //     if (f(moduleName)) {
  //       filteredModules[moduleName] = modules[moduleName]
  //       processTypeContainer(modules[moduleName])
  //     }
  //   })
  // } else {
  //   (<string[]>moduleNames).forEach(function(moduleName) {
  //     filteredModules[moduleName] = modules[moduleName]
  //     processTypeContainer(modules[moduleName])
  //   })
  // }
  //
  // return filteredModules
}
