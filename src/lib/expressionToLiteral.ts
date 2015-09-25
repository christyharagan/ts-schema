import {reflective as m, ExpressionKind} from './model'

function arrayExpressionToLiteral(arrayExpression: m.ArrayExpression): Array<any> {
  return arrayExpression.elements.map(function(expression) {
    return expressionToLiteral(expression)
  })
}

function objectExpressionToLiteral(objectExpression: m.ObjectExpression): Object {
  let obj = {}

  Object.keys(objectExpression.properties).forEach(function(property) {
    obj[property] = expressionToLiteral(objectExpression.properties[property])
  })

  return obj
}

export function expressionToLiteral(expression: m.Expression<any>) {
  switch (expression.expressionKind) {
    case ExpressionKind.PRIMITIVE:
      return (<m.PrimitiveExpression<any>>expression).primitiveValue
    case ExpressionKind.FUNCTION:
    case ExpressionKind.FUNCTION_CALL:
    case ExpressionKind.NEW:
      return undefined
    case ExpressionKind.VALUE:
      return (<m.ValueExpression<any>>expression).value.initializer
    case ExpressionKind.ENUM:
      let enumExpression = <m.EnumExpression>expression
      return expressionToLiteral(enumExpression.enum.valueMap[enumExpression.value].initializer)
    case ExpressionKind.PROPERTY_ACCESS:
      let propertyAccessExpression = <m.PropertyAccessExpression<any>>expression
      let parent = expressionToLiteral(propertyAccessExpression.parent)
      return parent ? parent[propertyAccessExpression.property] : undefined
    case ExpressionKind.CLASS_REFERENCE:
      return (<m.ClassReferenceExpression>expression).classReference
    case ExpressionKind.CLASS:
      return (<m.ClassExpression>expression).class
    case ExpressionKind.ARRAY:
      return arrayExpressionToLiteral(<m.ArrayExpression>expression)
    case ExpressionKind.OBJECT:
      return objectExpressionToLiteral(<m.ObjectExpression>expression)
  }
}
