export type RawSchema = RawContainer[]

export interface RawContainer {
  name: string
  types: Type[]
  namespaces: RawContainer[]
}

export interface RawInterface extends ParameterisedType {
  name: string
  members: RawMembers
  extends?: (RawReference|RefinedType<RawReference>)[]
}

export interface RawClass extends Decorated, ParameterisedType {
  name: string
  constructorSchema?: FunctionType
  members: RawClassMembers
  extends?: RawReference|RefinedType<RawReference>
  implements?: (RawReference|RefinedType<RawReference>)[]
}

export interface RawReference extends Type {
  module?: string
  name: string
}

export interface RawClassExpression extends Expression {
  module?: string
  name: string
}

export interface Schema {
  [name: string]: Module
}

export interface Module extends Container {
  imports: Imports
}

export interface Imports {
  [moduleName:string]:(NamedType)[]
}

export interface Container {
  containerKind: ContainerKind
  name: string
  interfaces: Interfaces
  classes: Classes
  aliases: TypeAliases
  namespaces: Namespaces
}

export enum ContainerKind {
  MODULE,
  NAMESPACE
}

export interface Namespaces {
  [name:string]: Namespace
}

export interface Namespace extends Container {
  parent: Container
}

export interface Type {
  typeKind: TypeKind
}

export interface NamedType extends Type {
  container: Container
  name: string
}

export interface TypeAliases {
  [aliasName: string]: TypeAlias<any>
}

export interface Interfaces {
  [interfaceName: string]: Interface
}

export interface Classes {
  [className: string]: Class
}

export interface Class extends Decorated, ParameterisedType, NamedType {
  members: ClassMembers
  constructorSchema?: FunctionType
  extends?: Class|RefinedType<Class>
  implements?: (Interface|RefinedType<Interface>)[]
}

export interface Interface extends ParameterisedType, NamedType {
  members: InterfaceMembers
  extends?: (Interface|RefinedType<Interface>)[]
}

export interface TypeAlias<T extends Type> extends ParameterisedType, NamedType {
  type: T
}

export enum TypeKind {
  STRING,
  BOOLEAN,
  NUMBER,
  ANY,
  ARRAY,
  FUNCTION,
  CLASS,
  INTERFACE,
  TUPLE,
  UNION,
  REFINED,
  ALIAS
}

export interface ParameterisedType extends Type {
  typeParameters?: TypeParameter[]
}

export interface RefinedType<T extends Type> extends Type {
  type: T
  parameters: Type[]
}

export interface Decorated {
  decorators?: Array<Decorator>
}

export interface TypeParameter {
  name: string
  extends?: Type
}

export interface ArrayType extends Type {
  element: Type
}

export interface TupleType extends Type {
  elements: Type[]
}

export interface UnionType extends Type {
  types: Type[]
}

export interface Parameter extends Decorated {
  name: string
  type: Type
}

export interface FunctionType extends ParameterisedType {
  parameters: Array<Parameter>
  type?: Type
}

export interface Decorator {
  // TODO: This shouldn't be a string...
  decorator: string
  parameters?: Array<Expression>
}

export interface InterfaceMember extends RawMember {
  parent: Interface
}

export interface ClassMember extends RawClassMember {
  parent: Class
}

export interface RawMember {
  name: string
  type: Type
}

export interface RawClassMember extends RawMember, Decorated {

}

export interface InterfaceMembers {
  [property: string]: InterfaceMember
}

export interface ClassMembers {
  [property: string]: ClassMember
}

export interface RawMembers {
  [property: string]: RawMember
}

export interface RawClassMembers {
  [property: string]: RawClassMember
}

export enum ExpressionKind {
  STRING,
  NUMBER,
  BOOLEAN,
  CLASS,
  OBJECT,
  ARRAY
}

export interface Expression {
  expressionKind: ExpressionKind
}

export interface ClassExpression extends Expression {
  class: Class
}

export interface Literal<T> extends Expression {
  value: T
}

export interface ArrayExpression extends Expression {
  elements: Array<Expression>
}

export interface ObjectProperties {
  [property:string]:Expression
}

export interface ObjectExpression extends Expression {
  properties: ObjectProperties
}
