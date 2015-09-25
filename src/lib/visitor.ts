import {reflective as m, KeyValue, TypeKind, PrimitiveTypeKind, ModelKind} from './model'

export interface ModulesVisitor {
  onModule: (module: m.Module) => void|ContainerVisitor
}

export interface ContainerVisitor {
  onClassConstructor?: (cls: m.ClassConstructor) => void|ClassConstructorVisitor
  onInterfaceConstructor?: (inter: m.InterfaceConstructor) => void|InterfaceConstructorVisitor
  onTypeAliasConstructor?: (alias: m.TypeAliasConstructor<any>) => void|TypeVisitor
  onEnum?: (e: m.Enum) =>void|EnumVisitor
  onValue?: (staticMember: m.Value<any>) => void|ValueVisitor
  onNamespace?: (namespace: m.Namespace) => void|ContainerVisitor
}

export interface ValueVisitor {
  onType?: (type: m.Type) => void|TypeVisitor
}

export interface ClassConstructorVisitor {
  onExtend?: (extend: m.Class) => void|ClassVisitor
  onImplement?: (extend: m.Interface|m.Class) => void|InterfaceVisitor|ClassVisitor
  onInstanceType?: (instanceType: m.CompositeType) => void|CompositeTypeVisitor
  onStaticType?: (instanceType: m.CompositeType) => void|CompositeTypeVisitor
  onTypeParameter?: (typeParameter: m.TypeParameter<m.ClassConstructor>) => void
  onClassConstructorDecorator?: (classDecorator: m.Decorator<m.ClassConstructor>) => void
}

export interface ClassVisitor {
  onClassConstructor?: (classConstructor: m.ClassConstructor) => void|ClassConstructorVisitor
  onExtend?: (extend: m.Class) => void|ClassVisitor
  onImplement?: (extend: m.Interface|m.Class) => void|InterfaceVisitor|ClassVisitor
  onInstanceType?: (instanceType: m.CompositeType) => void|CompositeTypeVisitor
  onStaticType?: (instanceType: m.CompositeType) => void|CompositeTypeVisitor
  onTypeArgument?: (typeArgument: m.Type, typeParameter: m.TypeParameter<m.ClassConstructor>) => void
  onClassDecorator?: (classDecorator: m.Decorator<m.Class>) => void
}

export interface InterfaceConstructorVisitor {
  onExtend?: (extend: m.Interface|m.Class) => void|InterfaceVisitor|ClassVisitor
  onInstanceType?: (instanceType: m.CompositeType) => void|CompositeTypeVisitor
  onTypeParameter?: (typeParameter: m.TypeParameter<m.InterfaceConstructor>) => void
}

export interface InterfaceVisitor {
  onInterfaceConstructor?: (interfaceConstructor: m.InterfaceConstructor) => void|InterfaceConstructorVisitor
  onExtend?: (extend: m.Interface|m.Class) => void|InterfaceVisitor|ClassVisitor
  onTypeArgument?: (typeArgument: m.Type, typeParameter: m.TypeParameter<m.InterfaceConstructor>) => void
  onInstanceType?: (instanceType: m.CompositeType) => void|CompositeTypeVisitor
}

export interface CompositeTypeVisitor {
  onMember?: (member: m.Member<any>) => void|MemberVisitor
  onIndex?: (index: m.Index) => void
  onCall?: (call: m.FunctionType) => void|FunctionTypeVisitor
}

export interface MemberVisitor {
  onType?: (alias: m.Type, member?: m.Member<any>) => void|TypeVisitor
  onMemberDecorator?: (decorator: m.Decorator<m.DecoratedMember<any>>) => void
}

export interface TypeQueryVisitor extends TypeVisitor {
  onVariable?: (variable: m.Value<any>) => MemberVisitor|void
  onNamespace?: (ns: m.Namespace) => ContainerVisitor|void
}

