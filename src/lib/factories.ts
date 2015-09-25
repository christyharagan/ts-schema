import * as m from './model'

export interface Factory<M> extends m.ModelElementTemplate {
  modelKind: m.ModelKind
  construct(constructorConstructor: <U extends M>(factory: Factory<U>, parent?: Factory<any>) => (() => U)): () => M
}

export interface ContainedFactory<M> extends Factory<M>, m.ModelElementTemplate {
  parent: ContainerFactory
  name: string
}

export interface TypeFactory<T extends m.TypeTemplate> extends Factory<T>, m.TypeTemplate {
}

export interface ExpressionFactory<E extends m.ExpressionTemplate> extends Factory<E>, m.ExpressionTemplate {
}

export interface ContainerFactory extends Factory<m.ContainerTemplate<any, any, any, any, any, any>>, m.ContainerTemplate<ClassConstructorFactory, InterfaceConstructorFactory, TypeAliasConstructorFactory<any>, EnumFactory, ValueFactory<any>, ContainerFactory> {
  name: string
  containerKind: m.ContainerKind
  addClassConstructor(name: string): ClassConstructorFactory
  addInterfaceConstructor(name: string): InterfaceConstructorFactory
  addTypeAliasConstructor<T extends m.TypeTemplate>(name: string): TypeAliasConstructorFactory<T>
  addEnum(name: string): EnumFactory
  addValue(name: string): ValueFactory<any>
  addNamespace(name: string): NamespaceFactory
}

export interface DecoratedFactory<T extends m.DecoratedTemplate<any>, This extends DecoratedFactory<any, any>> extends Factory<T>, m.DecoratedTemplate<DecoratorFactory<This>> {
  addDecorator(): DecoratorFactory<This>
}

export interface TypeConstructorFactory<This extends TypeConstructorFactory<any>> extends Factory<m.TypeConstructorTemplate<any>>, m.TypeConstructorTemplate<TypeParameterFactory<This>> {
  addTypeParameter(name: string): TypeParameterFactory<This>
}

export abstract class AbstractFactory<M> implements Factory<M>, m.ModelElementTemplate {
  private _constructor: () => M

  modelKind: m.ModelKind

  constructor(modelKind?: m.ModelKind) {
    this.modelKind = modelKind
  }

  construct(constructorConstructor: <U extends M>(factory: Factory<U>) => (() => U)) {
    if (!this._constructor) {
      let self = this
      let _constructor = constructorConstructor(this)
      this._constructor = function() {
        self._constructor = undefined
        return _constructor()
      }
    }
    return this._constructor
  }
}

export abstract class AbstractExpressionFactory<E extends m.ExpressionTemplate> extends AbstractFactory<E> implements m.ExpressionTemplate {
  expressionKind: m.ExpressionKind
  constructor(kind: m.ExpressionKind) {
    super(m.ModelKind.EXPRESSION)
    this.expressionKind = kind
  }
}

export abstract class AbstractTypeFactory<T extends m.TypeTemplate> extends AbstractFactory<T> implements m.TypeTemplate {
  typeKind: m.TypeKind
  constructor(kind: m.TypeKind) {
    super(m.ModelKind.TYPE)
    this.typeKind = kind
  }
}

export class FunctionExpressionFactory extends AbstractExpressionFactory<m.FunctionExpressionTemplate<any>> implements m.FunctionExpressionTemplate<FunctionTypeFactory> {
  functionType: FunctionTypeFactory
  constructor() {
    super(m.ExpressionKind.FUNCTION)
  }
}

export class FunctionCallExpressionFactory extends AbstractExpressionFactory<m.FunctionCallExpressionTemplate<any>> implements m.FunctionCallExpressionTemplate<ExpressionFactory<any>> {
  function: ExpressionFactory<any>
  arguments: ExpressionFactory<any>[]
  constructor() {
    super(m.ExpressionKind.FUNCTION_CALL)
  }
  createFunction(kind: m.ExpressionKind) {
    if (!this.function) {
      let func = expressionFactory(kind)
      this.function = func
    }
    return this.function
  }
  addArgument<E extends AbstractExpressionFactory<any>>(kindOrExpression: m.ExpressionKind|E) {
    let argument = expressionFactory(kindOrExpression)
    this.arguments.push(argument)
    return argument
  }
}

