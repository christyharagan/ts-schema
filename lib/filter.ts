import * as m from './model'

function createRawTypeContainer(): m.RawTypeContainer {
  return {
    classConstructors: {},
    interfaceConstructors: {},
    types: {},
    statics: {},
    reexports: {},
    namespaces: {}
  }
}

export function filterRawModules(moduleNames: string[]|((moduleName: string) => boolean), modules: m.Map<m.RawTypeContainer>): m.Map<m.RawTypeContainer> {
  let filteredModules: m.Map<m.RawTypeContainer> = {}

  function processTypeContainer(container: m.RawTypeContainer) {
    Object.keys(container.classConstructors).forEach(function(clsName) {
      processClass(container.classConstructors[clsName])
    })

    Object.keys(container.interfaceConstructors).forEach(function(intName) {
      processInterface(container.interfaceConstructors[intName])
    })

    Object.keys(container.types).forEach(function(name) {
      processTypeAlias(container.types[name])
    })

    Object.keys(container.namespaces).forEach(function(name) {
      processTypeContainer(container.namespaces[name])
    })

    Object.keys(container.statics).forEach(function(name) {
      processType(container.statics[name].type)
    })

    Object.keys(container.reexports).forEach(function(name) {
      copyReference(container.reexports[name])
    })
  }

  function processDecorator(decorator: m.RawDecorator) {
    copyReference(decorator.decoratorType)
    if (decorator.parameters) {
      decorator.parameters.forEach(function(parameter) {
        processExpression(parameter)
      })
    }
  }

  function processTypeAlias(typeAlias: m.RawTypeAlias|m.RawEnumType) {
    if (typeAlias.typeKind === m.TypeKind.ENUM) {
      processType(<m.RawEnumType>typeAlias)
    } else {
      processType((<m.RawTypeAlias>typeAlias).type)
    }
  }

  function processExpression(expr: m.RawExpression) {
    switch (expr.expressionKind) {
      case m.ExpressionKind.CLASS:
        processType((<m.RawClassExpression>expr).class)
        break
      case m.ExpressionKind.OBJECT:
        let obj = <m.RawObjectExpression>expr
        Object.keys(obj.properties).forEach(function(name) {
          processExpression(obj.properties[name])
        })
        break
      case m.ExpressionKind.ARRAY:
        let arr = <m.RawArrayExpression>expr
        arr.elements.forEach(function(expr) {
          processExpression(expr)
        })
        break
    }
  }

  function processClass(cls: m.RawClassConstructor) {
    processType(cls.instanceType)
    processType(cls.staticType)

    if (cls.extends) {
      processType(cls.extends)
    }
    if (cls.implements) {
      cls.implements.forEach(function(type) {
        processType(type)
      })
    }
    if (cls.typeParameters) {
      cls.typeParameters.forEach(function(typeParameter) {
        if (typeParameter.extends) {
          processType(typeParameter.extends)
        }
      })
    }

    if (cls.decorators) {
      cls.decorators.forEach(function(decorator) {
        processDecorator(decorator)
      })
    }
  }

  function processInterface(int: m.RawInterfaceConstructor) {
    processType(int.instanceType)

    if (int.extends) {
      int.extends.forEach(function(type) {
        processType(type)
      })
    }
    if (int.typeParameters) {
      int.typeParameters.forEach(function(typeParameter) {
        if (typeParameter.extends) {
          processType(typeParameter.extends)
        }
      })
    }
  }

  function processType(ref: m.RawType) {
    if ((<m.TypeTemplate>ref).typeKind) {
      let type = <m.TypeTemplate>ref
      switch (type.typeKind) {
        case m.TypeKind.TYPE_QUERY:
          if ((<m.RawTypeQuery>ref).type) {
            copyReference((<m.RawTypeQuery>ref).type)
          }
          break
        case m.TypeKind.FUNCTION:
          let f = <m.RawFunctionType>ref
          f.parameters.forEach(function(parameter) {
            if ((<m.RawDecoratedParameter>parameter).decorators) {
              (<m.RawDecoratedParameter>parameter).decorators.forEach(processDecorator)
            }
            processType(parameter.type)
          })
          if (f.typeParameters) {
            f.typeParameters.forEach(function(typeParameter) {
              if (typeParameter.extends) {
                processType(typeParameter.extends)
              }
            })
          }
          if (f.type) {
            processType(f.type)
          }
          break
        case m.TypeKind.TUPLE:
          (<m.RawTupleType>ref).elements.forEach(function(type) {
            processType(type)
          })
          break
        case m.TypeKind.UNION:
          (<m.RawUnionType>ref).types.forEach(function(type) {
            processType(type)
          })
          break
        case m.TypeKind.COMPOSITE:
          let composite = <m.RawCompositeType>ref
          Object.keys(composite.members).forEach(function(name) {
            let member = composite.members[name]
            processType(member.type)
            if ((<m.RawDecoratedMember>member).decorators) {
              (<m.RawDecoratedMember>member).decorators.forEach(processDecorator)
            }
          })
          if (composite.index) {
            processType(composite.index.valueType)
          }
          if (composite.calls) {
            composite.calls.forEach(processType)
          }
          break
      }
    } else if ((<m.RefinedReference>ref).reference) {
      let rr = <m.RefinedReference>ref
      copyReference(rr.reference)
      rr.typeArguments.forEach(function(typeArg) {
        processType(typeArg)
      })
    } else {
      copyReference(<m.Reference>ref)
    }
  }

  function copyReference(ref: m.Reference) {
    let split = ref.module.split(':')
    let namespaces: string[]
    let moduleName = split[0]

    if (split.length > 1) {
      split.shift()
      namespaces = split
    }

    if (ref.module !== '@') {
      let refMod = modules[moduleName]
      if (!refMod) {
        refMod = modules[''].namespaces[moduleName]
      }
      let mod = refMod
      let _mod = filteredModules[moduleName]
      if (!_mod) {
        _mod = createRawTypeContainer()
        filteredModules[moduleName] = <m.RawTypeContainer>_mod
      }
      if (namespaces) {
        for (let i = 0; i < namespaces.length; i++) {
          mod = mod.namespaces[namespaces[i]]
          _mod = _mod.namespaces[namespaces[i]]
          if (!_mod) {
            let __mod = _mod
            _mod = createRawTypeContainer()
            __mod.namespaces[namespaces[i]] = <m.RawTypeContainer>_mod
          }
        }
      }
      if (mod.classConstructors[ref.name]) {
        if (!_mod.classConstructors[ref.name]) {
          _mod.classConstructors[ref.name] = mod.classConstructors[ref.name]
          processClass(mod.classConstructors[ref.name])
        }
      } else if (mod.interfaceConstructors[ref.name]) {
        if (!_mod.interfaceConstructors[ref.name]) {
          _mod.interfaceConstructors[ref.name] = mod.interfaceConstructors[ref.name]
          processInterface(mod.interfaceConstructors[ref.name])
        }
      } else if (mod.types[ref.name]) {
        if (!_mod.types[ref.name]) {
          _mod.types[ref.name] = mod.types[ref.name]
          processTypeAlias(mod.types[ref.name])
        }
      } else if (mod.statics[ref.name]) {
        if (!_mod.statics[ref.name]) {
          _mod.statics[ref.name] = mod.statics[ref.name]
          processType(mod.statics[ref.name].type)
        }
      } else if (mod.reexports[ref.name]) {
        if (!_mod.reexports[ref.name]) {
          _mod.reexports[ref.name] = mod.reexports[ref.name]
          copyReference(mod.reexports[ref.name])
        }
      } else {
        throw new Error('Cannot find entity ' + ref.module + ':' + ref.name)
      }
    }
  }

  if ((<((moduleName: string) => boolean)>moduleNames).bind) {
    let f = <((moduleName: string) => boolean)>moduleNames
    Object.keys(modules).forEach(function(moduleName) {
      if (f(moduleName)) {
        filteredModules[moduleName] = modules[moduleName]
        processTypeContainer(modules[moduleName])
      }
    })
  } else {
    (<string[]>moduleNames).forEach(function(moduleName) {
      filteredModules[moduleName] = modules[moduleName]
      processTypeContainer(modules[moduleName])
    })
  }

  return filteredModules
}
