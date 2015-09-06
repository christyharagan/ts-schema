// TODO: Support ES6 Symbols

/*
 * Templates
 * = = = = = = = = = = = = = = = =
 */
export interface Map<T> {
  [name: string]: T
}

export enum TypeKind {
  PRIMITIVE = 1,
  ENUM,
  FUNCTION,
  TUPLE,
  UNION,
  COMPOSITE,
  INTERFACE,
  CLASS,
  TYPE_QUERY,
  TYPE_ALIAS
}

export interface TypeTemplate {
  typeKind: TypeKind
}

export interface TypeContainerTemplate<C extends ClassConstructorTemplate<any, any, any, any, any>, I extends InterfaceConstructorTemplate<any, any, any>, T extends (TypeAliasTemplate<any>|EnumTypeTemplate<any>), S extends ValueTemplate<any, any>, N extends TypeContainerTemplate<any, any, any, any, any>> {
  classConstructors: Map<C>
  interfaceConstructors: Map<I>
  types: Map<T>
  statics: Map<S>
  namespaces: Map<N>
}

export enum ValueKind {
  VAR = 1,
  LET,
  CONST,
  FUNCTION
}

export interface ValueTemplate<T, E> {
  type: T
  initialiser?: E
  valueKind: ValueKind
}

export interface CompositeTypeTemplate<M extends MemberTemplate<any, any>, I extends IndexTemplate<any>, C extends FunctionTypeTemplate<any, any, any>> extends TypeTemplate {
  members: Map<M>
  index?: I
  calls?: C[]
}

export interface DecoratedCompositeTypeTemplate<M extends DecoratedMemberTemplate<any, any, any>, I extends IndexTemplate<any>, C extends DecoratedFunctionTypeTemplate<any, any, any>> extends CompositeTypeTemplate<M, I, C> {
}

export interface InterfaceConstructorTemplate<T extends CompositeTypeTemplate<any, any, any>, E, TP extends TypeParameterTemplate<any>> extends ParameterisedTypeTemplate<TP> {
  instanceType: T
  extends?: E[]
}

export interface ClassConstructorTemplate<T extends DecoratedCompositeTypeTemplate<any, any, any>, D extends DecoratorTemplate<any, any>, C, I, TP extends TypeParameterTemplate<any>> extends DecoratedTemplate<D>, ParameterisedTypeTemplate<TP> {
  instanceType: T,
  staticType: T
  extends?: C
  implements?: I[]
}

export interface ClassTemplate<T extends DecoratedCompositeTypeTemplate<any, any, any>, D extends DecoratorTemplate<any, any>, C, I, CC extends ClassConstructorTemplate<any, any, any, any, any>, A> extends TypeTemplate, DecoratedTemplate<D> {
  typeConstructor: CC
  typeArguments?: A[]
  instanceType: T,
  staticType: T
  extends?: C
  implements?: I[]
}

export interface InterfaceTemplate<T extends CompositeTypeTemplate<any, any, any>, E, IC extends InterfaceConstructorTemplate<any, any, any>, A> extends TypeTemplate {
  typeConstructor: IC
  typeArguments?: A[]
  instanceType: T
  extends?: E[]
}

export interface IndexTemplate<T> {
  keyType: PrimitiveType
  valueType: T
}

export interface FunctionTypeTemplate<T, P extends ParameterTemplate<any, any>, TP extends TypeParameterTemplate<any>> extends TypeTemplate, ParameterisedTypeTemplate<TP> {
  parameters: P[]
  type?: T
}

export interface DecoratedFunctionTypeTemplate<T, P extends DecoratedParameterTemplate<any, any, any>, TP extends TypeParameterTemplate<any>> extends FunctionTypeTemplate<T, P, TP> {
}

export interface UnionTypeTemplate<T> extends TypeTemplate {
  types: T[]
}

export interface TupleTypeTemplate<T> extends TypeTemplate {
  elements: T[]
}

export interface ParameterTemplate<T, E extends ExpressionTemplate> {
  name: string
  type: T
  optional?: boolean
  initialiser?: E
}

