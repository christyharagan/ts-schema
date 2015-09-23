import * as m from './model'
import * as f from './factories'

export interface FactoriesModulesVisitor extends ModulesVisitor<f.ModuleFactory, FactoriesContainerVisitor> {}
export interface FactoriesContainerVisitor extends ContainerVisitor<
f.NamespaceFactory,
f.ClassConstructorFactory,
f.InterfaceConstructorFactory,
f.TypeAliasConstructorFactory<any>,
f.EnumFactory,
f.ValueFactory<any>,
FactoriesClassConstructorVisitor,
FactoriesInterfaceConstructorVisitor,
FactoriesTypeAliasConstructorVisitor,
FactoriesValueVisitor,
FactoriesEnumVisitor,
FactoriesContainerVisitor> {}
export interface FactoriesClassConstructorVisitor extends ClassConstructorVisitor<
f.ClassFactory,
f.InterfaceFactory,
f.DecoratedCompositeTypeFactory<f.ClassConstructorFactory>,
f.TypeParameterFactory<f.ClassConstructorFactory>,
f.DecoratorFactory<f.ClassConstructorFactory>,
FactoriesClassVisitor,
FactoriesInterfaceVisitor,
FactoriesCompositeTypeVisitor,
FactoriesDecoratorVisitor,
FactoriesTypeParameterVisitor> {}
export interface FactoriesInterfaceConstructorVisitor extends InterfaceConstructorVisitor<
f.InterfaceFactory,
f.CompositeTypeFactory<f.InterfaceConstructorFactory>,
f.TypeParameterFactory<f.InterfaceConstructorFactory>,
FactoriesInterfaceVisitor,
FactoriesCompositeTypeVisitor,
FactoriesTypeParameterVisitor> {}
export interface FactoriesTypeAliasConstructorVisitor extends TypeAliasConstructorVisitor<
f.TypeFactory<any>,
f.TypeParameterFactory<f.TypeAliasConstructorFactory<any>>,
FactoriesTypeParameterVisitor,
FactoriesTypeVisitor
>{}
export interface FactoriesValueVisitor extends ValueVisitor<
f.TypeFactory<any>,
FactoriesTypeVisitor
>{}
export interface FactoriesEnumVisitor extends EnumVisitor<
f.EnumMemberFactory
>{}
export interface FactoriesClassVisitor extends ClassVisitor<
f.ClassConstructorFactory,
f.ClassFactory,
f.InterfaceFactory,
f.DecoratedCompositeTypeFactory<f.ClassFactory>,
f.TypeParameterFactory<f.ClassConstructorFactory>,
f.TypeFactory<any>,
f.DecoratorFactory<f.ClassFactory>,
FactoriesClassConstructorVisitor,
FactoriesClassVisitor,
FactoriesInterfaceVisitor,
FactoriesCompositeTypeVisitor,
FactoriesDecoratorVisitor,
FactoriesTypeVisitor
>{}
export interface FactoriesInterfaceVisitor extends InterfaceVisitor<
f.InterfaceConstructorFactory,
f.InterfaceFactory,
f.CompositeTypeFactory<f.InterfaceFactory>,
f.TypeParameterFactory<f.InterfaceConstructorFactory>,
f.TypeFactory<any>,
FactoriesInterfaceConstructorVisitor,
FactoriesInterfaceVisitor,
FactoriesCompositeTypeVisitor,
FactoriesTypeVisitor
>{}
export interface FactoriesCompositeTypeVisitor extends CompositeTypeVisitor<
f.MemberFactory<any, any>,
f.IndexFactory,
f.FunctionTypeFactory,
FactoriesMemberVisitor,
FactoriesFunctionTypeVisitor,
FactoriesTypeVisitor
>{}
export interface FactoriesTypeParameterVisitor extends TypeParameterVisitor<
f.TypeFactory<any>,
FactoriesTypeVisitor
>{}
export interface FactoriesDecoratorVisitor extends DecoratorVisitor<
f.ExpressionFactory<any>
>{}
export interface FactoriesMemberVisitor extends MemberVisitor<
f.TypeFactory<any>,
f.ExpressionFactory<any>,
f.DecoratorFactory<any>,
FactoriesTypeVisitor,
FactoriesDecoratorVisitor
>{}
export interface FactoriesFunctionTypeVisitor extends FunctionTypeVisitor<
f.TypeFactory<any>,
f.ParameterFactory<any>,
f.TypeParameterFactory<any>,
FactoriesTypeVisitor,
FactoriesParameterVisitor,
FactoriesTypeParameterVisitor
>{}
export interface FactoriesParameterVisitor extends ParameterVisitor<
f.TypeFactory<any>,
f.DecoratorFactory<any>,
FactoriesTypeVisitor,
FactoriesDecoratorVisitor
>{}
export interface FactoriesTypeVisitor extends TypeVisitor<
f.CompositeTypeFactory<any>,
f.FunctionTypeFactory,
f.UnionOrIntersectionTypeFactory,
f.TupleTypeFactory,
f.ClassFactory,
f.InterfaceFactory,
f.TypeQueryFactory<any>,
f.TypeAliasFactory<any>,
f.TypeParameterFactory<any>,
f.EnumFactory,
FactoriesCompositeTypeVisitor,
FactoriesFunctionTypeVisitor,
FactoriesUnionOrIntersectionTypeVisitor,
FactoriesTupleTypeVisitor,
FactoriesClassVisitor,
FactoriesInterfaceVisitor,
FactoriesTypeQueryVisitor,
FactoriesTypeAliasVisitor,
FactoriesEnumVisitor,
FactoriesTypeVisitor
>{}
export interface FactoriesUnionOrIntersectionTypeVisitor extends UnionOrIntersectionTypeVisitor<
f.TypeFactory<any>,
FactoriesTypeVisitor
>{}
export interface FactoriesTupleTypeVisitor extends TupleTypeVisitor<
f.TypeFactory<any>,
FactoriesTypeVisitor
>{}
export interface FactoriesTypeQueryVisitor extends TypeQueryVisitor<
f.ValueFactory<any>,
f.NamespaceFactory,
f.CompositeTypeFactory<any>,
f.FunctionTypeFactory,
f.UnionOrIntersectionTypeFactory,
f.TupleTypeFactory,
f.ClassFactory,
f.InterfaceFactory,
f.TypeQueryFactory<any>,
f.TypeAliasFactory<any>,
f.TypeParameterFactory<any>,
f.EnumFactory,
FactoriesValueVisitor,
FactoriesContainerVisitor,
FactoriesCompositeTypeVisitor,
FactoriesFunctionTypeVisitor,
FactoriesUnionOrIntersectionTypeVisitor,
FactoriesTupleTypeVisitor,
FactoriesClassVisitor,
FactoriesInterfaceVisitor,
FactoriesTypeQueryVisitor,
FactoriesTypeAliasVisitor,
FactoriesEnumVisitor,
FactoriesTypeVisitor
>{}
export interface FactoriesTypeAliasVisitor extends TypeAliasVisitor<
f.TypeAliasConstructorFactory<any>,
f.TypeParameterFactory<any>,
f.TypeFactory<any>,
FactoriesTypeAliasConstructorVisitor,
FactoriesTypeVisitor
>{}

