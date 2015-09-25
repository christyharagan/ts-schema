import * as v from './visitor'
import {reflective as m, KeyValue, ModelKind, TypeKind, PrimitiveTypeKind, ExpressionKind, ContainerKind, ModelElementTemplate} from './model'
import * as e from './equals'
import * as f from './factories'
import * as tc from './typeConstructor'
import {expressionToLiteral} from './expressionToLiteral'

export function factoryToReflective(pkg?:m.Package, _typeParameters?:KeyValue<m.TypeParameter<any>>): <U extends ModelElementTemplate>(factory: f.Factory<U>) => (() => U) {
  pkg = pkg || {
    modules: {}
  }
  _typeParameters = _typeParameters || {}

  let context = {
    typeArgs: <KeyValue<m.Type>>{},
    closedTypes: <tc.ClosedTypes>{},
    closedTypeCallbacks: <(() => void)[]>[]
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
    contained.equals = e.containedEquals
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
        let classFactory = <f.ClassExpressionFactory>factory
        let classExpression = <m.ClassExpression>createExpression(factory.expressionKind, e.classExpressionEquals)
        classExpression.class = <m.ProtoClass>convertType(classFactory.class, {})
        return classExpression
      case ExpressionKind.OBJECT:
        let objectFactory = <f.ObjectExpressionFactory>factory
        let objectExpression = <m.ObjectExpression>createExpression(factory.expressionKind, e.objectExpressionEquals)
        objectExpression.properties = {}
        Object.keys(objectFactory.properties).forEach(function(name) {
          objectExpression.properties[name] = convertExpression(objectFactory.properties[name])
        })
        return objectExpression
      case ExpressionKind.ARRAY:
        let arrayFactory = <f.ArrayExpressionFactory>factory
        let arrayExpression = <m.ArrayExpression>createExpression(factory.expressionKind, e.arrayExpressionEquals)
        arrayExpression.elements = arrayFactory.elements.map(convertExpression)
        return arrayExpression
      case ExpressionKind.CLASS_REFERENCE:
        let classRefExpression = <m.ClassReferenceExpression>createExpression(factory.expressionKind, e.classReferenceExpressionEquals)
        classRefExpression.classReference = <m.ClassConstructor>getReference((<f.ClassReferenceExpressionFactory>factory).classReference)
        return classRefExpression
      case ExpressionKind.VALUE:
        let valueFactory = <f.ValueExpressionFactory<any>>factory
        let valueExpression = <m.ValueExpression<any>>createExpression(factory.expressionKind, e.valueExpressionEquals)
        valueExpression.value = <m.Value<any>>getReference(valueFactory.value)
        return valueExpression
      case ExpressionKind.FUNCTION_CALL:
        let functionCallFactory = <f.FunctionCallExpressionFactory>factory
        let functionCallExpression = <m.FunctionCallExpression<any>>createExpression(factory.expressionKind, e.functionCallExpressionEquals)
        functionCallExpression.function = convertExpression(functionCallFactory.function)
        functionCallExpression.arguments = functionCallFactory.arguments.map(convertExpression)
        return functionCallExpression
      case ExpressionKind.PROPERTY_ACCESS:
        let propAccessFactory = <f.PropertyAccessExpressionFactory>factory
        let propAccessExpression = <m.PropertyAccessExpression<any>>createExpression(factory.expressionKind, e.propertyAccessExpressionEquals)
        propAccessExpression.parent = convertExpression(propAccessFactory.parent)
        propAccessFactory.property = propAccessFactory.property
        return propAccessExpression
      case ExpressionKind.NEW:
        let newFactory = <f.NewExpressionFactory>factory
        let newExpression = <m.NewExpression<any>>createExpression(factory.expressionKind, e.newExpressionEquals)
        newExpression.classReference = convertExpression(newFactory.classReference)
        newExpression.arguments = newFactory.arguments.map(convertExpression)
        return newExpression
    }
  }

  function convertClass(factory:f.ClassFactory, typeParameters:KeyValue<m.TypeParameter<any>>) {
    let cc = <m.ClassConstructor>getReference(factory.typeConstructor)
    let typeArgs = getTypeArgs(factory, typeParameters)

    let cls:m.Class
    let _construct = function(parentTypeArgs?:KeyValue<m.Type>){
      if (cls['_construct']) {
        let c = tc.constructClass(cc, typeArgs, parentTypeArgs || context.typeArgs, context.closedTypes)
        function populate() {
          cls.instanceType = <m.DecoratedCompositeType<any>>copyCompositeType(c.instanceType, cls)
          cls.staticType = <m.DecoratedCompositeType<any>>copyCompositeType(c.staticType, cls)
          cls.extends = c.extends
          cls.implements = c.implements
          cls.typeArguments = c.typeArguments
          copyDecorators(c.decorators, cls)
        }
        if (c['_onFinished']) {
          c['_onFinished'](populate)
        } else {
          populate()
        }
        delete cls['_construct']
      }
      return cls
    }

    cls = <any>{
      _construct: _construct,
      modelKind: ModelKind.TYPE,
      name: cc.name,
      typeKind: TypeKind.CLASS,
      typeConstructor: cc,
      constructorParent: cc.parent,
      equals: e.constructableTypeEquals
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

  function copyElement(oldElement:m.ModelElement): m.ModelElement {
    return {
      modelKind:oldElement.modelKind,
      equals:oldElement.equals
    }
  }

  function copyDecorators(oldDecorators:m.Decorator<any>[], decorated:m.Decorated) {
    if (oldDecorators) {
      decorated.decorators = oldDecorators.map(function(oldDecorator){
        let newDecorator = <m.Decorator<any>>copyElement(oldDecorator)
        newDecorator.parent = decorated
        newDecorator.parameters = oldDecorator.parameters
        return newDecorator
      })
    }
  }

  function copyCompositeType(ct: m.CompositeType, parent: any): m.CompositeType {
    let copy = <m.CompositeType>{
      members: {},
      modelKind: ModelKind.TYPE,
      typeKind: TypeKind.COMPOSITE,
      equals: e.compositeTypeEquals
    }
    Object.keys(ct.members).forEach(function(name) {
      let member = ct.members[name]
      copy.members[name] = {
        parent: copy,
        name: name,
        type: member.type,
        optional: member.optional,
        initializer: member.initializer,
        modelKind: member.modelKind,
        equals: e.memberEquals
      }
      copyDecorators((<m.DecoratedMember<any>>member).decorators, <m.DecoratedMember<any>>copy.members[name])
    })
    if (ct.index) {
      copy.index = {
        parent: copy,
        keyType: ct.index.keyType,
        valueType: ct.index.valueType,
        modelKind: ModelKind.INDEX,
        equals: e.indexEquals
      }
    }
    if (ct.calls) {
      copy.calls = ct.calls.map(function(call) {
        return call
      })
    }
    (<m.ContainedCompositeType<any>>copy).parent = parent

    return copy
  }

  function convertInterface(factory:f.InterfaceFactory, typeParameters:KeyValue<m.TypeParameter<any>>) {
    let ic = <m.InterfaceConstructor>getReference(factory.typeConstructor)
    let typeArgs = getTypeArgs(factory, typeParameters)

    let int:m.Interface
    let _construct = function(parentTypeArgs?:KeyValue<m.Type>){
      if (int['_construct']) {
        let i = tc.constructInterface(ic, typeArgs, parentTypeArgs || context.typeArgs, context.closedTypes)
        function populate() {
          int.typeArguments = i.typeArguments
          int.extends = i.extends
          int.instanceType = <m.ContainedCompositeType<m.Interface>>copyCompositeType(i.instanceType, int)
        }
        if (i['_onFinished']) {
          i['_onFinished'](populate)
        } else {
          populate()
        }
        delete int['_construct']
      }
      return int
    }

    int = <any>{
      _construct: _construct,
      modelKind: ModelKind.TYPE,
      name: ic.name,
      typeKind: TypeKind.INTERFACE,
      typeConstructor: ic,
      constructorParent: ic.parent,
      equals: e.constructableTypeEquals
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
        if (impl.typeKind === TypeKind.INTERFACE) {
          return convertInterface(<f.InterfaceFactory>impl, typeParameters)
        } else {
          return convertClass(<f.ClassFactory>impl, typeParameters)
        }
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
        if (ext.typeKind === TypeKind.INTERFACE) {
          return convertInterface(<f.InterfaceFactory>ext, typeParameters)
        } else {
          return convertClass(<f.ClassFactory>ext, typeParameters)
        }
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

  function getTypeArgs(factory:f.AbstractConstructableTypeFactory<any, any>, typeParameters:KeyValue<m.TypeParameter<any>>) {
    let factoryTypeArguments = factory.typeArguments
    if (factoryTypeArguments.length === 0 && factory.typeConstructor.typeParameters.length > 0) {
      factoryTypeArguments = factory.typeConstructor.typeParameters.map(function(){
        return new f.PrimitiveTypeFactory(PrimitiveTypeKind.ANY)
      })
    }

    return factoryTypeArguments.map(function(arg){
      return convertType(arg, typeParameters)
    })
  }

  function convertTypeAlias(factory:f.TypeAliasFactory<any>, typeParameters:KeyValue<m.TypeParameter<any>>) {
    let tac = <m.TypeAliasConstructor<any>>getReference(factory.typeConstructor)
    let typeArgs = getTypeArgs(factory, typeParameters)

    let ta = <m.TypeAlias<any>>{}
    let _construct = function(parentTypeArgs?:KeyValue<m.Type>){
      if (ta['_construct']) {
        let t = tc.constructTypeAlias(tac, typeArgs, parentTypeArgs || context.typeArgs, context.closedTypes)
        function populate() {
          ta.type = t.type
        }
        if (ta['_onFinished']) {
          ta['_onFinished'](populate)
        } else {
          populate()
        }
        delete ta['_construct']
      }
      return ta
    }

    ta = <any>{
      _construct: _construct,
      modelKind: ModelKind.TYPE,
      name: tac.name,
      typeKind: TypeKind.TYPE_ALIAS,
      typeConstructor: tac,
      constructorParent: tac.parent,
      typeArguments: typeArgs,
      equals: e.constructableTypeEquals
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
        container.name = factory.name
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
    member.name = factory.name
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
    en.valueMap = {}
    let previousValue = -1
    en.members = factory.members.map(function(memberFactory){
      let member = convertEnumMember(memberFactory, en, previousValue)
      previousValue = expressionToLiteral(member.initializer)
      en.valueMap[member.name] = member
      return member
    })
    return en
  }

  function convertEnumMember(factory:f.EnumMemberFactory, parent:m.Enum, previousValue?:number) {
    let member = <m.EnumMember>createModelElement(ModelKind.ENUM_MEMBER, e.enumMemberEquals)
    member.parent = parent
    member.name = factory.name
    if (factory.initializer) {
      member.initializer = convertExpression(factory.initializer)
    } else {
      member.initializer = <m.PrimitiveExpression<number>>{
        primitiveValue:PrimitiveTypeKind.NUMBER,
        modelKind:ModelKind.EXPRESSION,
        expressionKind:ExpressionKind.PRIMITIVE,
        equals:e.primitiveExpressionEquals,
        primitiveTypeKind:previousValue + 1
      }
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

  function convertTypeParameter(factory:f.TypeParameterFactory<any>, typeConstructor: m.TypeConstructor, typeParameters:KeyValue<m.TypeParameter<any>>) {
    let tp = <m.TypeParameter<any>> createType(TypeKind.TYPE_PARAMETER, e.typeParameterEquals)
    tp.parent = typeConstructor
    tp.name = factory.name
    if (factory.extends) {
      tp.extends = convertType(factory.extends, typeParameters)
    }
    return tp
  }

  function convertTypeParameters(factory: f.TypeConstructorFactory<any>, typeConstructor: m.TypeConstructor, typeParameters:KeyValue<m.TypeParameter<any>>) {
    if (factory.typeParameters && factory.typeParameters.length > 0) {
      typeConstructor.typeParameters = factory.typeParameters.map(function(tpFactory){
        return convertTypeParameter(tpFactory, typeConstructor, typeParameters)
      })
      typeConstructor.typeParameters.forEach(function(typeParameter){
        typeParameters[typeParameter.name] = typeParameter
      })
    }
  }

  function convertDecorator(factory: f.DecoratorFactory<any>, decorated:m.Decorated) {
    let decorator = <m.Decorator<any>> createModelElement(ModelKind.DECORATOR, e.decoratorEquals)
    decorator.parent = decorated
    decorator.decoratorType = <m.Value<any>>getReference(factory.decoratorType)
    if (factory.parameters) {
      decorator.parameters = factory.parameters.map(convertExpression)
    }
    return decorator
  }

  function convertDecorators(factory: f.DecoratedFactory<any, any>, decorated:m.Decorated) {
    if (factory.decorators) {
      decorated.decorators = factory.decorators.map(function(decoratorFactory){
        return convertDecorator(decoratorFactory, decorated)
      })
    }
  }

  return function <U extends m.ModelElement>(factory: f.Factory<any>, parent?: m.ModelElement) {
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
          u = <any>convertIndex(<f.IndexFactory>factory, _typeParameters, <m.CompositeType>parent)
          break
        case ModelKind.PARAMETER:
        case ModelKind.DECORATED_PARAMETER:
          u = <any>convertParameter(<f.ParameterFactory<any>>factory, _typeParameters, <m.FunctionType>parent)
          break
        case ModelKind.MEMBER:
        case ModelKind.DECORATED_MEMBER:
          u = <any>convertMember(<f.MemberFactory<any, any>>factory, _typeParameters, <m.CompositeType>parent)
          break
        case ModelKind.ENUM_MEMBER:
          u = <any>convertEnumMember(<f.EnumMemberFactory>factory, <m.Enum>parent)
          break
        case ModelKind.VALUE:
          u = <any>convertValue(<f.ValueFactory<any>>factory, _typeParameters, <m.Container>parent)
          break
        case ModelKind.EXPRESSION:
          u = <any>convertExpression(<f.ExpressionFactory<any>>factory)
          break
        case ModelKind.DECORATOR:
          u = <any>convertDecorator(<f.DecoratorFactory<any>>factory, <m.Decorated>parent)
          break
      }
      context.closedTypeCallbacks.forEach(function(cb) {
        cb()
      })
      return u
    }
  }
}
