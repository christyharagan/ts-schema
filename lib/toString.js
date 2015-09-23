var model_1 = require('./model');
function typeToString(type) {
    switch (type.typeKind) {
        case model_1.TypeKind.FUNCTION:
            return functionTypeToString(type);
        case model_1.TypeKind.CLASS:
            return classToString(type);
        case model_1.TypeKind.INTERFACE:
            return interfaceToString(type);
        case model_1.TypeKind.TUPLE:
            return tupleTypeToString(type);
        case model_1.TypeKind.UNION:
            return unionTypeToString(type);
        case model_1.TypeKind.INTERSECTION:
            return intersectionTypeToString(type);
        case model_1.TypeKind.PRIMITIVE:
            return primitiveTypeToString(type);
        case model_1.TypeKind.TYPE_PARAMETER:
            var typeParameter = type;
            return '@' + typeParameter.name;
    }
}
exports.typeToString = typeToString;
function containerToString(container) {
    var str = container.name;
    while (container.containerKind === model_1.ContainerKind.NAMESPACE) {
        container = container.parent;
        if (container.name !== '') {
            str = container.name + ':' + str;
        }
    }
    return str;
}
exports.containerToString = containerToString;
function typeAliasConstructorToString(typeAliasConstructor) {
    return containerToString(typeAliasConstructor.parent) + ':' + typeAliasConstructor.name;
}
exports.typeAliasConstructorToString = typeAliasConstructorToString;
function classConstructorToString(classConstructor) {
    return containerToString(classConstructor.parent) + ':' + classConstructor.name;
}
exports.classConstructorToString = classConstructorToString;
function interfaceConstructorToString(interfaceConstructor) {
    return containerToString(interfaceConstructor.parent) + ':' + interfaceConstructor.name;
}
exports.interfaceConstructorToString = interfaceConstructorToString;
function primitiveTypeToString(type) {
    switch (type.primitiveTypeKind) {
        case model_1.PrimitiveTypeKind.STRING:
            return 'string';
        case model_1.PrimitiveTypeKind.BOOLEAN:
            return 'boolean';
        case model_1.PrimitiveTypeKind.NUMBER:
            return 'number';
        case model_1.PrimitiveTypeKind.ANY:
            return 'any';
        case model_1.PrimitiveTypeKind.SYMBOL:
            return 'symbol';
    }
}
exports.primitiveTypeToString = primitiveTypeToString;
function functionTypeToString(type) {
    var str = '(';
    if (type.parameters.length > 0) {
        str += type.parameters[0].name + ":" + typeToString(type.parameters[0].type);
        for (var i = 1; i < type.parameters.length; i++) {
            str += "," + type.parameters[0].name + ":" + typeToString(type.parameters[0].type);
        }
    }
    return str + (")=>(" + (type.type ? typeToString(type.type) : 'void') + ")");
}
exports.functionTypeToString = functionTypeToString;
function tupleTypeToString(type) {
    var str = '[';
    str += typeToString(type.elements[0]);
    for (var i = 1; i < type.elements.length; i++) {
        str += ',' + typeToString(type.elements[i]);
    }
    return str + ']';
}
exports.tupleTypeToString = tupleTypeToString;
function unionTypeToString(type) {
    var str = typeToString(type.types[0]);
    for (var i = 1; type.types.length; i++) {
        str += '|' + typeToString(type.types[i]);
    }
    return str;
}
exports.unionTypeToString = unionTypeToString;
function intersectionTypeToString(type) {
    var str = typeToString(type.types[0]);
    for (var i = 1; type.types.length; i++) {
        str += '&' + typeToString(type.types[i]);
    }
    return str;
}
exports.intersectionTypeToString = intersectionTypeToString;
function typeArgsToString(typeArgs) {
    if (typeArgs && typeArgs.length > 0) {
        var str = '<';
        str += typeToString(typeArgs[0]);
        for (var i = 1; i < typeArgs.length; i++) {
            str += ',' + typeToString(typeArgs[i]);
        }
        return str + '>';
    }
    else {
        return '';
    }
}
function classToString(type) {
    var str = classConstructorToString(type.typeConstructor);
    str += typeArgsToString(type.typeArguments);
    return str;
}
exports.classToString = classToString;
function interfaceToString(type) {
    var str = interfaceConstructorToString(type.typeConstructor);
    str += typeArgsToString(type.typeArguments);
    return str;
}
exports.interfaceToString = interfaceToString;
//# sourceMappingURL=toString.js.map