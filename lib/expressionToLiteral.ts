import * as s from './schema'

export function literalExpressionToLiteral(literalExpresion:s.Literal<any>) {
  return literalExpresion.value
}

export function arrayExpressionToLiteral(arrayExpression:s.ArrayExpression):Array<any> {
  return arrayExpression.elements.map(function(expression){
    return expressionToLiteral(expression)
  })
}

export function objectExpressionToLiteral(objectExpression:s.ObjectExpression):Object {
  let obj = {}

  Object.keys(objectExpression.properties).forEach(function(property){
    obj[property] = expressionToLiteral(objectExpression.properties[property])
  })

  return obj
}

export function expressionToLiteral(expression:s.Expression) {
  switch(expression.expressionKind) {
    case s.ExpressionKind.STRING:
    case s.ExpressionKind.BOOLEAN:
    case s.ExpressionKind.NUMBER:
      return literalExpressionToLiteral(<s.Literal<any>> expression)
    case s.ExpressionKind.TYPE_REFERENCE:
      // TODO
      return
    case s.ExpressionKind.ARRAY:
      return arrayExpressionToLiteral(<s.ArrayExpression> expression)
    case s.ExpressionKind.OBJECT:
      return objectExpressionToLiteral(<s.ObjectExpression> expression)
  }
}
