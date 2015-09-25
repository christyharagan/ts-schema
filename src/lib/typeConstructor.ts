import {reflective as m, KeyValue, ModelKind, TypeKind} from './model'
import * as e from './equals'
import * as f from './factories'
import * as s from './toString'
import * as v from './visitor'

export type ClosedTypes = KeyValue<m.ConstructableType<any>[]>

export function constructTypeAlias<T extends m.Type>(typeAliasConstructor: m.TypeAliasConstructor<T>, typeArgs: m.Type[], parentTypeArgs?: KeyValue<m.Type>, closedTypes?: ClosedTypes):m.TypeAlias<T> {
  [typeArgs, parentTypeArgs] = processTypeArgs(typeAliasConstructor, parentTypeArgs || {}, typeArgs)

  return processTypeAlias(typeAliasConstructor, typeArgs, parentTypeArgs, closedTypes)
}

function processTypeAlias<T extends m.Type>(typeAliasConstructor: m.TypeAliasConstructor<T>, typeArgs: m.Type[], parentTypeArgs?: KeyValue<m.Type>, closedTypes?: ClosedTypes):m.TypeAlias<T> {
  let fqName = s.typeAliasConstructorToString(typeAliasConstructor)
  let previouslyClosed = getPreviouslyClosed(closedTypes, fqName, typeArgs)
  if (previouslyClosed) {
    return <m.TypeAlias<T>>previouslyClosed
  } else {
    let typeAlias:m.TypeAlias<T> = {
      modelKind: ModelKind.TYPE,
      name: typeAliasConstructor.name,
      typeKind: TypeKind.TYPE_ALIAS,
      typeConstructor: typeAliasConstructor,
      constructorParent: typeAliasConstructor.parent,
      typeArguments: typeArgs,
      equals: e.containedEquals,
      type:null
    }
    addClosed(fqName, closedTypes, typeAlias)

    typeAlias.type = <any>substituteType(parentTypeArgs, closedTypes, typeAlias.type)

    typeAlias['finish']()
    return typeAlias
  }
}

export function constructClass(classConstructor: m.ClassConstructor, typeArgs: m.Type[], parentTypeArgs?: KeyValue<m.Type>, closedTypes?: ClosedTypes): m.Class {
  [typeArgs, parentTypeArgs] = processTypeArgs(classConstructor, parentTypeArgs || {}, typeArgs)
  return processClass(classConstructor, typeArgs, parentTypeArgs, closedTypes, classConstructor.instanceType, classConstructor.staticType, classConstructor.extends, classConstructor.implements, classConstructor.decorators)
}
function processClass(classConstructor: m.ClassConstructor, typeArgs: m.Type[], allArgs: KeyValue<m.Type>, closedTypes: ClosedTypes, instanceType: m.DecoratedCompositeType<any>, staticType: m.DecoratedCompositeType<any>, clsExtends: m.Class, clsImplements: (m.Interface|m.Class)[], decorators: m.Decorator<any>[]): m.Class {
  let fqName = s.classConstructorToString(classConstructor)
  let previouslyClosed = getPreviouslyClosed(closedTypes, fqName, typeArgs)
  if (previouslyClosed) {
    return <m.Class>previouslyClosed
  } else {
    let cls:m.Class = {
      modelKind: ModelKind.TYPE,
      name: classConstructor.name,
      typeKind: TypeKind.CLASS,
      typeConstructor: classConstructor,
      constructorParent: classConstructor.parent,
      typeArguments: typeArgs,
      equals: e.containedEquals,
      instanceType: null,
      staticType: null
    }
    addClosed(fqName, closedTypes, cls)

    closedTypes = closedTypes || {}

    cls.instanceType = substituteType(allArgs, closedTypes, instanceType)
    cls.staticType = substituteType(allArgs, closedTypes, staticType)

    cls.instanceType.parent = cls
    cls.staticType.parent = cls

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
      cls.extends = substituteType(allArgs, closedTypes, clsExtends)
    }

    if (clsImplements) {
      cls.implements = []
      cls.implements = clsImplements.map(function(impl) {
        return substituteType(allArgs, closedTypes, impl)
      })
    }
    cls['finish']()
    return cls
  }
}

export function constructInterface(interfaceConstructor: m.InterfaceConstructor, typeArgs: m.Type[], parentTypeArgs?: KeyValue<m.Type>, closedTypes?: ClosedTypes): m.Interface {
  [typeArgs, parentTypeArgs] = processTypeArgs(interfaceConstructor, parentTypeArgs || {}, typeArgs)

  return processInterface(interfaceConstructor, typeArgs, parentTypeArgs, closedTypes, interfaceConstructor.instanceType, interfaceConstructor.extends)
}

