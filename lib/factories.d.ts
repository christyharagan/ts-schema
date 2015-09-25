import * as m from './model';
export interface Factory<M> extends m.ModelElementTemplate {
    modelKind: m.ModelKind;
    construct(constructorConstructor: <U extends M>(factory: Factory<U>, parent?: Factory<any>) => (() => U)): () => M;
}
export interface ContainedFactory<M> extends Factory<M>, m.ModelElementTemplate {
    parent: ContainerFactory;
    name: string;
}
export interface TypeFactory<T extends m.TypeTemplate> extends Factory<T>, m.TypeTemplate {
}
export interface ExpressionFactory<E extends m.ExpressionTemplate> extends Factory<E>, m.ExpressionTemplate {
}
export interface ContainerFactory extends Factory<m.ContainerTemplate<any, any, any, any, any, any>>, m.ContainerTemplate<ClassConstructorFactory, InterfaceConstructorFactory, TypeAliasConstructorFactory<any>, EnumFactory, ValueFactory<any>, ContainerFactory> {
    name: string;
    containerKind: m.ContainerKind;
    addClassConstructor(name: string): ClassConstructorFactory;
    addInterfaceConstructor(name: string): InterfaceConstructorFactory;
    addTypeAliasConstructor<T extends m.TypeTemplate>(name: string): TypeAliasConstructorFactory<T>;
    addEnum(name: string): EnumFactory;
    addValue(name: string): ValueFactory<any>;
    addNamespace(name: string): NamespaceFactory;
}
export interface DecoratedFactory<T extends m.DecoratedTemplate<any>, This extends DecoratedFactory<any, any>> extends Factory<T>, m.DecoratedTemplate<DecoratorFactory<This>> {
    addDecorator(): DecoratorFactory<This>;
}
export interface TypeConstructorFactory<This extends TypeConstructorFactory<any>> extends Factory<m.TypeConstructorTemplate<any>>, m.TypeConstructorTemplate<TypeParameterFactory<This>> {
    addTypeParameter(name: string): TypeParameterFactory<This>;
}
export declare abstract class AbstractFactory<M> implements Factory<M>, m.ModelElementTemplate {
    private _constructor;
    modelKind: m.ModelKind;
    constructor(modelKind?: m.ModelKind);
    construct(constructorConstructor: <U extends M>(factory: Factory<U>) => (() => U)): () => M;
}
export declare abstract class AbstractExpressionFactory<E extends m.ExpressionTemplate> extends AbstractFactory<E> implements m.ExpressionTemplate {
    expressionKind: m.ExpressionKind;
    constructor(kind: m.ExpressionKind);
}
export declare abstract class AbstractTypeFactory<T extends m.TypeTemplate> extends AbstractFactory<T> implements m.TypeTemplate {
    typeKind: m.TypeKind;
    constructor(kind: m.TypeKind);
}
export declare class FunctionExpressionFactory extends AbstractExpressionFactory<m.FunctionExpressionTemplate<any>> implements m.FunctionExpressionTemplate<FunctionTypeFactory> {
    functionType: FunctionTypeFactory;
    constructor();
}
export declare class FunctionCallExpressionFactory extends AbstractExpressionFactory<m.FunctionCallExpressionTemplate<any>> implements m.FunctionCallExpressionTemplate<ExpressionFactory<any>> {
    function: ExpressionFactory<any>;
    arguments: ExpressionFactory<any>[];
    constructor();
    createFunction(kind: m.ExpressionKind): ExpressionFactory<any>;
    addArgument<E extends AbstractExpressionFactory<any>>(kindOrExpression: m.ExpressionKind | E): ExpressionFactory<any>;
}
export declare class PropertyAccessExpressionFactory extends AbstractExpressionFactory<m.PropertyAccessExpressionTemplate<any>> implements m.PropertyAccessExpressionTemplate<ExpressionFactory<any>> {
    parent: ExpressionFactory<any>;
    property: string;
    constructor();
    createParent<E extends AbstractExpressionFactory<any>>(kindOrExpression: m.ExpressionKind | E): E;
}
export declare class ValueExpressionFactory<T extends m.TypeTemplate> extends AbstractExpressionFactory<m.ValueExpressionTemplate<any>> implements m.ValueExpressionTemplate<ValueFactory<T>> {
    value: ValueFactory<T>;
    constructor();
}
export declare class EnumExpressionFactory extends AbstractExpressionFactory<m.EnumExpressionTemplate<any>> implements m.EnumExpressionTemplate<EnumFactory> {
    enum: EnumFactory;
    value: string;
    constructor();
}
export declare class ClassExpressionFactory extends AbstractExpressionFactory<m.ClassExpressionTemplate<any>> implements m.ClassExpressionTemplate<ProtoClassFactory> {
    class: ProtoClassFactory;
    constructor();
    createClass(): ProtoClassFactory;
}
export declare class ClassReferenceExpressionFactory extends AbstractExpressionFactory<m.ClassReferenceExpressionTemplate<any>> implements m.ClassReferenceExpressionTemplate<ClassConstructorFactory> {
    classReference: ClassConstructorFactory;
    constructor();
}
export declare class NewExpressionFactory extends AbstractExpressionFactory<m.NewExpressionTemplate<any>> implements m.NewExpressionTemplate<ExpressionFactory<any>> {
    classReference: ExpressionFactory<any>;
    arguments: ExpressionFactory<any>[];
    constructor();
}
export declare class ObjectExpressionFactory extends AbstractExpressionFactory<m.ObjectExpressionTemplate<any>> implements m.ObjectExpressionTemplate<ExpressionFactory<any>> {
    properties: m.KeyValue<ExpressionFactory<any>>;
    constructor();
    addProperty<E extends AbstractExpressionFactory<any>>(key: string, kindOrExpression: m.ExpressionKind | E): E;
}
export declare class ArrayExpressionFactory extends AbstractExpressionFactory<m.ArrayExpressionTemplate<any>> implements m.ArrayExpressionTemplate<ExpressionFactory<any>> {
    elements: ExpressionFactory<any>[];
    constructor();
    addElement<E extends AbstractExpressionFactory<any>>(kindOrExpression: m.ExpressionKind | E): E;
}
export declare class PrimitiveExpressionFactory<T extends m.Primitive> extends AbstractExpressionFactory<m.PrimitiveExpressionTemplate<T>> implements m.PrimitiveExpressionTemplate<T> {
    primitiveTypeKind: m.PrimitiveTypeKind;
    primitiveValue: T;
    constructor(primitiveTypeKind?: m.PrimitiveTypeKind, primitiveValue?: T);
}
export declare class DecoratorFactory<P extends DecoratedFactory<any, any>> extends AbstractFactory<m.DecoratorTemplate<any, any>> implements m.DecoratorTemplate<ValueFactory<any>, ExpressionFactory<any>> {
    parent: P;
    parameters: ExpressionFactory<any>[];
    decoratorType: ValueFactory<any>;
    constructor(parent: P);
}
export declare class PrimitiveTypeFactory extends AbstractTypeFactory<m.PrimitiveTypeTemplate> implements m.PrimitiveTypeTemplate {
    primitiveTypeKind: m.PrimitiveTypeKind;
    constructor(primitiveTypeKind: m.PrimitiveTypeKind);
}
export declare class TupleTypeFactory extends AbstractTypeFactory<m.TupleTypeTemplate<any>> implements m.TupleTypeTemplate<TypeFactory<any>> {
    elements: TypeFactory<any>[];
    constructor();
}
export declare class UnionOrIntersectionTypeFactory extends AbstractTypeFactory<m.UnionOrIntersectionTypeTemplate<any>> implements m.UnionOrIntersectionTypeTemplate<TypeFactory<any>> {
    types: TypeFactory<any>[];
    constructor(typeKind: m.TypeKind);
}
export declare class EnumMemberFactory extends AbstractFactory<m.EnumMemberTemplate<any>> implements m.EnumMemberTemplate<ExpressionFactory<any>> {
    name: string;
    parent: EnumFactory;
    initializer: ExpressionFactory<any>;
    constructor(parent: EnumFactory, name: string);
}
export declare class EnumFactory extends AbstractTypeFactory<m.EnumTemplate<any>> implements m.EnumTemplate<EnumMemberFactory>, ContainedFactory<m.EnumTemplate<any>> {
    name: string;
    members: EnumMemberFactory[];
    parent: ContainerFactory;
    constructor(parent: ContainerFactory, name: string);
    addMember(name: string): EnumMemberFactory;
}
export declare class TypeQueryFactory<T extends m.TypeTemplate> extends AbstractTypeFactory<m.TypeQueryTemplate<any>> implements m.TypeQueryTemplate<TypeFactory<T> | ValueFactory<T> | ContainerFactory> {
    type: TypeFactory<T> | ValueFactory<T> | ContainerFactory;
    constructor();
}
export declare class ValueFactory<T extends m.TypeTemplate> extends AbstractFactory<m.ValueTemplate<any, any>> implements m.ValueTemplate<TypeFactory<T>, ExpressionFactory<any>>, ContainedFactory<m.ValueTemplate<any, any>> {
    name: string;
    parent: ContainerFactory;
    valueKind: m.ValueKind;
    type: TypeFactory<T>;
    initializer: ExpressionFactory<any>;
    constructor(parent: ContainerFactory, name: string);
}
export declare abstract class AbstractParameterFactory<P extends AbstractFunctionTypeFactory<any, any, any>, T extends m.TypeTemplate> extends AbstractFactory<m.ParameterTemplate<any, any>> implements m.ParameterTemplate<TypeFactory<T>, ExpressionFactory<any>> {
    name: string;
    parent: P;
    type: TypeFactory<T>;
    initializer: ExpressionFactory<any>;
    optional: boolean;
    constructor(parent: P, name: string, optional: boolean);
}
export declare class DecoratedParameterFactory<T extends m.TypeTemplate> extends AbstractParameterFactory<DecoratedFunctionTypeFactory, T> implements m.DecoratedParameterTemplate<TypeFactory<T>, DecoratorFactory<DecoratedParameterFactory<T>>, ExpressionFactory<any>>, DecoratedFactory<m.DecoratedParameterTemplate<any, any, any>, DecoratedParameterFactory<T>> {
    decorators: DecoratorFactory<DecoratedParameterFactory<T>>[];
    constructor(parent: DecoratedFunctionTypeFactory, name: string, isOptional?: boolean);
    addDecorator(): any;
}
export declare class ParameterFactory<T extends m.TypeTemplate> extends AbstractParameterFactory<FunctionTypeFactory, T> {
}
export declare abstract class AbstractFunctionTypeFactory<F extends m.FunctionTypeTemplate<any, any, any>, PC extends AbstractParameterFactory<any, any>, This extends AbstractFunctionTypeFactory<any, any, any>> extends AbstractTypeFactory<F> implements m.FunctionTypeTemplate<TypeFactory<any>, PC, TypeParameterFactory<This>> {
    parameters: PC[];
    typeParameters: TypeParameterFactory<This>[];
    type: TypeFactory<any>;
    isDecorated: boolean;
    constructor(isDecorated: boolean);
    addTypeParameter(name: string): any;
    addParameter<T extends m.TypeTemplate>(name: string, isOptional?: boolean): any;
}
export declare class DecoratedFunctionTypeFactory extends AbstractFunctionTypeFactory<m.DecoratedFunctionTypeTemplate<TypeFactory<any>, DecoratedParameterFactory<any>, TypeParameterFactory<DecoratedFunctionTypeFactory>>, DecoratedParameterFactory<any>, DecoratedFunctionTypeFactory> implements Factory<m.DecoratedFunctionTypeTemplate<TypeFactory<any>, DecoratedParameterFactory<any>, TypeParameterFactory<DecoratedFunctionTypeFactory>>>, m.DecoratedFunctionTypeTemplate<TypeFactory<any>, DecoratedParameterFactory<any>, TypeParameterFactory<DecoratedFunctionTypeFactory>> {
    constructor();
}
export declare class FunctionTypeFactory extends AbstractFunctionTypeFactory<m.FunctionTypeTemplate<TypeFactory<any>, ParameterFactory<any>, TypeParameterFactory<FunctionTypeFactory>>, ParameterFactory<any>, FunctionTypeFactory> {
    constructor();
}
export declare abstract class AbstractMemberFactory<P extends AbstractCompositeTypeFactory<any, any, any>, M extends m.MemberTemplate<any, any>, T extends m.TypeTemplate> extends AbstractFactory<M> {
    name: string;
    optional: boolean;
    type: TypeFactory<T>;
    initializer: ExpressionFactory<any>;
    constructor(parent: P, name: string, optional?: boolean);
}
export declare class DecoratedMemberFactory<GP extends Factory<any>, T extends m.TypeTemplate> extends AbstractMemberFactory<DecoratedCompositeTypeFactory<GP>, m.DecoratedMemberTemplate<any, any, any>, T> implements m.MemberTemplate<TypeFactory<any>, ExpressionFactory<any>> {
    decorators: DecoratorFactory<DecoratedMemberFactory<GP, T>>[];
    constructor(parent: DecoratedCompositeTypeFactory<GP>, name: string, optional?: boolean);
    addDecorator(): any;
}
export declare class MemberFactory<GP extends Factory<any>, T extends m.TypeTemplate> extends AbstractMemberFactory<CompositeTypeFactory<GP>, m.MemberTemplate<TypeFactory<T>, ExpressionFactory<any>>, T> {
}
export declare class IndexFactory extends AbstractFactory<m.IndexTemplate<any>> implements m.IndexTemplate<TypeFactory<any>> {
    parent: AbstractCompositeTypeFactory<any, any, any>;
    keyType: m.PrimitiveTypeKind;
    valueType: TypeFactory<any>;
    constructor(parent: AbstractCompositeTypeFactory<any, any, any>);
}
export declare abstract class AbstractCompositeTypeFactory<C extends m.CompositeTypeTemplate<any, any, any>, MC extends AbstractMemberFactory<any, any, any>, FT extends AbstractFunctionTypeFactory<any, any, any>> extends AbstractTypeFactory<C> implements m.CompositeTypeTemplate<MC, IndexFactory, FT> {
    protected isDecorated: boolean;
    members: m.KeyValue<MC>;
    index: IndexFactory;
    calls: FT[];
    constructor(isDecorated: boolean);
    addMember(name: string, optional?: boolean): MC;
    createIndex(keyType: m.PrimitiveTypeKind): IndexFactory;
}
export declare class DecoratedCompositeTypeFactory<P extends Factory<any>> extends AbstractCompositeTypeFactory<DecoratedCompositeTypeFactory<P>, DecoratedMemberFactory<P, any>, DecoratedFunctionTypeFactory> implements m.DecoratedCompositeTypeTemplate<DecoratedMemberFactory<P, any>, IndexFactory, DecoratedFunctionTypeFactory> {
    parent: P;
    constructor(parent: P);
}
export declare class CompositeTypeFactory<P extends Factory<any>> extends AbstractCompositeTypeFactory<CompositeTypeFactory<P>, MemberFactory<P, any>, FunctionTypeFactory> implements m.CompositeTypeTemplate<MemberFactory<P, any>, IndexFactory, FunctionTypeFactory> {
    parent: P;
    constructor(parent?: P, isDecorated?: boolean);
}
export declare class TypeParameterFactory<P extends TypeConstructorFactory<any>> extends AbstractTypeFactory<m.TypeParameterTemplate<any>> implements m.TypeParameterTemplate<TypeFactory<any>> {
    parent: P;
    name: string;
    extends: TypeFactory<any>;
    constructor(parent: P, name: string);
}
export declare abstract class AbstractConstructableTypeFactory<T extends m.ConstructableTypeTemplate<any, any>, TC extends TypeConstructorFactory<any>> extends AbstractTypeFactory<T> {
    typeConstructor: TC;
    typeArguments: TypeFactory<any>[];
}
export declare class ClassFactory extends AbstractConstructableTypeFactory<m.ClassTemplate<any, any, any, any, any, any>, ClassConstructorFactory> implements m.ClassTemplate<DecoratedCompositeTypeFactory<ClassFactory>, DecoratorFactory<ClassFactory>, ClassFactory, InterfaceFactory | ClassFactory, ClassConstructorFactory, TypeFactory<any>>, DecoratedFactory<m.ClassTemplate<DecoratedCompositeTypeFactory<ClassFactory>, DecoratorFactory<ClassFactory>, ClassFactory, InterfaceFactory, ClassConstructorFactory, TypeFactory<any>>, ClassFactory> {
    instanceType: DecoratedCompositeTypeFactory<ClassFactory>;
    staticType: DecoratedCompositeTypeFactory<ClassFactory>;
    implements: (InterfaceFactory | ClassFactory)[];
    extends: ClassFactory;
    decorators: DecoratorFactory<ClassFactory>[];
    isAbstract: boolean;
    constructor();
    addDecorator(): any;
}
export declare class InterfaceFactory extends AbstractConstructableTypeFactory<m.InterfaceTemplate<any, any, any, any>, InterfaceConstructorFactory> implements m.InterfaceTemplate<CompositeTypeFactory<InterfaceFactory>, InterfaceFactory | ClassFactory, InterfaceConstructorFactory, TypeFactory<any>> {
    instanceType: CompositeTypeFactory<InterfaceFactory>;
    extends: (InterfaceFactory | ClassFactory)[];
    constructor();
}
export declare class TypeAliasFactory<T extends m.TypeTemplate> extends AbstractConstructableTypeFactory<m.TypeAliasTemplate<any, any, any>, TypeAliasConstructorFactory<T>> implements m.TypeAliasTemplate<T, TypeAliasConstructorFactory<T>, TypeFactory<any>> {
    type: T;
    constructor();
}
export declare class ProtoClassFactory extends AbstractTypeFactory<m.ProtoClassTemplate<any>> implements m.ProtoClassTemplate<CompositeTypeFactory<ProtoClassFactory>> {
    instanceType: CompositeTypeFactory<ProtoClassFactory>;
    staticType: CompositeTypeFactory<ProtoClassFactory>;
    constructor();
    createInstanceType(): CompositeTypeFactory<ProtoClassFactory>;
    createStaticType(): CompositeTypeFactory<ProtoClassFactory>;
}
export declare abstract class AbstractTypeConstructorFactory<T extends m.TypeConstructorTemplate<any>, This extends AbstractTypeConstructorFactory<any, any>> extends AbstractFactory<T> implements TypeConstructorFactory<This> {
    parent: ContainerFactory;
    name: string;
    typeParameters: TypeParameterFactory<This>[];
    constructor(modelKind: m.ModelKind, parent: ContainerFactory, name: string);
    addTypeParameter(name: string): any;
}
export declare class InterfaceConstructorFactory extends AbstractTypeConstructorFactory<m.InterfaceConstructorTemplate<any, any, any>, InterfaceConstructorFactory> implements m.InterfaceConstructorTemplate<CompositeTypeFactory<InterfaceConstructorFactory>, InterfaceFactory | ClassFactory, TypeParameterFactory<InterfaceConstructorFactory>>, ContainedFactory<m.InterfaceConstructorTemplate<any, any, any>> {
    instanceType: CompositeTypeFactory<InterfaceConstructorFactory>;
    extends: (InterfaceFactory | ClassFactory)[];
    typeParameters: TypeParameterFactory<InterfaceConstructorFactory>[];
    constructor(parent: ContainerFactory, name: string);
    createInstanceType(): CompositeTypeFactory<InterfaceConstructorFactory>;
}
export declare class TypeAliasConstructorFactory<T extends m.TypeTemplate> extends AbstractTypeConstructorFactory<m.TypeAliasConstructorTemplate<any, any>, TypeAliasConstructorFactory<T>> implements m.TypeAliasConstructorTemplate<TypeFactory<T>, TypeParameterFactory<TypeAliasConstructorFactory<T>>>, ContainedFactory<m.TypeAliasConstructorTemplate<any, any>> {
    type: TypeFactory<T>;
    constructor(parent: ContainerFactory, name: string);
}
export declare class ClassConstructorFactory extends AbstractTypeConstructorFactory<m.ClassConstructorTemplate<any, any, any, any, any>, ClassConstructorFactory> implements m.ClassConstructorTemplate<DecoratedCompositeTypeFactory<ClassConstructorFactory>, DecoratorFactory<ClassConstructorFactory>, ClassFactory, InterfaceFactory | ClassFactory, TypeParameterFactory<ClassConstructorFactory>>, DecoratedFactory<m.ClassConstructorTemplate<any, any, any, any, any>, ClassConstructorFactory>, ContainedFactory<m.ClassConstructorTemplate<any, any, any, any, any>> {
    instanceType: DecoratedCompositeTypeFactory<ClassConstructorFactory>;
    staticType: DecoratedCompositeTypeFactory<ClassConstructorFactory>;
    implements: (InterfaceFactory | ClassFactory)[];
    extends: ClassFactory;
    decorators: DecoratorFactory<ClassConstructorFactory>[];
    isAbstract: boolean;
    constructor(parent: ContainerFactory, name: string);
    createInstanceType(): DecoratedCompositeTypeFactory<ClassConstructorFactory>;
    createStaticType(): DecoratedCompositeTypeFactory<ClassConstructorFactory>;
    addDecorator(): any;
}
export declare abstract class AbstractContainerFactory extends AbstractFactory<m.ContainerTemplate<any, any, any, any, any, any>> implements ContainerFactory {
    name: string;
    containerKind: m.ContainerKind;
    classConstructors: m.KeyValue<ClassConstructorFactory>;
    interfaceConstructors: m.KeyValue<InterfaceConstructorFactory>;
    typeAliasConstructors: m.KeyValue<TypeAliasConstructorFactory<any>>;
    enums: m.KeyValue<EnumFactory>;
    values: m.KeyValue<ValueFactory<any>>;
    namespaces: m.KeyValue<NamespaceFactory>;
    constructor(kind: m.ContainerKind, name: string);
    addClassConstructor(name: string): ClassConstructorFactory;
    addInterfaceConstructor(name: string): InterfaceConstructorFactory;
    addTypeAliasConstructor<T extends m.TypeTemplate>(name: string): TypeAliasConstructorFactory<T>;
    addEnum(name: string): EnumFactory;
    addValue(name: string): ValueFactory<any>;
    addNamespace(name: string): NamespaceFactory;
}
export declare class ModuleFactory extends AbstractContainerFactory {
    constructor(name: string);
}
export declare class NamespaceFactory extends AbstractContainerFactory implements ContainedFactory<m.ContainerTemplate<any, any, any, any, any, any>> {
    parent: ContainerFactory;
    constructor(parent: ContainerFactory, name: string);
}
export declare class PackageFactory extends AbstractFactory<m.PackageTemplate<any>> implements m.PackageTemplate<ModuleFactory> {
    modules: m.KeyValue<ModuleFactory>;
    constructor();
}
export declare function expressionFactory(kindOrExpression: m.ExpressionKind | ExpressionFactory<any>): ExpressionFactory<any>;