export interface ModulesVisitor<
Module extends m.ContainerTemplate<any, any, any, any, any, any>,
CV extends ContainerVisitor<any, any, any, any, any, any, any, any, any, any, any, any>
> {
  onModule: (module: Module) => void|CV
}

export interface ContainerVisitor<
Namespace extends m.ContainerTemplate<any, any, any, any, any, any>,
ClassConstructor extends m.ClassConstructorTemplate<any, any, any, any, any>,
InterfaceConstructor extends m.InterfaceConstructorTemplate<any, any, any>,
TypeAliasConstructor extends m.TypeAliasConstructorTemplate<any, any>,
Enum extends m.EnumTemplate<any>,
Value extends m.ValueTemplate<any, any>,
CCV extends ClassConstructorVisitor<any, any, any, any, any, any, any, any, any, any>,
ICV extends InterfaceConstructorVisitor<any, any, any, any, any, any>,
TACV extends TypeAliasConstructorVisitor<any, any, any, any>,
VV extends ValueVisitor<any, any>,
EV extends EnumVisitor<any>,
NV extends ContainerVisitor<any, any, any, any, any, any, any, any, any, any, any, any>
> {
  onClassConstructor?: (cls: ClassConstructor) => void|CCV
  onInterfaceConstructor?: (inter: InterfaceConstructor) => void|ICV
  onTypeAliasConstructor?: (alias: TypeAliasConstructor) => void|TACV
  onEnum?: (e: Enum) =>void|EV
  onValue?: (staticMember: Value) => void|VV
  onNamespace?: (namespace: Namespace) => void|NV
}

export interface ValueVisitor<
Type extends m.TypeTemplate,
TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>> {
  onType?: (type: Type) => void|TV
}

export interface TypeAliasConstructorVisitor<
Type extends m.TypeTemplate,
TypeParameter extends m.TypeParameterTemplate<any>,
TPV extends TypeParameterVisitor<any, any>,
TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>
> {
  onTypeParameter?: (typeParameter: TypeParameter) => void|TPV
  onType?: (type:Type)=>void|TV
}

