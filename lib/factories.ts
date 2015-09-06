import * as m from './model'
import * as e from './equals'
import * as v from './visitor'
import * as tc from './typeCloser'
import * as tu from './typeUtils'

export type TypeOrConstructableType = m.OpenType|m.ClassConstructor|m.InterfaceConstructor
export type DirectOrFutureType<T extends m.ModelElement> = Promise<T>|Factory<T>|T

export interface Context {
  typeArgs: m.Map<m.OpenType>
  closedTypes: tc.ClosedTypes
  closedTypeCallbacks: (() => void)[]
  isStarted: boolean
}

export interface Factory<T extends m.ModelElement> {
  setValue(value: T)

  construct(): T
}

export interface DecoratedFactory<T extends m.Decorated> extends Factory<T> {
  decorator(): DecoratorFactory<T>
}

export interface ParameterisedTypeFactory<T extends m.ParameterisedType> extends Factory<T> {
  typeParameter(name: string): TypeParameterFactory<T>
}

export abstract class AbstractFactory<M extends m.ModelElement> implements Factory<M> {
  protected _instance: M
  protected _context: Context
  protected _isConstructed: boolean

  constructor(context?: Context) {
    this._context = context || {
      typeArgs: {},
      closedTypes: {},
      closedTypeCallbacks: [],
      isStarted: false
    }
  }

  abstract setValue(m: M)
  construct() {
    if (this._isConstructed) {
      return this._instance
    } else {
      let wasStarted = this._context.isStarted
      this._context.isStarted = true

      this._isConstructed = true
      let v = this._construct()
      if (!wasStarted) {
        this._context.closedTypeCallbacks.forEach(function(cb) {
          cb()
        })
      }
      return v
    }
  }
  protected abstract _construct(): M
}

export abstract class AbstractExpressionFactory<E extends m.Expression> extends AbstractFactory<E> {
  constructor(kind: m.ExpressionKind, equals: (e: m.ModelElement) => boolean, context?: Context) {
    super(context)
    this._instance = <E>{
      expressionKind: kind,
      modelKind: m.ModelKind.EXPRESSION,
      equals: equals
    }
  }
}

export abstract class AbstractTypeFactory<T extends m.Type> extends AbstractFactory<T> {
  constructor(kind: m.TypeKind, equals: (m: m.ModelElement) => boolean, context?: Context) {
    super(context)
    this._instance = <T>{
      typeKind: kind,
      modelKind: m.ModelKind.TYPE,
      equals: equals
    }
  }
}

export class EnumExpressionFactory extends AbstractExpressionFactory<m.EnumExpression> {
  constructor(context?: Context) {
    super(m.ExpressionKind.ENUM, e.enumExpressionEquals, context)
  }
  setValue(value: m.EnumExpression) {
    this.enum(value.enum)
    this.value(value.value)
  }
  value(value: string) {
    this._instance.value = value
  }
  enum(et: DirectOrFutureType<m.EnumType>) {
    let etc = factory(et)
    this._instance.enum = <m.EnumType><any>etc
  }
  protected _construct() {
    this._instance.enum = (<Factory<m.EnumType>><any>this._instance.enum).construct()
    return this._instance
  }
}

export class ComplexExpressionFactory extends AbstractExpressionFactory<m.ComplexExpression> {
  constructor(context?: Context) {
    super(m.ExpressionKind.COMPLEX, e.complexExpressionEquals, context)
  }
  setValue(value: m.ComplexExpression) {
  }
  protected _construct() {
    return this._instance
  }
}

export class ClassExpressionFactory extends AbstractExpressionFactory<m.ClassExpression> {
  constructor(context?: Context) {
    super(m.ExpressionKind.CLASS, e.classExpressionEquals, context)
  }
  setValue(value: m.ClassExpression) {
    this.class(value.class)
  }
  class(cc: DirectOrFutureType<m.ClassConstructor>) {
    let ccc = factory(cc)
    this._instance.class = <m.ClassConstructor><any>ccc
    return ccc
  }
  protected _construct() {
    let classConstructor = <ClassConstructorFactory><any>this._instance.class
    this._instance.class = classConstructor.construct()
    return this._instance
  }
}

export class ObjectExpressionFactory extends AbstractExpressionFactory<m.ObjectExpression> {
  constructor(context?: Context) {
    super(m.ExpressionKind.OBJECT, e.objectExpressionEquals, context)
    this._instance.properties = {}
  }
  setValue(value: m.ObjectExpression) {
    let self = this
    Object.keys(value.properties).forEach(function(key) {
      self.property(key, value.properties[key].expressionKind).setValue(value.properties[key])
    })
  }
  property<E extends AbstractExpressionFactory<any>>(key: string, kind: m.ExpressionKind): E {
    let ec = expressionFactory(kind, this._context)
    this._instance.properties[key] = <m.Expression><any>ec
    return <E>ec
  }
  protected _construct() {
    let self = this
    Object.keys(this._instance.properties).forEach(function(key) {
      self._instance.properties[key] = (<Factory<m.Expression>><any>self._instance.properties[key]).construct()
    })

    return this._instance
  }
}

export class ArrayExpressionFactory extends AbstractExpressionFactory<m.ArrayExpression> {
  constructor(context?: Context) {
    super(m.ExpressionKind.ARRAY, e.arrayExpressionEquals, context)
    this._instance.elements = []
  }
  setValue(value: m.ArrayExpression) {
    let self = this
    value.elements.forEach(function(element) {
      self.element(element.expressionKind).setValue(element)
    })
  }
  element<E extends AbstractExpressionFactory<any>>(kind: m.ExpressionKind): E {
    let ec = expressionFactory(kind, this._context)
    this._instance.elements.push(<m.Expression><any>ec)
    return <E>ec
  }
  protected _construct() {
    this._instance.elements = this._instance.elements.map(function(element) {
      return (<AbstractExpressionFactory<any>><any>element).construct()
    })

    return this._instance
  }
}