export class PropertyAccessExpressionFactory extends AbstractExpressionFactory<m.PropertyAccessExpressionTemplate<any>> implements m.PropertyAccessExpressionTemplate<ExpressionFactory<any>> {
  parent: ExpressionFactory<any>
  property: string
  constructor() {
    super(m.ExpressionKind.PROPERTY_ACCESS)
  }
  createParent<E extends AbstractExpressionFactory<any>>(kindOrExpression: m.ExpressionKind|E) {
    if (!this.parent) {
      let parent = expressionFactory(kindOrExpression)
      this.parent = parent
    }
    return <E>this.parent
  }
}

export class ValueExpressionFactory<T extends m.TypeTemplate> extends AbstractExpressionFactory<m.ValueExpressionTemplate<any>> implements m.ValueExpressionTemplate<ValueFactory<T>> {
  value: ValueFactory<T>
  constructor() {
    super(m.ExpressionKind.VALUE)
  }
}

export class EnumExpressionFactory extends AbstractExpressionFactory<m.EnumExpressionTemplate<any>> implements m.EnumExpressionTemplate<EnumFactory> {
  enum: EnumFactory
  value: string

  constructor() {
    super(m.ExpressionKind.ENUM)
  }
}

export class ClassExpressionFactory extends AbstractExpressionFactory<m.ClassExpressionTemplate<any>> implements m.ClassExpressionTemplate<ProtoClassFactory> {
  class: ProtoClassFactory

  constructor() {
    super(m.ExpressionKind.CLASS)
  }

  createClass() {
    if (!this.class) {
      this.class = new ProtoClassFactory()
    }
    return this.class
  }
}

export class ClassReferenceExpressionFactory extends AbstractExpressionFactory<m.ClassReferenceExpressionTemplate<any>> implements m.ClassReferenceExpressionTemplate<ClassConstructorFactory> {
  classReference: ClassConstructorFactory

  constructor() {
    super(m.ExpressionKind.CLASS_REFERENCE)
  }
}

export class NewExpressionFactory extends AbstractExpressionFactory<m.NewExpressionTemplate<any>> implements m.NewExpressionTemplate<ExpressionFactory<any>> {
  classReference: ExpressionFactory<any>
  arguments: ExpressionFactory<any>[]

  constructor() {
    super(m.ExpressionKind.NEW)
  }
}

export class ObjectExpressionFactory extends AbstractExpressionFactory<m.ObjectExpressionTemplate<any>> implements m.ObjectExpressionTemplate<ExpressionFactory<any>> {
  properties: m.KeyValue<ExpressionFactory<any>> = {}

  constructor() {
    super(m.ExpressionKind.OBJECT)
  }
  addProperty<E extends AbstractExpressionFactory<any>>(key: string, kindOrExpression: m.ExpressionKind|E): E {
    let ec = expressionFactory(kindOrExpression)
    this.properties[key] = ec
    return <E>ec
  }
}

export class ArrayExpressionFactory extends AbstractExpressionFactory<m.ArrayExpressionTemplate<any>> implements m.ArrayExpressionTemplate<ExpressionFactory<any>> {
  elements: ExpressionFactory<any>[] = []

  constructor() {
    super(m.ExpressionKind.ARRAY)
  }
  addElement<E extends AbstractExpressionFactory<any>>(kindOrExpression: m.ExpressionKind|E): E {
    let ec = expressionFactory(kindOrExpression)
    this.elements.push(ec)
    return <E>ec
  }
}

export class PrimitiveExpressionFactory<T extends m.Primitive> extends AbstractExpressionFactory<m.PrimitiveExpressionTemplate<T>> implements m.PrimitiveExpressionTemplate<T> {
  primitiveTypeKind: m.PrimitiveTypeKind
  primitiveValue: T