export interface TypeVisitor {
  onCompositeType?: (compositeType: m.CompositeType) => CompositeTypeVisitor|void
  onFunctionType?: (functionType: m.FunctionType) => FunctionTypeVisitor|void
  onUnionType?: (unionType: m.UnionOrIntersectionType) => UnionOrIntersectionTypeVisitor|void
  onIntersectionType?: (unionType: m.UnionOrIntersectionType) => UnionOrIntersectionTypeVisitor|void
  onTupleType?: (tupleType: m.TupleType) => TupleTypeVisitor|void
  onClass?: (cls: m.Class) => ClassVisitor|void
  onInterface?: (int: m.Interface) => InterfaceVisitor|void
  onTypeQuery?: (typeQuery: m.TypeQuery) => TypeQueryVisitor|void
  onTypeAlias?: (typeAlias: m.TypeAlias<any>) => TypeVisitor|void
  onTypeParameter?: (typeParameter: m.TypeParameter<any>) => void

  onEnumType?: (enumType: m.Enum) => void

  onString?: () => void
  onBoolean?: () => void
  onNumber?: () => void
  onAny?: () => void
  onSymbol?: () => void
  onVoid?: () => void

  onArrayType?: (array: m.Class) => TypeVisitor|void
}

export interface EnumVisitor {
  onEnumMember? (enumMember: m.EnumMember)
}

export interface FunctionTypeVisitor {
  onType?: (type: m.Type, functionType?: m.FunctionType) => void|TypeVisitor
  onParameter?: (parameter: m.Parameter) => void|ParameterVisitor
  onTypeParameter?: (typeParameter: m.TypeParameter<m.FunctionType>) => void
}

export interface UnionOrIntersectionTypeVisitor {
  onType?: (type: m.Type, unionType?: m.UnionOrIntersectionType) => void|TypeVisitor
}

export interface TupleTypeVisitor {
  onType?: (type: m.Type, tupleType?: m.TupleType) => void|TypeVisitor
}

export interface ParameterVisitor {
  onType?: (alias: m.Type, parameter?: m.Parameter) => void|TypeVisitor
  onParameterDecorator?: (decorator: m.Decorator<m.DecoratedParameter>) => void
}

export function visitModules(modules: KeyValue<m.Module>, visitor: ModulesVisitor) {
  Object.keys(modules).forEach(function(name) {
    let module = modules[name]
    let v = visitor.onModule(module)
    if (v) {
      visitTypeContainer(module, <ContainerVisitor>v)
    }
  })
}

export function visitTypeContainer(container: m.Container, visitor: ContainerVisitor) {
  if (visitor.onClassConstructor) {
    Object.keys(container.classConstructors).forEach(function(name: string) {
      let classSchema = container.classConstructors[name]
      let ccVisitor = visitor.onClassConstructor(classSchema)
      if (ccVisitor) {
        visitClassConstructor(classSchema, <ClassConstructorVisitor>ccVisitor)
      }
    })
  }

  if (visitor.onInterfaceConstructor) {
    Object.keys(container.interfaceConstructors).forEach(function(name: string) {
      let interfaceSchema = container.interfaceConstructors[name]
      let icVisitor = visitor.onInterfaceConstructor(interfaceSchema)
      if (icVisitor) {
        visitInterfaceConstructor(interfaceSchema, <InterfaceConstructorVisitor>icVisitor)
      }
    })
  }

  if (visitor.onTypeAliasConstructor) {
    Object.keys(container.typeAliasConstructors).forEach(function(name: string) {
      let type = container.typeAliasConstructors[name]
      let tVisitor = visitor.onTypeAliasConstructor(type)
      if (tVisitor) {
        visitType(type.type, <TypeVisitor>tVisitor)
      }
    })
  }
  if (visitor.onEnum) {
    Object.keys(container.enums).forEach(function(name: string){
      let e = container.enums[name]
      let eVisitor = visitor.onEnum(e)
      if (eVisitor) {
        visitEnum(e, <EnumVisitor>eVisitor)
      }
    })
  }
  if (visitor.onValue) {
    Object.keys(container.values).forEach(function(name: string) {
      let s = container.values[name]
      let sVisitor = visitor.onValue(s)
      if (sVisitor) {
        visitValue(s, <ValueVisitor>sVisitor)
      }
    })
  }
  if (visitor.onNamespace) {
    Object.keys(container.namespaces).forEach(function(name: string) {
      let nspace = container.namespaces[name]
      let nsVisitor = visitor.onNamespace(nspace)
      if (nsVisitor) {
        visitTypeContainer(nspace, <ContainerVisitor>nsVisitor)
      }
    })
  }
}

