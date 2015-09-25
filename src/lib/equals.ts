import {reflective as m, ContainerKind, Primitive} from './model'

export function createEquals<M extends m.ModelElement>(specificEquals: (m: M) => boolean) {
  return function(m: m.ModelElement) {
    let forElement = <M>this
    if (forElement.modelKind === m.modelKind) {
      return specificEquals.call(forElement, <M>m)
    } else {
      return false
    }
  }
}

export function createTypeEquals<M extends m.Type>(specificEquals: (m: M) => boolean) {
  return createEquals(function(type: M) {
    let forType = <M>this
    if (type.typeKind === forType.typeKind) {
      return specificEquals.call(forType, type)
    } else {
      return false
    }
  })
}

export function createExpressionEquals<M extends m.Expression<any>>(specificEquals: (m: M) => boolean) {
  let forExpression = <M>this
  return createEquals.call(forExpression, function(expression: M) {
    if (expression.expressionKind === forExpression.expressionKind) {
      return specificEquals.call(forExpression, expression)
    } else {
      return false
    }
  })
}

export const containerEquals = createEquals(function(tc: m.Container) {
  let typeContainer: m.Container = this
  if (typeContainer.name === tc.name && typeContainer.containerKind === tc.containerKind) {
    if (tc.containerKind === ContainerKind.NAMESPACE) {
      return (<m.Namespace>typeContainer).parent.equals((<m.Namespace>tc).parent)
    } else {
      return true
    }
  } else {
    return false
  }
})

export const containedEquals = createEquals(function(c: m.Contained) {
  let contained: m.Contained = this
  return contained.name === c.name && contained.parent.equals(c.parent)
})

export const protoClassEquals = createTypeEquals(function(pc: m.ProtoClass) {
  let protoClass: m.ProtoClass = this
  return protoClass.instanceType.equals(pc.instanceType) && protoClass.staticType.equals(pc.staticType)
})

export const constructableTypeEquals = createTypeEquals(function(c: m.ConstructableType<any>) {
  let cls: m.ConstructableType<any> = this
  if (!cls.typeConstructor.equals(c.typeConstructor)) {
    return false
  }
  if ((cls.typeArguments && !c.typeArguments) || (!cls.typeArguments && c.typeArguments)) {
    return false
  }
  if (cls.typeArguments) {
    if (cls.typeArguments.length !== c.typeArguments.length) {
      return false
    }
    for (let j = 0; j < cls.typeArguments.length; j++) {
      if (!cls.typeArguments[j].equals(c.typeArguments[j])) {
        return false
      }
    }
  }
  return true
})

export const typeParameterEquals = createEquals(function(tp: m.TypeParameter<m.ModelElement>) {
  let typeParameter: m.TypeParameter<m.ModelElement> = this
  return typeParameter.name === tp.name && typeParameter.parent.equals(tp.parent)
})

export const compositeTypeEquals = createTypeEquals(function(ct: m.CompositeType) {
  let compositeType: m.CompositeType = this
  let keys = Object.keys(compositeType.members)
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i]
    let thisMember = compositeType.members[key]
    let thatMember = ct.members[key]
    if (!thatMember || !thisMember.type.equals(thatMember.type) || !thisMember.optional === thatMember.optional) {
      return false
    }
    if (compositeType.index && (!ct.index || compositeType.index.keyType !== ct.index.keyType || !compositeType.index.valueType.equals(ct.index.valueType))) {
      return false
    }
    if (compositeType.calls) {
      if (!ct.calls || compositeType.calls.length !== ct.calls.length) {
        return false
      }
      for (let j = 0; j < compositeType.calls.length; j++) {
        if (!compositeType.calls[j].equals(ct.calls[j])) {
          return false
        }
      }
    }
  }
  return true
})

export const indexEquals = createEquals(function(i: m.Index) {
  let index: m.Index = this
  return index.parent.equals(i.parent)
})