export interface ClassConstructorVisitor<
Class extends m.ClassTemplate<any, any, any, any, any, any>,
Interface extends m.InterfaceTemplate<any, any, any, any>,
DecoratedCompositeType extends m.DecoratedCompositeTypeTemplate<any, any, any>,
TypeParameter extends m.TypeParameterTemplate<any>,
Decorator extends m.DecoratorTemplate<any, any>,
CV extends ClassVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any>,
IV extends InterfaceVisitor<any, any, any,any, any, any,any, any, any>,
CTV extends CompositeTypeVisitor<any, any, any, any, any, any>,
DV extends DecoratorVisitor<any>,
TPV extends TypeParameterVisitor<any, any>
> {
  onExtend?: (extend: Class) => void|CV
  onImplement?: (extend: Interface) => void|IV
  onInstanceType?: (instanceType: DecoratedCompositeType) => void|CTV
  onStaticType?: (instanceType: DecoratedCompositeType) => void|CTV
  onTypeParameter?: (typeParameter: TypeParameter) => void|TPV
  onClassConstructorDecorator?: (classDecorator: Decorator) => void|DV
}

export interface InterfaceConstructorVisitor<
Interface extends m.InterfaceTemplate<any, any, any, any>,
CompositeType extends m.CompositeTypeTemplate<any, any, any>,
TypeParameter extends m.TypeParameterTemplate<any>,
IV extends InterfaceVisitor<any, any, any,any, any, any,any, any, any>,
CTV extends CompositeTypeVisitor<any, any, any, any, any, any>,
TPV extends TypeParameterVisitor<any, any>
> {
  onExtend?: (extend: Interface) => void|IV
  onInstanceType?: (instanceType: CompositeType) => void|CTV
  onTypeParameter?: (typeParameter: TypeParameter) => void|TPV
}

export interface ClassVisitor<
ClassConstructor extends m.ClassConstructorTemplate<any, any, any, any, any>,
Class extends m.ClassTemplate<any, any, any, any, any, any>,
Interface extends m.InterfaceTemplate<any, any, any, any>,
DecoratedCompositeType extends m.DecoratedCompositeTypeTemplate<any, any, any>,
TypeParameter extends m.TypeParameterTemplate<any>,
TypeArgument extends m.TypeTemplate,
Decorator extends m.DecoratorTemplate<any, any>,
CCV extends ClassConstructorVisitor<any, any, any, any, any, any, any, any, any, any>,
CV extends ClassVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any>,
IV extends InterfaceVisitor<any, any, any,any, any, any,any, any, any>,
CTV extends CompositeTypeVisitor<any, any, any, any, any, any>,
DV extends DecoratorVisitor<any>,
TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>
> {
  onClassConstructor?: (classConstructor: ClassConstructor) => void|CCV
  onExtend?: (extend: Class) => void|CV
  onImplement?: (extend: Interface) => void|IV
  onInstanceType?: (instanceType: DecoratedCompositeType) => void|CTV
  onStaticType?: (instanceType: DecoratedCompositeType) => void|CTV
  onTypeArgument?: (typeArgument: TypeArgument, typeParameter: TypeParameter) => void|TV
  onClassDecorator?: (classDecorator: Decorator) => void|DV
}


export interface InterfaceVisitor<
InterfaceConstructor extends m.InterfaceConstructorTemplate<any, any, any>,
Interface extends m.InterfaceTemplate<any, any, any, any>,
CompositeType extends m.CompositeTypeTemplate<any, any, any>,
TypeParameter extends m.TypeParameterTemplate<any>,
TypeArgument extends m.TypeTemplate,
ICV extends InterfaceConstructorVisitor<any, any, any, any, any, any>,
IV extends InterfaceVisitor<any, any, any,any, any, any,any, any, any>,
CTV extends CompositeTypeVisitor<any, any, any, any, any, any>,
TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>
> {
  onInterfaceConstructor?: (interfaceConstructor: InterfaceConstructor) => void|ICV
  onTypeArgument?: (typeArgument: TypeArgument, typeParameter: TypeParameter) => void|TV
  onExtend?: (extend: Interface) => void|IV
  onInstanceType?: (instanceType: CompositeType) => void|CTV
}

export interface CompositeTypeVisitor<
Member extends m.MemberTemplate<any, any>,
Index extends m.IndexTemplate<any>,
FunctionType extends m.FunctionTypeTemplate<any, any, any>,
MV extends MemberVisitor<any, any, any, any, any>,
FTV extends FunctionTypeVisitor<any, any, any, any, any, any>,
TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>
> {
  onMember?: (member: Member) => void|MV
  onIndex?: (index: Index) => void|TV
  onCall?: (call: FunctionType) => void|FTV
}

