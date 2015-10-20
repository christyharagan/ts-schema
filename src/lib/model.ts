export interface KeyValue<T> {
  [name: string]: T
}

export type Primitive = symbol | number | boolean | string

export const enum ModelKind {
  PACKAGE = 1,
  CONTAINER,
  CLASS_CONSTRUCTOR,
  INTERFACE_CONSTRUCTOR,
  TYPE_ALIAS_CONSTRUCTOR,
  TYPE,
  INDEX,
  PARAMETER,
  DECORATED_PARAMETER,
  MEMBER,
  DECORATED_MEMBER,
  DECORATOR,
  EXPRESSION,
  VALUE,
  ENUM_MEMBER,
  SYMBOL
}

export const enum ContainerKind {
  MODULE = 1,
  NAMESPACE
}

export interface ModelElementTemplate {
  modelKind: ModelKind
}

export const enum TypeKind {
  PRIMITIVE = 1,
  ENUM,
  FUNCTION,
  TUPLE,
  UNION,
  COMPOSITE,
  INTERFACE,
  CLASS,
  TYPE_QUERY,
  TYPE_ALIAS,
  INTERSECTION,
  TYPE_PARAMETER
}

export interface TypeTemplate {
  typeKind: TypeKind
}

export interface PackageTemplate<M extends ContainerTemplate<any, any, any, any, any, any>> {
  modules: KeyValue<M>
}

export interface ContainerTemplate<C extends ClassConstructorTemplate<any, any, any, any, any>, I extends InterfaceConstructorTemplate<any, any, any>, A extends TypeAliasConstructorTemplate<any, any>, E extends EnumTemplate<any>, S extends ValueTemplate<any, any>, N extends ContainerTemplate<any, any, any, any, any, any>> {
  classConstructors: KeyValue<C>
  interfaceConstructors: KeyValue<I>
  typeAliasConstructors: KeyValue<A>
  enums: KeyValue<E>
  values: KeyValue<S>
  namespaces: KeyValue<N>
}

export const enum ValueKind {
  VAR = 1,
  LET,
  CONST,
  FUNCTION
}

export interface ValueTemplate<T, E> {
  type: T
  initializer?: E
  valueKind: ValueKind
}

export interface CompositeTypeTemplate<M extends MemberTemplate<any, any>, I extends IndexTemplate<any>, C extends FunctionTypeTemplate<any, any, any>> extends TypeTemplate {
  members: KeyValue<M>
  index?: I
  calls?: C[]
}

export interface DecoratedCompositeTypeTemplate<M extends DecoratedMemberTemplate<any, any, any>, I extends IndexTemplate<any>, C extends DecoratedFunctionTypeTemplate<any, any, any>> extends CompositeTypeTemplate<M, I, C> {
}

export interface InterfaceConstructorTemplate<T extends CompositeTypeTemplate<any, any, any>, E, TP extends TypeParameterTemplate<any>> extends TypeConstructorTemplate<TP> {
  instanceType: T
  extends?: E[]
}

export interface ClassConstructorTemplate<T extends DecoratedCompositeTypeTemplate<any, any, any>, D extends DecoratorTemplate<any, any>, C, I, TP extends TypeParameterTemplate<any>> extends DecoratedTemplate<D>, TypeConstructorTemplate<TP> {
  isAbstract?: boolean
  instanceType: T
  staticType: T
  extends?: C
  implements?: I[]
}

export interface TypeAliasConstructorTemplate<T, TP extends TypeParameterTemplate<any>> extends TypeConstructorTemplate<TP> {
  type: T
}

export interface ProtoClassTemplate<T extends CompositeTypeTemplate<any, any, any>> extends TypeTemplate {
  instanceType: T
  staticType: T
}

export interface ConstructableTypeTemplate<TC, A> extends TypeTemplate {
  typeConstructor: TC
  typeArguments?: A[]
}

export interface ClassTemplate<T extends DecoratedCompositeTypeTemplate<any, any, any>, D extends DecoratorTemplate<any, any>, C, I, CC extends ClassConstructorTemplate<any, any, any, any, any>, A> extends TypeTemplate, DecoratedTemplate<D>, ConstructableTypeTemplate<CC, A> {
  isAbstract?: boolean
  extends?: C
  implements?: I[]
  instanceType: T
  staticType: T
}