export class StringExpressionFactory extends AbstractExpressionFactory<m.LiteralExpression<string>> {
  constructor(context?: Context) {
    super(m.ExpressionKind.STRING, e.literalExpressionEquals, context)
  }
  setValue(value: m.LiteralExpression<string>) {
    this._instance.value = value.value
  }
  value(value: string) {
    this._instance.value = value
  }
  protected _construct() {
    return this._instance
  }
}

export class BooleanExpressionFactory extends AbstractExpressionFactory<m.LiteralExpression<boolean>> {
  constructor(context?: Context) {
    super(m.ExpressionKind.STRING, e.literalExpressionEquals, context)
  }
  setValue(value: m.LiteralExpression<boolean>) {
    this._instance.value = value.value
  }
  value(value: boolean) {
    this._instance.value = value
  }
  protected _construct() {
    return this._instance
  }
}

export class NumberExpressionFactory extends AbstractExpressionFactory<m.LiteralExpression<number>> {
  constructor(context?: Context) {
    super(m.ExpressionKind.STRING, e.literalExpressionEquals, context)
  }
  setValue(value: m.LiteralExpression<number>) {
    this._instance.value = value.value
  }
  value(value: number) {
    this._instance.value = value
  }
  protected _construct() {
    return this._instance
  }
}

export class DecoratorFactory<P extends m.Decorated> extends AbstractFactory<m.Decorator<P>> {
  constructor(parent: P, context?: Context) {
    super(context)
    this._instance = {
      parent: parent,
      modelKind: m.ModelKind.DECORATOR,
      equals: e.decoratorEquals,
      decoratorType: null
    }
  }
  decoratorType(type: DirectOrFutureType<m.TypeAlias<m.DecoratorType>>) {
    let t = factory(type)
    this._instance.decoratorType = <m.Value<m.TypeContainer, m.DecoratorType>><any>t
  }

  parameter(parameter: DirectOrFutureType<m.Expression>) {
    let e = factory(parameter)
    if (!this._instance.parameters) {
      this._instance.parameters = []
    }
    this._instance.parameters.push(<m.Expression><any>e)
  }

  setValue(decorator: m.Decorator<P>) {
    (<Factory<m.Value<m.TypeContainer, m.DecoratorType>>><any>this._instance.decoratorType).setValue(decorator.decoratorType)
  }
  protected _construct() {
    let c = <Factory<m.Value<m.TypeContainer, m.DecoratorType>>><any>this._instance.decoratorType
    this._instance.decoratorType = c.construct()

    if (this._instance.parameters) {
      this._instance.parameters = this._instance.parameters.map(function(parameter) {
        return (<Factory<m.Expression>><any>parameter).construct()
      })
    }
    return this._instance
  }
}

export class PrimitiveTypeFactory extends AbstractTypeFactory<m.PrimitiveType> {
  constructor(primitiveTypeKind: m.PrimitiveTypeKind, context?: Context) {
    super(m.TypeKind.PRIMITIVE, e.primitiveTypeEquals, context)
    this._instance.primitiveTypeKind = primitiveTypeKind
  }
  setValue(primitiveType: m.PrimitiveType) {
  }
  protected _construct() {
    return this._instance
  }
}

export class TupleTypeFactory extends AbstractTypeFactory<m.TupleType> {
  constructor(context?: Context) {
    super(m.TypeKind.TUPLE, e.tupleTypeEquals, context)
    this._instance.elements = []
  }
  element(type: DirectOrFutureType<TypeOrConstructableType>) {
    let t = factory(type)
    this._instance.elements.push(<m.OpenType><any>t)
  }
  setValue(tupleType: m.TupleType) {
    let self = this
    tupleType.elements.forEach(function(element) {
      self.element(element)
    })
  }
  protected _construct() {
    let self = this
    this._instance.elements.forEach(function(element, i) {
      constructConstructableType(self._instance.elements, i, <Factory<TypeOrConstructableType>><any>element, self._context)
    })
    return this._instance
  }
}

export class UnionTypeFactory extends AbstractTypeFactory<m.UnionType> {
  constructor(context?: Context) {
    super(m.TypeKind.TUPLE, e.unionTypeEquals, context)
    this._instance.types = []
  }
  type(type: DirectOrFutureType<TypeOrConstructableType>) {
    let t = factory(type)
    this._instance.types.push(<m.OpenType><any>t)
  }
  setValue(unionType: m.UnionType) {
    let self = this
    unionType.types.forEach(function(type) {
      self.type(type)
    })
  }
  protected _construct() {
    let self = this
    this._instance.types.forEach(function(type, i) {
      constructConstructableType(self._instance.types, i, <Factory<TypeOrConstructableType>><any>type, self._context)
    })
    return this._instance
  }
}

export class EnumMemberFactory extends AbstractFactory<m.EnumMember> {
  name: string
  constructor(parent: m.EnumType, name: string, context?: Context) {
    super(context)
    this._instance = {
      parent: parent,
      name: name,
      modelKind: m.ModelKind.ENUM_MEMBER,
      equals: e.enumMemberEquals
    }
    this.name = name
  }
  setValue(enumMember: m.EnumMember) {
  }
  protected _construct() {
    return this._instance
  }
}

export class EnumTypeFactory extends AbstractTypeFactory<m.EnumType> {
  name: string
  constructor(parent: m.TypeContainer, name: string, context?: Context) {
    super(m.TypeKind.ENUM, e.enumEquals, context)
    this._instance.name = name
    this._instance.parent = parent
    this._instance.members = []
    this.name = name
  }
  member(name: string) {
    let memberConstructor = new EnumMemberFactory(this._instance, name, this._context)
    this._instance.members.push(<m.EnumMember><any>memberConstructor)
    return memberConstructor
  }
  setValue(enumType: m.EnumType) {
    let self = this
    enumType.members.forEach(function(enumMember) {
      self.member(enumMember.name).setValue(enumMember)
    })
  }
  protected _construct() {
    this._instance.members = this._instance.members.map(function(enumMember) {
      return (<EnumMemberFactory><any>enumMember).construct()
    })
    return this._instance
  }
}