export interface MemberVisitor<
Type extends m.TypeTemplate,
Expression extends m.ExpressionTemplate,
Decorator extends m.DecoratorTemplate<any, any>,
TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>,
DV extends DecoratorVisitor<any>
> {
  onType?: (alias: Type) => void|TV
  onInitializer?: (initializer: Expression) => void
  onMemberDecorator?: (decorator: Decorator) => void|DV
}

export interface TypeParameterVisitor<
Type extends m.TypeTemplate,
TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>
> {
  onExtends?: (type:Type)=> void|TV
}

export interface DecoratorVisitor<Expression extends m.ExpressionTemplate> {
  onParameter?: (parameter: Expression) =>void
}

export interface TypeAliasVisitor<
TypeAliasConstructor extends m.TypeAliasConstructorTemplate<any, any>,
TypeParameter extends m.TypeParameterTemplate<any>,
Type extends m.TypeTemplate,
TACV extends TypeAliasConstructorVisitor<any, any, any, any>,
TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>
> {
  onInterfaceConstructor?: (interfaceConstructor: TypeAliasConstructor) => void|TACV
  onTypeArgument?: (typeArgument: Type, typeParameter: TypeParameter) => void|TV
  onType?: (type:Type)=>void|TV
}

export interface TypeVisitor<
CompositeType extends m.CompositeTypeTemplate<any, any, any>,
FunctionType extends m.FunctionTypeTemplate<any, any, any>,
UnionOrIntersectionType extends m.UnionOrIntersectionTypeTemplate<any>,
TupleType extends m.TupleTypeTemplate<any>,
Class extends m.ClassTemplate<any, any, any, any, any, any>,
Interface extends m.InterfaceTemplate<any, any, any, any>,
TypeQuery extends m.TypeQueryTemplate<any>,
TypeAlias extends m.TypeAliasTemplate<any, any, any>,
TypeParameter extends m.TypeParameterTemplate<any>,
Enum extends m.EnumTemplate<any>,
CTV extends CompositeTypeVisitor<any, any, any, any, any, any>,
FTV extends FunctionTypeVisitor<any, any, any, any, any, any>,
UITV extends UnionOrIntersectionTypeVisitor<any, any>,
TTV extends TupleTypeVisitor<any, any>,
CV extends ClassVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any>,
IV extends InterfaceVisitor<any, any, any,any, any, any,any, any, any>,
TQV extends TypeQueryVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>,
TAV extends TypeAliasVisitor<any, any, any, any, any>,
EV extends EnumVisitor<any>,
TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>
> {
  onCompositeType?: (compositeType: CompositeType) => void|CTV
  onFunctionType?: (functionType: FunctionType) => void|FTV
  onUnionType?: (unionType: UnionOrIntersectionType) => void|UITV
  onIntersectionType?: (unionType: UnionOrIntersectionType) => void|UITV
  onTupleType?: (tupleType: TupleType) => void|TTV
  onClass?: (cls: Class) => void|CV
  onInterface?: (int: Interface) => void|IV
  onTypeQuery?: (typeQuery: TypeQuery) => void|TQV
  onTypeAlias?: (typeAlias: TypeAlias) => void|TAV
  onTypeParameter?: (typeParameter: TypeParameter) => void|TV

  onEnumType?: (enumType: Enum) => void

  onString?: () => void
  onBoolean?: () => void
  onNumber?: () => void
  onAny?: () => void
  onSymbol?: () => void
  onVoid?: () => void

  onArrayType?: (array: Class) => void|TV
}