export interface InterfaceTemplate<T extends CompositeTypeTemplate<any, any, any>, E, IC extends InterfaceConstructorTemplate<any, any, any>, A> extends TypeTemplate, ConstructableTypeTemplate<IC, A> {
  instanceType: T
  extends?: E[]
}

export interface TypeAliasTemplate<T, TAC, A> extends TypeTemplate, ConstructableTypeTemplate<TAC, A> {
  type: T
}

export interface IndexTemplate<T> {
  keyType: PrimitiveTypeKind
  valueType: T
}

export interface FunctionTypeTemplate<T, P extends ParameterTemplate<any, any>, TP extends TypeParameterTemplate<any>> extends TypeTemplate, TypeConstructorTemplate<TP> {
  parameters: P[]
  type?: T
}

export interface DecoratedFunctionTypeTemplate<T, P extends DecoratedParameterTemplate<any, any, any>, TP extends TypeParameterTemplate<any>> extends FunctionTypeTemplate<T, P, TP> {
}

export interface UnionOrIntersectionTypeTemplate<T> extends TypeTemplate {
  types: T[]
}

export interface TupleTypeTemplate<T> extends TypeTemplate {
  elements: T[]
}

export interface ParameterTemplate<T, E extends ExpressionTemplate> {
  name: string
  type: T
  optional?: boolean
  initializer?: E
}

export interface DecoratedParameterTemplate<T, D extends DecoratorTemplate<any, any>, E extends ExpressionTemplate> extends ParameterTemplate<T, E>, DecoratedTemplate<D> {
}

export interface MemberTemplate<T, E extends ExpressionTemplate> {
  type: T
  optional?: boolean
  initializer?: E
}

export interface DecoratedMemberTemplate<T, D extends DecoratorTemplate<any, any>, E extends ExpressionTemplate> extends MemberTemplate<T, E>, DecoratedTemplate<D> {
}

export interface DecoratedTemplate<D extends DecoratorTemplate<any, any>> {
  decorators?: D[]
}

export interface DecoratorTemplate<T, E extends ExpressionTemplate> {
  decoratorType: T
  parameters?: E[]
}

export const enum ExpressionKind {
  PRIMITIVE = 1,
  ENUM,
  FUNCTION,
  CLASS,
  OBJECT,
  ARRAY,
  CLASS_REFERENCE,
  VALUE,
  FUNCTION_CALL,
  PROPERTY_ACCESS,
  NEW
}

export interface ExpressionTemplate {
  expressionKind: ExpressionKind
}

export interface ClassReferenceExpressionTemplate<C> extends ExpressionTemplate {
  classReference: C
}

export interface NewExpressionTemplate<E extends ExpressionTemplate> extends ExpressionTemplate {
  classReference: E
  arguments: E[]
}

export interface ClassExpressionTemplate<C extends ProtoClassTemplate<any>> extends ExpressionTemplate {
  class: C
}

export interface FunctionExpressionTemplate<F extends FunctionTypeTemplate<any, any, any>> extends ExpressionTemplate {
  functionType: F
}

export interface FunctionCallExpressionTemplate<E extends ExpressionTemplate> extends ExpressionTemplate {
  function: E
  arguments: E[]
}

export interface PropertyAccessExpressionTemplate<E extends ExpressionTemplate> extends ExpressionTemplate {
  parent: E
  property: string
}

export interface ValueExpressionTemplate<V> extends ExpressionTemplate {
  value: V
}

export interface PrimitiveExpressionTemplate<P extends Primitive> extends ExpressionTemplate {
  primitiveValue: P
  primitiveTypeKind: PrimitiveTypeKind
}

export interface ArrayExpressionTemplate<E extends ExpressionTemplate> extends ExpressionTemplate {
  elements: E[]
}

export interface ObjectExpressionTemplate<E extends ExpressionTemplate> extends ExpressionTemplate {
  properties: KeyValue<E>
}