export class TypeQueryFactory extends AbstractTypeFactory<m.TypeQuery> {
  constructor(context?: Context) {
    super(m.TypeKind.TYPE_QUERY, e.typeQueryEquals, context)
  }

  type(type: DirectOrFutureType<TypeOrConstructableType|m.TypeContainer|m.Value<m.TypeContainer, any>>) {
    let t = factory(type)
    this._instance.type = <any>t
  }

  setValue(typeQuery: m.TypeQuery) {
    this.type(typeQuery.type)
  }

  protected _construct() {
    constructConstructableType(this._instance, 'type', <Factory<TypeOrConstructableType>><any>this._instance.type, this._context)
    return this._instance
  }
}

export class ValueFactory<P, T extends m.Type> extends AbstractFactory<m.Value<P, T>> {
  name: string
  constructor(parent: P, name: string, valueKind: m.ValueKind, context?: Context) {
    super(context)
    this._instance = {
      name: name,
      parent: parent,
      valueKind: valueKind,
      modelKind: m.ModelKind.VALUE,
      equals: e.valueEquals,
      type: null
    }
    this.name = name
  }

  type(type: DirectOrFutureType<TypeOrConstructableType>) {
    let t = factory(type)
    this._instance.type = <T><any>t
  }

  setValue(value: m.Value<P, T>) {
    this.type(value.type)
  }
  protected _construct() {
    constructConstructableType(this._instance, 'type', <Factory<T>><any>this._instance.type, this._context)
    return this._instance
  }
}

export class TypeAliasFactory<T extends m.Type> extends AbstractTypeFactory<m.TypeAlias<T>> {
  name: string
  constructor(parent: m.TypeContainer, name: string, context?: Context) {
    super(m.TypeKind.TYPE_ALIAS, e.typeAliasEquals, context)
    this._instance.name = name
    this._instance.parent = parent
    this.name = name
  }

  type(type: DirectOrFutureType<TypeOrConstructableType>) {
    let t = factory(type)
    this._instance.type = <T><any>t
  }

  setValue(value: m.TypeAlias<T>) {
    this.type(value.type)
  }
  protected _construct() {
    constructConstructableType(this._instance, 'type', <Factory<TypeOrConstructableType>><any>this._instance.type, this._context)
    return this._instance
  }
}

export abstract class AbstractParameterFactory<P extends m.Parameter> extends AbstractFactory<P> {
  name: string
  constructor(parent: m.FunctionType, name: string, isOptional?: boolean, context?: Context) {
    super(context)
    this._instance = <P><m.Parameter>{
      modelKind: m.ModelKind.PARAMETER,
      parent: parent,
      name: name,
      equals: e.parameterEquals,
      type: null,
      optional: isOptional
    }
    this.name = name
  }

  type(type: DirectOrFutureType<TypeOrConstructableType>) {
    let t = factory(type)
    this._instance.type = <m.OpenType><any>t
  }
  setValue(parameter: P) {
    this.type(parameter.type)
  }
  protected _construct() {
    constructConstructableType(this._instance, 'type', <Factory<TypeOrConstructableType>><any>this._instance.type, this._context)
    return this._instance
  }
}

export class DecoratedParameterFactory extends AbstractParameterFactory<m.DecoratedParameter> {
  constructor(parent: m.FunctionType, name: string, isOptional?: boolean, context?: Context) {
    super(parent, name, isOptional, context)
    this._instance.modelKind = m.ModelKind.DECORATED_PARAMETER
  }

  decorator() {
    return decoratorFactory(this._instance, this._context)
  }

  protected _construct() {
    super._construct()
    constructDecorators(this._instance, this._context)
    return this._instance
  }
}

export class ParameterFactory extends AbstractParameterFactory<m.Parameter> {
}

export abstract class AbstractFunctionTypeFactory<F extends m.FunctionType, PC extends ParameterFactory> extends AbstractTypeFactory<F> {
  protected isDecorated: boolean
  constructor(equals?: (m: m.ModelElement) => boolean, isDecorated?: boolean, context?: Context) {
    super(m.TypeKind.FUNCTION, equals || e.functionTypeEquals, context)
    this._instance.parameters = []
    this.isDecorated = isDecorated
  }
  typeParameter(name: string) {
    if (!this._instance.typeParameters) {
      this._instance.typeParameters = []
    }
    let typeParameterConstructor = new TypeParameterFactory<F>(this._instance, name, this._context)
    this._instance.typeParameters.push(<m.TypeParameter<any>><any>typeParameterConstructor)
    return typeParameterConstructor
  }
  parameter(name: string, isOptional?: boolean) {
    let parameterConstructor = this.isDecorated ? new DecoratedParameterFactory(this._instance, name, isOptional, this._context) : new ParameterFactory(this._instance, name, isOptional, this._context)
    this._instance.parameters.push(<m.Parameter><any>parameterConstructor)
    return <PC>parameterConstructor
  }
  type(type: DirectOrFutureType<TypeOrConstructableType>) {
    let t = factory(type)
    this._instance.type = <m.OpenType><any>t
  }
  setValue(f: F) {
    let self = this

    f.parameters.forEach(function(parameter) {
      (<PC><any>self.parameter(parameter.name, parameter.optional)).setValue(parameter)
    })
    if (f.typeParameters) {
      f.typeParameters.forEach(function(typeParameter) {
        self.typeParameter(typeParameter.name).setValue(<m.TypeParameter<F>>typeParameter)
      })
    }
    if (f.type) {
      self.type(f.type)
    }
  }
  protected _construct() {
    this._instance.parameters = this._instance.parameters.map(function(parameter) {
      return (<PC><any>parameter).construct()
    })
    if (this._instance.typeParameters) {
      this._instance.typeParameters = this._instance.typeParameters.map(function(typeParameter) {
        return (<TypeParameterFactory<F>><any>typeParameter).construct()
      })
    }
    if (this._instance.type) {
      constructConstructableType(this._instance, 'type', <Factory<TypeOrConstructableType>><any>this._instance.type, this._context)
    }

    return this._instance
  }
}

