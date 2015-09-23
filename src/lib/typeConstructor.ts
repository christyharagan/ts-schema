import {reflective as m, KeyValue, ModelKind, TypeKind} from './model'
import * as e from './equals'
import * as f from './factories'
import * as s from './toString'

export type ClosedTypes = KeyValue<[m.Interface|m.Class|m.TypeAlias<any>, KeyValue<m.Type>][]>

export function constructTypeAlias<T extends m.Type>(typeAliasConstructor: m.TypeAliasConstructor<T>, typeArgs: m.Type[], parentTypeArgs?: KeyValue<m.Type>, closedTypes?: ClosedTypes, typeAlias?: m.TypeAlias<T>):m.TypeAlias<T> {
  typeAlias = typeAlias || <m.TypeAlias<T>>{}
  typeAlias.modelKind = ModelKind.TYPE
  typeAlias.name = typeAliasConstructor.name
  typeAlias.typeKind = TypeKind.TYPE_ALIAS
  typeAlias.typeConstructor = typeAliasConstructor
  typeAlias.typeArguments = typeArgs
  typeAlias.equals = e.containedEquals

  let fqName = s.typeAliasConstructorToString(typeAliasConstructor)
  let previouslyClosed = getPreviouslyClosed(fqName, closedTypes, typeArgs, parentTypeArgs)
  if (previouslyClosed) {
    typeAlias.type = (<m.TypeAlias<T>>previouslyClosed).type
  } else {
    typeAlias.type = typeAliasConstructor.type
    addClosed(fqName, closedTypes, typeAlias, parentTypeArgs)
  }
  typeAlias.type = <any>substituteType(parentTypeArgs, closedTypes, typeAlias.type)

  return typeAlias
}

export function constructClass(classConstructor: m.ClassConstructor, typeArgs: m.Type[], parentTypeArgs?: KeyValue<m.Type>, closedTypes?: ClosedTypes, cls?: m.Class): m.Class {
  return processClass(classConstructor, typeArgs, parentTypeArgs, closedTypes, classConstructor.instanceType, classConstructor.staticType, classConstructor.extends, classConstructor.implements, classConstructor.decorators, cls)
}
function processClass(classConstructor: m.ClassConstructor, typeArgs: m.Type[], parentTypeArgs: KeyValue<m.Type>, closedTypes: ClosedTypes, instanceType: m.DecoratedCompositeType<any>, staticType: m.DecoratedCompositeType<any>, clsExtends: m.Class, clsImplements: m.Interface[], decorators: m.Decorator<any>[], cls?: m.Class): m.Class {
  cls = cls || <m.Class>{}
  cls.modelKind = ModelKind.TYPE
  cls.name = classConstructor.name
  cls.typeKind = TypeKind.CLASS
  cls.typeConstructor = classConstructor
  cls.constructorParent = classConstructor.parent
  cls.typeArguments = typeArgs
  cls.equals = e.containedEquals

  let fqName = s.classConstructorToString(classConstructor)
  let previouslyClosed = getPreviouslyClosed(fqName, closedTypes, typeArgs, parentTypeArgs)
  if (previouslyClosed) {
    cls.instanceType = <m.DecoratedCompositeType<any>>copyCompositeType((<m.Class>previouslyClosed).instanceType, cls)
    cls.staticType = <m.DecoratedCompositeType<any>>copyCompositeType((<m.Class>previouslyClosed).staticType, cls)
    cls.extends = (<m.Class>previouslyClosed).extends
    cls.implements = (<m.Class>previouslyClosed).implements
    copyDecorators((<m.Class>previouslyClosed).decorators, cls)
  } else {
    let allArgs = getAllArgs(classConstructor.typeParameters, typeArgs, parentTypeArgs)
    closedTypes = closedTypes || {}

    cls.instanceType = <m.DecoratedCompositeType<m.Class>>processCompositeType(allArgs, closedTypes, instanceType, true)
    cls.staticType = <m.DecoratedCompositeType<m.Class>>processCompositeType(allArgs, closedTypes, staticType, true)
    cls.instanceType.parent = cls
    cls.staticType.parent = cls

    addClosed(fqName, closedTypes, cls, parentTypeArgs)

    if (decorators) {
      cls.decorators = decorators.map(function(decorator) {
        return <m.Decorator<m.Class>>{
          modelKind: ModelKind.DECORATOR,
          parent: cls,
          equals: e.decoratorEquals,
          decoratorType: decorator.decoratorType,
          parameters: decorator.parameters
        }
      })
    }

    if (clsExtends) {
      if (!(<m.Class>clsExtends).typeKind) {
        if ((<m.ClassConstructor><any>clsExtends).modelKind) {
          let cc = <m.ClassConstructor><any>clsExtends
          let typeArgs: m.Type[] = (cc).typeParameters ? (cc).typeParameters.map(function() {
            return m.ANY
          }) : []
          clsExtends = constructClass(cc, typeArgs, parentTypeArgs, closedTypes)
        } else {
          let construct = clsExtends['_construct']
          construct(allArgs)
          delete clsExtends['_construct']
        }
      }
      cls.extends = processClass(clsExtends.typeConstructor, clsExtends.typeArguments, allArgs, closedTypes, clsExtends.instanceType, clsExtends.staticType, clsExtends.extends, clsExtends.implements, clsExtends.decorators)
    }

    if (clsImplements) {
      cls.implements = []
      cls.implements = clsImplements.map(function(impl) {
        if (!(<m.Interface>impl).typeKind) {
          if ((<m.InterfaceConstructor><any>impl).modelKind) {
            let ic = <m.InterfaceConstructor><any>impl
            let typeArgs: m.Type[] = (ic).typeParameters ? (ic).typeParameters.map(function() {
              return m.ANY
            }) : []
            impl = constructInterface(ic, typeArgs, parentTypeArgs, closedTypes)
          } else {
            let construct = impl['_construct']
            construct(allArgs)
            delete impl['_construct']
          }
        }
        return processInterface(impl.typeConstructor, impl.typeArguments, allArgs, closedTypes, impl.instanceType, impl.extends)
      })
    }
  }

  return cls
}

