import * as m from './model'

export interface ModulesVisitor {
  onModule: (module: m.Module) => void|TypeContainerVisitor
}

export interface TypeContainerVisitor {
  onClassConstructor?: (cls: m.ClassConstructor) => void|ClassConstructorVisitor
  onInterfaceConstructor?: (inter: m.InterfaceConstructor) => void|InterfaceConstructorVisitor
  onType?: (alias: m.TypeAlias<any>|m.EnumType) => void|TypeVisitor
  onStatic?: (staticMember: m.Value<m.TypeContainer, any>) => void|ValueVisitor
  onNamespace?: (namespace: m.Namespace) => void|TypeContainerVisitor
}

export interface ValueVisitor {
  onType?: (type: m.Type) => void|TypeVisitor
}

export interface ClassConstructorVisitor {
  onExtend?: (extend: m.Class) => void|ClassVisitor
  onImplement?: (extend: m.Interface) => void|InterfaceVisitor
  onInstanceType?: (instanceType: m.CompositeType) => void|CompositeTypeVisitor
  onStaticType?: (instanceType: m.CompositeType) => void|CompositeTypeVisitor
  onTypeParameter?: (typeParameter: m.TypeParameter<m.ClassConstructor>) => void
  onClassConstructorDecorator?: (classDecorator: m.Decorator<m.ClassConstructor>) => void
}

export interface ClassVisitor {
  onClassConstructor?: (classConstructor: m.ClassConstructor) => void|ClassConstructorVisitor
  onExtend?: (extend: m.Class) => void|ClassVisitor
  onImplement?: (extend: m.Interface) => void|InterfaceVisitor
  onInstanceType?: (instanceType: m.CompositeType) => void|CompositeTypeVisitor
  onStaticType?: (instanceType: m.CompositeType) => void|CompositeTypeVisitor
  onTypeArgument?: (typeArgument: m.Type, typeParameter: m.TypeParameter<m.ClassConstructor>) => void
  onClassDecorator?: (classDecorator: m.Decorator<m.Class>) => void
}

export interface InterfaceConstructorVisitor {
  onExtend?: (extend: m.Interface) => void|InterfaceVisitor
  onInstanceType?: (instanceType: m.CompositeType) => void|CompositeTypeVisitor
  onTypeParameter?: (typeParameter: m.TypeParameter<m.InterfaceConstructor>) => void
}

export interface InterfaceVisitor {
  onInterfaceConstructor?: (interfaceConstructor: m.InterfaceConstructor) => void|InterfaceConstructorVisitor
  onExtend?: (extend: m.Interface) => void|InterfaceVisitor
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
  onVariable?: (variable: m.Value<any, any>) => MemberVisitor|void
  onNamespace?: (ns: m.Namespace) => TypeContainerVisitor|void
}

export interface TypeVisitor {
  onCompositeType?: (compositeType: m.CompositeType) => CompositeTypeVisitor|void
  onFunctionType?: (functionType: m.FunctionType) => FunctionTypeVisitor|void
  onUnionType?: (unionType: m.UnionType) => UnionTypeVisitor|void
  onTupleType?: (tupleType: m.TupleType) => TupleTypeVisitor|void
  onClass?: (cls: m.Class) => ClassVisitor|void
  onInterface?: (int: m.Interface) => InterfaceVisitor|void
  onTypeQuery?: (typeQuery: m.TypeQuery) => TypeQueryVisitor|void
  onTypeAlias?: (typeAlias: m.TypeAlias<any>) => TypeVisitor|void

  onEnumType?: (enumType: m.EnumType) => void

  onString?: () => void
  onBoolean?: () => void
  onNumber?: () => void
  onAny?: () => void
  onSymbol?: () => void
  onVoid?: () => void

  onArrayType?: (array: m.Class) => TypeVisitor|void
}

export interface FunctionTypeVisitor {
  onType?: (type: m.Type, functionType?: m.FunctionType) => void|TypeVisitor
  onParameter?: (parameter: m.Parameter) => void|ParameterVisitor
  onTypeParameter?: (typeParameter: m.TypeParameter<m.FunctionType>) => void
}

export interface UnionTypeVisitor {
  onType?: (type: m.Type, unionType?: m.UnionType) => void|TypeVisitor
}

export interface TupleTypeVisitor {
  onType?: (type: m.Type, tupleType?: m.UnionType) => void|TypeVisitor
}

export interface ParameterVisitor {
  onType?: (alias: m.Type, parameter?: m.Parameter) => void|TypeVisitor
  onParameterDecorator?: (decorator: m.Decorator<m.DecoratedParameter>) => void
}

export function visitModules(modules: m.Map<m.Module>, visitor: ModulesVisitor) {
  Object.keys(modules).forEach(function(name) {
    let module = modules[name]
    let v = visitor.onModule(module)
    if (v) {
      visitTypeContainer(module, <TypeContainerVisitor>v)
    }
  })
}