export interface EnumExpressionTemplate<E> extends ExpressionTemplate {
  enum: E
  value: string
}

export interface TypeQueryTemplate<T> extends TypeTemplate {
  type?: T
}

export interface TypeConstructorTemplate<T extends TypeParameterTemplate<any>> {
  typeParameters?: T[]
}

export interface TypeParameterTemplate<T> extends TypeTemplate {
  name: string
  extends?: T
}

export interface EnumMemberTemplate<E extends ExpressionTemplate> {
  name: string
  initializer?: E
}

export interface EnumTemplate<E extends EnumMemberTemplate<any>> extends TypeTemplate {
  members: E[]
}

export interface SymbolTemplate {
  isGlobal?: boolean
  description?: string
}

export const enum PrimitiveTypeKind {
  STRING = 1,
  BOOLEAN,
  NUMBER,
  VOID,
  ANY,
  SYMBOL
}

export interface PrimitiveTypeTemplate extends TypeTemplate {
  primitiveTypeKind: PrimitiveTypeKind
}

export namespace serializable {
  export interface Reference {
    module: string
    name?: string
  }

  export interface RefinedReference {
    reference: Reference,
    typeArguments: Type[]
  }

  export interface Package extends PackageTemplate<Container> {
  }

  export interface Container extends ContainerTemplate<ClassConstructor, InterfaceConstructor, TypeAliasConstructor, Enum, Value, Container> {
    reexports?: KeyValue<Reference>
  }

  export interface ParameterizedType extends TypeConstructorTemplate<TypeParameter> {
  }

  export interface Value extends ValueTemplate<Type, Expression> {
  }

  export interface TypeConstructor extends TypeConstructorTemplate<TypeParameter> {
  }

  export interface TypeAliasConstructor extends TypeAliasConstructorTemplate<Type, TypeParameter> {
  }

  export interface ClassConstructor extends ClassConstructorTemplate<DecoratedCompositeType, Decorator, Reference | RefinedReference, Reference | RefinedReference, TypeParameter> {
  }

  export interface ProtoClass extends ProtoClassTemplate<DecoratedCompositeType> {
  }

  export interface InterfaceConstructor extends InterfaceConstructorTemplate<CompositeType, Reference | RefinedReference, TypeParameter> {
  }

  export interface TypeParameter extends TypeParameterTemplate<Type> {
  }

  export interface Enum extends EnumTemplate<EnumMember> {
  }

  export interface EnumMember extends EnumMemberTemplate<Expression> {
  }

  export type Type = Reference | RefinedReference | UnionOrIntersectionType | FunctionType | TupleType | PrimitiveType | TypeQuery | CompositeType

  export interface CompositeType extends CompositeTypeTemplate<Member, Index, FunctionType> {
  }

  export interface Decorated extends DecoratedTemplate<Decorator> {
  }

  export interface DecoratedCompositeType extends DecoratedCompositeTypeTemplate<DecoratedMember, Index, DecoratedFunctionType> {
  }

  export interface TypeQuery extends TypeQueryTemplate<Reference> {
  }

  export interface UnionOrIntersectionType extends UnionOrIntersectionTypeTemplate<Type> {
  }

  export interface TupleType extends TupleTypeTemplate<Type> {
  }

  export interface Symbol extends SymbolTemplate {
  }

  export interface DecoratedFunctionType extends DecoratedFunctionTypeTemplate<Type, DecoratedParameter, TypeParameter> {
  }

  export interface FunctionType extends FunctionTypeTemplate<Type, Parameter, TypeParameter> {
  }

  export interface PrimitiveType extends PrimitiveTypeTemplate {
  }

  export interface Parameter extends ParameterTemplate<Type, Expression> {
  }

  export interface DecoratedParameter extends DecoratedParameterTemplate<Type, Decorator, Expression> {
  }

  export interface Index extends IndexTemplate<Type> {
  }

  export interface Member extends MemberTemplate<Type, Expression> {
  }

  export interface DecoratedMember extends DecoratedMemberTemplate<Type, Decorator, Expression> {
  }