  constructor(primitiveTypeKind?: m.PrimitiveTypeKind, primitiveValue?: T) {
    super(m.ExpressionKind.PRIMITIVE)
    this.primitiveTypeKind = primitiveTypeKind
    this.primitiveValue = primitiveValue
  }
}

export class DecoratorFactory<P extends DecoratedFactory<any, any>> extends AbstractFactory<m.DecoratorTemplate<any, any>> implements m.DecoratorTemplate<ValueFactory<any>, ExpressionFactory<any>> {
  parent: P
  parameters: ExpressionFactory<any>[] = []
  decoratorType: ValueFactory<any>
  constructor(parent: P) {
    super(m.ModelKind.DECORATOR)
    this.parent = parent
  }
}

export class PrimitiveTypeFactory extends AbstractTypeFactory<m.PrimitiveTypeTemplate> implements m.PrimitiveTypeTemplate {
  primitiveTypeKind: m.PrimitiveTypeKind
  constructor(primitiveTypeKind: m.PrimitiveTypeKind) {
    super(m.TypeKind.PRIMITIVE)
    this.primitiveTypeKind = primitiveTypeKind
  }
}

export class TupleTypeFactory extends AbstractTypeFactory<m.TupleTypeTemplate<any>> implements m.TupleTypeTemplate<TypeFactory<any>> {
  elements: TypeFactory<any>[] = []
  constructor() {
    super(m.TypeKind.TUPLE)
  }
}

export class UnionOrIntersectionTypeFactory extends AbstractTypeFactory<m.UnionOrIntersectionTypeTemplate<any>> implements m.UnionOrIntersectionTypeTemplate<TypeFactory<any>> {
  types: TypeFactory<any>[] = []
  constructor(typeKind: m.TypeKind) {
    super(typeKind)
  }
}

export class EnumMemberFactory extends AbstractFactory<m.EnumMemberTemplate<any>> implements m.EnumMemberTemplate<ExpressionFactory<any>> {
  name: string
  parent: EnumFactory
  initializer: ExpressionFactory<any>
  constructor(parent: EnumFactory, name: string) {
    super(m.ModelKind.ENUM_MEMBER)
    this.name = name
    this.parent = parent
  }
}

export class EnumFactory extends AbstractTypeFactory<m.EnumTemplate<any>> implements m.EnumTemplate<EnumMemberFactory>, ContainedFactory<m.EnumTemplate<any>> {
  name: string
  members: EnumMemberFactory[] = []
  parent: ContainerFactory
  constructor(parent: ContainerFactory, name: string) {
    super(m.TypeKind.ENUM)
    this.name = name
    this.parent = parent
  }
  addMember(name: string) {
    let memberConstructor = new EnumMemberFactory(this, name)
    this.members.push(memberConstructor)
    return memberConstructor
  }
}

export class TypeQueryFactory<T extends m.TypeTemplate> extends AbstractTypeFactory<m.TypeQueryTemplate<any>> implements m.TypeQueryTemplate<TypeFactory<T>|ValueFactory<T>|ContainerFactory> {
  type: TypeFactory<T>|ValueFactory<T>|ContainerFactory
  constructor() {
    super(m.TypeKind.TYPE_QUERY)
  }
}

export class ValueFactory<T extends m.TypeTemplate> extends AbstractFactory<m.ValueTemplate<any, any>> implements m.ValueTemplate<TypeFactory<T>, ExpressionFactory<any>>, ContainedFactory<m.ValueTemplate<any, any>> {
  name: string
  parent: ContainerFactory
  valueKind: m.ValueKind
  type: TypeFactory<T>
  initializer: ExpressionFactory<any>
  constructor(parent: ContainerFactory, name: string) {
    super(m.ModelKind.VALUE)
    this.name = name
    this.parent = parent
  }
}

export abstract class AbstractParameterFactory<P extends AbstractFunctionTypeFactory<any, any, any>, T extends m.TypeTemplate> extends AbstractFactory<m.ParameterTemplate<any, any>> implements m.ParameterTemplate<TypeFactory<T>, ExpressionFactory<any>> {
  name: string
  parent: P
  type: TypeFactory<T>
  initializer: ExpressionFactory<any>
  optional: boolean