export interface TypeQueryVisitor<
Value extends m.ValueTemplate<any, any>,
Namespace extends m.ContainerTemplate<any, any, any, any, any, any>,
CompositeType extends m.CompositeTypeTemplate<any, any, any>,
FunctionType extends m.FunctionTypeTemplate<any, any, any>,
UnionOrIntersectionType extends m.UnionOrIntersectionTypeTemplate<any>,
TupleType extends m.TupleTypeTemplate<any>,
Class extends m.ClassTemplate<any, any, any, any, any, any>,
Interface extends m.InterfaceTemplate<any, any, any, any>,
TypeQuery extends m.TypeQueryTemplate<any>,
TypeAlias extends m.TypeAliasTemplate<any, any, any>,
TypeParameter extends m.TypeParameterTemplate<any>,
Enum extends m.EnumTemplate<any>,
VV extends ValueVisitor<any, any>,
NV extends ContainerVisitor<any, any, any, any, any, any, any, any, any, any, any, any>,
CTV extends CompositeTypeVisitor<any, any, any, any, any, any>,
FTV extends FunctionTypeVisitor<any, any, any, any, any, any>,
UITV extends UnionOrIntersectionTypeVisitor<any, any>,
TTV extends TupleTypeVisitor<any, any>,
CV extends ClassVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any>,
IV extends InterfaceVisitor<any, any, any,any, any, any,any, any, any>,
TQV extends TypeQueryVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>,
TAV extends TypeAliasVisitor<any, any, any, any, any>,
EV extends EnumVisitor<any>,
TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>
> extends TypeVisitor<
CompositeType,
FunctionType,
UnionOrIntersectionType,
TupleType,
Class,
Interface,
TypeQuery,
TypeAlias,TypeParameter, Enum, CTV, FTV, UITV, TTV, CV, IV, TQV, TAV, EV, TV> {
  onValue?: (variable: Value) => void|VV
  onNamespace?: (ns: Namespace) => void|NV
}

export interface EnumVisitor<EnumMember extends m.EnumMemberTemplate<any>> {
  onEnumMember? (enumMember: EnumMember)
}

export interface FunctionTypeVisitor<
Type extends m.TypeTemplate,
Parameter extends m.ParameterTemplate<any, any>,
TypeParameter extends m.TypeParameterTemplate<any>,
TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>,
PV extends ParameterVisitor<any, any, any, any>,
TPV extends TypeParameterVisitor<any, any>
> {
  onType?: (type: Type) => void|TV
  onParameter?: (parameter: Parameter) => void|PV
  onTypeParameter?: (typeParameter: TypeParameter) => void|TPV
}

export interface UnionOrIntersectionTypeVisitor<
Type extends m.TypeTemplate,
TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>
> {
  onType?: (type: Type) => void|TV
}

export interface TupleTypeVisitor<
Type extends m.TypeTemplate,
TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>
> {
  onType?: (type: Type) => void|TV
}

export interface ParameterVisitor<
Type extends m.TypeTemplate,
Decorator extends m.DecoratorTemplate<any, any>,
TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>,
DV extends DecoratorVisitor<any>
> {
  onType?: (alias: Type) => void|TV
  onParameterDecorator?: (decorator: Decorator) => void|DV
}

export function visitModules<Module extends m.ContainerTemplate<any, any, any, any, any, any>, MV extends ModulesVisitor<any, any>>(modules: m.KeyValue<Module>, visitor: MV) {
  Object.keys(modules).forEach(function(name) {
    let module = modules[name]
    let v = visitor.onModule(module)
    if (v) {
      visitTypeContainer(module, <ContainerVisitor<any, any, any, any, any, any, any, any, any, any, any, any>>v)
    }
  })
}

export function visitTypeContainer<Container extends m.ContainerTemplate<any, any, any, any, any, any>, CV extends ContainerVisitor<any, any, any, any, any, any, any, any, any, any, any, any>>(container: Container, visitor: CV) {
  if (visitor.onClassConstructor) {
    Object.keys(container.classConstructors).forEach(function(name: string) {
      let classSchema = container.classConstructors[name]
      let ccVisitor = visitor.onClassConstructor(classSchema)
      if (ccVisitor) {
        visitClassConstructor(classSchema, <ClassConstructorVisitor<any, any, any, any, any, any, any, any, any, any>>ccVisitor)
      }
    })
  }

  if (visitor.onInterfaceConstructor) {
    Object.keys(container.interfaceConstructors).forEach(function(name: string) {
      let interfaceSchema = container.interfaceConstructors[name]
      let icVisitor = visitor.onInterfaceConstructor(interfaceSchema)
      if (icVisitor) {
        visitInterfaceConstructor(interfaceSchema, <InterfaceConstructorVisitor<any, any, any, any, any, any>>icVisitor)
      }
    })
  }

  if (visitor.onTypeAliasConstructor) {
    Object.keys(container.typeAliasConstructors).forEach(function(name: string) {
      let type = container.typeAliasConstructors[name]
      let tVisitor = visitor.onTypeAliasConstructor(type)
      if (tVisitor) {
        visitType(type.type, <TypeAliasConstructorVisitor<any, any, any, any>>tVisitor)
      }
    })
  }
  if (visitor.onEnum) {
    Object.keys(container.enums).forEach(function(name: string){
      let e = container.enums[name]
      let eVisitor = visitor.onEnum(e)
      if (eVisitor) {
        visitEnum(e, <EnumVisitor<any>>eVisitor)
      }
    })
  }
  if (visitor.onValue) {
    Object.keys(container.values).forEach(function(name: string) {
      let s = container.values[name]
      let sVisitor = visitor.onValue(s)
      if (sVisitor) {
        visitValue(s, <ValueVisitor<any, any>>sVisitor)
      }
    })
  }
  if (visitor.onNamespace) {
    Object.keys(container.namespaces).forEach(function(name: string) {
      let nspace = container.namespaces[name]
      let nsVisitor = visitor.onNamespace(nspace)
      if (nsVisitor) {
        visitTypeContainer(nspace, <ContainerVisitor<any, any, any, any, any, any, any, any, any, any, any, any>>nsVisitor)
      }
    })
  }
}

