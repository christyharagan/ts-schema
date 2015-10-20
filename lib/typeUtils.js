var ROOT = {
    modelKind: 2,
    containerKind: 1,
    name: ''
};
var FUNCTION = {
    modelKind: 6,
    typeKind: 7,
    name: 'Function',
    constructorParent: ROOT,
    typeConstructor: {
        name: 'Function',
        parent: ROOT
    }
};
function isFunctionVoid(f) {
    return !f.type || f.type.primitiveTypeKind === 4;
}
exports.isFunctionVoid = isFunctionVoid;
function isSubType(potentialSubType, potentialSuperType) {
    if (potentialSubType.typeKind === 8) {
        var cls = potentialSubType;
        if (potentialSuperType.typeKind === 8) {
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
        if (potentialSuperType.typeKind === 8) {
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
    if (type.typeKind === 3) {
        return true;
    }
    else if (type.typeKind === 7) {
        var int = type;
        return isSubType(int, FUNCTION);
        return false;
    }
    return type.typeKind === 3 || (type.name === 'Function' && type.constructorParent.name === '');
}
exports.isFunctionType = isFunctionType;
//# sourceMappingURL=typeUtils.js.map