  constructor(parent: P, name: string, optional: boolean) {
    super(m.ModelKind.PARAMETER)
    this.parent = parent
    this.name = name
    this.optional = optional
  }
}

export class DecoratedParameterFactory<T extends m.TypeTemplate> extends AbstractParameterFactory<DecoratedFunctionTypeFactory, T> implements m.DecoratedParameterTemplate<TypeFactory<T>, DecoratorFactory<DecoratedParameterFactory<T>>, ExpressionFactory<any>>, DecoratedFactory<m.DecoratedParameterTemplate<any, any, any>, DecoratedParameterFactory<T>> {
  decorators: DecoratorFactory<DecoratedParameterFactory<T>>[]

  constructor(parent: DecoratedFunctionTypeFactory, name: string, isOptional?: boolean) {
    super(parent, name, isOptional)
    this.modelKind = m.ModelKind.DECORATED_PARAMETER
  }

  addDecorator() {
    return decoratorFactory(this)
  }
}

export class ParameterFactory<T extends m.TypeTemplate> extends AbstractParameterFactory<FunctionTypeFactory, T> {
}

export abstract class AbstractFunctionTypeFactory<F extends m.FunctionTypeTemplate<any, any, any>, PC extends AbstractParameterFactory<any, any>, This extends AbstractFunctionTypeFactory<any, any, any>> extends AbstractTypeFactory<F> implements m.FunctionTypeTemplate<TypeFactory<any>, PC, TypeParameterFactory<This>> {
  parameters: PC[] = []
  typeParameters: TypeParameterFactory<This>[] = []
  type: TypeFactory<any>
  isDecorated: boolean

  constructor(isDecorated: boolean) {
    super(m.TypeKind.FUNCTION)
    this.isDecorated = isDecorated
  }
  addTypeParameter(name: string) {
    let typeParameterConstructor = new TypeParameterFactory<This>(<This>this, name)
    this.typeParameters.push(typeParameterConstructor)
    return typeParameterConstructor
  }
  addParameter<T extends m.TypeTemplate>(name: string, isOptional?: boolean) {
    let parameterConstructor = <PC>(this.isDecorated ? new DecoratedParameterFactory<T>(<This>this, name, isOptional) : new ParameterFactory<T>(this, name, isOptional))
    this.parameters.push(parameterConstructor)
    return parameterConstructor
  }
}

export class DecoratedFunctionTypeFactory extends AbstractFunctionTypeFactory<m.DecoratedFunctionTypeTemplate<TypeFactory<any>, DecoratedParameterFactory<any>, TypeParameterFactory<DecoratedFunctionTypeFactory>>, DecoratedParameterFactory<any>, DecoratedFunctionTypeFactory> implements Factory<m.DecoratedFunctionTypeTemplate<TypeFactory<any>, DecoratedParameterFactory<any>, TypeParameterFactory<DecoratedFunctionTypeFactory>>>, m.DecoratedFunctionTypeTemplate<TypeFactory<any>, DecoratedParameterFactory<any>, TypeParameterFactory<DecoratedFunctionTypeFactory>> {
  constructor() {
    super(true)
  }
}

export class FunctionTypeFactory extends AbstractFunctionTypeFactory<m.FunctionTypeTemplate<TypeFactory<any>, ParameterFactory<any>, TypeParameterFactory<FunctionTypeFactory>>, ParameterFactory<any>, FunctionTypeFactory> {
  constructor() {
    super(false)
  }
}

export abstract class AbstractMemberFactory<P extends AbstractCompositeTypeFactory<any, any, any>, M extends m.MemberTemplate<any, any>, T extends m.TypeTemplate> extends AbstractFactory<M> {
  name: string
  optional: boolean
  type: TypeFactory<T>
  initializer: ExpressionFactory<any>
  constructor(parent: P, name: string, optional?: boolean) {
    super(m.ModelKind.MEMBER)
    this.name = name
    this.optional = optional
  }
}