export class DecoratedFunctionTypeFactory extends AbstractFunctionTypeFactory<m.DecoratedFunctionType, DecoratedParameterFactory> implements Factory<m.DecoratedFunctionType> {
  constructor(context?: Context) {
    super(null, true, context)
  }
}

export class FunctionTypeFactory extends AbstractFunctionTypeFactory<m.FunctionType, ParameterFactory> {
}

export abstract class AbstractMemberFactory<P extends m.CompositeType, M extends m.Member<any>> extends AbstractFactory<M> {
  name: string
  constructor(parent: P, name: string, optional?: boolean, context?: Context) {
    super(context)
    this._instance = <M><m.Member<any>>{
      parent: parent,
      name: name,
      type: null,
      optional: optional,
      modelKind: m.ModelKind.MEMBER,
      equals: e.parameterEquals
    }
    this.name = name
  }
  type(type: DirectOrFutureType<TypeOrConstructableType>) {
    let t = factory(type)
    this._instance.type = <m.OpenType><any>t
  }
  setValue(member: M) {
    this.type(member.type)
  }
  protected _construct() {
    constructConstructableType(this._instance, 'type', <Factory<TypeOrConstructableType>><any>this._instance.type, this._context)
    return this._instance
  }
}

export class DecoratedMemberFactory<P> extends AbstractMemberFactory<m.DecoratedCompositeType<P>, m.DecoratedMember<P>> {
  constructor(parent: m.DecoratedCompositeType<P>, name: string, optional?: boolean, context?: Context) {
    super(parent, name, optional, context)
    this._instance.modelKind = m.ModelKind.DECORATED_MEMBER
  }
  decorator() {
    return decoratorFactory(this._instance, this._context)
  }
  protected _construct() {
    super._construct()
    constructDecorators(this._instance, this._context)
    return this._instance
  }
}

export class MemberFactory extends AbstractMemberFactory<m.CompositeType, m.Member<m.CompositeType>> {
}

export class IndexFactory extends AbstractFactory<m.Index> {
  constructor(parent: m.CompositeType, keyType: m.PrimitiveType, context?: Context) {
    super(context)
    this._instance = {
      parent: parent,
      keyType: keyType,
      modelKind: m.ModelKind.INDEX,
      equals: e.indexEquals,
      valueType: null
    }
  }
  valueType(type: DirectOrFutureType<TypeOrConstructableType>) {
    let t = factory(type)
    this._instance.valueType = <m.OpenType><any>t
  }
  setValue(index: m.Index) {
    this.valueType(index.valueType)
  }
  protected _construct() {
    constructConstructableType(this._instance, 'valueType', <Factory<TypeOrConstructableType>><any>this._instance.valueType, this._context)
    return this._instance
  }
}

export abstract class AbstractCompositeTypeFactory<C extends m.CompositeType, MC extends AbstractMemberFactory<any, any>> extends AbstractTypeFactory<C> {
  protected isDecorated: boolean
  constructor(isDecorated?: boolean, context?: Context) {
    super(m.TypeKind.COMPOSITE, e.compositeTypeEquals, context)
    this._instance.members = {}
    this.isDecorated = isDecorated
  }
  member(name: string, optional?: boolean) {
    let memberConstructor = this.isDecorated ? new DecoratedMemberFactory(<m.DecoratedCompositeType<any>><m.CompositeType>this._instance, name, optional, this._context) : new MemberFactory(this._instance, name, optional, this._context)
    this._instance.members[name] = <m.Member<C>><any>memberConstructor
    return <MC>memberConstructor
  }
  index(keyType: m.PrimitiveType) {
    let indexConstructor = new IndexFactory(this._instance, keyType, this._context)
    this._instance.index = <m.Index><any>indexConstructor
    return indexConstructor
  }
  call(call: DirectOrFutureType<m.FunctionType>) {
    let c = factory(call)
    if (!this._instance.calls) {
      this._instance.calls = []
    }
    this._instance.calls.push(<m.FunctionType><any>c)
  }
  setValue(compositeType: C) {
    let self = this
    Object.keys(compositeType.members).forEach(function(key) {
      let member = compositeType.members[key]
      self.member(name, member.optional).setValue(member)
    })
    if (compositeType.index) {
      this.index(compositeType.index.keyType).setValue(compositeType.index)
    }
    if (compositeType.calls) {
      compositeType.calls.forEach(function(call) {
        self.call(call)
      })
    }
  }
  protected _construct() {
    let self = this
    Object.keys(this._instance.members).forEach(function(key) {
      self._instance.members[key] = (<MC><any>self._instance.members[key]).construct()
    })
    if (this._instance.index) {
      this._instance.index = (<IndexFactory><any>this._instance.index).construct()
    }
    if (this._instance.calls) {
      this._instance.calls = this._instance.calls.map(function(call) {
        return (<Factory<m.FunctionType>><any>call).construct()
      })
    }
    return this._instance
  }
}

export class DecoratedCompositeTypeFactory<P> extends AbstractCompositeTypeFactory<m.DecoratedCompositeType<P>, DecoratedMemberFactory<P>> {
  constructor(parent: P, context?: Context) {
    super(true, context)
    this._instance.parent = parent
  }
}

export class ContainedCompositeTypeFactory<P> extends AbstractCompositeTypeFactory<m.ContainedCompositeType<P>, MemberFactory> {
  constructor(parent: P, isDecorated?: boolean, context?: Context) {
    super(isDecorated, context)
    this._instance.parent = parent
  }
}

export class CompositeTypeFactory extends AbstractCompositeTypeFactory<m.CompositeType, MemberFactory> {
}