export function visitValue(value: m.Value<any>, visitor: ValueVisitor) {
  if (visitor.onType) {
    let v = visitor.onType(value.type)
    if (v) {
      visitType(value.type, <TypeVisitor>v)
    }
  }
}

export function visitEnum(e: m.Enum, visitor: EnumVisitor) {
  if (visitor.onEnumMember) {
    e.members.forEach(function(member){
      visitor.onEnumMember(member)
    })
  }
}

export function visitClassConstructor(cls: m.ClassConstructor, visitor: ClassConstructorVisitor) {
  if (visitor.onClassConstructorDecorator && cls.decorators) {
    cls.decorators.forEach(function(decorator) {
      visitor.onClassConstructorDecorator(decorator)
    })
  }
  if (visitor.onTypeParameter && cls.typeParameters) {
    cls.typeParameters.forEach(function(typeParameter) {
      visitor.onTypeParameter(typeParameter)
    })
  }
  if (visitor.onExtend && cls.extends) {
    let eVisitor = visitor.onExtend(cls.extends)
    if (eVisitor) {
      visitClass(cls.extends, <ClassVisitor>eVisitor)
    }
  }
  if (visitor.onImplement && cls.implements) {
    cls.implements.forEach(function(impl) {
      let iVisitor = visitor.onImplement(impl)
      if (iVisitor) {
        if (impl.typeKind === TypeKind.INTERFACE) {
          visitInterface(<m.Interface>impl, <InterfaceVisitor>iVisitor)
        } else {
          visitClass(<m.Class>impl, <ClassVisitor>iVisitor)
        }
      }
    })
  }
  if (visitor.onInstanceType) {
    let iVisitor = visitor.onInstanceType(cls.instanceType)
    if (iVisitor) {
      visitCompositeType(cls.instanceType, <CompositeTypeVisitor>iVisitor)
    }
  }
  if (visitor.onStaticType) {
    let sVisitor = visitor.onStaticType(cls.staticType)
    if (sVisitor) {
      visitCompositeType(cls.staticType, <CompositeTypeVisitor>sVisitor)
    }
  }
}

export function visitClass(cls: m.Class, visitor: ClassVisitor) {
  if (visitor.onClassConstructor) {
    let ccVisitor = visitor.onClassConstructor(cls.typeConstructor)
    if (ccVisitor) {
      visitClassConstructor(cls.typeConstructor, <ClassConstructorVisitor>ccVisitor)
    }
  }
  if (visitor.onClassDecorator && cls.decorators) {
    cls.decorators.forEach(function(decorator) {
      visitor.onClassDecorator(decorator)
    })
  }
  if (visitor.onTypeArgument && cls.typeArguments) {
    cls.typeArguments.forEach(function(typeArgument, i) {
      visitor.onTypeArgument(<m.Type>typeArgument, cls.typeConstructor.typeParameters[i])
    })
  }
  if (visitor.onExtend && cls.extends) {
    let eVisitor = visitor.onExtend(cls.extends)
    if (eVisitor) {
      visitClass(cls.extends, <ClassVisitor>eVisitor)
    }
  }
  if (visitor.onImplement && cls.implements) {
    cls.implements.forEach(function(impl) {
      let iVisitor = visitor.onImplement(impl)
      if (iVisitor) {
        if (impl.typeKind === TypeKind.INTERFACE) {
          visitInterface(<m.Interface>impl, <InterfaceVisitor>iVisitor)
        } else {
          visitClass(<m.Class>impl, <ClassVisitor>iVisitor)
        }
      }
    })
  }
  if (visitor.onInstanceType) {
    let iVisitor = visitor.onInstanceType(cls.instanceType)
    if (iVisitor) {
      visitCompositeType(cls.instanceType, <CompositeTypeVisitor>iVisitor)
    }
  }
  if (visitor.onStaticType) {
    let sVisitor = visitor.onStaticType(cls.staticType)
    if (sVisitor) {
      visitCompositeType(cls.staticType, <CompositeTypeVisitor>sVisitor)
    }
  }
}