export class DecoratedMemberFactory<GP extends Factory<any>, T extends m.TypeTemplate> extends AbstractMemberFactory<DecoratedCompositeTypeFactory<GP>, m.DecoratedMemberTemplate<any, any, any>, T> implements m.MemberTemplate<TypeFactory<any>, ExpressionFactory<any>> {
  decorators: DecoratorFactory<DecoratedMemberFactory<GP, T>>[] = []

  constructor(parent: DecoratedCompositeTypeFactory<GP>, name: string, optional?: boolean) {
    super(parent, name, optional)
    this.modelKind = m.ModelKind.DECORATED_MEMBER
  }

  addDecorator() {
    return decoratorFactory(this)
  }
}

export class MemberFactory<GP extends Factory<any>, T extends m.TypeTemplate> extends AbstractMemberFactory<CompositeTypeFactory<GP>, m.MemberTemplate<TypeFactory<T>, ExpressionFactory<any>>, T> {
}

export class IndexFactory extends AbstractFactory<m.IndexTemplate<any>> implements m.IndexTemplate<TypeFactory<any>> {
  parent: AbstractCompositeTypeFactory<any, any, any>
  keyType: m.PrimitiveTypeKind
  valueType: TypeFactory<any>

  constructor(parent: AbstractCompositeTypeFactory<any, any, any>) {
    super(m.ModelKind.INDEX)
    this.parent = parent
  }
}

export abstract class AbstractCompositeTypeFactory<C extends m.CompositeTypeTemplate<any, any, any>, MC extends AbstractMemberFactory<any, any, any>, FT extends AbstractFunctionTypeFactory<any, any, any>> extends AbstractTypeFactory<C> implements m.CompositeTypeTemplate<MC, IndexFactory, FT> {
  protected isDecorated: boolean
  members: m.KeyValue<MC> = {}
  index: IndexFactory
  calls: FT[] = []
  constructor(isDecorated: boolean) {
    super(m.TypeKind.COMPOSITE)
    this.isDecorated = isDecorated
  }
  addMember(name: string, optional?: boolean) {
    let memberConstructor = <MC>(this.isDecorated ? new DecoratedMemberFactory(<DecoratedCompositeTypeFactory<any>><any>this, name, optional) : new MemberFactory(<CompositeTypeFactory<any>><any>this, name, optional))
    this.members[name] = memberConstructor
    return memberConstructor
  }
  createIndex(keyType: m.PrimitiveTypeKind) {
    if (!this.index) {
      let indexConstructor = new IndexFactory(this)
      indexConstructor.keyType = keyType
      this.index = indexConstructor
    }
    return this.index
  }
}

export class DecoratedCompositeTypeFactory<P extends Factory<any>> extends AbstractCompositeTypeFactory<DecoratedCompositeTypeFactory<P>, DecoratedMemberFactory<P, any>, DecoratedFunctionTypeFactory> implements m.DecoratedCompositeTypeTemplate<DecoratedMemberFactory<P, any>, IndexFactory, DecoratedFunctionTypeFactory> {
  parent: P

  constructor(parent: P) {
    super(true)
    this.parent = parent
  }
}

export class CompositeTypeFactory<P extends Factory<any>> extends AbstractCompositeTypeFactory<CompositeTypeFactory<P>, MemberFactory<P, any>, FunctionTypeFactory> implements m.CompositeTypeTemplate<MemberFactory<P, any>, IndexFactory, FunctionTypeFactory> {
  parent: P
  constructor(parent?: P, isDecorated?: boolean) {
    super(isDecorated)
    this.parent = parent
  }
}

export class TypeParameterFactory<P extends TypeConstructorFactory<any>> extends AbstractTypeFactory<m.TypeParameterTemplate<any>> implements m.TypeParameterTemplate<TypeFactory<any>> {
  parent: P
  name: string
  extends: TypeFactory<any>

  constructor(parent: P, name: string) {
    super(m.TypeKind.TYPE_PARAMETER)
    this.parent = parent
    this.name = name
  }
}

export abstract class AbstractConstructableTypeFactory<T extends m.ConstructableTypeTemplate<any, any>, TC extends TypeConstructorFactory<any>> extends AbstractTypeFactory<T> {
  typeConstructor: TC
  typeArguments: TypeFactory<any>[] = []
}

