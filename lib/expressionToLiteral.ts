import * as m from './model'

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

export function expressionToLiteral(expression: m.Expression) {
  switch (expression.expressionKind) {
    case m.ExpressionKind.STRING:
    case m.ExpressionKind.BOOLEAN:
    case m.ExpressionKind.NUMBER:
      return (<m.LiteralExpression<any>> expression).value
    case m.ExpressionKind.CLASS:
      let clsExpression = <m.ClassExpression> expression
      return clsExpression.class
    case m.ExpressionKind.ARRAY:
      return arrayExpressionToLiteral(<m.ArrayExpression> expression)
    case m.ExpressionKind.OBJECT:
      return objectExpressionToLiteral(<m.ObjectExpression> expression)
  }
}
