var model_1 = require('./model');
function arrayExpressionToLiteral(arrayExpression) {
    return arrayExpression.elements.map(function (expression) {
        return expressionToLiteral(expression);
    });
}
function objectExpressionToLiteral(objectExpression) {
    var obj = {};
    Object.keys(objectExpression.properties).forEach(function (property) {
        obj[property] = expressionToLiteral(objectExpression.properties[property]);
    });
    return obj;
}
function expressionToLiteral(expression) {
    switch (expression.expressionKind) {
        case model_1.ExpressionKind.PRIMITIVE:
            return expression.primitiveValue;
        case model_1.ExpressionKind.FUNCTION:
        case model_1.ExpressionKind.FUNCTION_CALL:
        case model_1.ExpressionKind.NEW:
            return undefined;
        case model_1.ExpressionKind.VALUE:
            return expression.value.initializer;
        case model_1.ExpressionKind.ENUM:
            var enumExpression = expression;
            return expressionToLiteral(enumExpression.enum.valueMap[enumExpression.value].initializer);
        case model_1.ExpressionKind.PROPERTY_ACCESS:
            var propertyAccessExpression = expression;
            var parent_1 = expressionToLiteral(propertyAccessExpression.parent);
            return parent_1 ? parent_1[propertyAccessExpression.property] : undefined;
        case model_1.ExpressionKind.CLASS_REFERENCE:
            return expression.classReference;
        case model_1.ExpressionKind.CLASS:
            return expression.class;
        case model_1.ExpressionKind.ARRAY:
            return arrayExpressionToLiteral(expression);
        case model_1.ExpressionKind.OBJECT:
            return objectExpressionToLiteral(expression);
    }
}
exports.expressionToLiteral = expressionToLiteral;
//# sourceMappingURL=expressionToLiteral.js.map