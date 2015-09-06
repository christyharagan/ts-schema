import * as m from './model'
import * as e from './equals'
import * as f from './factories'
import * as s from './toString'

export type ClosedTypes = m.Map<[m.Interface|m.Class, m.Map<m.OpenType>][]>

export function closeClassConstructor(classConstructor: m.ClassConstructor, typeArgs: m.OpenType[], parentTypeArgs?: m.Map<m.OpenType>, closedTypes?: ClosedTypes, cls?: m.Class): m.Class {
  return processClass(classConstructor, typeArgs, parentTypeArgs, closedTypes, classConstructor.instanceType, classConstructor.staticType, classConstructor.extends, classConstructor.implements, classConstructor.decorators, cls)
}
export function processClass(classConstructor: m.ClassConstructor, typeArgs: m.OpenType[], parentTypeArgs: m.Map<m.OpenType>, closedTypes: ClosedTypes, instanceType: m.DecoratedCompositeType<any>, staticType: m.DecoratedCompositeType<any>, clsExtends: m.Class, clsImplements: m.Interface[], decorators: m.Decorator<any>[], cls?: m.Class): m.Class {
  cls = cls || <m.Class>{}
  cls.modelKind = m.ModelKind.TYPE
  cls.name = classConstructor.name
  cls.typeKind = m.TypeKind.CLASS
  cls.typeConstructor = classConstructor
  cls.constructorParent = classConstructor.parent
  cls.typeArguments = typeArgs
  cls.equals = e.classEquals

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

    cls.instanceType = <m.DecoratedCompositeType<m.Class>>processCompositeType(allArgs, instanceType, true)
    cls.staticType = <m.DecoratedCompositeType<m.Class>>processCompositeType(allArgs, staticType, true)
    cls.instanceType.parent = cls
    cls.staticType.parent = cls

    addClosed(fqName, closedTypes, cls, parentTypeArgs)

    if (decorators) {
      cls.decorators = decorators.map(function(decorator) {
        return <m.Decorator<m.Class>>{
          modelKind: m.ModelKind.DECORATOR,
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
          let typeArgs: m.OpenType[] = (cc).typeParameters ? (cc).typeParameters.map(function() {
            return m.ANY
          }) : []
          clsExtends = closeClassConstructor(cc, typeArgs, parentTypeArgs, closedTypes)
        } else {
          clsExtends = (<Function><any>clsExtends)()
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
            let typeArgs: m.OpenType[] = (ic).typeParameters ? (ic).typeParameters.map(function() {
              return m.ANY
            }) : []
            impl = closeInterfaceConstructor(ic, typeArgs, parentTypeArgs, closedTypes)
          } else {
            impl = (<Function><any>impl)()
          }
        }
        return processInterface(impl.typeConstructor, impl.typeArguments, allArgs, closedTypes, impl.instanceType, impl.extends)
      })
    }
  }

  return cls
}

export function closeInterfaceConstructor(interfaceConstructor: m.InterfaceConstructor, typeArgs: m.OpenType[], parentTypeArgs?: m.Map<m.OpenType>, closedTypes?: ClosedTypes, int?: m.Interface): m.Interface {
  return processInterface(interfaceConstructor, typeArgs, parentTypeArgs, closedTypes, interfaceConstructor.instanceType, interfaceConstructor.extends, int)
}