function processInterface(interfaceConstructor: m.InterfaceConstructor, typeArgs: m.Type[], allArgs: KeyValue<m.Type>, closedTypes: ClosedTypes, instanceCompositeType: m.ContainedCompositeType<any>, intExtends: (m.Interface|m.Class)[]): m.Interface {
  let fqName = s.interfaceConstructorToString(interfaceConstructor)
  let previouslyClosed = getPreviouslyClosed(closedTypes, fqName, typeArgs)
  if (previouslyClosed) {
    return <m.Interface>previouslyClosed
  } else {
    let int:m.Interface = {
      modelKind: ModelKind.TYPE,
      name: interfaceConstructor.name,
      typeKind: TypeKind.INTERFACE,
      typeConstructor: interfaceConstructor,
      constructorParent: interfaceConstructor.parent,
      equals: e.containedEquals,
      typeArguments: typeArgs,
      instanceType:undefined
    }

    addClosed(fqName, closedTypes, int)

    closedTypes = closedTypes || {}

    int.instanceType = substituteType(allArgs, closedTypes, instanceCompositeType)
    int.instanceType.parent = int

    if (intExtends) {
      if (!Array.isArray(intExtends)){
        console.log(interfaceConstructor)
      }
      int.extends = []
      int.extends = intExtends.map(function(extend) {
        return substituteType(allArgs, closedTypes, extend)
      })
    }
    int['finish']()
    return int
  }
}

function processTypeArgs(typeConstructor: m.TypeConstructor, parentTypeArgs: KeyValue<m.Type>, typeArgs?: m.Type[]):[m.Type[], KeyValue<m.Type>] {
  let newParentArgs:KeyValue<m.Type> = {}
  Object.keys(function(name){
    newParentArgs[name] = parentTypeArgs[name]
  })
  return [(typeConstructor.typeParameters || []).map(function(typeParameter, i){
    if (parentTypeArgs[typeParameter.name]) {
      return parentTypeArgs[typeParameter.name]
    } else if (typeArgs) {
      let typeArg = typeArgs[i]
      parentTypeArgs[typeParameter.name] = typeArg
      return typeArg
    } else {
      return typeParameter
    }
  }), parentTypeArgs]
}

function addClosed(fqName: string, closedTypes: ClosedTypes, closedType: m.ConstructableType<any>) {
  let closedTypesForName = closedTypes[fqName]
  if (!closedTypesForName) {
    closedTypesForName = []
    closedTypes[fqName] = closedTypesForName
  }
  let cbs:(()=>void)[] = []
  closedType['_onFinished'] = function(cb:()=>void) {
    cbs.push(cb)
  }
  closedType['finish'] = function() {
    cbs.forEach(function(cb){
      cb()
    })
    delete closedType['finished']
    delete closedType['_onFinished']
  }
  closedTypesForName.push(closedType)
}

function getPreviouslyClosed(closedTypes: ClosedTypes, fqName: string, typeArgs: m.Type[]):m.ConstructableType<any> {
  if (closedTypes[fqName]) {
    let closedTypesForName = closedTypes[fqName]
    for (let i = 0; i < closedTypesForName.length; i++) {
      let closedType = closedTypesForName[i]
      let closedTypeArgs = closedType.typeArguments
      let isMatch = true
      for (let j = 0; j < closedTypeArgs.length; j++) {
        if (!closedTypeArgs[j].equals(typeArgs[j])) {
          isMatch = false
          break
        }
      }
      if (isMatch) {
        return closedType
      }
    }
  }
}

function copyElement(oldElement:m.ModelElement): m.ModelElement {
  return {
    modelKind:oldElement.modelKind,
    equals:oldElement.equals
  }
}

