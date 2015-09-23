var model_1 = require('./model');
var ROOT = {
    modelKind: model_1.ModelKind.CONTAINER,
    containerKind: model_1.ContainerKind.MODULE,
    name: ''
};
var FUNCTION = {
    modelKind: model_1.ModelKind.TYPE,
    typeKind: model_1.TypeKind.INTERFACE,
    name: 'Function',
    constructorParent: ROOT,
    typeConstructor: {
        name: 'Function',
        parent: ROOT
    }
};
function isFunctionVoid(f) {
    return !f.type || f.type.primitiveTypeKind === model_1.PrimitiveTypeKind.VOID;
}
exports.isFunctionVoid = isFunctionVoid;
function isSubType(potentialSubType, potentialSuperType) {
    if (potentialSubType.typeKind === model_1.TypeKind.CLASS) {
        var cls = potentialSubType;
        if (potentialSuperType.typeKind === model_1.TypeKind.CLASS) {
            if (potentialSubType.equals(potentialSuperType)) {
                return true;
            }
            if (cls.extends) {
                return isSubType(cls.extends, potentialSuperType);
            }
            else {
                return false;
            }
        }
        else {
            if (cls.implements) {
                for (var i = 0; i < cls.implements.length; i++) {
                    if (isSubType(cls.implements[i], potentialSuperType)) {
                        return true;
                    }
                }
                return false;
            }
            else {
                return false;
            }
        }
    }
    else {
        var int = potentialSubType;
        if (potentialSuperType.typeKind === model_1.TypeKind.CLASS) {
            return false;
        }
        else {
            if (potentialSubType.equals(potentialSuperType)) {
                return true;
            }
            if (int.extends) {
                for (var i = 0; i < int.extends.length; i++) {
                    if (isSubType(int.extends[i], potentialSuperType)) {
                        return true;
                    }
                }
                return false;
            }
            else {
                return false;
            }
        }
    }
}
exports.isSubType = isSubType;
function isFunctionType(type) {
    if (type.typeKind === model_1.TypeKind.FUNCTION) {
        return true;
    }
    else if (type.typeKind === model_1.TypeKind.INTERFACE) {
        var int = type;
        return isSubType(int, FUNCTION);
        return false;
    }
    return type.typeKind === model_1.TypeKind.FUNCTION || (type.name === 'Function' && type.constructorParent.name === '');
}
exports.isFunctionType = isFunctionType;
//# sourceMappingURL=typeUtils.js.map