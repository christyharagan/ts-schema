export interface KeyValue<T> {
    [name: string]: T;
}
export declare type Primitive = symbol | number | boolean | string;
export declare const enum ModelKind {
    PACKAGE = 1,
    CONTAINER = 2,
    CLASS_CONSTRUCTOR = 3,
    INTERFACE_CONSTRUCTOR = 4,
    TYPE_ALIAS_CONSTRUCTOR = 5,
    TYPE = 6,
    INDEX = 7,
    PARAMETER = 8,
    DECORATED_PARAMETER = 9,
    MEMBER = 10,
    DECORATED_MEMBER = 11,
    DECORATOR = 12,
    EXPRESSION = 13,
    VALUE = 14,
    ENUM_MEMBER = 15,
    SYMBOL = 16,
}
export declare const enum ContainerKind {
    MODULE = 1,
    NAMESPACE = 2,
}
export interface ModelElementTemplate {
    modelKind: ModelKind;
}
export declare const enum TypeKind {
    PRIMITIVE = 1,
    ENUM = 2,
    FUNCTION = 3,
    TUPLE = 4,
    UNION = 5,
    COMPOSITE = 6,
    INTERFACE = 7,
    CLASS = 8,
    TYPE_QUERY = 9,
    TYPE_ALIAS = 10,
    INTERSECTION = 11,
    TYPE_PARAMETER = 12,
}
export interface TypeTemplate {
    typeKind: TypeKind;
}
export interface PackageTemplate<M extends ContainerTemplate<any, any, any, any, any, any>> {
    modules: KeyValue<M>;
}
export interface ContainerTemplate<C extends ClassConstructorTemplate<any, any, any, any, any>, I extends InterfaceConstructorTemplate<any, any, any>, A extends TypeAliasConstructorTemplate<any, any>, E extends EnumTemplate<any>, S extends ValueTemplate<any, any>, N extends ContainerTemplate<any, any, any, any, any, any>> {
    classConstructors: KeyValue<C>;
    interfaceConstructors: KeyValue<I>;
    typeAliasConstructors: KeyValue<A>;
    enums: KeyValue<E>;
    values: KeyValue<S>;
    namespaces: KeyValue<N>;
}
export declare const enum ValueKind {
    VAR = 1,
    LET = 2,
    CONST = 3,
    FUNCTION = 4,
}
export interface ValueTemplate<T, E> {
    type: T;
    initializer?: E;
    valueKind: ValueKind;
}
export interface CompositeTypeTemplate<M extends MemberTemplate<any, any>, I extends IndexTemplate<any>, C extends FunctionTypeTemplate<any, any, any>> extends TypeTemplate {
    members: KeyValue<M>;
    index?: I;
    calls?: C[];
}
export interface DecoratedCompositeTypeTemplate<M extends DecoratedMemberTemplate<any, any, any>, I extends IndexTemplate<any>, C extends DecoratedFunctionTypeTemplate<any, any, any>> extends CompositeTypeTemplate<M, I, C> {
}
export interface InterfaceConstructorTemplate<T extends CompositeTypeTemplate<any, any, any>, E, TP extends TypeParameterTemplate<any>> extends TypeConstructorTemplate<TP> {
    instanceType: T;
    extends?: E[];
}
export interface ClassConstructorTemplate<T extends DecoratedCompositeTypeTemplate<any, any, any>, D extends DecoratorTemplate<any, any>, C, I, TP extends TypeParameterTemplate<any>> extends DecoratedTemplate<D>, TypeConstructorTemplate<TP> {
    isAbstract?: boolean;
    instanceType: T;
    staticType: T;
    extends?: C;
    implements?: I[];
}
export interface TypeAliasConstructorTemplate<T, TP extends TypeParameterTemplate<any>> extends TypeConstructorTemplate<TP> {
    type: T;
}
export interface ProtoClassTemplate<T extends CompositeTypeTemplate<any, any, any>> extends TypeTemplate {
    instanceType: T;
    staticType: T;
}
export interface ConstructableTypeTemplate<TC, A> extends TypeTemplate {
    typeConstructor: TC;
    typeArguments?: A[];
}
export interface ClassTemplate<T extends DecoratedCompositeTypeTemplate<any, any, any>, D extends DecoratorTemplate<any, any>, C, I, CC extends ClassConstructorTemplate<any, any, any, any, any>, A> extends TypeTemplate, DecoratedTemplate<D>, ConstructableTypeTemplate<CC, A> {
    isAbstract?: boolean;
    extends?: C;
    implements?: I[];
    instanceType: T;
    staticType: T;
}
export interface InterfaceTemplate<T extends CompositeTypeTemplate<any, any, any>, E, IC extends InterfaceConstructorTemplate<any, any, any>, A> extends TypeTemplate, ConstructableTypeTemplate<IC, A> {
    instanceType: T;
    extends?: E[];
}
export interface TypeAliasTemplate<T, TAC, A> extends TypeTemplate, ConstructableTypeTemplate<TAC, A> {
    type: T;
}
export interface IndexTemplate<T> {
    keyType: PrimitiveTypeKind;
    valueType: T;
}
export interface FunctionTypeTemplate<T, P extends ParameterTemplate<any, any>, TP extends TypeParameterTemplate<any>> extends TypeTemplate, TypeConstructorTemplate<TP> {
    parameters: P[];
    type?: T;
}
export interface DecoratedFunctionTypeTemplate<T, P extends DecoratedParameterTemplate<any, any, any>, TP extends TypeParameterTemplate<any>> extends FunctionTypeTemplate<T, P, TP> {
}
export interface UnionOrIntersectionTypeTemplate<T> extends TypeTemplate {
    types: T[];
}
export interface TupleTypeTemplate<T> extends TypeTemplate {
    elements: T[];
}
export interface ParameterTemplate<T, E extends ExpressionTemplate> {
    name: string;
    type: T;
    optional?: boolean;
    initializer?: E;
}
export interface DecoratedParameterTemplate<T, D extends DecoratorTemplate<any, any>, E extends ExpressionTemplate> extends ParameterTemplate<T, E>, DecoratedTemplate<D> {
}
export interface MemberTemplate<T, E extends ExpressionTemplate> {
    type: T;
    optional?: boolean;
    initializer?: E;
}
export interface DecoratedMemberTemplate<T, D extends DecoratorTemplate<any, any>, E extends ExpressionTemplate> extends MemberTemplate<T, E>, DecoratedTemplate<D> {
}
export interface DecoratedTemplate<D extends DecoratorTemplate<any, any>> {
    decorators?: D[];
}
export interface DecoratorTemplate<T, E extends ExpressionTemplate> {
    decoratorType: T;
    parameters?: E[];
}
export declare const enum ExpressionKind {
    PRIMITIVE = 1,
    ENUM = 2,
    FUNCTION = 3,
    CLASS = 4,
    OBJECT = 5,
    ARRAY = 6,
    CLASS_REFERENCE = 7,
    VALUE = 8,
    FUNCTION_CALL = 9,
    PROPERTY_ACCESS = 10,
    NEW = 11,
}
export interface ExpressionTemplate {
    expressionKind: ExpressionKind;
}
export interface ClassReferenceExpressionTemplate<C> extends ExpressionTemplate {
    classReference: C;
}
export interface NewExpressionTemplate<E extends ExpressionTemplate> extends ExpressionTemplate {
    classReference: E;
    arguments: E[];
}
export interface ClassExpressionTemplate<C extends ProtoClassTemplate<any>> extends ExpressionTemplate {
    class: C;
}
export interface FunctionExpressionTemplate<F extends FunctionTypeTemplate<any, any, any>> extends ExpressionTemplate {
    functionType: F;
}
export interface FunctionCallExpressionTemplate<E extends ExpressionTemplate> extends ExpressionTemplate {
    function: E;
    arguments: E[];
}
export interface PropertyAccessExpressionTemplate<E extends ExpressionTemplate> extends ExpressionTemplate {
    parent: E;
    property: string;
}
export interface ValueExpressionTemplate<V> extends ExpressionTemplate {
    value: V;
}
export interface PrimitiveExpressionTemplate<P extends Primitive> extends ExpressionTemplate {
    primitiveValue: P;
    primitiveTypeKind: PrimitiveTypeKind;
}
export interface ArrayExpressionTemplate<E extends ExpressionTemplate> extends ExpressionTemplate {
    elements: E[];
}
export interface ObjectExpressionTemplate<E extends ExpressionTemplate> extends ExpressionTemplate {
    properties: KeyValue<E>;
}
export interface EnumExpressionTemplate<E> extends ExpressionTemplate {
    enum: E;
    value: string;
}
export interface TypeQueryTemplate<T> extends TypeTemplate {
    type?: T;
}
export interface TypeConstructorTemplate<T extends TypeParameterTemplate<any>> {
    typeParameters?: T[];
}
export interface TypeParameterTemplate<T> extends TypeTemplate {
    name: string;
    extends?: T;
}
export interface EnumMemberTemplate<E extends ExpressionTemplate> {
    name: string;
    initializer?: E;
}
export interface EnumTemplate<E extends EnumMemberTemplate<any>> extends TypeTemplate {
    members: E[];
}
export interface SymbolTemplate {
    isGlobal?: boolean;
    description?: string;
}
export declare const enum PrimitiveTypeKind {
    STRING = 1,
    BOOLEAN = 2,
    NUMBER = 3,
    VOID = 4,
    ANY = 5,
    SYMBOL = 6,
}
export interface PrimitiveTypeTemplate extends TypeTemplate {
    primitiveTypeKind: PrimitiveTypeKind;
}
export declare namespace serializable {
    interface Reference {
        module: string;
        name?: string;
    }
    interface RefinedReference {
        reference: Reference;
        typeArguments: Type[];
    }
    interface Package extends PackageTemplate<Container> {
    }
    interface Container extends ContainerTemplate<ClassConstructor, InterfaceConstructor, TypeAliasConstructor, Enum, Value, Container> {
        reexports?: KeyValue<Reference>;
    }
    interface ParameterizedType extends TypeConstructorTemplate<TypeParameter> {
    }
    interface Value extends ValueTemplate<Type, Expression> {
    }
    interface TypeConstructor extends TypeConstructorTemplate<TypeParameter> {
    }
    interface TypeAliasConstructor extends TypeAliasConstructorTemplate<Type, TypeParameter> {
    }
    interface ClassConstructor extends ClassConstructorTemplate<DecoratedCompositeType, Decorator, Reference | RefinedReference, Reference | RefinedReference, TypeParameter> {
    }
    interface ProtoClass extends ProtoClassTemplate<DecoratedCompositeType> {
    }
    interface InterfaceConstructor extends InterfaceConstructorTemplate<CompositeType, Reference | RefinedReference, TypeParameter> {
    }
    interface TypeParameter extends TypeParameterTemplate<Type> {
    }
    interface Enum extends EnumTemplate<EnumMember> {
    }
    interface EnumMember extends EnumMemberTemplate<Expression> {
    }
    type Type = Reference | RefinedReference | UnionOrIntersectionType | FunctionType | TupleType | PrimitiveType | TypeQuery | CompositeType;
    interface CompositeType extends CompositeTypeTemplate<Member, Index, FunctionType> {
    }
    interface Decorated extends DecoratedTemplate<Decorator> {
    }
    interface DecoratedCompositeType extends DecoratedCompositeTypeTemplate<DecoratedMember, Index, DecoratedFunctionType> {
    }
    interface TypeQuery extends TypeQueryTemplate<Reference> {
    }
    interface UnionOrIntersectionType extends UnionOrIntersectionTypeTemplate<Type> {
    }
    interface TupleType extends TupleTypeTemplate<Type> {
    }
    interface Symbol extends SymbolTemplate {
    }
    interface DecoratedFunctionType extends DecoratedFunctionTypeTemplate<Type, DecoratedParameter, TypeParameter> {
    }
    interface FunctionType extends FunctionTypeTemplate<Type, Parameter, TypeParameter> {
    }
    interface PrimitiveType extends PrimitiveTypeTemplate {
    }
    interface Parameter extends ParameterTemplate<Type, Expression> {
    }
    interface DecoratedParameter extends DecoratedParameterTemplate<Type, Decorator, Expression> {
    }
    interface Index extends IndexTemplate<Type> {
    }
    interface Member extends MemberTemplate<Type, Expression> {
    }
    interface DecoratedMember extends DecoratedMemberTemplate<Type, Decorator, Expression> {
    }
    interface Decorator extends DecoratorTemplate<Reference, Expression> {
    }
    type Expression = ClassExpression | ClassReferenceExpression | ValueExpression | PrimitiveExpression<any> | ArrayExpression | ObjectExpression | EnumExpression | FunctionExpression | FunctionCallExpression | PropertyAccessExpression | EnumExpression | NewExpression;
    interface ClassReferenceExpression extends ClassReferenceExpressionTemplate<Reference> {
    }
    interface NewExpression extends NewExpressionTemplate<Expression> {
    }
    interface ClassExpression extends ClassExpressionTemplate<ProtoClass> {
    }
    interface ValueExpression extends ValueExpressionTemplate<Reference> {
    }
    interface EnumExpression extends EnumExpressionTemplate<Reference> {
    }
    interface PrimitiveExpression<P extends Primitive> extends PrimitiveExpressionTemplate<P> {
    }
    interface FunctionExpression extends FunctionExpressionTemplate<FunctionType> {
    }
    interface FunctionCallExpression extends FunctionCallExpressionTemplate<Expression> {
    }
    interface PropertyAccessExpression extends PropertyAccessExpressionTemplate<Expression> {
    }
    interface ArrayExpression extends ArrayExpressionTemplate<Expression> {
    }
    interface ObjectExpression extends ObjectExpressionTemplate<Expression> {
    }
    interface EnumExpression extends EnumExpressionTemplate<Reference> {
    }
    const STRING: PrimitiveType;
    const BOOLEAN: PrimitiveType;
    const NUMBER: PrimitiveType;
    const ANY: PrimitiveType;
    const VOID: PrimitiveType;
    const SYMBOL: PrimitiveType;
}
export declare namespace reflective {
    interface ModelElement extends ModelElementTemplate {
        equals(m: ModelElement): boolean;
    }
    type Type = Class | ProtoClass | Interface | UnionOrIntersectionType | FunctionType | TupleType | Enum | PrimitiveType | TypeQuery | TypeAlias<any> | DecoratorType | TypeParameter<any>;
    interface Container extends ContainerTemplate<ClassConstructor, InterfaceConstructor, TypeAliasConstructor<any>, Enum, Value<any>, Namespace>, ModelElement {
        name: string;
        containerKind: ContainerKind;
    }
    interface Contained extends ModelElement {
        parent: Container;
        name: string;
    }
    interface Package extends PackageTemplate<Module> {
    }
    interface Module extends Container {
    }
    interface Namespace extends Container, Contained {
    }
    interface Value<T extends Type> extends ValueTemplate<T, Expression<T>>, Contained {
    }
    interface ClassConstructor extends ClassConstructorTemplate<DecoratedCompositeType<ClassConstructor>, Decorator<ClassConstructor>, Class, Interface | Class, TypeParameter<ClassConstructor>>, Contained {
    }
    interface InterfaceConstructor extends InterfaceConstructorTemplate<ContainedCompositeType<InterfaceConstructor>, Interface | Class, TypeParameter<InterfaceConstructor>>, Contained {
    }
    interface TypeAliasConstructor<T extends Type> extends TypeAliasConstructorTemplate<T, TypeParameter<TypeAliasConstructor<T>>>, Contained {
    }
    interface TypeConstructor extends TypeConstructorTemplate<TypeParameter<any>>, ModelElement {
    }
    interface ProtoClass extends ProtoClassTemplate<DecoratedCompositeType<ProtoClass>>, ModelElement {
    }
    interface ConstructableType<TC extends TypeConstructor> extends ConstructableTypeTemplate<TC, Type>, ModelElement {
        name: string;
        constructorParent: Container;
    }
    interface Class extends ClassTemplate<DecoratedCompositeType<Class>, Decorator<Class>, Class, Interface | Class, ClassConstructor, Type>, ConstructableType<ClassConstructor> {
    }
    interface Interface extends InterfaceTemplate<ContainedCompositeType<Interface>, Interface | Class, InterfaceConstructor, Type>, ConstructableType<InterfaceConstructor> {
    }
    interface CompositeType extends CompositeTypeTemplate<Member<CompositeType>, Index, FunctionType>, ModelElement {
    }
    interface ContainedCompositeType<P> extends CompositeTypeTemplate<Member<ContainedCompositeType<P>>, Index, FunctionType>, ModelElement {
        parent: P;
    }
    interface DecoratedCompositeType<P> extends DecoratedCompositeTypeTemplate<DecoratedMember<P>, Index, DecoratedFunctionType>, ModelElement {
        parent: P;
    }
    interface Index extends IndexTemplate<Type>, ModelElement {
        parent: CompositeType;
    }
    interface SymbolInstance extends SymbolTemplate, ModelElement {
    }
    interface TypeParameter<P extends TypeConstructor> extends TypeParameterTemplate<Type>, ModelElement {
        parent: P;
    }
    interface FunctionType extends FunctionTypeTemplate<Type, Parameter, TypeParameter<FunctionType>>, ModelElement {
    }
    interface DecoratedFunctionType extends DecoratedFunctionTypeTemplate<Type, DecoratedParameter, TypeParameter<DecoratedFunctionType>>, ModelElement {
    }
    interface Parameter extends ParameterTemplate<Type, Expression<any>>, ModelElement {
        parent: FunctionType;
    }
    interface DecoratedParameter extends DecoratedParameterTemplate<Type, Decorator<DecoratedParameter>, Expression<any>>, ModelElement {
        parent: DecoratedFunctionType;
    }
    interface UnionOrIntersectionType extends UnionOrIntersectionTypeTemplate<Type>, ModelElement {
    }
    interface TupleType extends TupleTypeTemplate<Type>, ModelElement {
    }
    interface TypeQuery extends TypeQueryTemplate<Type | Container | Value<any>>, ModelElement {
    }
    interface TypeAlias<T extends Type> extends TypeAliasTemplate<T, TypeAliasConstructor<T>, Type>, ConstructableType<TypeAliasConstructor<T>> {
    }
    interface Enum extends EnumTemplate<EnumMember>, Contained {
        valueMap: KeyValue<EnumMember>;
    }
    interface EnumMember extends EnumMemberTemplate<Expression<PrimitiveType>>, ModelElement {
        parent: Enum;
    }
    type ClassConstructorMember = DecoratedMember<DecoratedCompositeType<ClassConstructor>>;
    type ClassMember = DecoratedMember<DecoratedCompositeType<Class>>;
    type InterfaceConstructorMember = Member<ContainedCompositeType<InterfaceConstructor>>;
    type InterfaceMember = Member<ContainedCompositeType<Interface>>;
    interface Member<P extends CompositeType> extends MemberTemplate<Type, Expression<any>>, ModelElement {
        parent: P;
        name: string;
    }
    interface DecoratedMember<GP> extends DecoratedMemberTemplate<Type, Decorator<DecoratedMember<GP>>, Expression<any>>, ModelElement {
        parent: DecoratedCompositeType<GP>;
        name: string;
    }
    interface Decorated extends DecoratedTemplate<Decorator<any>>, ModelElement {
    }
    interface Decorator<P extends Decorated> extends DecoratorTemplate<Value<DecoratorType>, Expression<any>>, ModelElement {
        parent: P;
    }
    interface Expression<TT extends Type> extends ExpressionTemplate, ModelElement {
    }
    interface ClassReferenceExpression extends ClassReferenceExpressionTemplate<ClassConstructor>, Expression<TypeQuery> {
    }
    interface NewExpression<T extends Type> extends NewExpressionTemplate<Expression<any>>, Expression<T> {
    }
    interface ClassExpression extends ClassExpressionTemplate<ProtoClass>, Expression<ProtoClass> {
    }
    interface ValueExpression<T extends Type> extends ValueExpressionTemplate<Value<T>>, Expression<T> {
    }
    interface PrimitiveExpression<P extends Primitive> extends PrimitiveExpressionTemplate<P>, Expression<PrimitiveType> {
    }
    interface ArrayExpression extends ArrayExpressionTemplate<Expression<any>>, Expression<Class> {
    }
    interface ObjectExpression extends ObjectExpressionTemplate<Expression<any>>, Expression<CompositeType> {
    }
    interface EnumExpression extends EnumExpressionTemplate<Enum>, Expression<PrimitiveType> {
    }
    interface FunctionExpression extends FunctionExpressionTemplate<FunctionType>, Expression<FunctionType> {
    }
    interface FunctionCallExpression<T extends Type> extends FunctionCallExpressionTemplate<Expression<FunctionType>>, Expression<T> {
    }
    interface PropertyAccessExpression<T extends Type> extends PropertyAccessExpressionTemplate<Expression<CompositeType | TypeQuery>>, Expression<T> {
    }
    interface DecoratorType extends FunctionType, ModelElement {
        decoratorTypeKind: DecoratorTypeKind;
    }
    const enum DecoratorTypeKind {
        CLASS = 1,
        PROPERTY = 2,
        METHOD = 3,
        PARAMETER = 4,
    }
    interface PrimitiveType extends PrimitiveTypeTemplate, ModelElement {
    }
    const STRING: PrimitiveType;
    const BOOLEAN: PrimitiveType;
    const NUMBER: PrimitiveType;
    const ANY: PrimitiveType;
    const VOID: PrimitiveType;
    const SYMBOL: PrimitiveType;
}