export function visitInterfaceConstructor(inter: m.InterfaceConstructor, visitor: InterfaceConstructorVisitor) {
  if (visitor.onTypeParameter && inter.typeParameters) {
    inter.typeParameters.forEach(function(typeParameter) {
      visitor.onTypeParameter(typeParameter)
    })
  }
  if (visitor.onExtend && inter.extends) {
    inter.extends.forEach(function(impl) {
      let iVisitor = visitor.onExtend(impl)
      if (iVisitor) {
        if (impl.typeKind === TypeKind.INTERFACE) {
          visitInterface(<m.Interface>impl, <InterfaceVisitor>iVisitor)
        } else {
          visitClass(<m.Class>impl, <ClassVisitor>iVisitor)
        }
      }
    })
  }
  if (visitor.onInstanceType) {
    let iVisitor = visitor.onInstanceType(inter.instanceType)
    if (iVisitor) {
      visitCompositeType(inter.instanceType, <CompositeTypeVisitor>iVisitor)
    }
  }
}

export function visitInterface(inter: m.Interface, visitor: InterfaceVisitor) {
  if (visitor.onInterfaceConstructor) {
    let icVisitor = visitor.onInterfaceConstructor(inter.typeConstructor)
    if (icVisitor) {
      visitInterfaceConstructor(inter.typeConstructor, <InterfaceConstructorVisitor>icVisitor)
    }
  }
  if (visitor.onTypeArgument && inter.typeArguments) {
    inter.typeArguments.forEach(function(typeArgument, i) {
      visitor.onTypeArgument(<m.Type>typeArgument, inter.typeConstructor.typeParameters[i])
    })
  }
  if (visitor.onExtend && inter.extends) {
    inter.extends.forEach(function(impl) {
      let iVisitor = visitor.onExtend(impl)
      if (iVisitor) {
        if (impl.typeKind === TypeKind.INTERFACE) {
          visitInterface(<m.Interface>impl, <InterfaceVisitor>iVisitor)
        } else {
          visitClass(<m.Class>impl, <ClassVisitor>iVisitor)
        }
      }
    })
  }
  if (visitor.onInstanceType) {
    let iVisitor = visitor.onInstanceType(inter.instanceType)
    if (iVisitor) {
      visitCompositeType(inter.instanceType, <CompositeTypeVisitor>iVisitor)
    }
  }
}

export function visitCompositeType(compositeType: m.CompositeType, visitor: CompositeTypeVisitor) {
  if (visitor.onMember) {
    Object.keys(compositeType.members).forEach(function(memberName) {
      let member = compositeType.members[memberName]
      let mVisitor = visitor.onMember(member)
      if (mVisitor) {
        visitMember(member, <MemberVisitor>mVisitor)
      }
    })
  }
  if (visitor.onIndex && compositeType.index) {
    visitor.onIndex(compositeType.index)
  }
  if (visitor.onCall && compositeType.calls) {
    compositeType.calls.forEach(function(call) {
      let cVisitor = visitor.onCall(call)
      if (cVisitor) {
        visitFunctionType(call, <FunctionTypeVisitor>cVisitor)
      }
    })
  }
}

