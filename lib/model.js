(function (ModelKind) {
    ModelKind[ModelKind["PACKAGE"] = 1] = "PACKAGE";
    ModelKind[ModelKind["CONTAINER"] = 2] = "CONTAINER";
    ModelKind[ModelKind["CLASS_CONSTRUCTOR"] = 3] = "CLASS_CONSTRUCTOR";
    ModelKind[ModelKind["INTERFACE_CONSTRUCTOR"] = 4] = "INTERFACE_CONSTRUCTOR";
    ModelKind[ModelKind["TYPE_ALIAS_CONSTRUCTOR"] = 5] = "TYPE_ALIAS_CONSTRUCTOR";
    ModelKind[ModelKind["TYPE"] = 6] = "TYPE";
    ModelKind[ModelKind["INDEX"] = 7] = "INDEX";
    ModelKind[ModelKind["PARAMETER"] = 8] = "PARAMETER";
    ModelKind[ModelKind["DECORATED_PARAMETER"] = 9] = "DECORATED_PARAMETER";
    ModelKind[ModelKind["MEMBER"] = 10] = "MEMBER";
    ModelKind[ModelKind["DECORATED_MEMBER"] = 11] = "DECORATED_MEMBER";
    ModelKind[ModelKind["DECORATOR"] = 12] = "DECORATOR";
    ModelKind[ModelKind["EXPRESSION"] = 13] = "EXPRESSION";
    ModelKind[ModelKind["VALUE"] = 14] = "VALUE";
    ModelKind[ModelKind["ENUM_MEMBER"] = 15] = "ENUM_MEMBER";
    ModelKind[ModelKind["SYMBOL"] = 16] = "SYMBOL";
})(exports.ModelKind || (exports.ModelKind = {}));
var ModelKind = exports.ModelKind;
(function (ContainerKind) {
    ContainerKind[ContainerKind["MODULE"] = 1] = "MODULE";
    ContainerKind[ContainerKind["NAMESPACE"] = 2] = "NAMESPACE";
})(exports.ContainerKind || (exports.ContainerKind = {}));
var ContainerKind = exports.ContainerKind;
(function (TypeKind) {
    TypeKind[TypeKind["PRIMITIVE"] = 1] = "PRIMITIVE";
    TypeKind[TypeKind["ENUM"] = 2] = "ENUM";
    TypeKind[TypeKind["FUNCTION"] = 3] = "FUNCTION";
    TypeKind[TypeKind["TUPLE"] = 4] = "TUPLE";
    TypeKind[TypeKind["UNION"] = 5] = "UNION";
    TypeKind[TypeKind["COMPOSITE"] = 6] = "COMPOSITE";
    TypeKind[TypeKind["INTERFACE"] = 7] = "INTERFACE";
    TypeKind[TypeKind["CLASS"] = 8] = "CLASS";
    TypeKind[TypeKind["TYPE_QUERY"] = 9] = "TYPE_QUERY";
    TypeKind[TypeKind["TYPE_ALIAS"] = 10] = "TYPE_ALIAS";
    TypeKind[TypeKind["INTERSECTION"] = 11] = "INTERSECTION";
    TypeKind[TypeKind["TYPE_PARAMETER"] = 12] = "TYPE_PARAMETER";
})(exports.TypeKind || (exports.TypeKind = {}));
var TypeKind = exports.TypeKind;
(function (ValueKind) {
    ValueKind[ValueKind["VAR"] = 1] = "VAR";
    ValueKind[ValueKind["LET"] = 2] = "LET";
    ValueKind[ValueKind["CONST"] = 3] = "CONST";
    ValueKind[ValueKind["FUNCTION"] = 4] = "FUNCTION";
})(exports.ValueKind || (exports.ValueKind = {}));
var ValueKind = exports.ValueKind;
(function (ExpressionKind) {
    ExpressionKind[ExpressionKind["PRIMITIVE"] = 1] = "PRIMITIVE";
    ExpressionKind[ExpressionKind["ENUM"] = 2] = "ENUM";
    ExpressionKind[ExpressionKind["FUNCTION"] = 3] = "FUNCTION";
    ExpressionKind[ExpressionKind["CLASS"] = 4] = "CLASS";
    ExpressionKind[ExpressionKind["OBJECT"] = 5] = "OBJECT";
    ExpressionKind[ExpressionKind["ARRAY"] = 6] = "ARRAY";
    ExpressionKind[ExpressionKind["CLASS_REFERENCE"] = 7] = "CLASS_REFERENCE";
    ExpressionKind[ExpressionKind["VALUE"] = 8] = "VALUE";
    ExpressionKind[ExpressionKind["FUNCTION_CALL"] = 9] = "FUNCTION_CALL";
    ExpressionKind[ExpressionKind["PROPERTY_ACCESS"] = 10] = "PROPERTY_ACCESS";
    ExpressionKind[ExpressionKind["NEW"] = 11] = "NEW";
})(exports.ExpressionKind || (exports.ExpressionKind = {}));
var ExpressionKind = exports.ExpressionKind;
(function (PrimitiveTypeKind) {
    PrimitiveTypeKind[PrimitiveTypeKind["STRING"] = 1] = "STRING";
    PrimitiveTypeKind[PrimitiveTypeKind["BOOLEAN"] = 2] = "BOOLEAN";
    PrimitiveTypeKind[PrimitiveTypeKind["NUMBER"] = 3] = "NUMBER";
    PrimitiveTypeKind[PrimitiveTypeKind["VOID"] = 4] = "VOID";
    PrimitiveTypeKind[PrimitiveTypeKind["ANY"] = 5] = "ANY";
    PrimitiveTypeKind[PrimitiveTypeKind["SYMBOL"] = 6] = "SYMBOL";
})(exports.PrimitiveTypeKind || (exports.PrimitiveTypeKind = {}));
var PrimitiveTypeKind = exports.PrimitiveTypeKind;
var serializable;
(function (serializable) {
    serializable.STRING = {
        primitiveTypeKind: 1,
        typeKind: 1
    };
    serializable.BOOLEAN = {
        primitiveTypeKind: 2,
        typeKind: 1
    };
    serializable.NUMBER = {
        primitiveTypeKind: 3,
        typeKind: 1
    };
    serializable.ANY = {
        primitiveTypeKind: 5,
        typeKind: 1
    };
    serializable.VOID = {
        primitiveTypeKind: 4,
        typeKind: 1
    };
    serializable.SYMBOL = {
        primitiveTypeKind: 6,
        typeKind: 1
    };
})(serializable = exports.serializable || (exports.serializable = {}));
var reflective;
(function (reflective) {
    (function (DecoratorTypeKind) {
        DecoratorTypeKind[DecoratorTypeKind["CLASS"] = 1] = "CLASS";
        DecoratorTypeKind[DecoratorTypeKind["PROPERTY"] = 2] = "PROPERTY";
        DecoratorTypeKind[DecoratorTypeKind["METHOD"] = 3] = "METHOD";
        DecoratorTypeKind[DecoratorTypeKind["PARAMETER"] = 4] = "PARAMETER";
    })(reflective.DecoratorTypeKind || (reflective.DecoratorTypeKind = {}));
    var DecoratorTypeKind = reflective.DecoratorTypeKind;
    reflective.STRING = {
        modelKind: 6,
        primitiveTypeKind: 1,
        typeKind: 1,
        equals: function (p) {
            return p.primitiveTypeKind === 1;
        }
    };
    reflective.BOOLEAN = {
        modelKind: 6,
        primitiveTypeKind: 2,
        typeKind: 1,
        equals: function (p) {
            return p.primitiveTypeKind === 2;
        }
    };
    reflective.NUMBER = {
        modelKind: 6,
        primitiveTypeKind: 3,
        typeKind: 1,
        equals: function (p) {
            return p.primitiveTypeKind === 3;
        }
    };
    reflective.ANY = {
        modelKind: 6,
        primitiveTypeKind: 5,
        typeKind: 1,
        equals: function (p) {
            return p.primitiveTypeKind === 5;
        }
    };
    reflective.VOID = {
        modelKind: 6,
        primitiveTypeKind: 4,
        typeKind: 1,
        equals: function (p) {
            return p.primitiveTypeKind === 4;
        }
    };
    reflective.SYMBOL = {
        modelKind: 6,
        primitiveTypeKind: 6,
        typeKind: 1,
        equals: function (p) {
            return p.primitiveTypeKind === 6;
        }
    };
})(reflective = exports.reflective || (exports.reflective = {}));
//# sourceMappingURL=model.js.map