export class ClassFactory extends AbstractConstructableTypeFactory<m.ClassTemplate<any, any, any, any, any, any>, ClassConstructorFactory> implements m.ClassTemplate<DecoratedCompositeTypeFactory<ClassFactory>, DecoratorFactory<ClassFactory>, ClassFactory, InterfaceFactory|ClassFactory, ClassConstructorFactory, TypeFactory<any>>, DecoratedFactory<m.ClassTemplate<DecoratedCompositeTypeFactory<ClassFactory>, DecoratorFactory<ClassFactory>, ClassFactory, InterfaceFactory, ClassConstructorFactory, TypeFactory<any>>, ClassFactory> {
  instanceType: DecoratedCompositeTypeFactory<ClassFactory>
  staticType: DecoratedCompositeTypeFactory<ClassFactory>
  implements: (InterfaceFactory|ClassFactory)[] = []
  extends: ClassFactory
  decorators: DecoratorFactory<ClassFactory>[] = []
  isAbstract: boolean

  constructor() {
    super(m.TypeKind.CLASS)
  }
  addDecorator() {
    return decoratorFactory(this)
  }
}

export class InterfaceFactory extends AbstractConstructableTypeFactory<m.InterfaceTemplate<any, any, any, any>, InterfaceConstructorFactory> implements m.InterfaceTemplate<CompositeTypeFactory<InterfaceFactory>, InterfaceFactory|ClassFactory, InterfaceConstructorFactory, TypeFactory<any>> {
  instanceType: CompositeTypeFactory<InterfaceFactory>
  extends: (InterfaceFactory|ClassFactory)[] = []

  constructor() {
    super(m.TypeKind.INTERFACE)
  }
}

export class TypeAliasFactory<T extends m.TypeTemplate> extends AbstractConstructableTypeFactory<m.TypeAliasTemplate<any, any, any>, TypeAliasConstructorFactory<T>> implements m.TypeAliasTemplate<T, TypeAliasConstructorFactory<T>, TypeFactory<any>> {
  type: T

  constructor() {
    super(m.TypeKind.TYPE_ALIAS)
  }
}

export class ProtoClassFactory extends AbstractTypeFactory<m.ProtoClassTemplate<any>> implements m.ProtoClassTemplate<CompositeTypeFactory<ProtoClassFactory>> {
  instanceType: CompositeTypeFactory<ProtoClassFactory>
  staticType: CompositeTypeFactory<ProtoClassFactory>

  constructor() {
    super(m.TypeKind.CLASS)
  }

  createInstanceType() {
    if (!this.instanceType) {
      let instanceTypeConstructor = new CompositeTypeFactory<ProtoClassFactory>(this, false)
      this.instanceType = instanceTypeConstructor
    }
    return this.instanceType
  }

  createStaticType() {
    if (!this.staticType) {
      let staticTypeConstructor = new CompositeTypeFactory<ProtoClassFactory>(this, false)
      this.staticType = staticTypeConstructor
    }
    return this.staticType
  }
}

export abstract class AbstractTypeConstructorFactory<T extends m.TypeConstructorTemplate<any>, This extends AbstractTypeConstructorFactory<any, any>> extends AbstractFactory<T> implements TypeConstructorFactory<This> {
  parent: ContainerFactory
  name: string
  typeParameters: TypeParameterFactory<This>[] = []

  constructor(modelKind: m.ModelKind, parent: ContainerFactory, name: string) {
    super(modelKind)
    this.parent = parent
    this.name = name
  }

  addTypeParameter(name: string) {
    return typeParameterFactory(this, name)
  }
}

export class InterfaceConstructorFactory extends AbstractTypeConstructorFactory<m.InterfaceConstructorTemplate<any, any, any>, InterfaceConstructorFactory> implements m.InterfaceConstructorTemplate<CompositeTypeFactory<InterfaceConstructorFactory>, InterfaceFactory|ClassFactory, TypeParameterFactory<InterfaceConstructorFactory>>, ContainedFactory<m.InterfaceConstructorTemplate<any, any, any>> {
  instanceType: CompositeTypeFactory<InterfaceConstructorFactory>
  extends: (InterfaceFactory|ClassFactory)[] = []
  typeParameters: TypeParameterFactory<InterfaceConstructorFactory>[] = []