export function visitValue<Value extends m.ValueTemplate<any, any>, VV extends ValueVisitor<any, any>>(value: Value, visitor: VV) {
  if (visitor.onType) {
    let v = visitor.onType(value.type)
    if (v) {
      visitType(value.type, <TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>>v)
    }
  }
}

export function visitEnum<Enum extends m.EnumTemplate<any>, EV extends EnumVisitor<any>>(e: Enum, visitor: EV) {
  if (visitor.onEnumMember) {
    e.members.forEach(function(member){
      visitor.onEnumMember(member)
    })
  }
}

export function visitClassConstructor<ClassConstructor extends m.ClassConstructorTemplate<any, any, any, any, any>, CCV extends ClassConstructorVisitor<any, any, any, any, any, any, any, any, any, any>>(cls: ClassConstructor, visitor: CCV) {
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
      visitClass(cls.extends, <ClassVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any>>eVisitor)
    }
  }
  if (visitor.onImplement && cls.implements) {
    cls.implements.forEach(function(impl) {
      let iVisitor = visitor.onImplement(impl)
      if (iVisitor) {
        visitInterface(impl, <InterfaceVisitor<any, any, any,any, any, any,any, any, any>>iVisitor)
      }
    })
  }
  if (visitor.onInstanceType) {
    let iVisitor = visitor.onInstanceType(cls.instanceType)
    if (iVisitor) {
      visitCompositeType(cls.instanceType, <CompositeTypeVisitor<any, any, any, any, any, any>>iVisitor)
    }
  }
  if (visitor.onStaticType) {
    let sVisitor = visitor.onStaticType(cls.staticType)
    if (sVisitor) {
      visitCompositeType(cls.staticType, <CompositeTypeVisitor<any, any, any, any, any, any>>sVisitor)
    }
  }
}

export function visitClass<Class extends m.ClassTemplate<any, any, any, any, any, any>, CV extends ClassVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any>>(cls: Class, visitor: CV) {
  if (visitor.onClassConstructor) {
    let ccVisitor = visitor.onClassConstructor(cls.typeConstructor)
    if (ccVisitor) {
      visitClassConstructor(cls.typeConstructor, <ClassConstructorVisitor<any, any, any, any, any, any, any, any, any, any>>ccVisitor)
    }
  }
  if (visitor.onClassDecorator && cls.decorators) {
    cls.decorators.forEach(function(decorator) {
      visitor.onClassDecorator(decorator)
    })
  }
  if (visitor.onTypeArgument && cls.typeArguments) {
    cls.typeArguments.forEach(function(typeArgument, i) {
      visitor.onTypeArgument(<any>typeArgument, cls.typeConstructor.typeParameters[i])
    })
  }
  if (visitor.onExtend && cls.extends) {
    let eVisitor = visitor.onExtend(cls.extends)
    if (eVisitor) {
      visitClass(cls.extends, <any>eVisitor)
    }
  }
  if (visitor.onImplement && cls.implements) {
    cls.implements.forEach(function(impl) {
      let iVisitor = visitor.onImplement(impl)
      if (iVisitor) {
        visitInterface(impl, <any>iVisitor)
      }
    })
  }
  if (visitor.onInstanceType) {
    let iVisitor = visitor.onInstanceType(cls.instanceType)
    if (iVisitor) {
      visitCompositeType(cls.instanceType, <any>iVisitor)
    }
  }
  if (visitor.onStaticType) {
    let sVisitor = visitor.onStaticType(cls.staticType)
    if (sVisitor) {
      visitCompositeType(cls.staticType, <any>sVisitor)
    }
  }
}