export class TypeParameterFactory<P extends m.ParameterisedType> extends AbstractFactory<m.TypeParameter<P>> {
  name: string
  constructor(parent: P, name: string, context?: Context) {
    super(context)
    this._instance = {
      modelKind: m.ModelKind.TYPE_PARAMETER,
      parent: parent,
      name: name,
      equals: e.typeParameterEquals
    }
    this.name = name
  }

  extends(type: DirectOrFutureType<TypeOrConstructableType>) {
    let t = factory(type)
    this._instance.extends = <m.OpenType><any>t
  }

  setValue(value: m.TypeParameter<P>) {
    if (value.extends) {
      this.extends(value.extends)
    }
  }

  protected _construct() {
    if (this._instance.extends) {
      constructConstructableType(this._instance, 'extends', <Factory<TypeOrConstructableType>><any>this._instance.extends, this._context)
    }
    return this._instance
  }
}

export class ClosableTypeFactory<T extends (m.Class|m.Interface), TC extends (m.ClassConstructor|m.InterfaceConstructor)> extends AbstractFactory<T> {
  protected typeConstructor: Factory<TC>
  protected typeArguments: Factory<TypeOrConstructableType>[] = []

  parentConstructor(c: DirectOrFutureType<TC>) {
    let icc = factory(c)
    this.typeConstructor = icc
    return icc
  }

  setValue(value: T) {
    this.parentConstructor(<TC>value.typeConstructor)
    let self = this
    if (value.typeArguments) {
      value.typeArguments.forEach(function(typeArg) {
        self.typeArgument(typeArg)
      })
    }
  }
  typeArgument(type: DirectOrFutureType<TypeOrConstructableType>) {
    let t = factory(type)
    this.typeArguments.push(t)
  }
  protected _construct() {
    let self = this
    let f = function() {
      let c = (<Factory<m.InterfaceConstructor|m.ClassConstructor>><any>self.typeConstructor).construct()
      let typeArguments: m.OpenType[]
      if (self.typeArguments.length > 0) {
        typeArguments = []
        self.typeArguments.forEach(function(typeArg, i) {
          return constructConstructableType(typeArguments, i, <Factory<TypeOrConstructableType>><any>typeArg, self._context)
        })
      }
      self._instance = <T>{}
      if (c.modelKind === m.ModelKind.INTERFACE_CONSTRUCTOR) {
        tc.closeInterfaceConstructor(<m.InterfaceConstructor>c, typeArguments, self._context.typeArgs, self._context.closedTypes, <m.Interface><any>self._instance)
      } else {
        tc.closeClassConstructor(<m.ClassConstructor>c, typeArguments, self._context.typeArgs, self._context.closedTypes, <m.Class><any>self._instance)
      }
      return <T>self._instance
    }
    this._context.closedTypeCallbacks.push(f)
    return <T><any>f
  }
}

export class InterfaceFactory extends ClosableTypeFactory<m.Interface, m.InterfaceConstructor> {
}

export class ClassFactory extends ClosableTypeFactory<m.Class, m.ClassConstructor> {
}

export class InterfaceConstructorFactory extends AbstractFactory<m.InterfaceConstructor> {
  name: string
  constructor(parent: m.TypeContainer, name: string, context?: Context) {
    super(context)
    this._instance = {
      parent: parent,
      name: name,
      modelKind: m.ModelKind.INTERFACE_CONSTRUCTOR,
      equals: e.interfaceConstructorEquals,
      instanceType: <m.ContainedCompositeType<m.InterfaceConstructor>>{}
    }
    this.name = name
  }

  instanceType() {
    let instanceTypeConstructor = new ContainedCompositeTypeFactory<m.InterfaceConstructor>(this._instance, false, this._context)
    this._instance.instanceType = <m.ContainedCompositeType<m.InterfaceConstructor>><any>instanceTypeConstructor
    return instanceTypeConstructor
  }

  typeParameter(name: string) {
    return typeParameterFactory(this._instance, name, this._context)
  }

  extend(extend: DirectOrFutureType<m.Interface|m.InterfaceConstructor>) {
    let t = factory(extend)
    if (!this._instance.extends) {
      this._instance.extends = []
    }
    this._instance.extends.push(<m.Interface><any>t)
  }

  setValue(ic: m.InterfaceConstructor) {
    let self = this
    self.instanceType().setValue(ic.instanceType)
    if (ic.typeParameters) {
      ic.typeParameters.forEach(function(typeParameter) {
        self.typeParameter(typeParameter.name).setValue(typeParameter)
      })
    }
    if (ic.extends) {
      ic.extends.forEach(function(extend) {
        self.extend(extend)
      })
    }
  }

  protected _construct() {
    let self = this
    this._instance.instanceType = (<ContainedCompositeTypeFactory<m.InterfaceConstructor>><any>this._instance.instanceType).construct()
    constructTypeParameters(this._instance, this._context)
    if (this._instance.extends) {
      this._instance.extends.forEach(function(extend, i) {
        constructConstructableType(self._instance.extends, i, <Factory<m.Interface|m.InterfaceConstructor>><any>extend, self._context)
      })
    }
    return this._instance
  }
}

export class ClassConstructorFactory extends AbstractFactory<m.ClassConstructor> {
  name: string
  constructor(parent: m.TypeContainer, name: string, context?: Context) {
    super(context)
    this._instance = {
      parent: parent,
      name: name,
      instanceType: <m.DecoratedCompositeType<m.ClassConstructor>>{},
      staticType: <m.DecoratedCompositeType<m.ClassConstructor>>{},
      modelKind: m.ModelKind.CLASS_CONSTRUCTOR,
      equals: e.classConstructorEquals
    }
    this.name = name
  }

  instanceType() {
    let instanceTypeConstructor = new DecoratedCompositeTypeFactory<m.ClassConstructor>(this._instance, this._context)
    this._instance.instanceType = <m.DecoratedCompositeType<m.ClassConstructor>><any>instanceTypeConstructor
    return instanceTypeConstructor
  }

