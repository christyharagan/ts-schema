import * as m from './model';
import * as f from './factories';
export interface FactoriesModulesVisitor extends ModulesVisitor<f.ModuleFactory, FactoriesContainerVisitor> {
}
export interface FactoriesContainerVisitor extends ContainerVisitor<f.NamespaceFactory, f.ClassConstructorFactory, f.InterfaceConstructorFactory, f.TypeAliasConstructorFactory<any>, f.EnumFactory, f.ValueFactory<any>, FactoriesClassConstructorVisitor, FactoriesInterfaceConstructorVisitor, FactoriesTypeAliasConstructorVisitor, FactoriesValueVisitor, FactoriesEnumVisitor, FactoriesContainerVisitor> {
}
export interface FactoriesClassConstructorVisitor extends ClassConstructorVisitor<f.ClassFactory, f.InterfaceFactory, f.DecoratedCompositeTypeFactory<f.ClassConstructorFactory>, f.TypeParameterFactory<f.ClassConstructorFactory>, f.DecoratorFactory<f.ClassConstructorFactory>, FactoriesClassVisitor, FactoriesInterfaceVisitor, FactoriesCompositeTypeVisitor, FactoriesDecoratorVisitor, FactoriesTypeParameterVisitor> {
}
export interface FactoriesInterfaceConstructorVisitor extends InterfaceConstructorVisitor<f.InterfaceFactory, f.CompositeTypeFactory<f.InterfaceConstructorFactory>, f.TypeParameterFactory<f.InterfaceConstructorFactory>, FactoriesInterfaceVisitor, FactoriesCompositeTypeVisitor, FactoriesTypeParameterVisitor> {
}
export interface FactoriesTypeAliasConstructorVisitor extends TypeAliasConstructorVisitor<f.TypeFactory<any>, f.TypeParameterFactory<f.TypeAliasConstructorFactory<any>>, FactoriesTypeParameterVisitor, FactoriesTypeVisitor> {
}
export interface FactoriesValueVisitor extends ValueVisitor<f.TypeFactory<any>, FactoriesTypeVisitor> {
}
export interface FactoriesEnumVisitor extends EnumVisitor<f.EnumMemberFactory> {
}
export interface FactoriesClassVisitor extends ClassVisitor<f.ClassConstructorFactory, f.ClassFactory, f.InterfaceFactory, f.DecoratedCompositeTypeFactory<f.ClassFactory>, f.TypeParameterFactory<f.ClassConstructorFactory>, f.TypeFactory<any>, f.DecoratorFactory<f.ClassFactory>, FactoriesClassConstructorVisitor, FactoriesClassVisitor, FactoriesInterfaceVisitor, FactoriesCompositeTypeVisitor, FactoriesDecoratorVisitor, FactoriesTypeVisitor> {
}
export interface FactoriesInterfaceVisitor extends InterfaceVisitor<f.InterfaceConstructorFactory, f.InterfaceFactory, f.CompositeTypeFactory<f.InterfaceFactory>, f.TypeParameterFactory<f.InterfaceConstructorFactory>, f.TypeFactory<any>, FactoriesInterfaceConstructorVisitor, FactoriesInterfaceVisitor, FactoriesCompositeTypeVisitor, FactoriesTypeVisitor> {
}
export interface FactoriesCompositeTypeVisitor extends CompositeTypeVisitor<f.MemberFactory<any, any>, f.IndexFactory, f.FunctionTypeFactory, FactoriesMemberVisitor, FactoriesFunctionTypeVisitor, FactoriesTypeVisitor> {
}
export interface FactoriesTypeParameterVisitor extends TypeParameterVisitor<f.TypeFactory<any>, FactoriesTypeVisitor> {
}
export interface FactoriesDecoratorVisitor extends DecoratorVisitor<f.ExpressionFactory<any>> {
}
export interface FactoriesMemberVisitor extends MemberVisitor<f.TypeFactory<any>, f.ExpressionFactory<any>, f.DecoratorFactory<any>, FactoriesTypeVisitor, FactoriesDecoratorVisitor> {
}
export interface FactoriesFunctionTypeVisitor extends FunctionTypeVisitor<f.TypeFactory<any>, f.ParameterFactory<any>, f.TypeParameterFactory<any>, FactoriesTypeVisitor, FactoriesParameterVisitor, FactoriesTypeParameterVisitor> {
}
export interface FactoriesParameterVisitor extends ParameterVisitor<f.TypeFactory<any>, f.DecoratorFactory<any>, FactoriesTypeVisitor, FactoriesDecoratorVisitor> {
}
export interface FactoriesTypeVisitor extends TypeVisitor<f.CompositeTypeFactory<any>, f.FunctionTypeFactory, f.UnionOrIntersectionTypeFactory, f.TupleTypeFactory, f.ClassFactory, f.InterfaceFactory, f.TypeQueryFactory<any>, f.TypeAliasFactory<any>, f.TypeParameterFactory<any>, f.EnumFactory, FactoriesCompositeTypeVisitor, FactoriesFunctionTypeVisitor, FactoriesUnionOrIntersectionTypeVisitor, FactoriesTupleTypeVisitor, FactoriesClassVisitor, FactoriesInterfaceVisitor, FactoriesTypeQueryVisitor, FactoriesTypeAliasVisitor, FactoriesEnumVisitor, FactoriesTypeVisitor> {
}
export interface FactoriesUnionOrIntersectionTypeVisitor extends UnionOrIntersectionTypeVisitor<f.TypeFactory<any>, FactoriesTypeVisitor> {
}
export interface FactoriesTupleTypeVisitor extends TupleTypeVisitor<f.TypeFactory<any>, FactoriesTypeVisitor> {
}
export interface FactoriesTypeQueryVisitor extends TypeQueryVisitor<f.ValueFactory<any>, f.NamespaceFactory, f.CompositeTypeFactory<any>, f.FunctionTypeFactory, f.UnionOrIntersectionTypeFactory, f.TupleTypeFactory, f.ClassFactory, f.InterfaceFactory, f.TypeQueryFactory<any>, f.TypeAliasFactory<any>, f.TypeParameterFactory<any>, f.EnumFactory, FactoriesValueVisitor, FactoriesContainerVisitor, FactoriesCompositeTypeVisitor, FactoriesFunctionTypeVisitor, FactoriesUnionOrIntersectionTypeVisitor, FactoriesTupleTypeVisitor, FactoriesClassVisitor, FactoriesInterfaceVisitor, FactoriesTypeQueryVisitor, FactoriesTypeAliasVisitor, FactoriesEnumVisitor, FactoriesTypeVisitor> {
}
export interface FactoriesTypeAliasVisitor extends TypeAliasVisitor<f.TypeAliasConstructorFactory<any>, f.TypeParameterFactory<any>, f.TypeFactory<any>, FactoriesTypeAliasConstructorVisitor, FactoriesTypeVisitor> {
}
export interface ModulesVisitor<Module extends m.ContainerTemplate<any, any, any, any, any, any>, CV extends ContainerVisitor<any, any, any, any, any, any, any, any, any, any, any, any>> {
    onModule: (module: Module) => void | CV;
}
export interface ContainerVisitor<Namespace extends m.ContainerTemplate<any, any, any, any, any, any>, ClassConstructor extends m.ClassConstructorTemplate<any, any, any, any, any>, InterfaceConstructor extends m.InterfaceConstructorTemplate<any, any, any>, TypeAliasConstructor extends m.TypeAliasConstructorTemplate<any, any>, Enum extends m.EnumTemplate<any>, Value extends m.ValueTemplate<any, any>, CCV extends ClassConstructorVisitor<any, any, any, any, any, any, any, any, any, any>, ICV extends InterfaceConstructorVisitor<any, any, any, any, any, any>, TACV extends TypeAliasConstructorVisitor<any, any, any, any>, VV extends ValueVisitor<any, any>, EV extends EnumVisitor<any>, NV extends ContainerVisitor<any, any, any, any, any, any, any, any, any, any, any, any>> {
    onClassConstructor?: (cls: ClassConstructor) => void | CCV;
    onInterfaceConstructor?: (inter: InterfaceConstructor) => void | ICV;
    onTypeAliasConstructor?: (alias: TypeAliasConstructor) => void | TACV;
    onEnum?: (e: Enum) => void | EV;
    onValue?: (staticMember: Value) => void | VV;
    onNamespace?: (namespace: Namespace) => void | NV;
}
export interface ValueVisitor<Type extends m.TypeTemplate, TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>> {
    onType?: (type: Type) => void | TV;
}
export interface TypeAliasConstructorVisitor<Type extends m.TypeTemplate, TypeParameter extends m.TypeParameterTemplate<any>, TPV extends TypeParameterVisitor<any, any>, TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>> {
    onTypeParameter?: (typeParameter: TypeParameter) => void | TPV;
    onType?: (type: Type) => void | TV;
}
export interface ClassConstructorVisitor<Class extends m.ClassTemplate<any, any, any, any, any, any>, Interface extends m.InterfaceTemplate<any, any, any, any>, DecoratedCompositeType extends m.DecoratedCompositeTypeTemplate<any, any, any>, TypeParameter extends m.TypeParameterTemplate<any>, Decorator extends m.DecoratorTemplate<any, any>, CV extends ClassVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any>, IV extends InterfaceVisitor<any, any, any, any, any, any, any, any, any>, CTV extends CompositeTypeVisitor<any, any, any, any, any, any>, DV extends DecoratorVisitor<any>, TPV extends TypeParameterVisitor<any, any>> {
    onExtend?: (extend: Class) => void | CV;
    onImplement?: (extend: Interface) => void | IV;
    onInstanceType?: (instanceType: DecoratedCompositeType) => void | CTV;
    onStaticType?: (instanceType: DecoratedCompositeType) => void | CTV;
    onTypeParameter?: (typeParameter: TypeParameter) => void | TPV;
    onClassConstructorDecorator?: (classDecorator: Decorator) => void | DV;
}
export interface InterfaceConstructorVisitor<Interface extends m.InterfaceTemplate<any, any, any, any>, CompositeType extends m.CompositeTypeTemplate<any, any, any>, TypeParameter extends m.TypeParameterTemplate<any>, IV extends InterfaceVisitor<any, any, any, any, any, any, any, any, any>, CTV extends CompositeTypeVisitor<any, any, any, any, any, any>, TPV extends TypeParameterVisitor<any, any>> {
    onExtend?: (extend: Interface) => void | IV;
    onInstanceType?: (instanceType: CompositeType) => void | CTV;
    onTypeParameter?: (typeParameter: TypeParameter) => void | TPV;
}
export interface ClassVisitor<ClassConstructor extends m.ClassConstructorTemplate<any, any, any, any, any>, Class extends m.ClassTemplate<any, any, any, any, any, any>, Interface extends m.InterfaceTemplate<any, any, any, any>, DecoratedCompositeType extends m.DecoratedCompositeTypeTemplate<any, any, any>, TypeParameter extends m.TypeParameterTemplate<any>, TypeArgument extends m.TypeTemplate, Decorator extends m.DecoratorTemplate<any, any>, CCV extends ClassConstructorVisitor<any, any, any, any, any, any, any, any, any, any>, CV extends ClassVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any>, IV extends InterfaceVisitor<any, any, any, any, any, any, any, any, any>, CTV extends CompositeTypeVisitor<any, any, any, any, any, any>, DV extends DecoratorVisitor<any>, TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>> {
    onClassConstructor?: (classConstructor: ClassConstructor) => void | CCV;
    onExtend?: (extend: Class) => void | CV;
    onImplement?: (extend: Interface) => void | IV;
    onInstanceType?: (instanceType: DecoratedCompositeType) => void | CTV;
    onStaticType?: (instanceType: DecoratedCompositeType) => void | CTV;
    onTypeArgument?: (typeArgument: TypeArgument, typeParameter: TypeParameter) => void | TV;
    onClassDecorator?: (classDecorator: Decorator) => void | DV;
}
export interface InterfaceVisitor<InterfaceConstructor extends m.InterfaceConstructorTemplate<any, any, any>, Interface extends m.InterfaceTemplate<any, any, any, any>, CompositeType extends m.CompositeTypeTemplate<any, any, any>, TypeParameter extends m.TypeParameterTemplate<any>, TypeArgument extends m.TypeTemplate, ICV extends InterfaceConstructorVisitor<any, any, any, any, any, any>, IV extends InterfaceVisitor<any, any, any, any, any, any, any, any, any>, CTV extends CompositeTypeVisitor<any, any, any, any, any, any>, TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>> {
    onInterfaceConstructor?: (interfaceConstructor: InterfaceConstructor) => void | ICV;
    onTypeArgument?: (typeArgument: TypeArgument, typeParameter: TypeParameter) => void | TV;
    onExtend?: (extend: Interface) => void | IV;
    onInstanceType?: (instanceType: CompositeType) => void | CTV;
}
export interface CompositeTypeVisitor<Member extends m.MemberTemplate<any, any>, Index extends m.IndexTemplate<any>, FunctionType extends m.FunctionTypeTemplate<any, any, any>, MV extends MemberVisitor<any, any, any, any, any>, FTV extends FunctionTypeVisitor<any, any, any, any, any, any>, TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>> {
    onMember?: (member: Member) => void | MV;
    onIndex?: (index: Index) => void | TV;
    onCall?: (call: FunctionType) => void | FTV;
}
export interface MemberVisitor<Type extends m.TypeTemplate, Expression extends m.ExpressionTemplate, Decorator extends m.DecoratorTemplate<any, any>, TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>, DV extends DecoratorVisitor<any>> {
    onType?: (alias: Type) => void | TV;
    onInitializer?: (initializer: Expression) => void;
    onMemberDecorator?: (decorator: Decorator) => void | DV;
}
export interface TypeParameterVisitor<Type extends m.TypeTemplate, TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>> {
    onExtends?: (type: Type) => void | TV;
}
export interface DecoratorVisitor<Expression extends m.ExpressionTemplate> {
    onParameter?: (parameter: Expression) => void;
}
export interface TypeAliasVisitor<TypeAliasConstructor extends m.TypeAliasConstructorTemplate<any, any>, TypeParameter extends m.TypeParameterTemplate<any>, Type extends m.TypeTemplate, TACV extends TypeAliasConstructorVisitor<any, any, any, any>, TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>> {
    onInterfaceConstructor?: (interfaceConstructor: TypeAliasConstructor) => void | TACV;
    onTypeArgument?: (typeArgument: Type, typeParameter: TypeParameter) => void | TV;
    onType?: (type: Type) => void | TV;
}
export interface TypeVisitor<CompositeType extends m.CompositeTypeTemplate<any, any, any>, FunctionType extends m.FunctionTypeTemplate<any, any, any>, UnionOrIntersectionType extends m.UnionOrIntersectionTypeTemplate<any>, TupleType extends m.TupleTypeTemplate<any>, Class extends m.ClassTemplate<any, any, any, any, any, any>, Interface extends m.InterfaceTemplate<any, any, any, any>, TypeQuery extends m.TypeQueryTemplate<any>, TypeAlias extends m.TypeAliasTemplate<any, any, any>, TypeParameter extends m.TypeParameterTemplate<any>, Enum extends m.EnumTemplate<any>, CTV extends CompositeTypeVisitor<any, any, any, any, any, any>, FTV extends FunctionTypeVisitor<any, any, any, any, any, any>, UITV extends UnionOrIntersectionTypeVisitor<any, any>, TTV extends TupleTypeVisitor<any, any>, CV extends ClassVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any>, IV extends InterfaceVisitor<any, any, any, any, any, any, any, any, any>, TQV extends TypeQueryVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>, TAV extends TypeAliasVisitor<any, any, any, any, any>, EV extends EnumVisitor<any>, TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>> {
    onCompositeType?: (compositeType: CompositeType) => void | CTV;
    onFunctionType?: (functionType: FunctionType) => void | FTV;
    onUnionType?: (unionType: UnionOrIntersectionType) => void | UITV;
    onIntersectionType?: (unionType: UnionOrIntersectionType) => void | UITV;
    onTupleType?: (tupleType: TupleType) => void | TTV;
    onClass?: (cls: Class) => void | CV;
    onInterface?: (int: Interface) => void | IV;
    onTypeQuery?: (typeQuery: TypeQuery) => void | TQV;
    onTypeAlias?: (typeAlias: TypeAlias) => void | TAV;
    onTypeParameter?: (typeParameter: TypeParameter) => void | TV;
    onEnumType?: (enumType: Enum) => void;
    onString?: () => void;
    onBoolean?: () => void;
    onNumber?: () => void;
    onAny?: () => void;
    onSymbol?: () => void;
    onVoid?: () => void;
    onArrayType?: (array: Class) => void | TV;
}
export interface TypeQueryVisitor<Value extends m.ValueTemplate<any, any>, Namespace extends m.ContainerTemplate<any, any, any, any, any, any>, CompositeType extends m.CompositeTypeTemplate<any, any, any>, FunctionType extends m.FunctionTypeTemplate<any, any, any>, UnionOrIntersectionType extends m.UnionOrIntersectionTypeTemplate<any>, TupleType extends m.TupleTypeTemplate<any>, Class extends m.ClassTemplate<any, any, any, any, any, any>, Interface extends m.InterfaceTemplate<any, any, any, any>, TypeQuery extends m.TypeQueryTemplate<any>, TypeAlias extends m.TypeAliasTemplate<any, any, any>, TypeParameter extends m.TypeParameterTemplate<any>, Enum extends m.EnumTemplate<any>, VV extends ValueVisitor<any, any>, NV extends ContainerVisitor<any, any, any, any, any, any, any, any, any, any, any, any>, CTV extends CompositeTypeVisitor<any, any, any, any, any, any>, FTV extends FunctionTypeVisitor<any, any, any, any, any, any>, UITV extends UnionOrIntersectionTypeVisitor<any, any>, TTV extends TupleTypeVisitor<any, any>, CV extends ClassVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any>, IV extends InterfaceVisitor<any, any, any, any, any, any, any, any, any>, TQV extends TypeQueryVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>, TAV extends TypeAliasVisitor<any, any, any, any, any>, EV extends EnumVisitor<any>, TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>> extends TypeVisitor<CompositeType, FunctionType, UnionOrIntersectionType, TupleType, Class, Interface, TypeQuery, TypeAlias, TypeParameter, Enum, CTV, FTV, UITV, TTV, CV, IV, TQV, TAV, EV, TV> {
    onValue?: (variable: Value) => void | VV;
    onNamespace?: (ns: Namespace) => void | NV;
}
export interface EnumVisitor<EnumMember extends m.EnumMemberTemplate<any>> {
    onEnumMember?(enumMember: EnumMember): any;
}
export interface FunctionTypeVisitor<Type extends m.TypeTemplate, Parameter extends m.ParameterTemplate<any, any>, TypeParameter extends m.TypeParameterTemplate<any>, TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>, PV extends ParameterVisitor<any, any, any, any>, TPV extends TypeParameterVisitor<any, any>> {
    onType?: (type: Type) => void | TV;
    onParameter?: (parameter: Parameter) => void | PV;
    onTypeParameter?: (typeParameter: TypeParameter) => void | TPV;
}
export interface UnionOrIntersectionTypeVisitor<Type extends m.TypeTemplate, TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>> {
    onType?: (type: Type) => void | TV;
}
export interface TupleTypeVisitor<Type extends m.TypeTemplate, TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>> {
    onType?: (type: Type) => void | TV;
}
export interface ParameterVisitor<Type extends m.TypeTemplate, Decorator extends m.DecoratorTemplate<any, any>, TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>, DV extends DecoratorVisitor<any>> {
    onType?: (alias: Type) => void | TV;
    onParameterDecorator?: (decorator: Decorator) => void | DV;
}
export declare function visitModules<Module extends m.ContainerTemplate<any, any, any, any, any, any>, MV extends ModulesVisitor<any, any>>(modules: m.KeyValue<Module>, visitor: MV): void;
export declare function visitTypeContainer<Container extends m.ContainerTemplate<any, any, any, any, any, any>, CV extends ContainerVisitor<any, any, any, any, any, any, any, any, any, any, any, any>>(container: Container, visitor: CV): void;
export declare function visitValue<Value extends m.ValueTemplate<any, any>, VV extends ValueVisitor<any, any>>(value: Value, visitor: VV): void;
export declare function visitEnum<Enum extends m.EnumTemplate<any>, EV extends EnumVisitor<any>>(e: Enum, visitor: EV): void;
export declare function visitClassConstructor<ClassConstructor extends m.ClassConstructorTemplate<any, any, any, any, any>, CCV extends ClassConstructorVisitor<any, any, any, any, any, any, any, any, any, any>>(cls: ClassConstructor, visitor: CCV): void;
export declare function visitClass<Class extends m.ClassTemplate<any, any, any, any, any, any>, CV extends ClassVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any>>(cls: Class, visitor: CV): void;
export declare function visitInterfaceConstructor<InterfaceConstructor extends m.InterfaceConstructorTemplate<any, any, any>, ICV extends InterfaceConstructorVisitor<any, any, any, any, any, any>>(inter: InterfaceConstructor, visitor: ICV): void;
export declare function visitInterface<Interface extends m.InterfaceTemplate<any, any, any, any>, IV extends InterfaceVisitor<any, any, any, any, any, any, any, any, any>>(inter: Interface, visitor: IV): void;
export declare function visitCompositeType<CompositeType extends m.CompositeTypeTemplate<any, any, any>, CTV extends CompositeTypeVisitor<any, any, any, any, any, any>>(compositeType: CompositeType, visitor: CTV): void;
export declare function visitMember<Member extends m.MemberTemplate<any, any>, MV extends MemberVisitor<any, any, any, any, any>>(member: Member, visitor: MV): void;
export declare function visitUnionOrIntersectionType<UnionOrIntersectionType extends m.UnionOrIntersectionTypeTemplate<any>, UITV extends UnionOrIntersectionTypeVisitor<any, any>>(unionType: UnionOrIntersectionType, visitor: UITV): void;
export declare function visitTupleType<TupleType extends m.TupleTypeTemplate<any>, TTV extends TupleTypeVisitor<any, any>>(tupleType: TupleType, visitor: TTV): void;
export declare function visitFunctionType<FunctionType extends m.FunctionTypeTemplate<any, any, any>, FTV extends FunctionTypeVisitor<any, any, any, any, any, any>>(functionType: FunctionType, visitor: FTV): void;
export declare function visitParameter<Parameter extends m.ParameterTemplate<any, any>, PV extends ParameterVisitor<any, any, any, any>>(parameter: Parameter, visitor: PV): void;
export declare function visitTypeQuery<TypeQuery extends m.TypeQueryTemplate<any>, TQV extends TypeQueryVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>>(typeQuery: TypeQuery, visitor: TQV): void;
export declare function visitType<Type extends m.TypeTemplate, TV extends TypeVisitor<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>>(type: Type, visitor: TV): void;