  export interface Decorator extends DecoratorTemplate<Reference, Expression> {
  }

  export type Expression = ClassExpression | ClassReferenceExpression | ValueExpression | PrimitiveExpression<any> | ArrayExpression | ObjectExpression | EnumExpression | FunctionExpression | FunctionCallExpression | PropertyAccessExpression | EnumExpression | NewExpression

  export interface ClassReferenceExpression extends ClassReferenceExpressionTemplate<Reference> {
  }

  export interface NewExpression extends NewExpressionTemplate<Expression>{
  }

  export interface ClassExpression extends ClassExpressionTemplate<ProtoClass> {
  }

  export interface ValueExpression extends ValueExpressionTemplate<Reference> {
  }

  export interface EnumExpression extends EnumExpressionTemplate<Reference> {
  }

  export interface PrimitiveExpression<P extends Primitive> extends PrimitiveExpressionTemplate<P> {
  }

  export interface FunctionExpression extends FunctionExpressionTemplate<FunctionType> {
  }

  export interface FunctionCallExpression extends FunctionCallExpressionTemplate<Expression> {
  }

  export interface PropertyAccessExpression extends PropertyAccessExpressionTemplate<Expression> {
  }

  export interface ArrayExpression extends ArrayExpressionTemplate<Expression> {
  }

  export interface ObjectExpression extends ObjectExpressionTemplate<Expression> {
  }

  export interface EnumExpression extends EnumExpressionTemplate<Reference> {
  }

  export const STRING: PrimitiveType = {
    primitiveTypeKind: PrimitiveTypeKind.STRING,
    typeKind: TypeKind.PRIMITIVE
  }

  export const BOOLEAN: PrimitiveType = {
    primitiveTypeKind: PrimitiveTypeKind.BOOLEAN,
    typeKind: TypeKind.PRIMITIVE
  }

  export const NUMBER: PrimitiveType = {
    primitiveTypeKind: PrimitiveTypeKind.NUMBER,
    typeKind: TypeKind.PRIMITIVE
  }

  export const ANY: PrimitiveType = {
    primitiveTypeKind: PrimitiveTypeKind.ANY,
    typeKind: TypeKind.PRIMITIVE
  }

  export const VOID: PrimitiveType = {
    primitiveTypeKind: PrimitiveTypeKind.VOID,
    typeKind: TypeKind.PRIMITIVE
  }

  export const SYMBOL: PrimitiveType = {
    primitiveTypeKind: PrimitiveTypeKind.SYMBOL,
    typeKind: TypeKind.PRIMITIVE
  }
}

export namespace reflective {
  export interface ModelElement extends ModelElementTemplate {
    equals(m: ModelElement): boolean
  }

  export type Type = Class | ProtoClass | Interface | UnionOrIntersectionType | FunctionType | TupleType | Enum | PrimitiveType | TypeQuery | TypeAlias<any> | DecoratorType | TypeParameter<any>

  export interface Container extends ContainerTemplate<ClassConstructor, InterfaceConstructor, TypeAliasConstructor<any>, Enum, Value<any>, Namespace>, ModelElement {
    name: string
    containerKind: ContainerKind
  }

  export interface Contained extends ModelElement {
    parent: Container
    name: string
  }

  export interface Package extends PackageTemplate<Module>{
  }

  export interface Module extends Container {
  }

  export interface Namespace extends Container, Contained {
  }

  export interface Value<T extends Type> extends ValueTemplate<T, Expression<T>>, Contained {
  }

  export interface ClassConstructor extends ClassConstructorTemplate<DecoratedCompositeType<ClassConstructor>, Decorator<ClassConstructor>, Class, Interface|Class, TypeParameter<ClassConstructor>>, Contained {
  }

  export interface InterfaceConstructor extends InterfaceConstructorTemplate<ContainedCompositeType<InterfaceConstructor>, Interface|Class, TypeParameter<InterfaceConstructor>>, Contained {
  }

  export interface TypeAliasConstructor<T extends Type> extends TypeAliasConstructorTemplate<T, TypeParameter<TypeAliasConstructor<T>>>, Contained {
  }

