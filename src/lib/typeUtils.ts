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

// DO NOT REMOVE
// TODO: Implement full type ordering algorithm 

// export const enum TypeOrdering {
//   NONE,
//   A,
//   B,
//   EQUAL
// }
//
// function compareOrdering(oldOrdering:TypeOrdering, newOrdering:TypeOrdering) {
//   if (newOrdering === TypeOrdering.NONE) {
//     return TypeOrdering.NONE
//   } else if (oldOrdering === TypeOrdering.EQUAL) {
//     return newOrdering
//   } else if (newOrdering === TypeOrdering.EQUAL) {
//     return oldOrdering
//   } else if (newOrdering === oldOrdering) {
//     return oldOrdering
//   } else {
//     return TypeOrdering.NONE
//   }
// }
//
// function getCompositeTypeOrdering(cA:m.CompositeType, cB:m.CompositeType) {
//   let membersA = Object.keys(cA.members)
//   let membersB = Object.keys(cB.members)
//   let allMembers:{[name:string]:boolean} = {}
//   for (let i = 0; i < membersA.length; i++) {
//     allMembers[membersA[i]] = true
//   }
//   for (let i = 0; i < membersB.length; i++) {
//     allMembers[membersB[i]] = true
//   }
//   let typeOrdering:TypeOrdering
//   let allMemberNames = Object.keys(allMembers)
//   for (let i = 0; i < allMemberNames.length; i++) {
//     let mA = cA.members[allMemberNames[i]]
//     let mB = cB.members[allMemberNames[i]]
//     if ((!mA && !mB.optional) || (!mB && !mA.optional)) {
//       return TypeOrdering.NONE
//     } else if (mA && mB) {
//       if (!typeOrdering || typeOrdering === TypeOrdering.EQUAL) {
//         typeOrdering = getTypeOrdering(mA.type, mB.type)
//         if (typeOrdering === TypeOrdering.NONE) {
//           return TypeOrdering.NONE
//         }
//       } else if (typeOrdering !== getTypeOrdering(mA.type, mB.type)) {
//         return TypeOrdering.NONE
//       }
//     }
//   }
//   if (cA.index) {
//     if (cB.index) {
//       if (cA.index.keyType !== cB.index.keyType) {
//         if (cA.index.keyType !== PrimitiveTypeKind.ANY && cB.index.keyType !== PrimitiveTypeKind.ANY) {
//           return TypeOrdering.NONE
//         } else if (cA.index.keyType === PrimitiveTypeKind.ANY && typeOrdering === TypeOrdering.A) {
//           return TypeOrdering.NONE
//         } else if (cB.index.keyType === PrimitiveTypeKind.ANY && typeOrdering === TypeOrdering.B) {
//           return TypeOrdering.NONE
//         }
//       }
//       typeOrdering = compareOrdering(typeOrdering, getTypeOrdering(cA.index.valueType, cB.index.valueType))
//       if (typeOrdering === TypeOrdering.NONE) {
//         return TypeOrdering.NONE
//       }
//     } else if (typeOrdering === TypeOrdering.B) {
//       return TypeOrdering.NONE
//     } else if (typeOrdering === TypeOrdering.EQUAL) {
//       typeOrdering = TypeOrdering.A
//     }
//   } else if (cB.index) {
//     if (typeOrdering === TypeOrdering.A) {
//       return TypeOrdering.NONE
//     } else if (typeOrdering === TypeOrdering.EQUAL) {
//       typeOrdering = TypeOrdering.B
//     }
//   }
//   if (cA.calls) {
//     if (cB.calls) {
//       if (cA.calls.length === cB.calls.length || (cA.calls.length > cB.calls.length && typeOrdering !== TypeOrdering.B) || (cB.calls.length > cA.calls.length && typeOrdering !== TypeOrdering.A)) {
//         if (typeOrdering === TypeOrdering.EQUAL && cA.calls.length !== cB.calls.length) {
//           typeOrdering = cA.calls.length > cB.calls.length ? TypeOrdering.A : TypeOrdering.B
//         }
//         let i = 0
//         while (i < cA.calls.length && i < cB.calls.length) {
//           typeOrdering = compareOrdering(typeOrdering, getTypeOrdering(cA.calls[i], cB.calls[i]))
//           if (typeOrdering === TypeOrdering.NONE) {
//             return TypeOrdering.NONE
//           }
//         }
//       } else {
//         return TypeOrdering.NONE
//       }
//     } else if (typeOrdering === TypeOrdering.B) {
//       return TypeOrdering.NONE
//     } else if (typeOrdering === TypeOrdering.EQUAL) {
//       typeOrdering = TypeOrdering.A
//     }
//   } else if (cB.calls) {
//     if (typeOrdering === TypeOrdering.A) {
//       return TypeOrdering.NONE
//     } else if (typeOrdering === TypeOrdering.EQUAL) {
//       typeOrdering = TypeOrdering.B
//     }
//   }
//   return typeOrdering
// }
//
// export function getTypeOrdering(typeA:m.Type, typeB:m.Type) {
//   if (typeA.typeKind === typeB.typeKind) {
//     switch (typeA.typeKind) {
//       case TypeKind.PRIMITIVE: {
//         if ((<m.PrimitiveType>typeA).primitiveTypeKind === (<m.PrimitiveType>typeB).primitiveTypeKind) {
//           return TypeOrdering.EQUAL
//         } else if ((<m.PrimitiveType>typeA).primitiveTypeKind === PrimitiveTypeKind.ANY) {
//           return TypeOrdering.B
//         } else if ((<m.PrimitiveType>typeA).primitiveTypeKind === PrimitiveTypeKind.ANY) {
//           return TypeOrdering.A
//         } else {
//           return TypeOrdering.NONE
//         }
//       }
//       case TypeKind.ENUM:
//       case TypeKind.TYPE_PARAMETER:
//       case TypeKind.TYPE_QUERY:
//         return typeA.equals(typeB) ? TypeOrdering.EQUAL : TypeOrdering.NONE
//       case TypeKind.FUNCTION: {
//         let fA = <m.FunctionType> typeA
//         let fB = <m.FunctionType> typeB
//         if ((!fA.type && fB.type) || (fA.type && !fB.type)) {
//           return TypeOrdering.NONE
//         }
//         let typeOrdering = fA.type ? getTypeOrdering(fA.type, fB.type) : TypeOrdering.EQUAL
//         if (typeOrdering === TypeOrdering.NONE) {
//           return TypeOrdering.NONE
//         }
//         let i = 0
//         while (i < fA.parameters.length || i < fB.parameters.length) {
//           if ((i >= fA.parameters.length && !fB.parameters[i].optional) || (i >= fB.parameters.length && !fA.parameters[i].optional)) {
//             return TypeOrdering.NONE
//           } else {
//             let parameterOrdering = getTypeOrdering(fA.parameters[i].type, fB.parameters[i].type)
//             if (parameterOrdering !== TypeOrdering.EQUAL) {
//               if (parameterOrdering === TypeOrdering.NONE || typeOrdering === parameterOrdering) {
//                 return TypeOrdering.NONE
//               } else if (typeOrdering === TypeOrdering.EQUAL) {
//                 typeOrdering = parameterOrdering === TypeOrdering.A ? TypeOrdering.B : TypeOrdering.A
//               }
//             }
//           }
//           i++
//         }
//         return typeOrdering
//       }
//       case TypeKind.TUPLE: {
//         let tA = <m.TupleType>typeA
//         let tB = <m.TupleType>typeB
//         if (tA.elements.length !== tB.elements.length) {
//           return TypeOrdering.NONE
//         } else {
//           let elementOrdering = getTypeOrdering(tA.elements[0], tB.elements[0])
//           if (elementOrdering === TypeOrdering.NONE) {
//             return TypeOrdering.NONE
//           }
//           for (let i = 1 ; i < tA.elements.length; i++) {
//             if (elementOrdering !== getTypeOrdering(tA.elements[i], tB.elements[i])) {
//               return TypeOrdering.NONE
//             }
//           }
//           return elementOrdering
//         }
//       }
//       case TypeKind.INTERSECTION:
//       case TypeKind.UNION: {
//         let uA = <m.UnionOrIntersectionType>typeA
//         let uB = <m.UnionOrIntersectionType>typeB
//         let unionOrdering:TypeOrdering
//         if (uA.types.length < uB.types.length) {
//           unionOrdering = typeA.typeKind === TypeKind.UNION ? TypeOrdering.A : TypeOrdering.B
//         } else if (uA.types.length > uB.types.length) {
//           unionOrdering = typeA.typeKind === TypeKind.UNION ? TypeOrdering.B : TypeOrdering.A
//         } else {
//           unionOrdering = TypeOrdering.EQUAL
//         }
//         let i = 0
//         while (i < uA.types.length && i < uB.types.length) {
//           unionOrdering = compareOrdering(unionOrdering, getTypeOrdering(uA.types[i], uB.types[i]))
//           if (unionOrdering === TypeOrdering.NONE) {
//             return TypeOrdering.NONE
//           }
//         }
//         return unionOrdering
//       }
//       case TypeKind.COMPOSITE: {
//         return getCompositeTypeOrdering(<m.CompositeType>typeA, <m.CompositeType>typeB)
//       }
//       case TypeKind.INTERFACE: {
//         if (typeA.equals(typeB)) {
//           return true
//         }
//         let iA = <m.Interface>typeA
//         let iB = <m.Interface>typeB
//
//         function isSubType(candidateSuper:m.Interface|m.Class, candidateSub:m.Interface) {
//           if (candidateSuper.typeKind === TypeKind.INTERFACE) {
//             let int = <m.Interface>candidateSuper
//             if (int.extends) {
//               for (let i = 0; i < int.extends.length; i++) {
//                 if (candidateSub.equals(int.extends[i])) {
//                   return true
//                 } else {
//                   if (isSubType(int.extends[i], candidateSub)) {
//                     return true
//                   }
//                 }
//               }
//             }
//           } else {
//             let cls = <m.Class>candidateSuper
//             if (cls.implements) {
//               for (let i = 0; i < cls.implements.length; i++) {
//                 if (candidateSub.equals(cls.implements[i])) {
//                   return true
//                 } else {
//                   if (isSubType(cls.implements[i], candidateSub)) {
//                     return true
//                   }
//                 }
//               }
//             }
//           }
//           return false
//         }
//         if (isSubType(iA, iB)) {
//           return TypeOrdering.B
//         } else if (isSubType(iB, iA)) {
//           return TypeOrdering.A
//         } else {
//           return getCompositeTypeOrdering(iA.instanceType, iB.instanceType)
//         }
//       }
//       case TypeKind.CLASS: {
//         if (typeA.equals(typeB)) {
//           return true
//         }
//         let cA = <m.Class>typeA
//         let cB = <m.Class>typeB
//
//         let e = cA.extends
//         while (e) {
//           if (typeB.equals(e)) {
//             return TypeOrdering.A
//           } else {
//             e = e.extends
//           }
//         }
//         e = cB.extends
//         while (e) {
//           if (typeA.equals(e)) {
//             return TypeOrdering.B
//           } else {
//             e = e.extends
//           }
//         }
//         let typeOrdering = getCompositeTypeOrdering(cA.instanceType, cB.instanceType)
//         if (typeOrdering === TypeOrdering.NONE) {
//           return TypeOrdering.NONE
//         } else {
//           let staticTypeOrdering = getCompositeTypeOrdering(cA.staticType, cB.staticType)
//           if (typeOrdering === TypeOrdering.EQUAL || staticTypeOrdering === typeOrdering) {
//             return staticTypeOrdering
//           } else  {
//             return TypeOrdering.NONE
//           }
//         }
//       }
//       case TypeKind.TYPE_ALIAS: {
//         return getTypeOrdering((<m.TypeAlias<any>>typeA).type, (<m.TypeAlias<any>>typeB).type)
//       }
//     }
//   } else if (typeA.typeKind === TypeKind.PRIMITIVE && (<m.PrimitiveType>typeA).primitiveTypeKind === PrimitiveTypeKind.ANY) {
//     return TypeOrdering.B
//   } else if (typeA.typeKind === TypeKind.PRIMITIVE && (<m.PrimitiveType>typeA).primitiveTypeKind === PrimitiveTypeKind.ANY) {
//     return TypeOrdering.A
//   } else if (typeA.typeKind === TypeKind.TYPE_ALIAS) {
//     return getTypeOrdering((<m.TypeAlias<any>>typeA).type, typeB)
//   } else if (typeA.typeKind === TypeKind.TYPE_ALIAS) {
//     return getTypeOrdering(typeA, (<m.TypeAlias<any>>typeB).type)
//   } else if (typeA.typeKind === TypeKind.UNION) {
//     let union = <m.UnionOrIntersectionType>typeA
//     for (let i = 0; i < union.types.length; i++) {
//       let ordering = getTypeOrdering(union.types[i], typeB)
//       if (ordering === TypeOrdering.B || ordering === TypeOrdering.EQUAL) {
//         return TypeOrdering.B
//       }
//     }
//     return TypeOrdering.NONE
//   } else if (typeB.typeKind === TypeKind.UNION) {
//     let union = <m.UnionOrIntersectionType>typeB
//     for (let i = 0; i < union.types.length; i++) {
//       let ordering = getTypeOrdering(typeA, union.types[i])
//       if (ordering === TypeOrdering.A || ordering === TypeOrdering.EQUAL) {
//         return TypeOrdering.A
//       }
//     }
//     return TypeOrdering.NONE
//   } else if (typeA.typeKind === TypeKind.INTERSECTION) {
//     let inter = <m.UnionOrIntersectionType>typeA
//     for (let i = 0; i < inter.types.length; i++) {
//       let ordering = getTypeOrdering(inter.types[i], typeB)
//       if (ordering === TypeOrdering.A || ordering === TypeOrdering.EQUAL) {
//         return TypeOrdering.A
//       }
//     }
//     return TypeOrdering.NONE
//   } else if (typeB.typeKind === TypeKind.INTERSECTION) {
//     let union = <m.UnionOrIntersectionType>typeB
//     for (let i = 0; i < union.types.length; i++) {
//       let ordering = getTypeOrdering(typeA, union.types[i])
//       if (ordering === TypeOrdering.B || ordering === TypeOrdering.EQUAL) {
//         return TypeOrdering.B
//       }
//     }
//     return TypeOrdering.NONE
//   } else if (typeA.typeKind === TypeKind.COMPOSITE) {
//     if (typeB.typeKind === TypeKind.INTERFACE) {
//       return getCompositeTypeOrdering(<m.CompositeType>typeA, (<m.Interface>typeB).instanceType)
//     } else if (typeB.typeKind === TypeKind.CLASS) {
//       return getCompositeTypeOrdering(<m.CompositeType>typeA, (<m.Class>typeB).instanceType)
//     } else {
//       return TypeOrdering.NONE
//     }
//   } else if (typeB.typeKind === TypeKind.COMPOSITE) {
//     if (typeA.typeKind === TypeKind.INTERFACE) {
//       return getCompositeTypeOrdering((<m.Interface>typeA).instanceType, <m.CompositeType>typeB)
//     } else if (typeA.typeKind === TypeKind.CLASS) {
//       return getCompositeTypeOrdering((<m.Class>typeA).instanceType, <m.CompositeType>typeB)
//     } else {
//       return TypeOrdering.NONE
//     }
//   } else if (typeA.typeKind === TypeKind.CLASS) {
//     if (typeB.typeKind === TypeKind.INTERFACE) {
//       let cls = <m.Class>typeA
//       let int = <m.Interface>typeB
//       return getCompositeTypeOrdering(cls.instanceType, int.instanceType)
//     } else {
//       return TypeOrdering.NONE
//     }
//   } else if (typeB.typeKind === TypeKind.CLASS) {
//     if (typeA.typeKind === TypeKind.INTERFACE) {
//       let cls = <m.Class>typeB
//       let int = <m.Interface>typeA
//       return getCompositeTypeOrdering(int.instanceType, cls.instanceType)
//     } else {
//       return TypeOrdering.NONE
//     }
//   } else {
//     return TypeOrdering.NONE
//   }
// }

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
