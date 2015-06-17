declare module 'typescript-schema/schema' {
	export interface DecoratedSchema {
	    decorators?: Array<DecoratorSchema>;
	}
	export type Type = string | ArraySchema | FunctionSchema | TypeReference;
	export interface TypeParameter {
	    name: string;
	    extends?: Type;
	}
	export interface DeclaredType {
	    module: string;
	    type: string;
	}
	export interface TypeReference extends DeclaredType {
	    typeArguments?: Type[];
	}
	export interface ArraySchema {
	    element: Type;
	}
	export interface Parameter extends DecoratedSchema {
	    name: string;
	    type: Type;
	}
	export interface FunctionSchema extends DecoratedSchema {
	    parameters: Array<Parameter>;
	    type: Type;
	}
	export interface InterfaceSchema {
	    name: string;
	    members: MembersSchema;
	    typeParameters?: TypeParameter[];
	}
	export type Expression = Literal | TypeReference | ObjectExpression | ArrayExpression;
	export interface Literal {
	    value: any;
	    type: string;
	}
	export interface ArrayExpression extends Array<Literal | TypeReference | ObjectExpression | ArrayExpression> {
	}
	export interface ObjectProperties {
	    [property: string]: Expression;
	}
	export interface ObjectExpression {
	    properties: ObjectProperties;
	}
	export interface DecoratorSchema {
	    decorator: string;
	    parameters?: Array<Expression>;
	}
	export interface MemberSchema {
	    name: string;
	    type: Type;
	}
	export interface MembersSchema {
	    [property: string]: MemberSchema;
	}
	export interface ClassSchema extends DecoratedSchema {
	    name: string;
	    members: MembersSchema;
	    typeParameters?: TypeParameter[];
	    implements?: (TypeReference)[];
	}
	export interface InterfacesSchema {
	    [interfaceName: string]: InterfaceSchema;
	}
	export interface ClassesSchema {
	    [className: string]: ClassSchema;
	}
	export interface ModuleSchema {
	    name: string;
	    interfaces: InterfacesSchema;
	    classes: ClassesSchema;
	}
	export interface Schema {
	    [name: string]: ModuleSchema;
	}

}
declare module 'typescript-schema/schemaGenerator' {
	import * as s from './schema';
	export interface Files {
	    [name: string]: string;
	}
	export function fileNameToModuleName(fileName: string): string;
	export function generateSchema(files: Files): s.Schema;

}
declare module 'typescript-schema/schemaVisitor' {
	import * as s from './schema';
	export interface SchemaVisitor extends ModuleSchemaVisitor {
	    onModuleSchema?: (moduleSchema: s.ModuleSchema) => void;
	}
	export interface ModuleSchemaVisitor extends ClassSchemaVisitor, InterfaceSchemaVisitor {
	    onClass?: (classSchema: s.ClassSchema, moduleSchema?: s.ModuleSchema) => void;
	    onInterface?: (interfaceSchema: s.InterfaceSchema, moduleSchema?: s.ModuleSchema) => void;
	}
	export interface ClassSchemaVisitor {
	    onClassDecorator?: (decoratorSchema: s.DecoratorSchema, classSchema?: s.ClassSchema, moduleSchema?: s.ModuleSchema) => void;
	    onClassMember?: (memberSchema: s.MemberSchema, classSchema?: s.ClassSchema, moduleSchema?: s.ModuleSchema) => void;
	}
	export interface InterfaceSchemaVisitor {
	    onInterfaceMember?: (memberSchema: s.MemberSchema, interfaceSchema?: s.InterfaceSchema, moduleSchema?: s.ModuleSchema) => void;
	}
	export function schemaVisitor(schema: s.Schema, visitor: SchemaVisitor): void;
	export function moduleSchemaVisitor(moduleSchema: s.ModuleSchema, visitor: ModuleSchemaVisitor): void;
	export function classSchemaVisitor(classSchema: s.ClassSchema, visitor: ClassSchemaVisitor, moduleSchema?: s.ModuleSchema): void;
	export function interfaceSchemaVisitor(interfaceSchema: s.InterfaceSchema, visitor: InterfaceSchemaVisitor, moduleSchema?: s.ModuleSchema): void;

}
declare module 'typescript-schema/index' {
	export * from './schema';
	export * from './schemaGenerator';
	export * from './schemaVisitor';

}
declare module 'typescript-schema' {
	export * from 'index';
}