export interface DecoratedParameterTemplate<T, D extends DecoratorTemplate<any, any>, E extends ExpressionTemplate> extends ParameterTemplate<T, E>, DecoratedTemplate<D> {
}

export interface MemberTemplate<T, E extends ExpressionTemplate> {
  type: T
  optional?: boolean
  initialiser?: E
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

export enum ExpressionKind {
  STRING = 1,
  NUMBER,
  BOOLEAN,
  CLASS,
  OBJECT,
  ARRAY,
  COMPLEX,
  ENUM
}

export interface ExpressionTemplate {
  expressionKind: ExpressionKind
}

export interface ComplexExpressionTemplate<T> extends ExpressionTemplate {
  type: T
}

export interface ClassExpressionTemplate<C> extends ExpressionTemplate {
  class: C
}

export interface LiteralExpressionTemplate<V> extends ExpressionTemplate {
  value: V
}

export interface ArrayExpressionTemplate<E extends ExpressionTemplate> extends ExpressionTemplate {
  elements: E[]
}

export interface ObjectExpressionTemplate<E extends ExpressionTemplate> extends ExpressionTemplate {
  properties: Map<E>
}

export interface EnumExpressionTemplate<E> extends ExpressionTemplate {
  enum: E
  value: string
}

export interface TypeQueryTemplate<T> extends TypeTemplate {
  type?: T
}

export interface TypeAliasTemplate<T> extends TypeTemplate {
  type: T
}

export interface ParameterisedTypeTemplate<T extends TypeParameterTemplate<any>> {
  typeParameters?: T[]
}

export interface TypeParameterTemplate<T> {
  name: string
  extends?: T
}

export interface EnumMemberTemplate<E extends ExpressionTemplate> {
  name: string
  initialiser?: E
}

export interface EnumTypeTemplate<E extends EnumMemberTemplate<any>> extends TypeTemplate {
  members: E[]
}

export enum PrimitiveTypeKind {
  STRING = 1,
  BOOLEAN,
  NUMBER,
  VOID,
  ANY
}

export interface PrimitiveTypeTemplate extends TypeTemplate {
  primitiveTypeKind: PrimitiveTypeKind
}

/*
 * Raw Model
 * = = = = = = = = = = = = = = = =
 */

export interface Reference {
  module: string
  name?: string
}

export interface RefinedReference {
  reference: Reference,
  typeArguments: RawType[]
}

export interface RawTypeContainer extends TypeContainerTemplate<RawClassConstructor, RawInterfaceConstructor, RawTypeAlias|RawEnumType, RawValue, RawTypeContainer> {
  reexports?: Map<Reference>
}

export interface RawParameterisedType extends ParameterisedTypeTemplate<RawTypeParameter> {
}

export interface RawValue extends ValueTemplate<RawType, RawExpression> {
}

export interface RawTypeAlias extends TypeAliasTemplate<RawType> {
}

export interface RawClassConstructor extends ClassConstructorTemplate<RawDecoratedCompositeType, RawDecorator, Reference|RefinedReference, Reference|RefinedReference, RawTypeParameter> {
}

export interface RawInterfaceConstructor extends InterfaceConstructorTemplate<RawCompositeType, Reference|RefinedReference, RawTypeParameter> {
}

export interface RawTypeParameter extends TypeParameterTemplate<RawType> {
}

export interface RawEnumType extends EnumTypeTemplate<RawEnumMember> {
}

export interface RawEnumMember extends EnumMemberTemplate<RawExpression> {
}

export type RawType = Reference|RefinedReference|RawUnionType|RawFunctionType|RawTupleType|RawPrimitiveType|RawTypeQuery|RawCompositeType|RawTypeAlias

export interface RawCompositeType extends CompositeTypeTemplate<RawMember, RawIndex, RawFunctionType> {
}

export interface RawDecorated extends DecoratedTemplate<RawDecorator> {
}

export interface RawDecoratedCompositeType extends DecoratedCompositeTypeTemplate<RawDecoratedMember, RawIndex, RawDecoratedFunctionType> {
}

export interface RawTypeQuery extends TypeQueryTemplate<Reference> {
}

export interface RawUnionType extends UnionTypeTemplate<RawType> {
}

export interface RawTupleType extends TupleTypeTemplate<RawType> {
}

export interface RawDecoratedFunctionType extends DecoratedFunctionTypeTemplate<RawType, RawDecoratedParameter, RawTypeParameter> {
}

export interface RawFunctionType extends FunctionTypeTemplate<RawType, RawParameter, RawTypeParameter> {
}

export interface RawPrimitiveType extends PrimitiveTypeTemplate {
}

export interface RawParameter extends ParameterTemplate<RawType, RawExpression> {
}

export interface RawDecoratedParameter extends DecoratedParameterTemplate<RawType, RawDecorator, RawExpression> {
}

export interface RawIndex extends IndexTemplate<RawType> {
}

export interface RawMember extends MemberTemplate<RawType, RawExpression> {
}

export interface RawDecoratedMember extends DecoratedMemberTemplate<RawType, RawDecorator, RawExpression> {
}

export interface RawDecorator extends DecoratorTemplate<Reference, RawExpression> {
}

export type RawExpression = RawComplexExpression|RawClassExpression|RawClassExpression|RawLiteralExpression<any>|RawArrayExpression|RawObjectExpression|RawEnumExpression

export interface RawComplexExpression extends ComplexExpressionTemplate<RawType> {
}

export interface RawClassExpression extends ClassExpressionTemplate<Reference> {
}

export interface RawLiteralExpression<T> extends LiteralExpressionTemplate<T> {
}

export interface RawArrayExpression extends ArrayExpressionTemplate<RawExpression> {
}

export interface RawObjectExpression extends ObjectExpressionTemplate<RawExpression> {
}

export interface RawEnumExpression extends EnumExpressionTemplate<Reference> {
}

/*
 * Open Model
 * = = = = = = = = = = = = = = = =
 */

export enum ModelKind {
  TYPE_CONTAINER = 1,
  CLASS_CONSTRUCTOR,
  INTERFACE_CONSTRUCTOR,
  TYPE,
  INDEX,
  TYPE_PARAMETER,
  PARAMETER,
  DECORATED_PARAMETER,
  MEMBER,
  DECORATED_MEMBER,
  DECORATOR,
  EXPRESSION,
  VALUE,
  ENUM_MEMBER
}

export interface ModelElement {
  modelKind: ModelKind
  equals(m: ModelElement): boolean
}

export enum TypeContainerKind {
  MODULE = 1,
  NAMESPACE
}

export type Type = Class|Interface|UnionType|FunctionType|TupleType|EnumType|PrimitiveType|TypeQuery|TypeAlias<any>|DecoratorType
export type OpenType = Type|TypeParameter<any>

export interface TypeContainer extends TypeContainerTemplate<ClassConstructor, InterfaceConstructor, TypeAlias<any>|EnumType, Value<TypeContainer, any>, Namespace>, ModelElement {
  name: string
  typeContainerKind: TypeContainerKind
}

export interface Module extends TypeContainer {
}

export interface Namespace extends TypeContainer {
  parent: TypeContainer
}

export interface Value<P, T extends Type> extends ValueTemplate<T, Expression>, ModelElement {
  name: string
  parent: P
}

export interface ClassConstructor extends ClassConstructorTemplate<DecoratedCompositeType<ClassConstructor>, Decorator<ClassConstructor>, Class, Interface, TypeParameter<ClassConstructor>>, ModelElement {
  parent: TypeContainer
  name: string
}

export interface InterfaceConstructor extends InterfaceConstructorTemplate<ContainedCompositeType<InterfaceConstructor>, Interface, TypeParameter<InterfaceConstructor>>, ModelElement {
  parent: TypeContainer
  name: string
}

export interface ParameterisedType extends ParameterisedTypeTemplate<TypeParameter<any>>, ModelElement {
}

export interface Class extends ClassTemplate<DecoratedCompositeType<Class>, Decorator<Class>, Class, Interface, ClassConstructor, OpenType>, ModelElement {
  name: string
  constructorParent: TypeContainer
}

export interface Interface extends InterfaceTemplate<ContainedCompositeType<Interface>, Interface, InterfaceConstructor, OpenType>, ModelElement {
  name: string
  constructorParent: TypeContainer
}

export interface CompositeType extends CompositeTypeTemplate<Member<CompositeType>, Index, FunctionType>, ModelElement {
}

export interface ContainedCompositeType<P> extends CompositeTypeTemplate<Member<ContainedCompositeType<P>>, Index, FunctionType>, ModelElement {
  parent: P
}

export interface DecoratedCompositeType<P> extends DecoratedCompositeTypeTemplate<DecoratedMember<P>, Index, DecoratedFunctionType>, ModelElement {
  parent: P
}

export interface Index extends IndexTemplate<OpenType>, ModelElement {
  parent: CompositeType
}

export interface TypeParameter<P extends ParameterisedType> extends TypeParameterTemplate<OpenType>, ModelElement {
  parent: P
}

export interface FunctionType extends FunctionTypeTemplate<OpenType, Parameter, TypeParameter<FunctionType>>, ModelElement {
}

export interface DecoratedFunctionType extends DecoratedFunctionTypeTemplate<OpenType, DecoratedParameter, TypeParameter<DecoratedFunctionType>>, ModelElement {
}

export interface Parameter extends ParameterTemplate<OpenType, Expression>, ModelElement {
  parent: FunctionType
}

export interface DecoratedParameter extends DecoratedParameterTemplate<OpenType, Decorator<DecoratedParameter>, Expression>, ModelElement {
  parent: DecoratedFunctionType
}

export interface UnionType extends UnionTypeTemplate<OpenType>, ModelElement {
}

export interface TupleType extends TupleTypeTemplate<OpenType>, ModelElement {
}

export interface TypeQuery extends TypeQueryTemplate<OpenType|TypeContainer|Value<TypeContainer, any>>, ModelElement {
}

export interface TypeAlias<T extends Type> extends TypeAliasTemplate<T>, ModelElement {
  name: string
  parent: TypeContainer
}

export interface EnumType extends EnumTypeTemplate<EnumMember>, ModelElement {
  name: string
  parent: TypeContainer
}

export interface EnumMember extends EnumMemberTemplate<Expression>, ModelElement {
  parent: EnumType
}

export type ClassConstructorMember = DecoratedMember<DecoratedCompositeType<ClassConstructor>>
export type ClassMember = DecoratedMember<DecoratedCompositeType<Class>>
export type InterfaceConstructorMember = Member<ContainedCompositeType<InterfaceConstructor>>
export type InterfaceMember = Member<ContainedCompositeType<Interface>>

export interface Member<P extends CompositeType> extends MemberTemplate<OpenType, Expression>, ModelElement {
  parent: P
  name: string
}

export interface DecoratedMember<GP> extends DecoratedMemberTemplate<OpenType, Decorator<DecoratedMember<GP>>, Expression>, ModelElement {
  parent: DecoratedCompositeType<GP>
  name: string
}

export interface Decorated extends DecoratedTemplate<Decorator<any>>, ModelElement {
}

export interface Decorator<P extends Decorated> extends DecoratorTemplate<Value<TypeContainer, DecoratorType>, Expression>, ModelElement {
  parent: P
}

export type Expression = ComplexExpression|ClassExpression|LiteralExpression<any>|ArrayExpression|ObjectExpression|EnumExpression

export interface ComplexExpression extends ComplexExpressionTemplate<Type>, ModelElement {
}

export interface ClassExpression extends ClassExpressionTemplate<ClassConstructor>, ModelElement {
}

export interface LiteralExpression<T> extends LiteralExpressionTemplate<T>, ModelElement {
}

export interface ArrayExpression extends ArrayExpressionTemplate<Expression>, ModelElement {
}

export interface ObjectExpression extends ObjectExpressionTemplate<Expression>, ModelElement {
}

export interface EnumExpression extends EnumExpressionTemplate<EnumType>, ModelElement {
}

export interface DecoratorType extends FunctionType, ModelElement {
  decoratorTypeKind: DecoratorTypeKind
}

export enum DecoratorTypeKind {
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