export const memberEquals = createEquals(function <P extends m.CompositeType>(m: m.Member<P>) {
  let member: m.Member<P> = this
  return member.parent.equals(m.parent)
})

export const enumMemberEquals = createEquals(function(em: m.EnumMember) {
  let enumMember: m.EnumMember = this
  return enumMember.name === em.name && enumMember.parent.equals(em.parent)
})

export const primitiveTypeEquals = createTypeEquals(function(p: m.PrimitiveType) {
  let primitiveType: m.PrimitiveType = this
  return primitiveType.primitiveTypeKind === p.primitiveTypeKind
})

export const decoratorTypeEquals = function(m: m.ModelElement) {
  let decoratorType: m.DecoratorType = this
  if (functionTypeEquals(m)) {
    return decoratorType.decoratorTypeKind === (<m.DecoratorType>m).decoratorTypeKind
  } else {
    return false
  }
}

export const functionTypeEquals = createTypeEquals(function(ft: m.FunctionType) {
  let functionType: m.FunctionType = this
  if (ft.parameters.length !== functionType.parameters.length) {
    return false
  }
  for (let i = 0; i < ft.parameters.length; i++) {
    let thisParameter = functionType.parameters[i]
    let thatParameter = ft.parameters[i]
    if (thisParameter.name !== thatParameter.name || !thisParameter.type.equals(thatParameter.type) || thisParameter.optional !== thatParameter.optional) {
      return false
    }
  }
  if ((functionType.type && !ft.type) || (!functionType.type && ft.type)) {
    return false
  }
  if (functionType.type && !functionType.type.equals(ft.type)) {
    return false
  }
  if ((functionType.typeParameters && !ft.typeParameters) || (!functionType.typeParameters && ft.typeParameters)) {
    return false
  }
  if (functionType.typeParameters) {
    if (functionType.typeParameters.length !== ft.typeParameters.length) {
      return false
    }
    for (let i = 0; i < functionType.typeParameters.length; i++) {
      let thisParameter = functionType.typeParameters[i]
      let thatParameter = ft.typeParameters[i]

      if ((thisParameter.extends && !thatParameter.extends) || (!thisParameter.extends && thatParameter.extends)) {
        return false
      }
      if (thisParameter.extends && thisParameter.name !== thatParameter.name && !thisParameter.extends.equals(thatParameter.extends)) {
        return false
      }
    }
  }
  return true
})

export const parameterEquals = createEquals(function(p: m.Parameter) {
  let parameter: m.Parameter = this
  return parameter.name === p.name && parameter.parent.equals(p.parent)
})

export const tupleTypeEquals = createTypeEquals(function(t: m.TupleType) {
  let tupleType: m.TupleType = this
  if (tupleType.elements.length !== t.elements.length) {
    return false
  }
  for (let i = 0; i < tupleType.elements.length; i++) {
    if (!tupleType.elements[i].equals(t.elements[i])) {
      return false
    }
  }
  return true
})

export const unionOrIntersectionTypeEquals = createTypeEquals(function(t: m.UnionOrIntersectionType) {
  let unionType: m.UnionOrIntersectionType = this
  if (unionType.types.length !== t.types.length) {
    return false
  }
  for (let i = 0; i < unionType.types.length; i++) {
    if (!unionType.types[i].equals(t.types[i])) {
      return false
    }
  }
  return true
})

export const typeQueryEquals = createTypeEquals(function(tQ: m.TypeQuery) {
  let typeQuery: m.TypeQuery = this
  return typeQuery.type.equals(tQ.type)
})

export const valueExpressionEquals = createExpressionEquals(function <T extends m.Type>(vE: m.ValueExpression<T>) {
  let valueExpression: m.ValueExpression<T> = this
  return valueExpression.value.equals(vE.value)
})

export const primitiveExpressionEquals = createExpressionEquals(function <T extends Primitive>(rE: m.PrimitiveExpression<T>) {
  let literalExpression: m.PrimitiveExpression<T> = this
  return literalExpression.primitiveValue === rE.primitiveValue
})

