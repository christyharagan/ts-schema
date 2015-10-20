function createEquals(specificEquals) {
    return function (m) {
        var forElement = this;
        if (forElement.modelKind === m.modelKind) {
            return specificEquals.call(forElement, m);
        }
        else {
            return false;
        }
    };
}
exports.createEquals = createEquals;
function createTypeEquals(specificEquals) {
    return createEquals(function (type) {
        var forType = this;
        if (type.typeKind === forType.typeKind) {
            return specificEquals.call(forType, type);
        }
        else {
            return false;
        }
    });
}
exports.createTypeEquals = createTypeEquals;
function createExpressionEquals(specificEquals) {
    var forExpression = this;
    return createEquals.call(forExpression, function (expression) {
        if (expression.expressionKind === forExpression.expressionKind) {
            return specificEquals.call(forExpression, expression);
        }
        else {
            return false;
        }
    });
}
exports.createExpressionEquals = createExpressionEquals;
exports.containerEquals = createEquals(function (tc) {
    var typeContainer = this;
    if (typeContainer.name === tc.name && typeContainer.containerKind === tc.containerKind) {
        if (tc.containerKind === 2) {
            return typeContainer.parent.equals(tc.parent);
        }
        else {
            return true;
        }
    }
    else {
        return false;
    }
});
exports.containedEquals = createEquals(function (c) {
    var contained = this;
    return contained.name === c.name && contained.parent.equals(c.parent);
});
exports.protoClassEquals = createTypeEquals(function (pc) {
    var protoClass = this;
    return protoClass.instanceType.equals(pc.instanceType) && protoClass.staticType.equals(pc.staticType);
});
exports.constructableTypeEquals = createTypeEquals(function (c) {
    var cls = this;
    if (!cls.typeConstructor.equals(c.typeConstructor)) {
        return false;
    }
    if ((cls.typeArguments && !c.typeArguments) || (!cls.typeArguments && c.typeArguments)) {
        return false;
    }
    if (cls.typeArguments) {
        if (cls.typeArguments.length !== c.typeArguments.length) {
            return false;
        }
        for (var j = 0; j < cls.typeArguments.length; j++) {
            if (!cls.typeArguments[j].equals(c.typeArguments[j])) {
                return false;
            }
        }
    }
    return true;
});
exports.typeParameterEquals = createEquals(function (tp) {
    var typeParameter = this;
    return typeParameter.name === tp.name && typeParameter.parent.equals(tp.parent);
});
exports.compositeTypeEquals = createTypeEquals(function (ct) {
    var compositeType = this;
    var keys = Object.keys(compositeType.members);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var thisMember = compositeType.members[key];
        var thatMember = ct.members[key];
        if (!thatMember || !thisMember.type.equals(thatMember.type) || !thisMember.optional === thatMember.optional) {
            return false;
        }
        if (compositeType.index && (!ct.index || compositeType.index.keyType !== ct.index.keyType || !compositeType.index.valueType.equals(ct.index.valueType))) {
            return false;
        }
        if (compositeType.calls) {
            if (!ct.calls || compositeType.calls.length !== ct.calls.length) {
                return false;
            }
            for (var j = 0; j < compositeType.calls.length; j++) {
                if (!compositeType.calls[j].equals(ct.calls[j])) {
                    return false;
                }
            }
        }
    }
    return true;
});
exports.indexEquals = createEquals(function (i) {
    var index = this;
    return index.parent.equals(i.parent);
});
exports.memberEquals = createEquals(function (m) {
    var member = this;
    return member.parent.equals(m.parent);
});
exports.enumMemberEquals = createEquals(function (em) {
    var enumMember = this;
    return enumMember.name === em.name && enumMember.parent.equals(em.parent);
});
exports.primitiveTypeEquals = createTypeEquals(function (p) {
    var primitiveType = this;
    return primitiveType.primitiveTypeKind === p.primitiveTypeKind;
});
exports.decoratorTypeEquals = function (m) {
    var decoratorType = this;
    if (exports.functionTypeEquals(m)) {
        return decoratorType.decoratorTypeKind === m.decoratorTypeKind;
    }
    else {
        return false;
    }
};
exports.functionTypeEquals = createTypeEquals(function (ft) {
    var functionType = this;
    if (ft.parameters.length !== functionType.parameters.length) {
        return false;
    }
    for (var i = 0; i < ft.parameters.length; i++) {
        var thisParameter = functionType.parameters[i];
        var thatParameter = ft.parameters[i];
        if (thisParameter.name !== thatParameter.name || !thisParameter.type.equals(thatParameter.type) || thisParameter.optional !== thatParameter.optional) {
            return false;
        }
    }
    if ((functionType.type && !ft.type) || (!functionType.type && ft.type)) {
        return false;
    }
    if (functionType.type && !functionType.type.equals(ft.type)) {
        return false;
    }
    if ((functionType.typeParameters && !ft.typeParameters) || (!functionType.typeParameters && ft.typeParameters)) {
        return false;
    }
    if (functionType.typeParameters) {
        if (functionType.typeParameters.length !== ft.typeParameters.length) {
            return false;
        }
        for (var i = 0; i < functionType.typeParameters.length; i++) {
            var thisParameter = functionType.typeParameters[i];
            var thatParameter = ft.typeParameters[i];
            if ((thisParameter.extends && !thatParameter.extends) || (!thisParameter.extends && thatParameter.extends)) {
                return false;
            }
            if (thisParameter.extends && thisParameter.name !== thatParameter.name && !thisParameter.extends.equals(thatParameter.extends)) {
                return false;
            }
        }
    }
    return true;
});
exports.parameterEquals = createEquals(function (p) {
    var parameter = this;
    return parameter.name === p.name && parameter.parent.equals(p.parent);
});
exports.tupleTypeEquals = createTypeEquals(function (t) {
    var tupleType = this;
    if (tupleType.elements.length !== t.elements.length) {
        return false;
    }
    for (var i = 0; i < tupleType.elements.length; i++) {
        if (!tupleType.elements[i].equals(t.elements[i])) {
            return false;
        }
    }
    return true;
});
exports.unionOrIntersectionTypeEquals = createTypeEquals(function (t) {
    var unionType = this;
    if (unionType.types.length !== t.types.length) {
        return false;
    }
    for (var i = 0; i < unionType.types.length; i++) {
        if (!unionType.types[i].equals(t.types[i])) {
            return false;
        }
    }
    return true;
});
exports.typeQueryEquals = createTypeEquals(function (tQ) {
    var typeQuery = this;
    return typeQuery.type.equals(tQ.type);
});
exports.valueExpressionEquals = createExpressionEquals(function (vE) {
    var valueExpression = this;
    return valueExpression.value.equals(vE.value);
});
exports.primitiveExpressionEquals = createExpressionEquals(function (rE) {
    var literalExpression = this;
    return literalExpression.primitiveValue === rE.primitiveValue;
});
exports.arrayExpressionEquals = createExpressionEquals(function (aE) {
    var arrayExpression = this;
    if (arrayExpression.elements.length !== aE.elements.length) {
        return false;
    }
    for (var i = 0; i < arrayExpression.elements.length; i++) {
        var eq = arrayExpression.elements[i].equals(aE.elements[i]);
        if (eq === undefined) {
            return undefined;
        }
        else if (!eq) {
            return false;
        }
    }
    return true;
});
exports.objectExpressionEquals = createExpressionEquals(function (oE) {
    var objectExpression = this;
    var keys = Object.keys(objectExpression);
    for (var i = 0; i < keys.length; i++) {
        var thisProp = objectExpression[keys[i]];
        var thatProp = oE[keys[i]];
        var eq = thisProp.equals(thatProp);
        if (eq === undefined) {
            return undefined;
        }
        else if (!thatProp || !eq) {
            return false;
        }
    }
    return true;
});
exports.classExpressionEquals = createExpressionEquals(function (cE) {
    var classExpression = this;
    return classExpression.class.equals(cE.class);
});
exports.classReferenceExpressionEquals = createExpressionEquals(function (crE) {
    var classReferenceExpression = this;
    return classReferenceExpression.classReference.equals(crE.classReference);
});
exports.functionExpressionEquals = createExpressionEquals(function (cE) {
    return undefined;
});
exports.functionCallExpressionEquals = createExpressionEquals(function (cE) {
    var callExpression = this;
    var eq = callExpression.function.equals(cE.function);
    if (!eq) {
        return eq;
    }
    else {
        if (callExpression.arguments.length !== cE.arguments.length) {
            return false;
        }
        for (var i = 0; i < callExpression.arguments.length; i++) {
            var eq_1 = callExpression.arguments[i].equals(cE.arguments[i]);
            if (!eq_1) {
                return eq_1;
            }
        }
        return true;
    }
});
exports.newExpressionEquals = createExpressionEquals(function (nE) {
    var newExpression = this;
    var eq = newExpression.classReference.equals(nE.classReference);
    if (!eq) {
        return eq;
    }
    else {
        if (newExpression.arguments.length !== nE.arguments.length) {
            return false;
        }
        for (var i = 0; i < newExpression.arguments.length; i++) {
            var eq_2 = newExpression.arguments[i].equals(nE.arguments[i]);
            if (!eq_2) {
                return eq_2;
            }
        }
        return true;
    }
});
exports.propertyAccessExpressionEquals = createExpressionEquals(function (paE) {
    var propertyAccessExpression = this;
    var eq = propertyAccessExpression.parent.equals(paE.parent);
    if (eq === undefined) {
        return undefined;
    }
    else {
        return eq && propertyAccessExpression.property === paE.property;
    }
});
exports.enumExpressionEquals = createExpressionEquals(function (eE) {
    var enumExpression = this;
    return enumExpression.enum.equals(eE.enum) && enumExpression.value === eE.value;
});
exports.decoratorEquals = createEquals(function (d) {
    var decorator = this;
    if (!decorator.parent.equals(d.parent)) {
        return false;
    }
    if (decorator.parameters && !d.parameters || (!decorator.parameters && d.parameters)) {
        return false;
    }
    if (decorator.parameters) {
        if (decorator.parameters.length !== d.parameters.length) {
            return false;
        }
        for (var i = 0; i < decorator.parameters.length; i++) {
            if (!decorator.parameters[i].equals(d.parameters[i])) {
                return false;
            }
        }
    }
    return true;
});
//# sourceMappingURL=equals.js.map