export function visitMember(member: m.Member<any>, visitor: MemberVisitor) {
  if (visitor.onType) {
    let tVisitor = visitor.onType(<m.Type>member.type, member)
    if (tVisitor) {
      visitType(<m.Type>member.type, <TypeVisitor>tVisitor)
    }
  }
  if (visitor.onMemberDecorator && (<m.DecoratedMember<any>>member).decorators) {
    (<m.DecoratedMember<any>>member).decorators.forEach(function(decorator) {
      visitor.onMemberDecorator(decorator)
    })
  }
}

export function visitUnionOrIntersectionType(unionType: m.UnionOrIntersectionType, visitor: UnionOrIntersectionTypeVisitor) {
  if (visitor.onType) {
    unionType.types.forEach(function(type) {
      let v = visitor.onType(<m.Type>type)
      if (v) {
        visitType(<m.Type>type, <TypeVisitor>v)
      }
    })
  }
}

export function visitTupleType(tupleType: m.TupleType, visitor: TupleTypeVisitor) {
  if (visitor.onType) {
    tupleType.elements.forEach(function(type) {
      let v = visitor.onType(<m.Type>type)
      if (v) {
        visitType(<m.Type>type, <TypeVisitor>v)
      }
    })
  }
}

export function visitFunctionType(functionType: m.FunctionType, visitor: FunctionTypeVisitor) {
  if (visitor.onType && functionType.type) {
    let tVisitor = visitor.onType(<m.Type>functionType.type, functionType)
    if (tVisitor) {
      visitType(<m.Type>functionType.type, <TypeVisitor>tVisitor)
    }
  }
  if (visitor.onParameter) {
    functionType.parameters.forEach(function(parameter) {
      let pVisitor = visitor.onParameter(parameter)
      if (pVisitor) {
        visitParameter(parameter, <ParameterVisitor>pVisitor)
      }
    })
  }
  if (visitor.onTypeParameter && functionType.typeParameters) {
    functionType.typeParameters.forEach(function(typeParameter) {
      visitor.onTypeParameter(typeParameter)
    })
  }
}

export function visitParameter(parameter: m.Parameter, visitor: ParameterVisitor) {
  if (visitor.onType) {
    let tVisitor = visitor.onType(<m.Type>parameter.type, parameter)
    if (tVisitor) {
      visitType(<m.Type>parameter.type, <TypeVisitor>tVisitor)
    }
  }
  if (visitor.onParameterDecorator && (<m.DecoratedParameter>parameter).decorators) {
    (<m.DecoratedParameter>parameter).decorators.forEach(function(decorator) {
      visitor.onParameterDecorator(decorator)
    })
  }
}

export function visitTypeQuery(typeQuery: m.TypeQuery, visitor: TypeQueryVisitor) {
  switch (typeQuery.modelKind) {
    case ModelKind.CONTAINER:
      if (visitor.onNamespace) {
        let v = visitor.onNamespace(<m.Namespace>typeQuery.type)
        if (v) {
          visitTypeContainer(<m.Container>typeQuery.type, <ContainerVisitor>v)
        }
      }
      break
    case ModelKind.VALUE:
      if (visitor.onVariable) {
        let v = visitor.onVariable(<m.Value<any>>typeQuery.type)
        if (v) {
          visitValue(<m.Value<any>>typeQuery.type, <MemberVisitor>v)
        }
      }
      break
    case ModelKind.TYPE:
      visitType(<m.Type>typeQuery.type, visitor)
      break
  }
}