  staticType() {
    let instanceTypeConstructor = new DecoratedCompositeTypeFactory<m.ClassConstructor>(this._instance, this._context)
    this._instance.staticType = <m.DecoratedCompositeType<m.ClassConstructor>><any>instanceTypeConstructor
    return instanceTypeConstructor
  }

  typeParameter(name: string) {
    return typeParameterFactory(this._instance, name, this._context)
  }

  extend(extend: DirectOrFutureType<m.Class|m.ClassConstructor>) {
    let t = factory(extend)
    this._instance.extends = <m.Class><any>extend
  }

  implement(extend: DirectOrFutureType<m.Interface|m.InterfaceConstructor>) {
    let t = factory(extend)
    if (!this._instance.implements) {
      this._instance.implements = []
    }
    this._instance.implements.push(<m.Interface><any>t)
  }

  decorator() {
    return decoratorFactory(this._instance, this._context)
  }

  setValue(cc: m.ClassConstructor) {
    let self = this
    self.instanceType().setValue(cc.instanceType)
    self.staticType().setValue(cc.staticType)
    if (cc.typeParameters) {
      cc.typeParameters.forEach(function(typeParameter) {
        self.typeParameter(typeParameter.name).setValue(typeParameter)
      })
    }
    if (cc.extends) {
      this.extend(cc.extends)
    }
    if (cc.implements) {
      cc.implements.forEach(function(impl) {
        self.implement(impl)
      })
    }
    if (cc.decorators) {
      cc.decorators.forEach(function(decorator) {
        self.decorator().setValue(decorator)
      })
    }
  }

  protected _construct() {
    let self = this
    this._instance.instanceType = (<DecoratedCompositeTypeFactory<m.ClassConstructor>><any>this._instance.instanceType).construct()
    this._instance.staticType = (<DecoratedCompositeTypeFactory<m.ClassConstructor>><any>this._instance.staticType).construct()
    constructTypeParameters(this._instance, this._context)
    constructDecorators(this._instance, this._context)
    if (this._instance.extends) {
      constructConstructableType(this._instance, 'extends', <Factory<m.Class|m.ClassConstructor>><any>this._instance.extends, this._context)
    }
    if (this._instance.implements) {
      this._instance.implements.forEach(function(impl, i) {
        constructConstructableType(self._instance.implements, i, <Factory<m.Interface|m.InterfaceConstructor>><any>impl, self._context)
      })
    }
    return this._instance
  }
}

export type TypeContainerChildType = m.ClassConstructor|m.InterfaceConstructor|m.TypeAlias<any>|m.EnumType|m.Value<m.TypeContainer, any>|m.Namespace

const ROOT = <m.Module>{
  modelKind: m.ModelKind.TYPE_CONTAINER,
  typeContainerKind: m.TypeContainerKind.MODULE,
  name: ''
}
const TYPED_PROPERTY_DESCRIPTOR = <m.InterfaceConstructor>{
  modelKind: m.ModelKind.INTERFACE_CONSTRUCTOR,
  name: 'TypedPropertyDescriptor',
  parent: ROOT
}

export abstract class AbstractTypeContainerFactory<T extends m.TypeContainer> extends AbstractFactory<T> {
  protected unresolvedConstructors: m.Map<[(resolve: Factory<TypeContainerChildType>) => void, Factory<TypeContainerChildType>]> = {}
  protected undefinedConstructors: m.Map<Factory<TypeContainerChildType>> = {}
  name: string

  constructor(kind: m.TypeContainerKind, name: string, context?: Context) {
    super(context)
    this._instance = <T>{
      name: name,
      typeContainerKind: kind,
      modelKind: m.ModelKind.TYPE_CONTAINER,
      equals: e.typeContainerEquals,
      classConstructors: {},
      interfaceConstructors: {},
      types: {},
      statics: {},
      namespaces: {}
    }
    this.name = name
  }

  setValue(typeContainer: m.TypeContainer) {
    let self = this
    v.visitTypeContainer(typeContainer, {
      onClassConstructor: function(cc) {
        self.classConstructor(cc.name).setValue(cc)
      },
      onInterfaceConstructor: function(ic) {
        self.interfaceConstructor(ic.name).setValue(ic)
      },
      onType: function(t) {
        if (t.typeKind === m.TypeKind.TYPE_ALIAS) {
          self.typeAlias(t.name).setValue(<m.TypeAlias<any>>t)
        } else {
          self.enumType(t.name).setValue(<m.EnumType>t)
        }
      },
      onStatic: function(s) {
        self.static(s.name, s.valueKind).setValue(s)
      },
      onNamespace: function(ns) {
        self.namespace(ns.name).setValue(ns)
      }
    })
  }

  setChild(name: string, c: Factory<TypeContainerChildType>) {
    this.undefinedConstructors[name] = c
    if (this.unresolvedConstructors[name]) {
      this.unresolvedConstructors[name][0](c)
    }
  }

  getChild(name: string): Factory<TypeContainerChildType> {
    let c = <Factory<TypeContainerChildType>><Factory<any>>((<ClassConstructorFactory><any>this._instance.classConstructors[name]) ||
      (<InterfaceConstructorFactory><any>this._instance.interfaceConstructors[name]) ||
      (<TypeAliasFactory<any>|EnumTypeFactory><any>this._instance.types[name]) ||
      (<ValueFactory<m.TypeContainer, any>><any>this._instance.statics[name]) ||
      (<NamespaceFactory><any>this._instance.namespaces[name]) || this.undefinedConstructors[name])
    if (!c) {
      if (this.unresolvedConstructors[name]) {
        return this.unresolvedConstructors[name][1]
      }
      let self = this
      let _value: TypeContainerChildType
      let _resolvedConstructor: Factory<TypeContainerChildType>
      c = {
        setValue: function(value: TypeContainerChildType) {
          _value = value
        },
        construct: function() {
          if (!_resolvedConstructor) {
            throw `Cannot construct child "${name}" of type container "${self.name}" because it has not been resolved.`
          }
          return _resolvedConstructor.construct()
        }
      }
      this.unresolvedConstructors[name] = [function(resolvedConstructor) {
        _resolvedConstructor = <Factory<TypeContainerChildType>>resolvedConstructor
        if (_value) {
          _resolvedConstructor.setValue(_value)
        }
      }, c]
    }
    return c
  }