  constructor(parent: ContainerFactory, name: string) {
    super(m.ModelKind.INTERFACE_CONSTRUCTOR, parent, name)
  }

  createInstanceType() {
    if (!this.instanceType) {
      let instanceTypeConstructor = new CompositeTypeFactory<InterfaceConstructorFactory>(this, false)
      this.instanceType = instanceTypeConstructor
    }
    return this.instanceType
  }
}

export class TypeAliasConstructorFactory<T extends m.TypeTemplate> extends AbstractTypeConstructorFactory<m.TypeAliasConstructorTemplate<any, any>, TypeAliasConstructorFactory<T>> implements m.TypeAliasConstructorTemplate<TypeFactory<T>, TypeParameterFactory<TypeAliasConstructorFactory<T>>>, ContainedFactory<m.TypeAliasConstructorTemplate<any, any>> {
  type: TypeFactory<T>

  constructor(parent: ContainerFactory, name: string) {
    super(m.ModelKind.TYPE_ALIAS_CONSTRUCTOR, parent, name)
  }
}

export class ClassConstructorFactory extends AbstractTypeConstructorFactory<m.ClassConstructorTemplate<any, any, any, any, any>, ClassConstructorFactory> implements m.ClassConstructorTemplate<DecoratedCompositeTypeFactory<ClassConstructorFactory>, DecoratorFactory<ClassConstructorFactory>, ClassFactory, InterfaceFactory|ClassFactory, TypeParameterFactory<ClassConstructorFactory>>, DecoratedFactory<m.ClassConstructorTemplate<any, any, any, any, any>, ClassConstructorFactory>, ContainedFactory<m.ClassConstructorTemplate<any, any, any, any, any>> {
  instanceType: DecoratedCompositeTypeFactory<ClassConstructorFactory>
  staticType: DecoratedCompositeTypeFactory<ClassConstructorFactory>
  implements: (InterfaceFactory|ClassFactory)[] = []
  extends: ClassFactory
  decorators: DecoratorFactory<ClassConstructorFactory>[] = []
  isAbstract: boolean

  constructor(parent: ContainerFactory, name: string) {
    super(m.ModelKind.CLASS_CONSTRUCTOR, parent, name)
  }

  createInstanceType() {
    if (!this.instanceType) {
      let instanceTypeConstructor = new DecoratedCompositeTypeFactory<ClassConstructorFactory>(this)
      this.instanceType = instanceTypeConstructor
    }
    return this.instanceType
  }

  createStaticType() {
    if (!this.staticType) {
      let staticTypeConstructor = new DecoratedCompositeTypeFactory<ClassConstructorFactory>(this)
      this.staticType = staticTypeConstructor
    }
    return this.staticType
  }

  addDecorator() {
    return decoratorFactory(this)
  }
}

export abstract class AbstractContainerFactory extends AbstractFactory<m.ContainerTemplate<any, any, any, any, any, any>> implements ContainerFactory {
  name: string
  containerKind: m.ContainerKind
  classConstructors: m.KeyValue<ClassConstructorFactory> = {}
  interfaceConstructors: m.KeyValue<InterfaceConstructorFactory> = {}
  typeAliasConstructors: m.KeyValue<TypeAliasConstructorFactory<any>> = {}
  enums: m.KeyValue<EnumFactory> = {}
  values: m.KeyValue<ValueFactory<any>> = {}
  namespaces: m.KeyValue<NamespaceFactory> = {}

  constructor(kind: m.ContainerKind, name: string) {
    super(m.ModelKind.CONTAINER)
    this.name = name
    this.containerKind = kind
  }

  addClassConstructor(name: string): ClassConstructorFactory {
    let cc = this.classConstructors[name]
    if (cc) {
      return cc
    } else {
      let ccc = new ClassConstructorFactory(this, name)
      this.classConstructors[name] = ccc
      return ccc
    }
  }