function copyType(oldType:m.Type):m.Type {
  return {
    modelKind:ModelKind.TYPE,
    typeKind:oldType.typeKind,
    equals:oldType.equals
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

function copyTypeParameters(allArgs: KeyValue<m.Type>, closedTypes: ClosedTypes, oldTypeParameters:m.TypeParameter<any>[], typeConstructor:m.TypeConstructor) {
  if (oldTypeParameters) {
    typeConstructor.typeParameters = oldTypeParameters.map(function(oldTypeParameter){
      let typeParameter = <m.TypeParameter<any>>copyElement(oldTypeParameter)
      typeParameter.parent = typeConstructor
      typeParameter.typeKind = TypeKind.TYPE_PARAMETER
      if (oldTypeParameter.extends) {
        typeParameter.extends = substituteType(allArgs, closedTypes, oldTypeParameter.extends)
      }
      return typeParameter
    })
  }
}

function substituteType<T extends m.Type>(allArgs: KeyValue<m.Type>, closedTypes: ClosedTypes, type: T, parent?:m.ModelElement):T {
  let newType:m.Type
  if (type['_construct']) {
    return type['_construct'](allArgs)
  } else {
    v.visitType(type, {
      onCompositeType: function(oldCompositeType){
        let newCompositeType = <m.ContainedCompositeType<any>>copyType(oldCompositeType)
        newCompositeType.members = {}
        if (oldCompositeType.calls) {
          newCompositeType.calls = []
        }
        if (parent) {
          newCompositeType.parent = parent
        }
        newType = newCompositeType
        return <v.CompositeTypeVisitor>{
          onMember: function(oldMember){
            let newMember = <m.DecoratedMember<any>>copyElement(oldMember)
            newMember.name = oldMember.name
            newMember.parent = newCompositeType
            newMember.optional = oldMember.optional
            newMember.initializer = oldMember.initializer
            newMember.type = substituteType(allArgs, closedTypes, oldMember.type)
            copyDecorators((<m.DecoratedMember<any>>oldMember).decorators, newMember)

            newCompositeType.members[oldMember.name] = newMember
          },
          onIndex: function(oldIndex){
            let newIndex = <m.Index>copyElement(oldIndex)
            newIndex.parent = newCompositeType
            newIndex.keyType = oldIndex.keyType
            newIndex.valueType = substituteType(allArgs, closedTypes, oldIndex.valueType)

            newCompositeType.index = newIndex
          },
          onCall: function(oldCall){
            newCompositeType.calls.push(substituteType(allArgs, closedTypes, oldCall))
          }
        }
      },
      onFunctionType: function(oldFunctionType){
        let functionType = <m.DecoratedFunctionType>copyElement(oldFunctionType)
        functionType.parameters = []
        copyTypeParameters(allArgs, closedTypes, (<m.DecoratedFunctionType>oldFunctionType).typeParameters, functionType)
        newType = functionType
        return <v.FunctionTypeVisitor>{
          onType: function(oldType){
            functionType.type = substituteType(allArgs, closedTypes, oldType)
          },onParameter:function(oldParameter){
            let parameter = <m.Parameter>copyElement(oldParameter)
            parameter.parent = functionType
            parameter.name = oldParameter.name
            parameter.optional = oldParameter.optional
            parameter.initializer = oldParameter.initializer
            parameter.type = substituteType(allArgs, closedTypes, oldParameter.type)
            copyDecorators((<m.DecoratedParameter>oldParameter).decorators, parameter)
            functionType.parameters.push(parameter)
          }
        }
      },
      onUnionType: function(oldUnionType){
        let unionType = <m.UnionOrIntersectionType>copyElement(oldUnionType)
        unionType.types = oldUnionType.types.map(function(type){
          return substituteType(allArgs, closedTypes, type)
        })
        newType = unionType
      },
      onIntersectionType: function(oldIntersectionType){
        let intersectionType = <m.UnionOrIntersectionType>copyElement(oldIntersectionType)
        intersectionType.types = oldIntersectionType.types.map(function(type){
          return substituteType(allArgs, closedTypes, type)
        })
        newType = intersectionType
      },
      onTupleType: function(oldTupleType) {
        let tupleType = <m.UnionOrIntersectionType>copyElement(oldTupleType)
        tupleType.types = oldTupleType.elements.map(function(type){
          return substituteType(allArgs, closedTypes, type)
        })
        newType = tupleType
      },
      onClass: function(oldClass){
        newType = processClass(oldClass.typeConstructor, processTypeArgs(oldClass.typeConstructor, allArgs)[0], allArgs, closedTypes, oldClass.instanceType, oldClass.staticType, oldClass.extends, oldClass.implements, oldClass.decorators)
      },
      onInterface: function(oldInterface){
        newType = processInterface(oldInterface.typeConstructor, processTypeArgs(oldInterface.typeConstructor, allArgs)[0], allArgs, closedTypes, oldInterface.instanceType, oldInterface.extends)
      },
      onTypeAlias: function(oldTypeAlias) {
        newType = processTypeAlias(oldTypeAlias.typeConstructor, processTypeArgs(oldTypeAlias.typeConstructor, allArgs)[0], allArgs, closedTypes)
      },
      onTypeParameter: function(typeParameter) {
        newType = allArgs[typeParameter.name] || typeParameter
      }
    })
    if (!newType) {
      newType = type
    }
  }
  return <T>newType
}
