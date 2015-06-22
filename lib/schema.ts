export interface DecoratedSchema {
  decorators?: Array<DecoratorSchema>
}

export enum TypeKind {
  STRING,
  BOOLEAN,
  NUMBER,
  ANY,
  ARRAY,
  FUNCTION,
  REFERENCE,
  TUPLE,
  UNION
}

//export type Type = string|ArraySchema|FunctionSchema|TypeReference|TupleSchema|UnionSchema
export interface Type {
  typeKind: TypeKind
}

export interface TypeParameter {
  name: string
  extends?: Type
}

export interface DeclaredType {
  module: string
  type: string
}

export interface TypeReference extends DeclaredType, Type {
  typeArguments?: Type[]
}

export interface TypeExpression extends DeclaredType, Expression {
}

export interface ArraySchema extends Type {
  element: Type
}

export interface TupleSchema extends Type {
  elements: Type[]
}

export interface UnionSchema extends Type {
  types: Type[]
}

export interface Parameter extends DecoratedSchema {
  name: string
  type: Type
}

export interface FunctionSchema extends DecoratedSchema, Type {
  parameters: Array<Parameter>
  type?: Type
}

export interface InterfaceSchema {
  name: string
  members: MembersSchema
  typeParameters?: TypeParameter[]
}

//export type Expression = Literal|TypeReference|ObjectExpression|ArrayExpression
export enum ExpressionKind {
  STRING,
  NUMBER,
  BOOLEAN,
  TYPE_REFERENCE,
  OBJECT,
  ARRAY
}

export interface Expression {
  expressionKind: ExpressionKind
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

export interface DecoratorSchema {
  decorator: string
  parameters?: Array<Expression>
}

export interface MemberSchema {
  name: string
  type: Type
}

export interface MembersSchema {
  [property: string]: MemberSchema
}

export interface ClassSchema extends DecoratedSchema {
  name: string
  members: MembersSchema
  typeParameters?: TypeParameter[]
  implements?: (TypeReference)[]
}

export interface InterfacesSchema {
  [interfaceName: string]: InterfaceSchema
}

export interface ClassesSchema {
  [className: string]: ClassSchema
}

export interface ModuleSchema {
  name: string
  interfaces: InterfacesSchema
  classes: ClassesSchema
}

export interface Schema {
  [name: string]: ModuleSchema
}