export function visitInterfaceConstructor<InterfaceConstructor extends m.InterfaceConstructorTemplate<any, any, any>, ICV extends InterfaceConstructorVisitor<any, any, any, any, any, any>>(inter: InterfaceConstructor, visitor: ICV) {
  if (visitor.onTypeParameter && inter.typeParameters) {
    inter.typeParameters.forEach(function(typeParameter) {
      visitor.onTypeParameter(typeParameter)
    })
  }
  if (visitor.onExtend && inter.extends) {
    inter.extends.forEach(function(impl) {
      let iVisitor = visitor.onExtend(impl)
      if (iVisitor) {
        visitInterface(impl, <any>iVisitor)
      }
    })
  }
  if (visitor.onInstanceType) {
    let iVisitor = visitor.onInstanceType(inter.instanceType)
    if (iVisitor) {
      visitCompositeType(inter.instanceType, <any>iVisitor)
    }
  }
}

export function visitInterface<Interface extends m.InterfaceTemplate<any, any, any, any>, IV extends InterfaceVisitor<any, any, any,any, any, any,any, any, any>>(inter: Interface, visitor: IV) {
  if (visitor.onInterfaceConstructor) {
    let icVisitor = visitor.onInterfaceConstructor(inter.typeConstructor)
    if (icVisitor) {
      visitInterfaceConstructor(inter.typeConstructor, <any>icVisitor)
    }
  }
  if (visitor.onTypeArgument && inter.typeArguments) {
    inter.typeArguments.forEach(function(typeArgument, i) {
      visitor.onTypeArgument(<any>typeArgument, inter.typeConstructor.typeParameters[i])
    })
  }
  if (visitor.onExtend && inter.extends) {
    inter.extends.forEach(function(impl) {
      let iVisitor = visitor.onExtend(impl)
      if (iVisitor) {
        visitInterface(impl, <any>iVisitor)
      }
    })
  }
  if (visitor.onInstanceType) {
    let iVisitor = visitor.onInstanceType(inter.instanceType)
    if (iVisitor) {
      visitCompositeType(inter.instanceType, <any>iVisitor)
    }
  }
}

export function visitCompositeType<CompositeType extends m.CompositeTypeTemplate<any, any, any>, CTV extends CompositeTypeVisitor<any, any, any, any, any, any>>(compositeType: CompositeType, visitor: CTV) {
  if (visitor.onMember) {
    Object.keys(compositeType.members).forEach(function(memberName) {
      let member = compositeType.members[memberName]
      let mVisitor = visitor.onMember(member)
      if (mVisitor) {
        visitMember(member, <any>mVisitor)
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
        visitFunctionType(call, <any>cVisitor)
      }
    })
  }
}

export function visitMember<Member extends m.MemberTemplate<any, any>, MV extends MemberVisitor<any, any, any, any, any>>(member: Member, visitor: MV) {
  if (visitor.onType) {
    let tVisitor = visitor.onType(member.type)
    if (tVisitor) {
      visitType(member.type, <any>tVisitor)
    }
  }
  if (visitor.onMemberDecorator && (<m.DecoratedMemberTemplate<any, any, any>>member).decorators) {
    (<m.DecoratedMemberTemplate<any, any, any>>member).decorators.forEach(function(decorator) {
      visitor.onMemberDecorator(decorator)
    })
  }
}

export function visitUnionOrIntersectionType<UnionOrIntersectionType extends m.UnionOrIntersectionTypeTemplate<any>, UITV extends UnionOrIntersectionTypeVisitor<any, any>>(unionType: UnionOrIntersectionType, visitor: UITV) {
  if (visitor.onType) {
    unionType.types.forEach(function(type) {
      let v = visitor.onType(type)
      if (v) {
        visitType(type, <any>v)
      }
    })
  }
}

export function visitTupleType<TupleType extends m.TupleTypeTemplate<any>, TTV extends TupleTypeVisitor<any, any>>(tupleType: TupleType, visitor: TTV) {
  if (visitor.onType) {
    tupleType.elements.forEach(function(type) {
      let v = visitor.onType(type)
      if (v) {
        visitType(type, <any>v)
      }
    })
  }
}

export function visitFunctionType<FunctionType extends m.FunctionTypeTemplate<any, any, any>, FTV extends FunctionTypeVisitor<any, any, any, any, any, any>>(functionType: FunctionType, visitor: FTV) {
  if (visitor.onType && functionType.type) {
    let tVisitor = visitor.onType(functionType.type)
    if (tVisitor) {
      visitType(functionType.type, <any>tVisitor)
    }
  }
  if (visitor.onParameter) {
    functionType.parameters.forEach(function(parameter) {
      let pVisitor = visitor.onParameter(parameter)
      if (pVisitor) {
        visitParameter(parameter, <any>pVisitor)
      }
    })
  }
  if (visitor.onTypeParameter && functionType.typeParameters) {
    functionType.typeParameters.forEach(function(typeParameter) {
      visitor.onTypeParameter(typeParameter)
    })
  }
}

