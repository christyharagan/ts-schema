import {reflective as m, ModelKind, TypeKind, PrimitiveTypeKind, ContainerKind} from './model'
import * as e from './equals'

const ROOT = <m.Module>{
  modelKind: ModelKind.CONTAINER,
  containerKind: ContainerKind.MODULE,
  name: ''
}
const FUNCTION = <m.Interface>{
  modelKind: ModelKind.TYPE,
  typeKind: TypeKind.INTERFACE,
  name: 'Function',
  constructorParent: ROOT,
  typeConstructor: <m.InterfaceConstructor>{
    name: 'Function',
    parent: ROOT
  }
}

export function isFunctionVoid(f: m.FunctionType) {
  return !f.type || (<m.PrimitiveType>f.type).primitiveTypeKind === PrimitiveTypeKind.VOID
}

export function isSubType(potentialSubType: m.Class|m.Interface, potentialSuperType: m.Class|m.Interface) {
  if (potentialSubType.typeKind === TypeKind.CLASS) {
    let cls = <m.Class>potentialSubType
    if (potentialSuperType.typeKind === TypeKind.CLASS) {
      if (potentialSubType.equals(potentialSuperType)) {
        return true
      }

      if (cls.extends) {
        return isSubType(cls.extends, potentialSuperType)
      } else {
        return false
      }
    } else {
      if (cls.implements) {
        for (let i = 0; i < cls.implements.length; i++) {
          if (isSubType(cls.implements[i], potentialSuperType)) {
            return true
          }
        }
        return false
      } else {
        return false
      }
    }
  } else {
    let int = <m.Interface>potentialSubType
    if (potentialSuperType.typeKind === TypeKind.CLASS) {
      return false
    } else {
      if (potentialSubType.equals(potentialSuperType)) {
        return true
      }

      if (int.extends) {
        for (let i = 0; i < int.extends.length; i++) {
          if (isSubType(int.extends[i], potentialSuperType)) {
            return true
          }
        }
        return false
      } else {
        return false
      }
    }
  }
}

export function isFunctionType(type: m.Type) {
  if ((<m.Type>type).typeKind === TypeKind.FUNCTION) {
    return true
  } else if ((<m.Type>type).typeKind === TypeKind.INTERFACE) {
    let int = <m.Interface>type
    return isSubType(int, FUNCTION)
    return false
  }

  return (<m.Type>type).typeKind === TypeKind.FUNCTION || ((<m.Interface>type).name === 'Function' && (<m.Interface>type).constructorParent.name === '')
}