export function constructInterface(interfaceConstructor: m.InterfaceConstructor, typeArgs: m.Type[], parentTypeArgs?: KeyValue<m.Type>, closedTypes?: ClosedTypes, int?: m.Interface): m.Interface {
  return processInterface(interfaceConstructor, typeArgs, parentTypeArgs, closedTypes, interfaceConstructor.instanceType, interfaceConstructor.extends, int)
}

function processInterface(interfaceConstructor: m.InterfaceConstructor, typeArgs: m.Type[], parentTypeArgs: KeyValue<m.Type>, closedTypes: ClosedTypes, instanceCompositeType: m.ContainedCompositeType<any>, intExtends: m.Interface[], int?: m.Interface): m.Interface {
  int = int || <m.Interface>{}
  int.modelKind = ModelKind.TYPE
  int.name = interfaceConstructor.name
  int.typeKind = TypeKind.INTERFACE
  int.typeConstructor = interfaceConstructor
  int.constructorParent = interfaceConstructor.parent
  int.typeArguments = typeArgs
  int.equals = e.containedEquals

  let fqName = s.interfaceConstructorToString(interfaceConstructor)
  let previouslyClosed = getPreviouslyClosed(fqName, closedTypes, typeArgs, parentTypeArgs)
  if (previouslyClosed) {
    int.instanceType = <m.ContainedCompositeType<any>>copyCompositeType((<m.Interface>previouslyClosed).instanceType, int)
    int.extends = (<m.Interface>previouslyClosed).extends
  } else {
    let allArgs = getAllArgs(interfaceConstructor.typeParameters, typeArgs, parentTypeArgs)
    closedTypes = closedTypes || {}

    int.instanceType = <m.ContainedCompositeType<m.Interface>>processCompositeType(allArgs, closedTypes, interfaceConstructor.instanceType, false)
    int.instanceType.parent = int

    addClosed(fqName, closedTypes, int, parentTypeArgs)

    if (intExtends) {
      int.extends = []
      int.extends = intExtends.map(function(extend) {
        if (!(<m.Interface>extend).typeKind) {
          if ((<m.InterfaceConstructor><any>extend).modelKind) {
            let ic = <m.InterfaceConstructor><any>extend
            let typeArgs: m.Type[] = (ic).typeParameters ? (ic).typeParameters.map(function() {
              return m.ANY
            }) : []
            extend = constructInterface(ic, typeArgs, parentTypeArgs, closedTypes)
          } else {
            let construct = extend['_construct']
            construct(allArgs)
            delete extend['_construct']
          }
        }
        return processInterface(extend.typeConstructor, extend.typeArguments, allArgs, closedTypes, extend.instanceType, extend.extends)
      })
    }
  }

  return int
}