  export interface TypeConstructor extends TypeConstructorTemplate<TypeParameter<any>>, ModelElement {
  }

  export interface ProtoClass extends ProtoClassTemplate<DecoratedCompositeType<ProtoClass>>, ModelElement {
  }

  export interface ConstructableType<TC extends TypeConstructor> extends ConstructableTypeTemplate<TC, Type>, ModelElement {
    name: string
    constructorParent: Container
  }

  export interface Class extends ClassTemplate<DecoratedCompositeType<Class>, Decorator<Class>, Class, Interface|Class, ClassConstructor, Type>, ConstructableType<ClassConstructor> {
  }

  export interface Interface extends InterfaceTemplate<ContainedCompositeType<Interface>, Interface|Class, InterfaceConstructor, Type>, ConstructableType<InterfaceConstructor> {
  }

  export interface CompositeType extends CompositeTypeTemplate<Member<CompositeType>, Index, FunctionType>, ModelElement {
  }

  export interface ContainedCompositeType<P> extends CompositeTypeTemplate<Member<ContainedCompositeType<P>>, Index, FunctionType>, ModelElement {
    parent: P
  }

  export interface DecoratedCompositeType<P> extends DecoratedCompositeTypeTemplate<DecoratedMember<P>, Index, DecoratedFunctionType>, ModelElement {
    parent: P
  }

  export interface Index extends IndexTemplate<Type>, ModelElement {
    parent: CompositeType
  }

  export interface SymbolInstance extends SymbolTemplate, ModelElement {
  }

  export interface TypeParameter<P extends TypeConstructor> extends TypeParameterTemplate<Type>, ModelElement {
    parent: P
  }

  export interface FunctionType extends FunctionTypeTemplate<Type, Parameter, TypeParameter<FunctionType>>, ModelElement {
  }

  export interface DecoratedFunctionType extends DecoratedFunctionTypeTemplate<Type, DecoratedParameter, TypeParameter<DecoratedFunctionType>>, ModelElement {
  }

  export interface Parameter extends ParameterTemplate<Type, Expression<any>>, ModelElement {
    parent: FunctionType
  }

  export interface DecoratedParameter extends DecoratedParameterTemplate<Type, Decorator<DecoratedParameter>, Expression<any>>, ModelElement {
    parent: DecoratedFunctionType
  }

  export interface UnionOrIntersectionType extends UnionOrIntersectionTypeTemplate<Type>, ModelElement {
  }

  export interface TupleType extends TupleTypeTemplate<Type>, ModelElement {
  }

  export interface TypeQuery extends TypeQueryTemplate<Type | Container | Value<any>>, ModelElement {
  }

  export interface TypeAlias<T extends Type> extends TypeAliasTemplate<T, TypeAliasConstructor<T>, Type>, ConstructableType<TypeAliasConstructor<T>> {
  }

  export interface Enum extends EnumTemplate<EnumMember>, Contained {
    valueMap: KeyValue<EnumMember>
  }

  export interface EnumMember extends EnumMemberTemplate<Expression<PrimitiveType>>, ModelElement {
    parent: Enum
  }

  export type ClassConstructorMember = DecoratedMember<DecoratedCompositeType<ClassConstructor>>
  export type ClassMember = DecoratedMember<DecoratedCompositeType<Class>>
  export type InterfaceConstructorMember = Member<ContainedCompositeType<InterfaceConstructor>>
  export type InterfaceMember = Member<ContainedCompositeType<Interface>>

  export interface Member<P extends CompositeType> extends MemberTemplate<Type, Expression<any>>, ModelElement {
    parent: P
    name: string
  }

  export interface DecoratedMember<GP> extends DecoratedMemberTemplate<Type, Decorator<DecoratedMember<GP>>, Expression<any>>, ModelElement {
    parent: DecoratedCompositeType<GP>
    name: string
  }

  export interface Decorated extends DecoratedTemplate<Decorator<any>>, ModelElement {
  }

  export interface Decorator<P extends Decorated> extends DecoratorTemplate<Value<DecoratorType>, Expression<any>>, ModelElement {
    parent: P
  }

