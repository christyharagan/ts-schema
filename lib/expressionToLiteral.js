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
        case 1:
            return expression.primitiveValue;
        case 3:
        case 9:
        case 11:
            return undefined;
        case 8:
            return expression.value.initializer;
        case 2:
            var enumExpression = expression;
            return expressionToLiteral(enumExpression.enum.valueMap[enumExpression.value].initializer);
        case 10:
            var propertyAccessExpression = expression;
            var parent_1 = expressionToLiteral(propertyAccessExpression.parent);
            return parent_1 ? parent_1[propertyAccessExpression.property] : undefined;
        case 7:
            return expression.classReference;
        case 4:
            return expression.class;
        case 6:
            return arrayExpressionToLiteral(expression);
        case 5:
            return objectExpressionToLiteral(expression);
    }
}
exports.expressionToLiteral = expressionToLiteral;
//# sourceMappingURL=expressionToLiteral.js.map