export function visitParameter<Parameter extends m.ParameterTemplate<any, any>, PV extends ParameterVisitor<any, any, any, any>>(parameter: Parameter, visitor: PV) {
  if (visitor.onType) {
    let tVisitor = visitor.onType(parameter.type)
    if (tVisitor) {
      visitType(parameter.type, <any>tVisitor)
    }
  }
  if (visitor.onParameterDecorator && (<m.DecoratedParameterTemplate<any, any, any>>parameter).decorators) {
    (<m.DecoratedParameterTemplate<any, any, any>>parameter).decorators.forEach(function(decorator) {
      visitor.onParameterDecorator(decorator)
    })
  }
}

export function visitTypeQuery<TypeQuery extends m.TypeQueryTemplate<any>, TQV extends TypeQueryVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>>(typeQuery: TypeQuery, visitor: TQV) {
  if ((<m.TypeTemplate>typeQuery.type).typeKind) {
    visitType(typeQuery.type, visitor)
  } else if ((<m.ValueTemplate<any, any>>typeQuery.type).type) {
    if (visitor.onValue) {
      let v = visitor.onValue(typeQuery.type)
      if (v) {
        visitValue(typeQuery.type, <any>v)
      }
    }
  } else {
    if (visitor.onNamespace) {
      let v = visitor.onNamespace(<any>typeQuery.type)
      if (v) {
        visitTypeContainer(typeQuery.type, <any>v)
      }
    }
  }
}

export function visitType<Type extends m.TypeTemplate, TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>>(type: Type, visitor: TV) {
  switch (type.typeKind) {
    case m.TypeKind.FUNCTION:
      if (visitor.onFunctionType) {
        let v = visitor.onFunctionType(type)
        if (v) {
          visitFunctionType(<any>type, <any>v)
        }
      }
    case m.TypeKind.COMPOSITE:
      if (visitor.onCompositeType) {
        let v = visitor.onCompositeType(type)
        if (v) {
          visitCompositeType(<any>type, <any>v)
        }
      }
    case m.TypeKind.INTERFACE:
      if (visitor.onInterface) {
        let v = visitor.onInterface(type)
        if (v) {
          visitInterface(<any>type, <any>v)
        }
      }
    case m.TypeKind.CLASS:
      let cls = <m.ClassTemplate<any, any, any, any, any, any>><any>type
      if (cls.typeConstructor.name === 'Array' && cls.typeConstructor.parent.name === '' && visitor.onArrayType) {
        let v = visitor.onArrayType(cls)
        if (v) {
          visitType(cls.typeArguments[0], <any>v)
        }
      } else if (visitor.onClass) {
        let v = visitor.onClass(cls)
        if (v) {
          visitClass(cls, <any>v)
        }
      }
    case m.TypeKind.ENUM:
      if (visitor.onEnumType) {
        visitor.onEnumType(<any>type)
      }
    case m.TypeKind.TYPE_QUERY:
      if (visitor.onTypeQuery) {
        let v = visitor.onTypeQuery(<any>type)
        if (v) {
          visitTypeQuery(type, <any>v)
        }
      }
    case m.TypeKind.UNION:
      if (visitor.onUnionType) {
        let v = visitor.onUnionType(type)
        if (v) {
          visitUnionOrIntersectionType(<any>type, <any>v)
        }
      }
    case m.TypeKind.INTERSECTION:
      if (visitor.onUnionType) {
        let v = visitor.onIntersectionType(<any>type)
        if (v) {
          visitUnionOrIntersectionType(<any>type, <any>v)
        }
      }
    case m.TypeKind.TUPLE:
      if (visitor.onTupleType) {
        let v = visitor.onTupleType(type)
        if (v) {
          visitTupleType(<any>type, <any>v)
        }
      }
    case m.TypeKind.COMPOSITE:
      if (visitor.onCompositeType) {
        let v = visitor.onCompositeType(type)
        if (v) {
          visitCompositeType(<any>type, <any>v)
        }
      }
    case m.TypeKind.TYPE_ALIAS:
      if (visitor.onTypeAlias) {
        let v = visitor.onTypeAlias(<any>type)
        if (v) {
          visitType((<any>type).type, <any>v)
        }
      }
    case m.TypeKind.PRIMITIVE:
      let p = <m.PrimitiveTypeTemplate><any>type
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
        case m.PrimitiveTypeKind.SYMBOL:
          if (visitor.onSymbol) {
            visitor.onSymbol()
          }
      }
  }
}
