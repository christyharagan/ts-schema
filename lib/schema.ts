export interface DecoratedSchema {
  decorators?: Array<DecoratorSchema>
}

export type Type = string|ArraySchema|FunctionSchema|TypeReference

export interface TypeParameter {
  name: string
  extends?: Type
}

export interface DeclaredType {
  module: string
  type: string
}

export interface TypeReference extends DeclaredType {
  typeArguments?: Type[]
}

export interface ArraySchema {
  element: Type
}

export interface Parameter extends DecoratedSchema {
  name: string
  type: Type
}

export interface FunctionSchema extends DecoratedSchema {
  parameters: Array<Parameter>
  type: Type
}

export interface InterfaceSchema {
  name: string
  members: MembersSchema
  typeParameters?: TypeParameter[]
}

export type Expression = Literal|TypeReference|ObjectExpression|ArrayExpression

export interface Literal {
  value: any
  type: string
}

export interface ArrayExpression extends Array<Literal|TypeReference|ObjectExpression|ArrayExpression> {
}

export interface ObjectProperties {
  [property:string]:Expression
}

export interface ObjectExpression {
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