export const arrayExpressionEquals = createExpressionEquals(function(aE: m.ArrayExpression) {
  let arrayExpression: m.ArrayExpression = this
  if (arrayExpression.elements.length !== aE.elements.length) {
    return false
  }
  for (let i = 0; i < arrayExpression.elements.length; i++) {
    let eq = arrayExpression.elements[i].equals(aE.elements[i])
    if (eq === undefined) {
      return undefined
    } else if (!eq) {
      return false
    }
  }
  return true
})

export const objectExpressionEquals = createExpressionEquals(function(oE: m.ObjectExpression) {
  let objectExpression: m.ObjectExpression = this
  let keys = Object.keys(objectExpression)
  for (let i = 0; i < keys.length; i++) {
    let thisProp = objectExpression[keys[i]]
    let thatProp = oE[keys[i]]
    let eq = thisProp.equals(thatProp)
    if (eq === undefined) {
      return undefined
    } else if (!thatProp || !eq) {
      return false
    }
  }
  return true
})

export const classExpressionEquals = createExpressionEquals(function(cE: m.ClassExpression) {
  let classExpression: m.ClassExpression = this
  return classExpression.class.equals(cE.class)
})

export const classReferenceExpressionEquals = createExpressionEquals(function(crE: m.ClassReferenceExpression) {
  let classReferenceExpression: m.ClassReferenceExpression = this
  return classReferenceExpression.classReference.equals(crE.classReference)
})

export const functionExpressionEquals = createExpressionEquals(function(cE: m.FunctionExpression) {
  // We cannot determine equality, so return an undefined answer
  return undefined
})

export const functionCallExpressionEquals = createExpressionEquals(function(cE: m.FunctionCallExpression<any>) {
  let callExpression: m.FunctionCallExpression<any> = this
  let eq = callExpression.function.equals(cE.function)
  if (!eq) {
    return eq
  } else {
    if (callExpression.arguments.length !== cE.arguments.length) {
      return false
    }
    for (let i = 0; i < callExpression.arguments.length; i++) {
      let eq = callExpression.arguments[i].equals(cE.arguments[i])
      if (!eq) {
        return eq
      }
    }
    return true
  }
})

export const newExpressionEquals = createExpressionEquals(function(nE: m.NewExpression<any>){
  let newExpression: m.NewExpression<any> = this
  let eq = newExpression.classReference.equals(nE.classReference)
  if (!eq) {
    return eq
  } else {
    if (newExpression.arguments.length !== nE.arguments.length) {
      return false
    }
    for (let i = 0; i < newExpression.arguments.length; i++) {
      let eq = newExpression.arguments[i].equals(nE.arguments[i])
      if (!eq) {
        return eq
      }
    }
    return true
  }
})

export const propertyAccessExpressionEquals = createExpressionEquals(function <T extends m.Type>(paE: m.PropertyAccessExpression<T>) {
  let propertyAccessExpression: m.PropertyAccessExpression<T> = this
  let eq = propertyAccessExpression.parent.equals(paE.parent)
  if (eq === undefined) {
    return undefined
  } else {
    return eq && propertyAccessExpression.property === paE.property
  }
})

export const enumExpressionEquals = createExpressionEquals(function(eE: m.EnumExpression) {
  let enumExpression: m.EnumExpression = this
  return enumExpression.enum.equals(eE.enum) && enumExpression.value === eE.value
})

export const decoratorEquals = createEquals(function <P extends m.Decorated>(d: m.Decorator<P>) {
  let decorator: m.Decorator<P> = this
  if (!decorator.parent.equals(d.parent)) {
    return false
  }
  if (decorator.parameters && !d.parameters || (!decorator.parameters && d.parameters)) {
    return false
  }
  if (decorator.parameters) {
    if (decorator.parameters.length !== d.parameters.length) {
      return false
    }
    for (let i = 0; i < decorator.parameters.length; i++) {
      if (!decorator.parameters[i].equals(d.parameters[i])) {
        return false
      }
    }
  }
  return true
})
