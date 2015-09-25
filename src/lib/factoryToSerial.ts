import * as v from './visitor'
import {serializable as m, KeyValue, ModelKind, TypeKind, PrimitiveTypeKind, ExpressionKind, ContainerKind, ModelElementTemplate, TypeTemplate} from './model'
import * as e from './equals'
import * as f from './factories'
import * as tc from './typeConstructor'

export function factoryToSerializable(): <U extends ModelElementTemplate>(factory: f.Factory<U>) => (() => U) {
  function createType<T extends TypeTemplate>(typeKind: TypeKind) {
    let t = <T>{}
    t.typeKind = typeKind
    return t
  }

  function createExpression<E extends m.Expression>(expressionKind: ExpressionKind) {
    let e = <E>{}
    e.expressionKind = expressionKind
    return e
  }

  function createContainer<C extends m.Container>() {
    let c = <C>{}
    c.classConstructors = {}
    c.interfaceConstructors = {}
    c.typeAliasConstructors = {}
    c.enums = {}
    c.values = {}
    c.namespaces = {}
    return c
  }

  function getRefinedReference(constructable: f.AbstractConstructableTypeFactory<any, any>) {
    let ref = getReference(constructable.typeConstructor)
    return <m.RefinedReference>{
      reference: ref,
      typeArguments: constructable.typeArguments.map(function(arg) {
        return convertType(arg)
      })
    }
  }

  function getContainerReference(container: f.ContainerFactory) {
    let parent = container
    let parents = [parent]
    let module = ''
    while (parent.containerKind === ContainerKind.NAMESPACE) {
      module = ':' + parent.name + module
      parent = (<f.NamespaceFactory>parent).parent
      parents.splice(0, 0, parent)
    }
    return parent.name + module

  }

  function getReference(contained: f.ContainedFactory<any>) {
    return <m.Reference>{
      module: getContainerReference(contained.parent),
      name: contained.name
    }
  }

  function convertPackage(factory: f.PackageFactory): m.Package {
    let pkg = <m.Package>{
      modules:{}
    }
    Object.keys(factory.modules).forEach(function(name){
      pkg.modules[name] = convertContainer(factory.modules[name])
    })

    return pkg
  }

  function convertType(factory: f.TypeFactory<any>): m.Type {
    switch (factory.typeKind) {
      case TypeKind.PRIMITIVE:
        let primitiveFactory = <f.PrimitiveTypeFactory>factory
        switch (primitiveFactory.primitiveTypeKind) {
          case PrimitiveTypeKind.STRING:
            return m.STRING
          case PrimitiveTypeKind.BOOLEAN:
            return m.BOOLEAN
          case PrimitiveTypeKind.NUMBER:
            return m.NUMBER
          case PrimitiveTypeKind.VOID:
            return m.VOID
          case PrimitiveTypeKind.ANY:
            return m.ANY
          case PrimitiveTypeKind.SYMBOL:
            return m.SYMBOL
        }
      case TypeKind.ENUM:
        return getReference(<f.EnumFactory>factory)
      case TypeKind.FUNCTION:
        return convertFunctionType(<f.AbstractFunctionTypeFactory<any, any, any>>factory)
      case TypeKind.TUPLE:
        return convertTupleType(<f.TupleTypeFactory>factory)
      case TypeKind.UNION:
      case TypeKind.INTERSECTION:
        return convertUnionOrIntersectionType(<f.UnionOrIntersectionTypeFactory>factory)
      case TypeKind.COMPOSITE:
        return convertCompositeType(<f.AbstractCompositeTypeFactory<any, any, any>>factory)
      case TypeKind.INTERFACE:
        return getRefinedReference(<f.InterfaceFactory>factory)
      case TypeKind.CLASS:
        if ((<f.ClassFactory>factory).typeConstructor) {
          return getRefinedReference(<f.ClassFactory>factory)
        } else {
          let protoClassFactory = <f.ProtoClassFactory>factory
          let protoClass = <m.ProtoClass>createType(TypeKind.CLASS)
          protoClass.instanceType = <m.CompositeType>convertType(protoClassFactory.instanceType)
          protoClass.staticType = <m.CompositeType>convertType(protoClassFactory.staticType)
          return protoClass
        }
      case TypeKind.TYPE_QUERY:
        return convertTypeQuery(<f.TypeQueryFactory<any>>factory)
      case TypeKind.TYPE_ALIAS:
        return getRefinedReference(<f.TypeAliasFactory<any>>factory)
      case TypeKind.TYPE_PARAMETER:
        return <m.Reference>{
          module: '@',
          name: (<f.TypeParameterFactory<any>>factory).name
        }
    }
  }

  function convertExpression(factory: f.ExpressionFactory<any>): m.Expression {
    switch (factory.expressionKind) {
      case ExpressionKind.PRIMITIVE:
        let primitiveFactory = <f.PrimitiveExpressionFactory<any>>factory
        let primitiveExpression = <m.PrimitiveExpression<any>>createExpression(factory.expressionKind)
        primitiveExpression.primitiveTypeKind = primitiveFactory.primitiveTypeKind
        primitiveExpression.primitiveValue = primitiveFactory.primitiveValue
        return primitiveExpression
      case ExpressionKind.ENUM:
        let enumFactory = <f.EnumExpressionFactory>factory
        let enumExpression = <m.EnumExpression>createExpression(factory.expressionKind)
        enumExpression.enum = getReference(enumFactory.enum)
        enumExpression.value = enumFactory.value
        return enumExpression
      case ExpressionKind.FUNCTION:
        let functionFactory = <f.FunctionExpressionFactory>factory
        let functionExpression = <m.FunctionExpression>createExpression(factory.expressionKind)
        functionExpression.functionType = <m.FunctionType>convertType(functionFactory.functionType)
        return functionExpression
      case ExpressionKind.CLASS:
        let classFactory = <f.ClassExpressionFactory>factory
        let classExpression = <m.ClassExpression>createExpression(factory.expressionKind)
        classExpression.class = <m.ProtoClass>convertType(classFactory.class)
        return classExpression
      case ExpressionKind.OBJECT:
        let objectFactory = <f.ObjectExpressionFactory>factory
        let objectExpression = <m.ObjectExpression>createExpression(factory.expressionKind)
        objectExpression.properties = {}
        Object.keys(objectFactory.properties).forEach(function(name) {
          objectExpression.properties[name] = convertExpression(objectFactory.properties[name])
        })
        return objectExpression
      case ExpressionKind.ARRAY:
        let arrayFactory = <f.ArrayExpressionFactory>factory
        let arrayExpression = <m.ArrayExpression>createExpression(factory.expressionKind)
        arrayExpression.elements = arrayFactory.elements.map(convertExpression)
        return arrayExpression
      case ExpressionKind.CLASS_REFERENCE:
        let classRefExpression = <m.ClassReferenceExpression>createExpression(factory.expressionKind)
        classRefExpression.classReference = getReference((<f.ClassReferenceExpressionFactory>factory).classReference)
        return classRefExpression
      case ExpressionKind.VALUE:
        let valueFactory = <f.ValueExpressionFactory<any>>factory
        let valueExpression = <m.ValueExpression>createExpression(factory.expressionKind)
        valueExpression.value = getReference(valueFactory.value)
        return valueExpression
      case ExpressionKind.FUNCTION_CALL:
        let functionCallFactory = <f.FunctionCallExpressionFactory>factory
        let functionCallExpression = <m.FunctionCallExpression>createExpression(factory.expressionKind)
        functionCallExpression.function = convertExpression(functionCallFactory.function)
        functionCallExpression.arguments = functionCallFactory.arguments.map(convertExpression)
        return functionCallExpression
      case ExpressionKind.PROPERTY_ACCESS:
        let propAccessFactory = <f.PropertyAccessExpressionFactory>factory
        let propAccessExpression = <m.PropertyAccessExpression>createExpression(factory.expressionKind)
        propAccessExpression.parent = convertExpression(propAccessFactory.parent)
        propAccessFactory.property = propAccessFactory.property
        return propAccessExpression
      case ExpressionKind.NEW:
        let newFactory = <f.NewExpressionFactory>factory
        let newExpression = <m.NewExpression>createExpression(factory.expressionKind)
        newExpression.classReference = convertExpression(newFactory.classReference)
        newExpression.arguments = newFactory.arguments.map(convertExpression)
        return newExpression
    }
  }

  function convertClassConstructor(factory: f.ClassConstructorFactory) {
    let cc = <m.ClassConstructor>{}
    cc.instanceType = <m.DecoratedCompositeType>convertCompositeType(factory.instanceType)
    cc.staticType = <m.DecoratedCompositeType>convertCompositeType(factory.staticType)
    cc.isAbstract = factory.isAbstract
    convertDecorators(factory, cc)
    if (factory.extends) {
      cc.extends = getRefinedReference(factory.extends)
    }
    if (factory.implements) {
      cc.implements = factory.implements.map(getRefinedReference)
    }
    convertTypeParameters(factory, cc)
    return cc
  }

  function convertInterfaceConstructor(factory: f.InterfaceConstructorFactory) {
    let ic = <m.InterfaceConstructor>{}
    ic.instanceType = <m.CompositeType>convertCompositeType(factory.instanceType)
    if (factory.extends) {
      ic.extends = factory.extends.map(getRefinedReference)
    }
    convertTypeParameters(factory, ic)
    return ic
  }

  function convertTypeAliasConstructor(factory: f.TypeAliasConstructorFactory<any>) {
    let tac = <m.TypeAliasConstructor>{}
    tac.type = convertType(factory.type)
    convertTypeParameters(factory, tac)
    return tac
  }

  function convertTypeQuery(factory: f.TypeQueryFactory<any>) {
    let typeQuery = <m.TypeQuery>createType(TypeKind.TYPE_QUERY)
    if (factory.type) {
      switch (factory.type.modelKind) {
        case ModelKind.TYPE:
          typeQuery.type = <m.Reference>convertType(<f.TypeFactory<any>>factory.type)
          break
        case ModelKind.VALUE:
          typeQuery.type = getReference(<f.ValueFactory<any>>factory.type)
          break
        case ModelKind.CONTAINER:
          typeQuery.type = { module: getContainerReference(<f.ContainerFactory>factory.type) }
          break
      }
    }
    return typeQuery
  }

  function convertValue(factory: f.ValueFactory<any>) {
    let v = <m.Value>{}
    v.valueKind = factory.valueKind
    v.type = convertType(factory.type)
    if (factory.initializer) {
      v.initializer = convertExpression(factory.initializer)
    }
    return v
  }

  function convertContainer(factory: f.ContainerFactory) {
    let container = createContainer()
    Object.keys(factory.classConstructors).forEach(function(name) {
      container.classConstructors[name] = convertClassConstructor(factory.classConstructors[name])
    })
    Object.keys(factory.classConstructors).forEach(function(name) {
      container.classConstructors[name] = convertClassConstructor(factory.classConstructors[name])
    })
    Object.keys(factory.interfaceConstructors).forEach(function(name) {
      container.interfaceConstructors[name] = convertInterfaceConstructor(factory.interfaceConstructors[name])
    })
    Object.keys(factory.typeAliasConstructors).forEach(function(name) {
      container.typeAliasConstructors[name] = convertTypeAliasConstructor(factory.typeAliasConstructors[name])
    })
    Object.keys(factory.enums).forEach(function(name) {
      container.enums[name] = convertEnum(factory.enums[name])
    })
    Object.keys(factory.values).forEach(function(name) {
      container.values[name] = convertValue(factory.values[name])
    })
    Object.keys(factory.namespaces).forEach(function(name) {
      container.namespaces[name] = convertContainer(factory.namespaces[name])
    })
    return container
  }

  function convertCompositeType<MC extends f.AbstractMemberFactory<any, any, any>, FT extends f.AbstractFunctionTypeFactory<any, any, any>>(factory: f.AbstractCompositeTypeFactory<any, MC, FT>) {
    let c = <m.CompositeType>createType(TypeKind.COMPOSITE)
    c.members = {}
    Object.keys(factory.members).forEach(function(name) {
      c.members[name] = convertMember(factory.members[name])
    })
    if (factory.index) {
      c.index = convertIndex(factory.index)
    }
    if (factory.calls) {
      c.calls = factory.calls.map(convertFunctionType)
    }
    return c
  }

  function convertIndex(factory: f.IndexFactory) {
    let index = <m.Index>{}
    index.keyType = factory.keyType
    index.valueType = convertType(factory.valueType)
    return index
  }

  function convertMember(factory: f.AbstractMemberFactory<any, any, any>) {
    let member = <m.Member>{}
    member.type = convertType(factory.type)
    member.optional = factory.optional
    if (factory.initializer) {
      member.initializer = convertExpression(factory.initializer)
    }
    convertDecorators(<f.DecoratedMemberFactory<any, any>>factory, member)
    return member
  }

  function convertEnum(factory: f.EnumFactory) {
    let en = <m.Enum>createType(TypeKind.ENUM)
    en.members = factory.members.map(function(memberFactory) {
      return convertEnumMember(memberFactory)
    })
    return en
  }

  function convertEnumMember(factory: f.EnumMemberFactory) {
    let member = <m.EnumMember>{}
    member.name = factory.name
    if (factory.initializer) {
      member.initializer = convertExpression(factory.initializer)
    }
    return member
  }

  function convertFunctionType(factory: f.AbstractFunctionTypeFactory<any, any, any>) {
    let f = <m.FunctionType>createType(TypeKind.FUNCTION)
    if (factory.type) {
      f.type = convertType(factory.type)
    }
    f.parameters = factory.parameters.map(function(parameterFactory) {
      return convertParameter(parameterFactory)
    })
    convertTypeParameters(factory, f)
    return f
  }

  function convertParameter(factory: f.ParameterFactory<any>) {
    let parameter = <m.Parameter>{}
    parameter.name = factory.name
    parameter.optional = factory.optional
    parameter.type = convertType(factory.type)
    if (factory.initializer) {
      parameter.initializer = convertExpression(factory.initializer)
    }
    convertDecorators(<f.DecoratedParameterFactory<any>>factory, parameter)
    return parameter
  }

  function convertTupleType(factory: f.TupleTypeFactory) {
    let t = <m.TupleType>createType(TypeKind.TUPLE)
    t.elements = factory.elements.map(convertType)
    return t
  }

  function convertUnionOrIntersectionType(factory: f.UnionOrIntersectionTypeFactory) {
    let u = <m.UnionOrIntersectionType>createType(factory.typeKind)
    u.types = factory.types.map(convertType)
    return u
  }

  function convertTypeParameters(factory: f.TypeConstructorFactory<any>, typeConstructor: m.TypeConstructor) {
    if (factory.typeParameters && factory.typeParameters.length > 0) {
      typeConstructor.typeParameters = factory.typeParameters.map(function(tpFactory) {
        let tp = <m.TypeParameter>createType(TypeKind.TYPE_PARAMETER)
        tp.name = tpFactory.name
        if (tpFactory.extends) {
          tp.extends = convertType(tpFactory.extends)
        }
        return tp
      })
    }
  }

  function convertDecorators(factory: f.DecoratedFactory<any, any>, decorated: m.Decorated) {
    if (factory.decorators) {
      decorated.decorators = factory.decorators.map(function(decoratorFactory) {
        return convertDecorator(decoratorFactory)
      })
    }
  }

  function convertDecorator(factory: f.DecoratorFactory<any>) {
    let decorator = <m.Decorator>{}
    decorator.decoratorType = getReference(factory.decoratorType)
    if (factory.parameters) {
      decorator.parameters = factory.parameters.map(convertExpression)
    }
    return decorator
  }

  return function <U extends ModelElementTemplate>(factory: f.Factory<any>) {
    return function(): any {
      let u: U
      switch (factory.modelKind) {
        case ModelKind.PACKAGE:
          u = <any>convertPackage(<f.PackageFactory>factory)
          break
        case ModelKind.TYPE:
          u = <any>convertType(<f.TypeFactory<any>>factory)
          break
        case ModelKind.EXPRESSION:
          u = <any>convertExpression(<f.ExpressionFactory<any>>factory)
          break
        case ModelKind.CONTAINER:
          u = <any>convertContainer(<f.ContainerFactory>factory)
          break
        case ModelKind.CLASS_CONSTRUCTOR:
          u = <any>convertClassConstructor(<f.ClassConstructorFactory>factory)
          break
        case ModelKind.INTERFACE_CONSTRUCTOR:
          u = <any>convertClassConstructor(<f.ClassConstructorFactory>factory)
          break
        case ModelKind.TYPE_ALIAS_CONSTRUCTOR:
          u = <any>convertClassConstructor(<f.ClassConstructorFactory>factory)
          break
        case ModelKind.INDEX:
          u = <any>convertIndex(<f.IndexFactory>factory)
          break
        case ModelKind.PARAMETER:
        case ModelKind.DECORATED_PARAMETER:
          u = <any>convertParameter(<f.ParameterFactory<any>>factory)
          break
        case ModelKind.MEMBER:
        case ModelKind.DECORATED_MEMBER:
          u = <any>convertMember(<f.MemberFactory<any, any>>factory)
          break
        case ModelKind.SYMBOL:
          // TODO
        case ModelKind.ENUM_MEMBER:
          u = <any>convertEnumMember(<f.EnumMemberFactory>factory)
          break
        case ModelKind.VALUE:
          u = <any>convertValue(<f.ValueFactory<any>>factory)
          break
        case ModelKind.EXPRESSION:
          u = <any>convertExpression(<f.ExpressionFactory<any>>factory)
          break
        case ModelKind.DECORATOR:
          u = <any>convertDecorator(<f.DecoratorFactory<any>>factory)
          break
      }
      return u
    }
  }
}