function processInterface(interfaceConstructor: m.InterfaceConstructor, typeArgs: m.OpenType[], parentTypeArgs: m.Map<m.OpenType>, closedTypes: ClosedTypes, instanceCompositeType: m.ContainedCompositeType<any>, intExtends: m.Interface[], int?: m.Interface): m.Interface {
  int = int || <m.Interface>{}
  int.modelKind = m.ModelKind.TYPE
  int.name = interfaceConstructor.name
  int.typeKind = m.TypeKind.INTERFACE
  int.typeConstructor = interfaceConstructor
  int.constructorParent = interfaceConstructor.parent
  int.typeArguments = typeArgs
  int.equals = e.interfaceEquals

  let fqName = s.interfaceConstructorToString(interfaceConstructor)
  let previouslyClosed = getPreviouslyClosed(fqName, closedTypes, typeArgs, parentTypeArgs)
  if (previouslyClosed) {
    int.instanceType = <m.ContainedCompositeType<any>>copyCompositeType((<m.Interface>previouslyClosed).instanceType, int)
    int.extends = (<m.Interface>previouslyClosed).extends
  } else {
    let allArgs = getAllArgs(interfaceConstructor.typeParameters, typeArgs, parentTypeArgs)
    closedTypes = closedTypes || {}

    int.instanceType = <m.ContainedCompositeType<m.Interface>>processCompositeType(allArgs, interfaceConstructor.instanceType, false)
    int.instanceType.parent = int

    addClosed(fqName, closedTypes, int, parentTypeArgs)

    if (intExtends) {
      int.extends = []
      int.extends = intExtends.map(function(extend) {
        if (!(<m.Interface>extend).typeKind) {
          if ((<m.InterfaceConstructor><any>extend).modelKind) {
            let ic = <m.InterfaceConstructor><any>extend
            let typeArgs: m.OpenType[] = (ic).typeParameters ? (ic).typeParameters.map(function() {
              return m.ANY
            }) : []
            extend = closeInterfaceConstructor(ic, typeArgs, parentTypeArgs, closedTypes)
          } else {
            extend = (<Function><any>extend)()
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
        modelKind: m.ModelKind.DECORATOR,
        equals: e.decoratorEquals
      }
    })
  }
}

function copyCompositeType(ct: m.CompositeType, parent: any): m.CompositeType {
  let copy = <m.CompositeType>{
    members: {},
    modelKind: m.ModelKind.TYPE,
    typeKind: m.TypeKind.COMPOSITE,
    equals: e.compositeTypeEquals
  }
  Object.keys(ct.members).forEach(function(name) {
    let member = ct.members[name]
    copy.members[name] = {
      parent: copy,
      name: name,
      type: member.type,
      optional: member.optional,
      initialiser: member.initialiser,
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
      modelKind: m.ModelKind.INDEX,
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

function addClosed(fqName: string, closedTypes: ClosedTypes, closedInstance: m.Class|m.Interface, parentTypeArgs?: m.Map<m.OpenType>) {
  let closedTypesForName = closedTypes[fqName]
  if (!closedTypesForName) {
    closedTypesForName = []
    closedTypes[fqName] = closedTypesForName
  }
  closedTypesForName.push([closedInstance, parentTypeArgs])
}

function getPreviouslyClosed(fqName: string, closedTypes: ClosedTypes, typeArgs: m.OpenType[], parentTypeArgs?: m.Map<m.OpenType>) {
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

function substituteType(allArgs: m.Map<m.OpenType>, type: m.OpenType) {
  if (!(<m.ModelElement>type).modelKind) {
    type = (<Function><any>type)()
  }
  if ((<m.Type>type).typeKind) {
    return type
  } else {
    let p = <m.TypeParameter<any>>type
    return allArgs[p.name] || p
  }
}

function processCompositeType(allArgs: m.Map<m.OpenType>, oldCompositeType: m.CompositeType, isDecorated: boolean): m.CompositeType {
  let newCompositeType: m.CompositeType = {
    modelKind: m.ModelKind.TYPE,
    members: {},
    equals: e.compositeTypeEquals,
    typeKind: m.TypeKind.COMPOSITE
  }
  Object.keys(oldCompositeType.members).forEach(function(name) {
    let member = oldCompositeType.members[name]
    newCompositeType.members[name] = {
      modelKind: m.ModelKind.MEMBER,
      parent: newCompositeType,
      equals: e.compositeTypeEquals,
      name: name,
      type: substituteType(allArgs, member.type),
      optional: member.optional
    }
    if (isDecorated) {
      (<m.DecoratedMember<any>>newCompositeType.members[name]).decorators = (<m.DecoratedMember<any>>member).decorators
    }
  })
  if (oldCompositeType.index) {
    newCompositeType.index = {
      modelKind: m.ModelKind.INDEX,
      parent: newCompositeType,
      equals: e.compositeTypeEquals,
      keyType: oldCompositeType.index.keyType,
      valueType: substituteType(allArgs, oldCompositeType.index.valueType)
    }
  }
  if (oldCompositeType.calls) {
    newCompositeType.calls = oldCompositeType.calls.map(function(call) {
      let newCall: m.FunctionType = {
        modelKind: m.ModelKind.TYPE,
        typeKind: m.TypeKind.FUNCTION,
        equals: e.functionTypeEquals,
        typeParameters: call.typeParameters,
        parameters: call.parameters.map(function(parameter) {
          let newParameter: m.Parameter = {
            modelKind: (<m.DecoratedParameter>parameter).decorators ? m.ModelKind.DECORATED_PARAMETER : m.ModelKind.PARAMETER,
            parent: newCall,
            equals: e.parameterEquals,
            name: parameter.name,
            type: substituteType(allArgs, parameter.type)
          }

          if (isDecorated && (<m.DecoratedParameter>parameter).decorators) {
            (<m.DecoratedParameter>newParameter).decorators = (<m.DecoratedParameter>parameter).decorators
          }
          return newParameter
        })
      }
      if (call.type) {
        newCall.type = substituteType(allArgs, call.type)
      }
      return newCall
    })
  }
  return newCompositeType
}

function getAllArgs(typeParams: m.TypeParameter<any>[], typeArgs: m.OpenType[], parentTypeArgs?: m.Map<m.OpenType>): m.Map<m.OpenType> {
  let names = parentTypeArgs ? Object.keys(parentTypeArgs) : null
  let allArgs: m.Map<m.OpenType> = {}

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