function copyDecorators<P extends m.Decorated>(decorators: m.Decorator<P>[], parent: P) {
  if (decorators) {
    parent.decorators = decorators.map(function(decorator) {
      return <m.Decorator<any>>{
        parent: parent,
        decoratorType: decorator.decoratorType,
        parameters: decorator.parameters,
        modelKind: ModelKind.DECORATOR,
        equals: e.decoratorEquals
      }
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

function addClosed(fqName: string, closedTypes: ClosedTypes, closedInstance: m.Class|m.Interface|m.TypeAlias<any>, parentTypeArgs?: KeyValue<m.Type>) {
  let closedTypesForName = closedTypes[fqName]
  if (!closedTypesForName) {
    closedTypesForName = []
    closedTypes[fqName] = closedTypesForName
  }
  closedTypesForName.push([closedInstance, parentTypeArgs])
}

function getPreviouslyClosed(fqName: string, closedTypes: ClosedTypes, typeArgs: m.Type[], parentTypeArgs?: KeyValue<m.Type>) {
  if (closedTypes[fqName]) {
    let closedTypesForName = closedTypes[fqName]
    for (let i = 0; i < closedTypesForName.length; i++) {
      let closedType = closedTypesForName[i]
      let closedTypeArgs = closedType[0].typeArguments
      let isMatch = true
      for (let j = 0; j < closedTypeArgs.length; j++) {
        if (!closedTypeArgs[j].equals(typeArgs[j])) {
          isMatch = false
          break
        }
      }
      if (isMatch) {
        if ((closedType[1] && !parentTypeArgs) || (!closedType[1] && parentTypeArgs)) {
          isMatch = false
        } else {
          let closedParentTypeArgs = closedType[1]
          let keys = Object.keys(closedParentTypeArgs)
          for (let j = 0; j < keys.length; j++) {
            let key = keys[j]
            if (!parentTypeArgs[key]) {
              isMatch = false
              break
            } else if (!closedParentTypeArgs[key].equals(parentTypeArgs[key])) {
              isMatch = false
              break
            }
          }
        }
        if (isMatch) {
          return closedType[0]
        }
      }
    }
  }
}

function substituteType(allArgs: KeyValue<m.Type>, closedTypes: ClosedTypes, type: m.Type):m.Type {
  // if (type['_construct']) {
  //   let construct = type['_construct']
  //   construct(allArgs)
  //   delete type['_construct']
  //   return type
  // } else {
  //   switch (type.typeKind) {
  //     case TypeKind.CLASS:
  //       let cls = <m.Class> type
  //       return processClass(cls.typeConstructor, cls.typeArguments.map(function(arg){
  //         return substituteType(allArgs, closedTypes, arg)
  //       }), allArgs, closedTypes, cls.instanceType, cls.staticType, cls.extends, cls.implements, cls.decorators, cls)
  //     case TypeKind.INTERFACE:
  //       let int = <m.Interface> type
  //       return processInterface(int.typeConstructor, int.typeArguments.map(function(arg){
  //         return substituteType(allArgs, closedTypes, arg)
  //       }), allArgs, closedTypes, int.instanceType, int.extends, int)
  //     case TypeKind.TYPE_ALIAS:
  //       let ta = <m.TypeAlias<any>> type
  //       return constructTypeAlias(ta.typeConstructor, ta.typeArguments.map(function(arg){
  //         return substituteType(allArgs, closedTypes, arg)
  //       }), allArgs, closedTypes, ta)
  //     case TypeKind.TYPE_PARAMETER:
  //       let p = <m.TypeParameter<any>>type
  //       return allArgs[p.name] || p
  //     default:
  //       return type
  //   }
    if ((<m.Type>type).typeKind) {
      return type
    } else {
      let p = <m.TypeParameter<any>>type
      return allArgs[p.name] || p
    }
  // }
}

function processCompositeType(allArgs: KeyValue<m.Type>, closedTypes: ClosedTypes, oldCompositeType: m.CompositeType, isDecorated: boolean): m.CompositeType {
  let newCompositeType: m.CompositeType = {
    modelKind: ModelKind.TYPE,
    members: {},
    equals: e.compositeTypeEquals,
    typeKind: TypeKind.COMPOSITE
  }
  Object.keys(oldCompositeType.members).forEach(function(name) {
    let member = oldCompositeType.members[name]
    newCompositeType.members[name] = {
      modelKind: ModelKind.MEMBER,
      parent: newCompositeType,
      equals: e.compositeTypeEquals,
      name: name,
      type: substituteType(allArgs, closedTypes, member.type),
      optional: member.optional
    }
    if (isDecorated) {
      (<m.DecoratedMember<any>>newCompositeType.members[name]).decorators = (<m.DecoratedMember<any>>member).decorators
    }
  })
  if (oldCompositeType.index) {
    newCompositeType.index = {
      modelKind: ModelKind.INDEX,
      parent: newCompositeType,
      equals: e.compositeTypeEquals,
      keyType: oldCompositeType.index.keyType,
      valueType: substituteType(allArgs, closedTypes, oldCompositeType.index.valueType)
    }
  }
  if (oldCompositeType.calls) {
    newCompositeType.calls = oldCompositeType.calls.map(function(call) {
      let newCall: m.FunctionType = {
        modelKind: ModelKind.TYPE,
        typeKind: TypeKind.FUNCTION,
        equals: e.functionTypeEquals,
        typeParameters: call.typeParameters,
        parameters: call.parameters.map(function(parameter) {
          let newParameter: m.Parameter = {
            modelKind: (<m.DecoratedParameter>parameter).decorators ? ModelKind.DECORATED_PARAMETER : ModelKind.PARAMETER,
            parent: newCall,
            equals: e.parameterEquals,
            name: parameter.name,
            type: substituteType(allArgs, closedTypes, parameter.type)
          }

          if (isDecorated && (<m.DecoratedParameter>parameter).decorators) {
            (<m.DecoratedParameter>newParameter).decorators = (<m.DecoratedParameter>parameter).decorators
          }
          return newParameter
        })
      }
      if (call.type) {
        newCall.type = substituteType(allArgs, closedTypes, call.type)
      }
      return newCall
    })
  }
  return newCompositeType
}

function getAllArgs(typeParams: m.TypeParameter<any>[], typeArgs: m.Type[], parentTypeArgs?: KeyValue<m.Type>): KeyValue<m.Type> {
  let names = parentTypeArgs ? Object.keys(parentTypeArgs) : null
  let allArgs: KeyValue<m.Type> = {}

  if (parentTypeArgs) {
    names.forEach(function(name) {
      allArgs[name] = parentTypeArgs[name]
    })
  }
  if (typeParams) {
    typeParams.forEach(function(typeParam, i) {
      allArgs[typeParam.name] = typeArgs[i]
    })
  }

  return allArgs
}