  export interface Expression<TT extends Type> extends ExpressionTemplate, ModelElement {
  }

  export interface ClassReferenceExpression extends ClassReferenceExpressionTemplate<ClassConstructor>, Expression<TypeQuery> {
  }

  export interface NewExpression<T extends Type> extends NewExpressionTemplate<Expression<any>>, Expression<T> {
  }

  export interface ClassExpression extends ClassExpressionTemplate<ProtoClass>, Expression<ProtoClass> {
  }

  export interface ValueExpression<T extends Type> extends ValueExpressionTemplate<Value<T>>, Expression<T> {
  }

  export interface PrimitiveExpression<P extends Primitive> extends PrimitiveExpressionTemplate<P>, Expression<PrimitiveType> {
  }

  export interface ArrayExpression extends ArrayExpressionTemplate<Expression<any>>, Expression<Class> {
  }

  export interface ObjectExpression extends ObjectExpressionTemplate<Expression<any>>, Expression<CompositeType> {
  }

  export interface EnumExpression extends EnumExpressionTemplate<Enum>, Expression<PrimitiveType> {
  }

  export interface FunctionExpression extends FunctionExpressionTemplate<FunctionType>, Expression<FunctionType> {
  }

  export interface FunctionCallExpression<T extends Type> extends FunctionCallExpressionTemplate<Expression<FunctionType>>, Expression<T> {
  }

  export interface PropertyAccessExpression<T extends Type> extends PropertyAccessExpressionTemplate<Expression<CompositeType | TypeQuery>>, Expression<T> {
  }

  export interface DecoratorType extends FunctionType, ModelElement {
    decoratorTypeKind: DecoratorTypeKind
  }

  export const enum DecoratorTypeKind {
    CLASS = 1,
    PROPERTY,
    METHOD,
    PARAMETER
  }

  export interface PrimitiveType extends PrimitiveTypeTemplate, ModelElement {
  }

  export const STRING: PrimitiveType = {
    modelKind: ModelKind.TYPE,
    primitiveTypeKind: PrimitiveTypeKind.STRING,
    typeKind: TypeKind.PRIMITIVE,
    equals: function(p: PrimitiveType) {
      return p.primitiveTypeKind === PrimitiveTypeKind.STRING
    }
  }

  export const BOOLEAN: PrimitiveType = {
    modelKind: ModelKind.TYPE,
    primitiveTypeKind: PrimitiveTypeKind.BOOLEAN,
    typeKind: TypeKind.PRIMITIVE,
    equals: function(p: PrimitiveType) {
      return p.primitiveTypeKind === PrimitiveTypeKind.BOOLEAN
    }
  }

  export const NUMBER: PrimitiveType = {
    modelKind: ModelKind.TYPE,
    primitiveTypeKind: PrimitiveTypeKind.NUMBER,
    typeKind: TypeKind.PRIMITIVE,
    equals: function(p: PrimitiveType) {
      return p.primitiveTypeKind === PrimitiveTypeKind.NUMBER
    }
  }

  export const ANY: PrimitiveType = {
    modelKind: ModelKind.TYPE,
    primitiveTypeKind: PrimitiveTypeKind.ANY,
    typeKind: TypeKind.PRIMITIVE,
    equals: function(p: PrimitiveType) {
      return p.primitiveTypeKind === PrimitiveTypeKind.ANY
    }
  }

  export const VOID: PrimitiveType = {
    modelKind: ModelKind.TYPE,
    primitiveTypeKind: PrimitiveTypeKind.VOID,
    typeKind: TypeKind.PRIMITIVE,
    equals: function(p: PrimitiveType) {
      return p.primitiveTypeKind === PrimitiveTypeKind.VOID
    }
  }

  export const SYMBOL: PrimitiveType = {
    modelKind: ModelKind.TYPE,
    primitiveTypeKind: PrimitiveTypeKind.SYMBOL,
    typeKind: TypeKind.PRIMITIVE,
    equals: function(p: PrimitiveType) {
      return p.primitiveTypeKind === PrimitiveTypeKind.SYMBOL
    }
  }
}