  addInterfaceConstructor(name: string): InterfaceConstructorFactory {
    let ic = this.interfaceConstructors[name]
    if (ic) {
      return ic
    } else {
      let icc = new InterfaceConstructorFactory(this, name)
      this.interfaceConstructors[name] = icc
      return icc
    }
  }

  addTypeAliasConstructor<T extends m.TypeTemplate>(name: string): TypeAliasConstructorFactory<T> {
    let ta = this.typeAliasConstructors[name]
    if (ta) {
      return ta
    } else {
      let tac = new TypeAliasConstructorFactory<T>(this, name)
      this.typeAliasConstructors[name] = tac
      return tac
    }
  }

  addEnum(name: string): EnumFactory {
    let et = this.enums[name]
    if (et) {
      return et
    } else {
      let etc = new EnumFactory(this, name)
      this.enums[name] = etc
      return etc
    }
  }

  addValue(name: string): ValueFactory<any> {
      let s = this.values[name]
      if (s) {
        return s
      } else {
        let sc = new ValueFactory<any>(this, name)
        this.values[name] = <any>sc
        return sc
      }
  }

  addNamespace(name: string): NamespaceFactory {
    let ns = this.namespaces[name]
    if (ns) {
      return ns
    } else {
      let nsc = new NamespaceFactory(this, name)
      this.namespaces[name] = nsc
      return nsc
    }
  }
}

export class ModuleFactory extends AbstractContainerFactory {
  constructor(name: string) {
    super(m.ContainerKind.MODULE, name)
  }
}

export class NamespaceFactory extends AbstractContainerFactory implements ContainedFactory<m.ContainerTemplate<any, any, any, any, any, any>> {
  parent: ContainerFactory
  constructor(parent: ContainerFactory, name: string) {
    super(m.ContainerKind.NAMESPACE, name)
    this.parent = parent
  }
}

export class PackageFactory extends AbstractFactory<m.PackageTemplate<any>> implements m.PackageTemplate<ModuleFactory> {
  modules:m.KeyValue<ModuleFactory> = {}
  constructor() {
    super(m.ModelKind.PACKAGE)
  }
}

export function expressionFactory(kindOrExpression: m.ExpressionKind|ExpressionFactory<any>): ExpressionFactory<any> {
  if ((<ExpressionFactory<any>>kindOrExpression).modelKind) {
    return <ExpressionFactory<any>>kindOrExpression
  } else {
    let kind = <m.ExpressionKind>kindOrExpression
    switch (kind) {
      case m.ExpressionKind.PRIMITIVE:
        return new PrimitiveExpressionFactory()
      case m.ExpressionKind.CLASS:
        return new ClassExpressionFactory()
      case m.ExpressionKind.OBJECT:
        return new ObjectExpressionFactory()
      case m.ExpressionKind.ARRAY:
        return new ArrayExpressionFactory()
      case m.ExpressionKind.ENUM:
        return new EnumExpressionFactory()
      case m.ExpressionKind.VALUE:
        return new ValueExpressionFactory()
      case m.ExpressionKind.FUNCTION:
        return new FunctionExpressionFactory()
      case m.ExpressionKind.CLASS_REFERENCE:
        return new ClassReferenceExpressionFactory()
      case m.ExpressionKind.FUNCTION_CALL:
        return new FunctionCallExpressionFactory()
      case m.ExpressionKind.PROPERTY_ACCESS:
        return new PropertyAccessExpressionFactory()
      case m.ExpressionKind.NEW:
        return new NewExpressionFactory()
    }
  }
}

function decoratorFactory<P extends DecoratedFactory<any, any>>(instance: P) {
  let decoratorConstructor = new DecoratorFactory<P>(instance)
  instance.decorators.push(decoratorConstructor)
  return decoratorConstructor
}

function typeParameterFactory<P extends TypeConstructorFactory<any>>(instance: P, name: string) {
  if (!instance.typeParameters) {
    instance.typeParameters = []
  }
  let typeParameterConstructor = new TypeParameterFactory<P>(instance, name)
  instance.typeParameters.push(typeParameterConstructor)
  return typeParameterConstructor
}