export function visitType(type: m.Type, visitor: TypeVisitor) {
  switch (type.typeKind) {
    case TypeKind.FUNCTION:
      if (visitor.onFunctionType) {
        let v = visitor.onFunctionType(<m.FunctionType>type)
        if (v) {
          visitFunctionType(<m.FunctionType>type, <FunctionTypeVisitor>v)
        }
      }
      break
    case TypeKind.COMPOSITE:
      if (visitor.onCompositeType) {
        let v = visitor.onCompositeType(<m.CompositeType>type)
        if (v) {
          visitCompositeType(<m.CompositeType>type, <CompositeTypeVisitor>v)
        }
      }
      break
    case TypeKind.INTERFACE:
      if (visitor.onInterface) {
        let v = visitor.onInterface(<m.Interface>type)
        if (v) {
          visitInterface(<m.Interface>type, <InterfaceVisitor>v)
        }
      }
      break
    case TypeKind.CLASS:
      let cls = <m.Class>type
      if (cls.name === 'Array' && cls.typeConstructor.parent.name === '' && visitor.onArrayType) {
        let v = visitor.onArrayType(cls)
        if (v) {
          visitType(<m.Type>cls.typeArguments[0], <TypeVisitor>v)
        }
      } else if (visitor.onClass) {
        let v = visitor.onClass(cls)
        if (v) {
          visitClass(cls, <ClassVisitor>v)
        }
      }
      break
    case TypeKind.ENUM:
      if (visitor.onEnumType) {
        visitor.onEnumType(<m.Enum>type)
      }
      break
    case TypeKind.TYPE_QUERY:
      if (visitor.onTypeQuery) {
        let v = visitor.onTypeQuery(<m.TypeQuery>type)
        if (v) {
          visitTypeQuery(<m.TypeQuery>type, <TypeQueryVisitor>v)
        }
      }
      break
    case TypeKind.UNION:
      if (visitor.onUnionType) {
        let v = visitor.onUnionType(<m.UnionOrIntersectionType>type)
        if (v) {
          visitUnionOrIntersectionType(<m.UnionOrIntersectionType>type, <UnionOrIntersectionTypeVisitor>v)
        }
      }
      break
    case TypeKind.INTERSECTION:
      if (visitor.onUnionType) {
        let v = visitor.onIntersectionType(<m.UnionOrIntersectionType>type)
        if (v) {
          visitUnionOrIntersectionType(<m.UnionOrIntersectionType>type, <UnionOrIntersectionTypeVisitor>v)
        }
      }
      break
    case TypeKind.TUPLE:
      if (visitor.onTupleType) {
        let v = visitor.onTupleType(<m.TupleType>type)
        if (v) {
          visitTupleType(<m.TupleType>type, <TupleTypeVisitor>v)
        }
      }
      break
    case TypeKind.COMPOSITE:
      if (visitor.onCompositeType) {
        let v = visitor.onCompositeType(<m.CompositeType>type)
        if (v) {
          visitCompositeType(<m.CompositeType>type, <CompositeTypeVisitor>v)
        }
      }
      break
    case TypeKind.TYPE_ALIAS:
      if (visitor.onTypeAlias) {
        let v = visitor.onTypeAlias(<m.TypeAlias<any>>type)
        if (v) {
          visitType((<m.TypeAlias<any>>type).type, <TypeVisitor>v)
        }
      }
      break
    case TypeKind.PRIMITIVE:
      let p = <m.PrimitiveType>type
      switch (p.primitiveTypeKind) {
        case PrimitiveTypeKind.STRING:
          if (visitor.onString) {
            visitor.onString()
          }
          break
        case PrimitiveTypeKind.BOOLEAN:
          if (visitor.onBoolean) {
            visitor.onBoolean()
          }
          break
        case PrimitiveTypeKind.NUMBER:
          if (visitor.onNumber) {
            visitor.onNumber()
          }
          break
        case PrimitiveTypeKind.VOID:
          if (visitor.onVoid) {
            visitor.onVoid()
          }
          break
        case PrimitiveTypeKind.ANY:
          if (visitor.onAny) {
            visitor.onAny()
          }
          break
        case PrimitiveTypeKind.SYMBOL:
          if (visitor.onSymbol) {
            visitor.onSymbol()
          }
          break
      }
      break
  }
}