  classConstructor(name: string): ClassConstructorFactory {
    let cc = this._instance.classConstructors[name]
    if (cc) {
      return <ClassConstructorFactory><any>cc
    } else {
      let ccc = new ClassConstructorFactory(this._instance, name, this._context)
      this._instance.classConstructors[name] = <any>ccc
      if (this.unresolvedConstructors[name]) {
        this.unresolvedConstructors[name][0](ccc)
      }
      return ccc
    }
  }

  interfaceConstructor(name: string): InterfaceConstructorFactory {
    let ic = this._instance.interfaceConstructors[name]
    if (ic) {
      return <InterfaceConstructorFactory><any>ic
    } else {
      let icc = new InterfaceConstructorFactory(this._instance, name, this._context)
      this._instance.interfaceConstructors[name] = <any>icc
      if (this.unresolvedConstructors[name]) {
        this.unresolvedConstructors[name][0](icc)
      }
      return icc
    }
  }

  typeAlias<T extends m.Type>(name: string): TypeAliasFactory<T> {
    let ta = this._instance.types[name]
    if (ta) {
      return <TypeAliasFactory<T>><any>ta
    } else {
      let tac = new TypeAliasFactory<T>(this._instance, name, this._context)
      this._instance.types[name] = <any>tac
      if (this.unresolvedConstructors[name]) {
        this.unresolvedConstructors[name][0](tac)
      }
      return tac
    }
  }

  enumType(name: string): EnumTypeFactory {
    let et = this._instance.types[name]
    if (et) {
      return <EnumTypeFactory><any>et
    } else {
      let etc = new EnumTypeFactory(this._instance, name, this._context)
      this._instance.types[name] = <any>etc
      if (this.unresolvedConstructors[name]) {
        this.unresolvedConstructors[name][0](etc)
      }
      return etc
    }
  }

  static(name: string, valueKind: m.ValueKind): ValueFactory<m.TypeContainer, any> {
    if (!Object.prototype.hasOwnProperty(name)) {
      let s = this._instance.statics[name]
      if (s) {
        return <ValueFactory<m.TypeContainer, any>><any>s
      } else {
        let sc = new ValueFactory<m.TypeContainer, any>(this._instance, name, valueKind, this._context)
        this._instance.statics[name] = <any>sc
        if (this.unresolvedConstructors[name]) {
          this.unresolvedConstructors[name][0](sc)
        }
        return sc
      }
    }
  }

  namespace(name: string): NamespaceFactory {
    let ns = this._instance.namespaces[name]
    if (ns) {
      return <NamespaceFactory><any>ns
    } else {
      let nsc = new NamespaceFactory(this._instance, name, this._context)
      this._instance.namespaces[name] = <any>nsc
      if (this.unresolvedConstructors[name]) {
        this.unresolvedConstructors[name][0](<Factory<m.Namespace>>nsc)
      }
      return nsc
    }
  }

  protected _construct() {
    let tc = this._instance
    v.visitTypeContainer(tc, {
      onClassConstructor: function(cc) {
        tc.classConstructors[cc.name] = (<ClassConstructorFactory><any>cc).construct()
      },
      onInterfaceConstructor: function(ic) {
        tc.interfaceConstructors[ic.name] = (<InterfaceConstructorFactory><any>ic).construct()
      },
      onType: function(t) {
        tc.types[t.name] = (<TypeAliasFactory<any>><any>t).construct()
      },
      onStatic: function(s) {
        tc.statics[s.name] = (<ValueFactory<m.TypeContainer, any>><any>s).construct()
        let type = tc.statics[s.name].type
        if (type.typeKind === m.TypeKind.FUNCTION) {
          let f = <m.FunctionType>type
          if (f.parameters.length === 1) {
            let t1 = <m.Type>f.parameters[0].type
            if (tu.isFunctionType(t1) && (tu.isFunctionVoid(f) || t1.equals(<m.Type>f.type))) {
              (<m.DecoratorType>f).decoratorTypeKind = m.DecoratorTypeKind.CLASS
            }
          } else if (f.parameters.length === 2) {
            let t2 = <m.PrimitiveType>f.parameters[1].type
            // TODO: Support ES6 Symbols
            if ((t2.primitiveTypeKind === m.PrimitiveTypeKind.STRING) && tu.isFunctionVoid(f)) {
              (<m.DecoratorType>f).decoratorTypeKind = m.DecoratorTypeKind.PROPERTY
            }
          } else if (f.parameters.length === 3) {
            let t1 = <m.Type>f.parameters[0].type
            let t2 = <m.PrimitiveType>f.parameters[1].type
            let t3 = <m.Type>f.parameters[2].type
            // TODO: Support ES6 Symbols
            if ((t2.primitiveTypeKind === m.PrimitiveTypeKind.STRING) && tu.isFunctionVoid(f)) {
              if ((<m.PrimitiveType>t3).primitiveTypeKind === m.PrimitiveTypeKind.NUMBER && tu.isFunctionType(t1) && tu.isFunctionVoid(f)) {
                (<m.DecoratorType>f).decoratorTypeKind = m.DecoratorTypeKind.PARAMETER
              } else if (t3.typeKind === m.TypeKind.INTERFACE && (<m.Interface>t3).typeConstructor.equals(TYPED_PROPERTY_DESCRIPTOR) && f.type && (<m.Type>f.type).typeKind === m.TypeKind.INTERFACE && (<m.Interface>f.type).typeConstructor.equals(TYPED_PROPERTY_DESCRIPTOR)) {
                (<m.DecoratorType>f).decoratorTypeKind = m.DecoratorTypeKind.METHOD
              }
            }
          }
        }
      },
      onNamespace: function(ns) {
        tc.namespaces[ns.name] = (<NamespaceFactory><any>ns).construct()
      }
    })

    let self = this
    Object.keys(this.undefinedConstructors).forEach(function(name) {
      let value = self.undefinedConstructors[name].construct()
      switch (value.modelKind) {
        case m.ModelKind.CLASS_CONSTRUCTOR:
          self._instance.classConstructors[name] = <m.ClassConstructor>value
        case m.ModelKind.INTERFACE_CONSTRUCTOR:
          self._instance.interfaceConstructors[name] = <m.InterfaceConstructor>value
        case m.ModelKind.TYPE:
          self._instance.types[name] = <m.TypeAlias<m.TypeContainer>|m.EnumType>value
        case m.ModelKind.TYPE_CONTAINER:
          self._instance.namespaces[name] = <m.Namespace>value
        case m.ModelKind.VALUE:
          self._instance.statics[name] = <m.Value<m.TypeContainer, any>>value
      }
    })

    return this._instance
  }
}

