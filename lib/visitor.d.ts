import { reflective as m, KeyValue } from './model';
export interface ModulesVisitor {
    onModule: (module: m.Module) => void | ContainerVisitor;
}
export interface ContainerVisitor {
    onClassConstructor?: (cls: m.ClassConstructor) => void | ClassConstructorVisitor;
    onInterfaceConstructor?: (inter: m.InterfaceConstructor) => void | InterfaceConstructorVisitor;
    onTypeAliasConstructor?: (alias: m.TypeAliasConstructor<any>) => void | TypeVisitor;
    onEnum?: (e: m.Enum) => void | EnumVisitor;
    onValue?: (staticMember: m.Value<any>) => void | ValueVisitor;
    onNamespace?: (namespace: m.Namespace) => void | ContainerVisitor;
}
export interface ValueVisitor {
    onType?: (type: m.Type) => void | TypeVisitor;
}
export interface ClassConstructorVisitor {
    onExtend?: (extend: m.Class) => void | ClassVisitor;
    onImplement?: (extend: m.Interface | m.Class) => void | InterfaceVisitor | ClassVisitor;
    onInstanceType?: (instanceType: m.CompositeType) => void | CompositeTypeVisitor;
    onStaticType?: (instanceType: m.CompositeType) => void | CompositeTypeVisitor;
    onTypeParameter?: (typeParameter: m.TypeParameter<m.ClassConstructor>) => void;
    onClassConstructorDecorator?: (classDecorator: m.Decorator<m.ClassConstructor>) => void;
}
export interface ClassVisitor {
    onClassConstructor?: (classConstructor: m.ClassConstructor) => void | ClassConstructorVisitor;
    onExtend?: (extend: m.Class) => void | ClassVisitor;
    onImplement?: (extend: m.Interface | m.Class) => void | InterfaceVisitor | ClassVisitor;
    onInstanceType?: (instanceType: m.CompositeType) => void | CompositeTypeVisitor;
    onStaticType?: (instanceType: m.CompositeType) => void | CompositeTypeVisitor;
    onTypeArgument?: (typeArgument: m.Type, typeParameter: m.TypeParameter<m.ClassConstructor>) => void;
    onClassDecorator?: (classDecorator: m.Decorator<m.Class>) => void;
}
export interface InterfaceConstructorVisitor {
    onExtend?: (extend: m.Interface | m.Class) => void | InterfaceVisitor | ClassVisitor;
    onInstanceType?: (instanceType: m.CompositeType) => void | CompositeTypeVisitor;
    onTypeParameter?: (typeParameter: m.TypeParameter<m.InterfaceConstructor>) => void;
}
export interface InterfaceVisitor {
    onInterfaceConstructor?: (interfaceConstructor: m.InterfaceConstructor) => void | InterfaceConstructorVisitor;
    onExtend?: (extend: m.Interface | m.Class) => void | InterfaceVisitor | ClassVisitor;
    onTypeArgument?: (typeArgument: m.Type, typeParameter: m.TypeParameter<m.InterfaceConstructor>) => void;
    onInstanceType?: (instanceType: m.CompositeType) => void | CompositeTypeVisitor;
}
export interface CompositeTypeVisitor {
    onMember?: (member: m.Member<any>) => void | MemberVisitor;
    onIndex?: (index: m.Index) => void;
    onCall?: (call: m.FunctionType) => void | FunctionTypeVisitor;
}
export interface MemberVisitor {
    onType?: (alias: m.Type, member?: m.Member<any>) => void | TypeVisitor;
    onMemberDecorator?: (decorator: m.Decorator<m.DecoratedMember<any>>) => void;
}
export interface TypeQueryVisitor extends TypeVisitor {
    onVariable?: (variable: m.Value<any>) => MemberVisitor | void;
    onNamespace?: (ns: m.Namespace) => ContainerVisitor | void;
}
export interface TypeVisitor {
    onCompositeType?: (compositeType: m.CompositeType) => CompositeTypeVisitor | void;
    onFunctionType?: (functionType: m.FunctionType) => FunctionTypeVisitor | void;
    onUnionType?: (unionType: m.UnionOrIntersectionType) => UnionOrIntersectionTypeVisitor | void;
    onIntersectionType?: (unionType: m.UnionOrIntersectionType) => UnionOrIntersectionTypeVisitor | void;
    onTupleType?: (tupleType: m.TupleType) => TupleTypeVisitor | void;
    onClass?: (cls: m.Class) => ClassVisitor | void;
    onInterface?: (int: m.Interface) => InterfaceVisitor | void;
    onTypeQuery?: (typeQuery: m.TypeQuery) => TypeQueryVisitor | void;
    onTypeAlias?: (typeAlias: m.TypeAlias<any>) => TypeVisitor | void;
    onTypeParameter?: (typeParameter: m.TypeParameter<any>) => void;
    onEnumType?: (enumType: m.Enum) => void;
    onString?: () => void;
    onBoolean?: () => void;
    onNumber?: () => void;
    onAny?: () => void;
    onSymbol?: () => void;
    onVoid?: () => void;
    onArrayType?: (array: m.Class) => TypeVisitor | void;
}
export interface EnumVisitor {
    onEnumMember?(enumMember: m.EnumMember): any;
}
export interface FunctionTypeVisitor {
    onType?: (type: m.Type, functionType?: m.FunctionType) => void | TypeVisitor;
    onParameter?: (parameter: m.Parameter) => void | ParameterVisitor;
    onTypeParameter?: (typeParameter: m.TypeParameter<m.FunctionType>) => void;
}
export interface UnionOrIntersectionTypeVisitor {
    onType?: (type: m.Type, unionType?: m.UnionOrIntersectionType) => void | TypeVisitor;
}
export interface TupleTypeVisitor {
    onType?: (type: m.Type, tupleType?: m.TupleType) => void | TypeVisitor;
}
export interface ParameterVisitor {
    onType?: (alias: m.Type, parameter?: m.Parameter) => void | TypeVisitor;
    onParameterDecorator?: (decorator: m.Decorator<m.DecoratedParameter>) => void;
}
export declare function visitModules(modules: KeyValue<m.Module>, visitor: ModulesVisitor): void;
export declare function visitTypeContainer(container: m.Container, visitor: ContainerVisitor): void;
export declare function visitValue(value: m.Value<any>, visitor: ValueVisitor): void;
export declare function visitEnum(e: m.Enum, visitor: EnumVisitor): void;
export declare function visitClassConstructor(cls: m.ClassConstructor, visitor: ClassConstructorVisitor): void;
export declare function visitClass(cls: m.Class, visitor: ClassVisitor): void;
export declare function visitInterfaceConstructor(inter: m.InterfaceConstructor, visitor: InterfaceConstructorVisitor): void;
export declare function visitInterface(inter: m.Interface, visitor: InterfaceVisitor): void;
export declare function visitCompositeType(compositeType: m.CompositeType, visitor: CompositeTypeVisitor): void;
export declare function visitMember(member: m.Member<any>, visitor: MemberVisitor): void;
export declare function visitUnionOrIntersectionType(unionType: m.UnionOrIntersectionType, visitor: UnionOrIntersectionTypeVisitor): void;
export declare function visitTupleType(tupleType: m.TupleType, visitor: TupleTypeVisitor): void;
export declare function visitFunctionType(functionType: m.FunctionType, visitor: FunctionTypeVisitor): void;
export declare function visitParameter(parameter: m.Parameter, visitor: ParameterVisitor): void;
export declare function visitTypeQuery(typeQuery: m.TypeQuery, visitor: TypeQueryVisitor): void;
export declare function visitType(type: m.Type, visitor: TypeVisitor): void;