export function visitTypeContainer(typeContainer: m.TypeContainer, visitor: TypeContainerVisitor) {
  if (visitor.onClassConstructor) {
    Object.keys(typeContainer.classConstructors).forEach(function(name: string) {
      let classSchema = typeContainer.classConstructors[name]
      let ccVisitor = visitor.onClassConstructor(classSchema)
      if (ccVisitor) {
        visitClassConstructor(classSchema, <ClassConstructorVisitor>ccVisitor)
      }
    })
  }

  if (visitor.onInterfaceConstructor) {
    Object.keys(typeContainer.interfaceConstructors).forEach(function(name: string) {
      let interfaceSchema = typeContainer.interfaceConstructors[name]
      let icVisitor = visitor.onInterfaceConstructor(interfaceSchema)
      if (icVisitor) {
        visitInterfaceConstructor(interfaceSchema, <InterfaceConstructorVisitor>icVisitor)
      }
    })
  }

  if (visitor.onType) {
    Object.keys(typeContainer.types).forEach(function(name: string) {
      let type = typeContainer.types[name]
      let tVisitor = visitor.onType(type)
      if (tVisitor && type.typeKind === m.TypeKind.TYPE_ALIAS) {
        visitType((<m.TypeAlias<any>>type).type, <TypeVisitor>tVisitor)
      }
    })
  }
  if (visitor.onStatic) {
    Object.keys(typeContainer.statics).forEach(function(name: string) {
      let s = typeContainer.statics[name]
      let sVisitor = visitor.onStatic(s)
      if (sVisitor) {
        visitValue(s, <ValueVisitor>sVisitor)
      }
    })
  }
  if (visitor.onNamespace) {
    Object.keys(typeContainer.namespaces).forEach(function(name: string) {
      let nspace = typeContainer.namespaces[name]
      let nsVisitor = visitor.onNamespace(nspace)
      if (nsVisitor) {
        visitTypeContainer(nspace, <TypeContainerVisitor>nsVisitor)
      }
    })
  }
}

export function visitValue(value: m.Value<any, any>, visitor: ValueVisitor) {
  if (visitor.onType) {
    let v = visitor.onType(value.type)
    if (v) {
      visitType(value.type, <TypeVisitor>v)
    }
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
        visitInterface(impl, <InterfaceVisitor>iVisitor)
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
        visitInterface(impl, <InterfaceVisitor>iVisitor)
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
        visitInterface(impl, <InterfaceVisitor>iVisitor)
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
        visitInterface(impl, <InterfaceVisitor>iVisitor)
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

export function visitUnionType(unionType: m.UnionType, visitor: UnionTypeVisitor) {
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
    case m.ModelKind.TYPE_CONTAINER:
      if (visitor.onNamespace) {
        let v = visitor.onNamespace(<m.Namespace>typeQuery.type)
        if (v) {
          visitTypeContainer(<m.TypeContainer>typeQuery.type, <TypeContainerVisitor>v)
        }
      }
    case m.ModelKind.VALUE:
      if (visitor.onVariable) {
        let v = visitor.onVariable(<m.Value<any, any>>typeQuery.type)
        if (v) {
          visitValue(<m.Value<any, any>>typeQuery.type, <MemberVisitor>v)
        }
      }
    case m.ModelKind.TYPE:
      visitType(<m.Type>typeQuery.type, visitor)
  }
}

export function visitType(type: m.Type, visitor: TypeVisitor) {
  switch (type.typeKind) {
    case m.TypeKind.FUNCTION:
      if (visitor.onFunctionType) {
        let v = visitor.onFunctionType(<m.FunctionType>type)
        if (v) {
          visitFunctionType(<m.FunctionType>type, <FunctionTypeVisitor>v)
        }
      }
    case m.TypeKind.COMPOSITE:
      if (visitor.onCompositeType) {
        let v = visitor.onCompositeType(<m.CompositeType>type)
        if (v) {
          visitCompositeType(<m.CompositeType>type, <CompositeTypeVisitor>v)
        }
      }
    case m.TypeKind.INTERFACE:
      if (visitor.onInterface) {
        let v = visitor.onInterface(<m.Interface>type)
        if (v) {
          visitInterface(<m.Interface>type, <InterfaceVisitor>v)
        }
      }
    case m.TypeKind.CLASS:
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
    case m.TypeKind.ENUM:
      if (visitor.onEnumType) {
        visitor.onEnumType(<m.EnumType>type)
      }
    case m.TypeKind.TYPE_QUERY:
      if (visitor.onTypeQuery) {
        let v = visitor.onTypeQuery(<m.TypeQuery>type)
        if (v) {
          visitTypeQuery(<m.TypeQuery>type, <TypeQueryVisitor>v)
        }
      }
    case m.TypeKind.UNION:
      if (visitor.onUnionType) {
        let v = visitor.onUnionType(<m.UnionType>type)
        if (v) {
          visitUnionType(<m.UnionType>type, <UnionTypeVisitor>v)
        }
      }
    case m.TypeKind.TUPLE:
      if (visitor.onTupleType) {
        let v = visitor.onTupleType(<m.TupleType>type)
        if (v) {
          visitTupleType(<m.TupleType>type, <TupleTypeVisitor>v)
        }
      }
    case m.TypeKind.COMPOSITE:
      if (visitor.onCompositeType) {
        let v = visitor.onCompositeType(<m.CompositeType>type)
        if (v) {
          visitCompositeType(<m.CompositeType>type, <CompositeTypeVisitor>v)
        }
      }
    case m.TypeKind.TYPE_ALIAS:
      if (visitor.onTypeAlias) {
        let v = visitor.onTypeAlias(<m.TypeAlias<any>>type)
        if (v) {
          visitType((<m.TypeAlias<any>>type).type, <TypeVisitor>v)
        }
      }
    case m.TypeKind.PRIMITIVE:
      let p = <m.PrimitiveType>type
      switch (p.primitiveTypeKind) {
        case m.PrimitiveTypeKind.STRING:
          if (visitor.onString) {
            visitor.onString()
          }
        case m.PrimitiveTypeKind.BOOLEAN:
          if (visitor.onBoolean) {
            visitor.onBoolean()
          }
        case m.PrimitiveTypeKind.NUMBER:
          if (visitor.onNumber) {
            visitor.onNumber()
          }
        case m.PrimitiveTypeKind.VOID:
          if (visitor.onVoid) {
            visitor.onVoid()
          }
        case m.PrimitiveTypeKind.ANY:
          if (visitor.onAny) {
            visitor.onAny()
          }
      }
  }
}
