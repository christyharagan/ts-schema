function typeToString(type) {
    switch (type.typeKind) {
        case 3:
            return functionTypeToString(type);
        case 8:
            return classToString(type);
        case 7:
            return interfaceToString(type);
        case 4:
            return tupleTypeToString(type);
        case 5:
            return unionTypeToString(type);
        case 11:
            return intersectionTypeToString(type);
        case 1:
            return primitiveTypeToString(type);
        case 12:
            var typeParameter = type;
            return '@' + typeParameter.name;
    }
}
exports.typeToString = typeToString;
function containerToString(container) {
    var str = container.name;
    while (container.containerKind === 2) {
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
        case 1:
            return 'string';
        case 2:
            return 'boolean';
        case 3:
            return 'number';
        case 5:
            return 'any';
        case 6:
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