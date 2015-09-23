import * as v from './visitor'
import {reflective as m, KeyValue, ModelKind, TypeKind, PrimitiveTypeKind, ExpressionKind, ContainerKind, ModelElementTemplate} from './model'
import * as e from './equals'
import * as f from './factories'
import * as tc from './typeConstructor'

export function factoryToReflective(pkg?:m.Package, _typeParameters?:KeyValue<m.TypeParameter<any>>): <U extends ModelElementTemplate>(factory: f.Factory<U>) => (() => U) {
  pkg = pkg || {
    modules: {}
  }
  _typeParameters = _typeParameters || {}

  let context = {
    typeArgs: <KeyValue<m.Type>>{},
    closedTypes: <tc.ClosedTypes>{},
    closedTypeCallbacks: <(() => void)[]>[]
//    isStarted: false
  }

  function createModelElement<U extends m.ModelElement>(modelKind:ModelKind, equals:(e: m.ModelElement) => boolean) {
    return <U>{
      modelKind: modelKind,
      equals: equals
    }
  }

  function createType<T extends m.Type>(typeKind:TypeKind, equals:(e: m.ModelElement) => boolean) {
    let t = <T>createModelElement(ModelKind.TYPE, equals)
    t.typeKind = typeKind
    return t
  }

  function createExpression<E extends m.Expression<any>>(expressionKind:ExpressionKind, equals:(e: m.ModelElement) => boolean) {
    let e = <E>createModelElement(ModelKind.EXPRESSION, equals)
    e.expressionKind = expressionKind
    return e
  }

  function createContainer<C extends m.Container>(containerKind:ContainerKind) {
    let c = <C>createModelElement(ModelKind.CONTAINER, e.containerEquals)
    c.containerKind = containerKind
    c.classConstructors = {}
    c.interfaceConstructors = {}
    c.typeAliasConstructors = {}
    c.enums = {}
    c.values = {}
    c.namespaces = {}
    return c
  }

  function createContained(modelKind:ModelKind, name: string, parent:m.Container) {
    let contained = <m.Contained>createModelElement(modelKind, e.containedEquals)
    contained.name = name
    contained.parent = parent
    switch (modelKind) {
      case ModelKind.CLASS_CONSTRUCTOR:
        parent.classConstructors[name] = <m.ClassConstructor>contained
        break
      case ModelKind.INTERFACE_CONSTRUCTOR:
        parent.interfaceConstructors[name] = <m.InterfaceConstructor>contained
        break
      case ModelKind.TYPE_ALIAS_CONSTRUCTOR:
        parent.typeAliasConstructors[name] = <m.TypeAliasConstructor<any>>contained
        break
      case ModelKind.VALUE:
        parent.values[name] = <m.Value<any>>contained
        break
      case ModelKind.TYPE:
        parent.enums[name] = <m.Enum>contained
        break
      case ModelKind.CONTAINER:
        parent.namespaces[name] = <m.Namespace>contained
        break
    }

    return contained
  }

  function convertPackage(factory: f.PackageFactory) {
    Object.keys(factory.modules).forEach(function(name){
      convertContainer(factory.modules[name])
    })

    return pkg
  }

  function convertType(factory:f.TypeFactory<any>, typeParameters:KeyValue<m.TypeParameter<any>>):m.Type {
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
        return <m.Enum>getReference(<f.EnumFactory>factory)
      case TypeKind.FUNCTION:
        return convertFunctionType(<f.AbstractFunctionTypeFactory<any, any, any>>factory, typeParameters)
      case TypeKind.TUPLE:
        return convertTupleType(<f.TupleTypeFactory>factory, typeParameters)
      case TypeKind.UNION:
      case TypeKind.INTERSECTION:
        return convertUnionOrIntersectionType(<f.UnionOrIntersectionTypeFactory>factory, typeParameters)
      case TypeKind.COMPOSITE:
        return convertCompositeType(<f.AbstractCompositeTypeFactory<any, any, any>>factory, typeParameters)
      case TypeKind.INTERFACE:
        return convertInterface(<f.InterfaceFactory>factory, typeParameters)
      case TypeKind.CLASS:
        return convertClass(<f.ClassFactory>factory, typeParameters)
      case TypeKind.TYPE_QUERY:
        return convertTypeQuery(<f.TypeQueryFactory<any>>factory, typeParameters)
      case TypeKind.TYPE_ALIAS:
        return convertTypeAlias(<f.TypeAliasFactory<any>>factory, typeParameters)
      case TypeKind.TYPE_PARAMETER:
        return typeParameters[(<f.TypeParameterFactory<any>>factory).name]
    }
  }

  function convertExpression(factory:f.ExpressionFactory<any>):m.Expression<any> {
    switch (factory.expressionKind) {
      case ExpressionKind.PRIMITIVE:
        let primitiveFactory = <f.PrimitiveExpressionFactory<any>>factory
        let primitiveExpression = <m.PrimitiveExpression<any>>createExpression(factory.expressionKind, e.primitiveExpressionEquals)
        primitiveExpression.primitiveTypeKind = primitiveFactory.primitiveTypeKind
        primitiveExpression.primitiveValue = primitiveFactory.primitiveValue
        return primitiveExpression
      case ExpressionKind.ENUM:
        let enumFactory = <f.EnumExpressionFactory>factory
        let enumExpression = <m.EnumExpression>createExpression(factory.expressionKind, e.enumExpressionEquals)
        enumExpression.enum = <m.Enum>getReference(enumFactory.enum)
        enumExpression.value = enumFactory.value
        return enumExpression
      case ExpressionKind.FUNCTION:
        let functionFactory = <f.FunctionExpressionFactory>factory
        let functionExpression = <m.FunctionExpression>createExpression(factory.expressionKind, e.functionExpressionEquals)
        functionExpression.functionType = <m.FunctionType>convertType(functionFactory.functionType, {})
        return functionExpression
      case ExpressionKind.CLASS:
      case ExpressionKind.OBJECT:
      case ExpressionKind.ARRAY:
      case ExpressionKind.CLASS_REFERENCE:
      case ExpressionKind.VALUE:
      case ExpressionKind.FUNCTION_CALL:
      case ExpressionKind.PROPERTY_ACCESS:
    }
  }

  function convertClass(factory:f.ClassFactory, typeParameters:KeyValue<m.TypeParameter<any>>) {
    let cc = <m.ClassConstructor>getReference(factory.typeConstructor)
    if (cc.modelKind === ModelKind.INTERFACE_CONSTRUCTOR) {
      console.log(factory)
    }
    let typeArgs = factory.typeArguments.map(function(arg){
      return convertType(arg, typeParameters)
    })

    let cls:m.Class
    let _construct = function(_typeArgs?:KeyValue<m.Type>){
      if (cls['_construct']) {
        // TODO: Temporary to get over the line for a demo
        //tc.constructClass(cc, typeArgs, _typeArgs || context.typeArgs, context.closedTypes, cls)
        delete cls['_construct']
      }
    }

    cls = <any>{
      _construct: _construct
    }
    context.closedTypeCallbacks.push(_construct)
    return cls
  }

  function getContainerReference(containerFactory: f.ContainerFactory) {
    let parentFactory = containerFactory
    let namespaces:f.ContainerFactory[] = []
    while (parentFactory.containerKind === ContainerKind.NAMESPACE) {
      namespaces.splice(0, 0, parentFactory)
      parentFactory = (<f.NamespaceFactory>parentFactory).parent
    }
    let container:m.Container = pkg.modules[parentFactory.name]
    if (!pkg.modules[parentFactory.name]) {
      container = createContainer(ContainerKind.MODULE)
      pkg.modules[parentFactory.name] = <m.Module>container
    }
    namespaces.forEach(function(ns){
      let name = ns.name
      let parent = container
      container = parent.namespaces[name]
      if (!container) {
        let ns = <m.Namespace>createContainer(ContainerKind.NAMESPACE)
        ns.name = name
        ns.parent = parent
        container = ns
        parent.namespaces[name] = <m.Namespace>container
      }
    })

    return container
  }

  function getReference(containedFactory: f.ContainedFactory<any>):m.Contained {
    let contained:m.Contained
    let container = getContainerReference(containedFactory.parent)
    switch (containedFactory.modelKind) {
      case ModelKind.CLASS_CONSTRUCTOR:
        contained = container.classConstructors[containedFactory.name]
        if (!contained) {
          contained = createContained(ModelKind.CLASS_CONSTRUCTOR, containedFactory.name, container)
        }
        break
      case ModelKind.INTERFACE_CONSTRUCTOR:
        contained = container.interfaceConstructors[containedFactory.name]
        if (!contained) {
          contained = createContained(ModelKind.INTERFACE_CONSTRUCTOR, containedFactory.name, container)
        }
        break
      case ModelKind.TYPE_ALIAS_CONSTRUCTOR:
        contained = container.typeAliasConstructors[containedFactory.name]
        if (!contained) {
          contained = createContained(ModelKind.TYPE_ALIAS_CONSTRUCTOR, containedFactory.name, container)
        }
        break
      case ModelKind.VALUE:
        contained = container.values[containedFactory.name]
        if (!contained) {
          contained = createContained(ModelKind.VALUE, containedFactory.name, container)
        }
        break
      case ModelKind.TYPE:
        contained = container.enums[containedFactory.name]
        if (!contained) {
          contained = createContained(ModelKind.TYPE, containedFactory.name, container)
        }
        break
      case ModelKind.CONTAINER:
        contained = container.namespaces[containedFactory.name]
        if (!contained) {
          contained = createContained(ModelKind.CONTAINER, containedFactory.name, container)
        }
        break
    }
    return contained
  }

  function convertInterface(factory:f.InterfaceFactory, typeParameters:KeyValue<m.TypeParameter<any>>) {
    let ic = <m.InterfaceConstructor>getReference(factory.typeConstructor)
    let typeArgs = factory.typeArguments.map(function(arg){
      return convertType(arg, typeParameters)
    })

    let int:m.Interface
    let _construct = function(_typeArgs?:KeyValue<m.Type>){
      if (int['_construct']) {
        // TODO: Temporary to get over the line for a demo
        //tc.constructInterface(ic, typeArgs, _typeArgs || context.typeArgs, context.closedTypes, int)
        delete int['_construct']
      }
    }

    int = <any>{
      _construct: _construct
    }
    context.closedTypeCallbacks.push(_construct)

    return int
  }

  function convertClassConstructor(factory:f.ClassConstructorFactory, parentTypeParameters:KeyValue<m.TypeParameter<any>>, parent:m.Container) {
    let cc = parent.classConstructors[factory.name]
    if (!cc) {
      cc = <m.ClassConstructor>createContained(ModelKind.CLASS_CONSTRUCTOR, factory.name, parent)
      parent.classConstructors[factory.name] = cc
    }

    let typeParameters:KeyValue<m.TypeParameter<any>> = {}
    Object.keys(parentTypeParameters).forEach(function(name){
      typeParameters[name] = parentTypeParameters[name]
    })

    convertTypeParameters(factory, cc, typeParameters)

    cc.instanceType = <m.DecoratedCompositeType<m.ClassConstructor>>convertCompositeType(factory.instanceType, typeParameters, cc)
    cc.staticType = <m.DecoratedCompositeType<m.ClassConstructor>>convertCompositeType(factory.staticType, typeParameters, cc)
    cc.isAbstract = factory.isAbstract
    convertDecorators(factory, cc)
    if (factory.extends) {
      cc.extends = convertClass(factory.extends, typeParameters)
    }
    if (factory.implements) {
      cc.implements = factory.implements.map(function(impl){
        return convertInterface(impl, typeParameters)
      })
    }
    return cc
  }

  function convertInterfaceConstructor(factory:f.InterfaceConstructorFactory, parentTypeParameters:KeyValue<m.TypeParameter<any>>, parent:m.Container) {
    let ic = parent.interfaceConstructors[factory.name]
    if (!ic) {
      ic = <m.InterfaceConstructor>createContained(ModelKind.INTERFACE_CONSTRUCTOR, factory.name, parent)
      parent.interfaceConstructors[factory.name] = ic
    }

    let typeParameters:KeyValue<m.TypeParameter<any>> = {}
    Object.keys(parentTypeParameters).forEach(function(name){
      typeParameters[name] = parentTypeParameters[name]
    })

    convertTypeParameters(factory, ic, typeParameters)

    ic.instanceType = <m.ContainedCompositeType<m.InterfaceConstructor>>convertCompositeType(factory.instanceType, typeParameters, ic)
    if (factory.extends) {
      ic.extends = factory.extends.map(function(ext){
        return convertInterface(ext, typeParameters)
      })
    }
    return ic
  }

  function convertTypeAliasConstructor(factory:f.TypeAliasConstructorFactory<any>, parentTypeParameters:KeyValue<m.TypeParameter<any>>, parent:m.Container) {
    let tac = parent.typeAliasConstructors[factory.name]
    if (!tac) {
      tac = <m.TypeAliasConstructor<any>>createContained(ModelKind.TYPE_ALIAS_CONSTRUCTOR, factory.name, parent)
      parent.typeAliasConstructors[factory.name] = tac
    }

    let typeParameters:KeyValue<m.TypeParameter<any>> = {}
    Object.keys(parentTypeParameters).forEach(function(name){
      typeParameters[name] = parentTypeParameters[name]
    })

    convertTypeParameters(factory, tac, typeParameters)

    tac.type = convertType(factory.type, typeParameters)
    return tac
  }

  function convertTypeAlias(factory:f.TypeAliasFactory<any>, typeParameters:KeyValue<m.TypeParameter<any>>) {
    let tac = <m.TypeAliasConstructor<any>>getReference(factory.typeConstructor)
    let typeArgs = factory.typeArguments.map(function(arg){
      return convertType(arg, typeParameters)
    })

    let ta = <m.TypeAlias<any>>{}
    let _construct = function(_typeArgs?:KeyValue<m.Type>){
      if (ta['_construct']) {
        // TODO: Temporary to get over the line for a demo
        //tc.constructTypeAlias(tac, typeArgs, _typeArgs || context.typeArgs, context.closedTypes, ta)
        delete ta['_construct']
      }
    }

    ta = <any>{
      _construct: _construct
    }
    context.closedTypeCallbacks.push(_construct)
    return ta
  }

  function convertTypeQuery(factory:f.TypeQueryFactory<any>, typeParameters:KeyValue<m.TypeParameter<any>>) {
    let typeQuery = <m.TypeQuery>createType(TypeKind.TYPE_QUERY, e.typeQueryEquals)
    if (factory.type) {
      switch (factory.type.modelKind) {
        case ModelKind.TYPE:
          typeQuery.type = convertType(<f.TypeFactory<any>>factory.type, typeParameters)
          break
        case ModelKind.VALUE:
        case ModelKind.CONTAINER:
          typeQuery.type = <m.Value<any>>getReference(<f.ValueFactory<any>>factory.type)
          break
      }
    }
    return typeQuery
  }

  function convertValue(factory:f.ValueFactory<any>, typeParameters:KeyValue<m.TypeParameter<any>>, parent:m.Container) {
    let v = parent.values[factory.name]
    if (!v) {
      v = <m.Value<any>>createContained(ModelKind.VALUE, factory.name, parent)
      parent.values[factory.name] = v
    }
    v.valueKind = factory.valueKind
    v.type = convertType(factory.type, typeParameters)
    if (factory.initializer) {
      v.initializer = convertExpression(factory.initializer)
    }
    return v
  }

  function convertContainer(factory:f.ContainerFactory, parent?:m.Container) {
    let container:m.Container
    if (parent) {
      container = parent.namespaces[factory.name]
      if (!container) {
        container = <m.Namespace>createContained(ModelKind.CONTAINER, factory.name, parent)
        container.containerKind = ContainerKind.NAMESPACE
        container.classConstructors = {}
        container.interfaceConstructors = {}
        container.typeAliasConstructors = {}
        container.enums = {}
        container.values = {}
        container.namespaces = {}
      }
    } else {
      container = pkg.modules[factory.name]
      if (!container) {
        container = createContainer(factory.containerKind)
        pkg.modules[factory.name] = container
      }
    }
    Object.keys(factory.classConstructors).forEach(function(name){
      convertClassConstructor(factory.classConstructors[name], {}, container)
    })
    Object.keys(factory.interfaceConstructors).forEach(function(name){
      convertInterfaceConstructor(factory.interfaceConstructors[name], {}, container)
    })
    Object.keys(factory.typeAliasConstructors).forEach(function(name){
      convertTypeAliasConstructor(factory.typeAliasConstructors[name], {}, container)
    })
    Object.keys(factory.enums).forEach(function(name){
      convertEnum(factory.enums[name], container)
    })
    Object.keys(factory.values).forEach(function(name){
      convertValue(factory.values[name], {}, container)
    })
    Object.keys(factory.namespaces).forEach(function(name){
      convertContainer(factory.namespaces[name], container)
    })
    return container
  }

  function convertCompositeType<MC extends f.AbstractMemberFactory<any, any, any>, FT extends f.AbstractFunctionTypeFactory<any, any, any>>(factory:f.AbstractCompositeTypeFactory<any, MC, FT>, typeParameters:KeyValue<m.TypeParameter<any>>, parent?: m.ModelElement) {
    let c = <m.CompositeType>createType(TypeKind.COMPOSITE, e.compositeTypeEquals)
    if (parent) {
      (<m.ContainedCompositeType<any>>c).parent = parent
    }
    c.members = {}
    Object.keys(factory.members).forEach(function(name){
      c.members[name] = convertMember(factory.members[name], typeParameters, c)
    })
    if (factory.index) {
      c.index = convertIndex(factory.index, typeParameters, c)
    }
    if (factory.calls) {
      c.calls = factory.calls.map(function(call){
        return convertFunctionType(call, typeParameters)
      })
    }
    return c
  }

  function convertIndex(factory:f.IndexFactory, typeParameters:KeyValue<m.TypeParameter<any>>, parent:m.CompositeType) {
    let index = <m.Index>createModelElement(ModelKind.INDEX, e.indexEquals)
    index.parent = parent
    index.keyType = factory.keyType
    index.valueType = convertType(factory.valueType, typeParameters)
    return index
  }

  function convertMember(factory:f.AbstractMemberFactory<any, any, any>, typeParameters:KeyValue<m.TypeParameter<any>>, parent:m.CompositeType) {
    let member = <m.Member<any>> createModelElement(ModelKind.MEMBER, e.memberEquals)
    member.parent = parent
    member.type = convertType(factory.type, typeParameters)
    member.optional = factory.optional
    if (factory.initializer) {
      member.initializer = convertExpression(factory.initializer)
    }
    convertDecorators(<f.DecoratedMemberFactory<any, any>>factory, member)
    return member
  }

  function convertEnum(factory:f.EnumFactory, parent:m.Container) {
    let en = parent.enums[factory.name]
    if (!en) {
      en = <m.Enum>createContained(ModelKind.TYPE, factory.name, parent)
      parent.enums[factory.name] = en
      en.typeKind = TypeKind.ENUM
    }
    en.members = factory.members.map(function(memberFactory){
      return convertEnumMember(memberFactory, en)
    })
    return en
  }

  function convertEnumMember(factory:f.EnumMemberFactory, parent:m.Enum) {
    let member = <m.EnumMember>createModelElement(ModelKind.ENUM_MEMBER, e.enumMemberEquals)
    member.parent = parent
    member.name = factory.name
    if (factory.initializer) {
      member.initializer = convertExpression(factory.initializer)
    }
    return member
  }

  function convertFunctionType(factory:f.AbstractFunctionTypeFactory<any, any, any>, parentTypeParameters:KeyValue<m.TypeParameter<any>>) {
    let typeParameters:KeyValue<m.TypeParameter<any>> = {}
    Object.keys(parentTypeParameters).forEach(function(name){
      typeParameters[name] = parentTypeParameters[name]
    })

    let f = <m.FunctionType>createType(TypeKind.FUNCTION, e.functionTypeEquals)
    convertTypeParameters(factory, f, typeParameters)

    if (factory.type) {
      f.type = convertType(factory.type, typeParameters)
    }
    f.parameters = factory.parameters.map(function(parameterFactory){
      return convertParameter(parameterFactory, typeParameters, f)
    })
    return f
  }

  function convertParameter(factory:f.ParameterFactory<any>, typeParameters:KeyValue<m.TypeParameter<any>>, parent:m.FunctionType) {
    let parameter = <m.Parameter> createModelElement(ModelKind.PARAMETER, e.parameterEquals)
    parameter.parent = parent
    parameter.name = factory.name
    parameter.type = convertType(factory.type, typeParameters)
    parameter.optional = factory.optional
    if (factory.initializer) {
      parameter.initializer = convertExpression(factory.initializer)
    }
    convertDecorators(<f.DecoratedParameterFactory<any>>factory, parameter)
    return parameter
  }

  function convertTupleType(factory:f.TupleTypeFactory, typeParameters:KeyValue<m.TypeParameter<any>>) {
    let t = <m.TupleType>createType(TypeKind.TUPLE, e.tupleTypeEquals)
    t.elements = factory.elements.map(function(type){
      return convertType(type, typeParameters)
    })
    return t
  }

  function convertUnionOrIntersectionType(factory:f.UnionOrIntersectionTypeFactory, typeParameters:KeyValue<m.TypeParameter<any>>) {
    let u = <m.UnionOrIntersectionType>createType(factory.typeKind, e.unionOrIntersectionTypeEquals)
    u.types = factory.types.map(function(type){
      return convertType(type, typeParameters)
    })
    return u
  }

  function convertTypeParameters(factory: f.TypeConstructorFactory<any>, typeConstructor: m.TypeConstructor, typeParameters:KeyValue<m.TypeParameter<any>>) {
    if (factory.typeParameters && factory.typeParameters.length > 0) {
      typeConstructor.typeParameters = factory.typeParameters.map(function(tpFactory){
        let tp = <m.TypeParameter<any>> createType(TypeKind.TYPE_PARAMETER, e.typeParameterEquals)
        tp.parent = typeConstructor
        tp.name = tpFactory.name
        if (tpFactory.extends) {
          tp.extends = convertType(tpFactory.extends, typeParameters)
        }
        return tp
      })
      typeConstructor.typeParameters.forEach(function(typeParameter){
        typeParameters[typeParameter.name] = typeParameter
      })
    }
  }

  function convertDecorators(factory: f.DecoratedFactory<any, any>, decorated:m.Decorated) {
    if (factory.decorators) {
      decorated.decorators = factory.decorators.map(function(decoratorFactory){
        let decorator = <m.Decorator<any>> createModelElement(ModelKind.DECORATOR, e.decoratorEquals)
        if (decoratorFactory.parameters) {
          decorator.parameters = decoratorFactory.parameters.map(convertExpression)
        }
        return decorator
      })
    }
  }

  return function <U extends m.ModelElement>(factory: f.Factory<any>, parent?: m.ModelElement) {
//    let wasStarted = context.isStarted
//    context.isStarted = true
    return function():any {
      let u: U
      switch (factory.modelKind) {
        case ModelKind.PACKAGE:
          u = <any>convertPackage(<f.PackageFactory>factory)
          break
        case ModelKind.TYPE:
          u = <any>convertType(<f.TypeFactory<any>>factory, _typeParameters)
          break
        case ModelKind.EXPRESSION:
          u = <any>convertExpression(<f.ExpressionFactory<any>>factory)
          break
        case ModelKind.CONTAINER:
          u = <any>convertContainer(<f.ContainerFactory>factory, <m.Container>parent)
          break
        case ModelKind.CLASS_CONSTRUCTOR:
          u = <any>convertClassConstructor(<f.ClassConstructorFactory>factory, _typeParameters, <m.Container>parent)
          break
        case ModelKind.INTERFACE_CONSTRUCTOR:
          u = <any>convertClassConstructor(<f.ClassConstructorFactory>factory, _typeParameters, <m.Container>parent)
          break
        case ModelKind.TYPE_ALIAS_CONSTRUCTOR:
          u = <any>convertClassConstructor(<f.ClassConstructorFactory>factory, _typeParameters, <m.Container>parent)
          break
        case ModelKind.INDEX:
        case ModelKind.PARAMETER:
        case ModelKind.DECORATED_PARAMETER:
        case ModelKind.MEMBER:
        case ModelKind.SYMBOL:
        case ModelKind.ENUM_MEMBER:
        case ModelKind.VALUE:
        case ModelKind.EXPRESSION:
        case ModelKind.DECORATOR:
        case ModelKind.DECORATED_MEMBER:
          let decoratedMemberFactory = <f.DecoratedMemberFactory<any, any>>factory
      }
//      if (!wasStarted) {
      context.closedTypeCallbacks.forEach(function(cb) {
        cb()
      })
//      }
      return u
    }
  }
}