export class ModuleFactory extends AbstractTypeContainerFactory<m.Module> {
  constructor(name: string, context?: Context) {
    super(m.TypeContainerKind.MODULE, name, context)
  }
}

export class NamespaceFactory extends AbstractTypeContainerFactory<m.Namespace> {
  constructor(parent: m.TypeContainer, name: string, context?: Context) {
    super(m.TypeContainerKind.NAMESPACE, name, context)
    this._instance.parent = parent
  }
}

export function expressionFactory<E extends m.Expression>(kind: m.ExpressionKind, context?: Context): AbstractExpressionFactory<E> {
  switch (kind) {
    case m.ExpressionKind.STRING:
      return <any>new StringExpressionFactory(context)
    case m.ExpressionKind.BOOLEAN:
      return <any>new BooleanExpressionFactory(context)
    case m.ExpressionKind.NUMBER:
      return <any>new NumberExpressionFactory(context)
    case m.ExpressionKind.CLASS:
      return <any>new ClassExpressionFactory(context)
    case m.ExpressionKind.OBJECT:
      return <any>new ObjectExpressionFactory(context)
    case m.ExpressionKind.ARRAY:
      return <any>new ArrayExpressionFactory(context)
    case m.ExpressionKind.COMPLEX:
      return <any>new ComplexExpressionFactory(context)
    case m.ExpressionKind.ENUM:
      return <any>new EnumExpressionFactory(context)
  }
}

export function factory<T extends m.ModelElement>(type: DirectOrFutureType<T>): Factory<T> {
  if ((<Promise<T>>type).then) {
    let _type: T
    let promise = <Promise<T>>type
    promise.then(function(type) {
      _type = type
    })
    return <Factory<T>>{
      setValue: function(type) {
        _type = type
      },
      construct: function() {
        return _type
      }
    }
  } else if ((<Factory<T>>type).construct) {
    return <Factory<T>>type
  } else {
    let _type = <T>type
    return <Factory<T>>{
      setValue: function(type) {
        _type = type
      },
      construct: function() {
        return _type
      }
    }
  }
}

function decoratorFactory<P extends m.Decorated>(instance: P, context: Context) {
  if (!instance.decorators) {
    instance.decorators = []
  }
  let decoratorConstructor = new DecoratorFactory<P>(instance, context)
  instance.decorators.push(<m.Decorator<P>><any>decoratorConstructor)
  return decoratorConstructor
}

function constructDecorators<P extends m.Decorated>(instance: P, context: Context) {
  if (instance.decorators) {
    instance.decorators = instance.decorators.map(function(decorator) {
      return (<DecoratorFactory<P>><any>decorator).construct()
    })
  }
}

function constructConstructableType(parent: any, index: string|number, c: Factory<TypeOrConstructableType>, context: Context) {
  let value = c.construct()
  let completed = false
  switch (value.modelKind) {
    case m.ModelKind.INTERFACE_CONSTRUCTOR:
      let iccb = function() {
        if (!completed) {
          completed = true
          let typeArgs: m.OpenType[] = (<m.InterfaceConstructor>value).typeParameters ? (<m.InterfaceConstructor>value).typeParameters.map(function() {
            return new PrimitiveTypeFactory(m.PrimitiveTypeKind.ANY).construct()
          }) : []
          parent[index] = tc.closeInterfaceConstructor(<m.InterfaceConstructor>value, typeArgs, context.typeArgs, context.closedTypes)
        }
        return parent[index]
      }
      parent[index] = iccb
      context.closedTypeCallbacks.push(iccb)
    case m.ModelKind.CLASS_CONSTRUCTOR:
      let cccb = function() {
        if (!completed) {
          completed = true
          let typeArgs: m.OpenType[] = (<m.ClassConstructor>value).typeParameters ? (<m.ClassConstructor>value).typeParameters.map(function() {
            return new PrimitiveTypeFactory(m.PrimitiveTypeKind.ANY).construct()
          }) : []
          parent[index] = tc.closeClassConstructor(<m.ClassConstructor>value, typeArgs, context ? context.typeArgs : null, context ? context.closedTypes : null)
        }
        return parent[index]
      }
      parent[index] = cccb
      context.closedTypeCallbacks.push(cccb)
    default:
      parent[index] = <m.OpenType>value
  }
}

function typeParameterFactory<P extends m.ParameterisedType>(instance: P, name: string, context: Context) {
  if (!instance.typeParameters) {
    instance.typeParameters = []
  }
  let typeParameterConstructor = new TypeParameterFactory<P>(instance, name, context)
  instance.typeParameters.push(<m.TypeParameter<P>><any>typeParameterConstructor)
  return typeParameterConstructor
}

function constructTypeParameters<P extends m.ParameterisedType>(instance: P, context: Context) {
  if (instance.typeParameters) {
    instance.typeParameters = instance.typeParameters.map(function(typeParameter) {
      return (<TypeParameterFactory<P>><any>typeParameter).construct()
    })
  }
}
