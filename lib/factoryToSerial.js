var model_1 = require('./model');
function factoryToSerializable() {
    function createType(typeKind) {
        var t = {};
        t.typeKind = typeKind;
        return t;
    }
    function createExpression(expressionKind) {
        var e = {};
        e.expressionKind = expressionKind;
        return e;
    }
    function createContainer() {
        var c = {};
        c.classConstructors = {};
        c.interfaceConstructors = {};
        c.typeAliasConstructors = {};
        c.enums = {};
        c.values = {};
        c.namespaces = {};
        return c;
    }
    function getRefinedReference(constructable) {
        var ref = getReference(constructable.typeConstructor);
        return {
            reference: ref,
            typeArguments: constructable.typeArguments.map(function (arg) {
                return convertType(arg);
            })
        };
    }
    function getContainerReference(container) {
        var parent = container;
        var parents = [parent];
        var module = '';
        while (parent.containerKind === model_1.ContainerKind.NAMESPACE) {
            module = ':' + parent.name + module;
            parent = parent.parent;
            parents.splice(0, 0, parent);
        }
        return parent.name + module;
    }
    function getReference(contained) {
        return {
            module: getContainerReference(contained.parent),
            name: contained.name
        };
    }
    function convertPackage(factory) {
        var pkg = {
            modules: {}
        };
        Object.keys(factory.modules).forEach(function (name) {
            pkg.modules[name] = convertContainer(factory.modules[name]);
        });
        return pkg;
    }
    function convertType(factory) {
        switch (factory.typeKind) {
            case model_1.TypeKind.PRIMITIVE:
                var primitiveFactory = factory;
                switch (primitiveFactory.primitiveTypeKind) {
                    case model_1.PrimitiveTypeKind.STRING:
                        return model_1.serializable.STRING;
                    case model_1.PrimitiveTypeKind.BOOLEAN:
                        return model_1.serializable.BOOLEAN;
                    case model_1.PrimitiveTypeKind.NUMBER:
                        return model_1.serializable.NUMBER;
                    case model_1.PrimitiveTypeKind.VOID:
                        return model_1.serializable.VOID;
                    case model_1.PrimitiveTypeKind.ANY:
                        return model_1.serializable.ANY;
                    case model_1.PrimitiveTypeKind.SYMBOL:
                        return model_1.serializable.SYMBOL;
                }
            case model_1.TypeKind.ENUM:
                return getReference(factory);
            case model_1.TypeKind.FUNCTION:
                return convertFunctionType(factory);
            case model_1.TypeKind.TUPLE:
                return convertTupleType(factory);
            case model_1.TypeKind.UNION:
            case model_1.TypeKind.INTERSECTION:
                return convertUnionOrIntersectionType(factory);
            case model_1.TypeKind.COMPOSITE:
                return convertCompositeType(factory);
            case model_1.TypeKind.INTERFACE:
                return getRefinedReference(factory);
            case model_1.TypeKind.CLASS:
                if (factory.typeConstructor) {
                    return getRefinedReference(factory);
                }
                else {
                    var protoClassFactory = factory;
                    var protoClass = createType(model_1.TypeKind.CLASS);
                    protoClass.instanceType = convertType(protoClassFactory.instanceType);
                    protoClass.staticType = convertType(protoClassFactory.staticType);
                    return protoClass;
                }
            case model_1.TypeKind.TYPE_QUERY:
                return convertTypeQuery(factory);
            case model_1.TypeKind.TYPE_ALIAS:
                return getRefinedReference(factory);
            case model_1.TypeKind.TYPE_PARAMETER:
                return {
                    module: '@',
                    name: factory.name
                };
        }
    }
    function convertExpression(factory) {
        switch (factory.expressionKind) {
            case model_1.ExpressionKind.PRIMITIVE:
                var primitiveFactory = factory;
                var primitiveExpression = createExpression(factory.expressionKind);
                primitiveExpression.primitiveTypeKind = primitiveFactory.primitiveTypeKind;
                primitiveExpression.primitiveValue = primitiveFactory.primitiveValue;
                return primitiveExpression;
            case model_1.ExpressionKind.ENUM:
                var enumFactory = factory;
                var enumExpression = createExpression(factory.expressionKind);
                enumExpression.enum = getReference(enumFactory.enum);
                enumExpression.value = enumFactory.value;
                return enumExpression;
            case model_1.ExpressionKind.FUNCTION:
                var functionFactory = factory;
                var functionExpression = createExpression(factory.expressionKind);
                functionExpression.functionType = convertType(functionFactory.functionType);
                return functionExpression;
            case model_1.ExpressionKind.CLASS:
                var classFactory = factory;
                var classExpression = createExpression(factory.expressionKind);
                classExpression.class = convertType(classFactory.class);
                return classExpression;
            case model_1.ExpressionKind.OBJECT:
                var objectFactory = factory;
                var objectExpression = createExpression(factory.expressionKind);
                objectExpression.properties = {};
                Object.keys(objectFactory.properties).forEach(function (name) {
                    objectExpression.properties[name] = convertExpression(objectFactory.properties[name]);
                });
                return objectExpression;
            case model_1.ExpressionKind.ARRAY:
                var arrayFactory = factory;
                var arrayExpression = createExpression(factory.expressionKind);
                arrayExpression.elements = arrayFactory.elements.map(convertExpression);
                return arrayExpression;
            case model_1.ExpressionKind.CLASS_REFERENCE:
                var classRefExpression = createExpression(factory.expressionKind);
                classRefExpression.classReference = getReference(factory.classReference);
                return classRefExpression;
            case model_1.ExpressionKind.VALUE:
                var valueFactory = factory;
                var valueExpression = createExpression(factory.expressionKind);
                valueExpression.value = getReference(valueFactory.value);
                return valueExpression;
            case model_1.ExpressionKind.FUNCTION_CALL:
                var functionCallFactory = factory;
                var functionCallExpression = createExpression(factory.expressionKind);
                functionCallExpression.function = convertExpression(functionCallFactory.function);
                functionCallExpression.arguments = functionCallFactory.arguments.map(convertExpression);
                return functionCallExpression;
            case model_1.ExpressionKind.PROPERTY_ACCESS:
                var propAccessFactory = factory;
                var propAccessExpression = createExpression(factory.expressionKind);
                propAccessExpression.parent = convertExpression(propAccessFactory.parent);
                propAccessFactory.property = propAccessFactory.property;
                return propAccessExpression;
            case model_1.ExpressionKind.NEW:
                var newFactory = factory;
                var newExpression = createExpression(factory.expressionKind);
                newExpression.classReference = convertExpression(newFactory.classReference);
                newExpression.arguments = newFactory.arguments.map(convertExpression);
                return newExpression;
        }
    }
    function convertClassConstructor(factory) {
        var cc = {};
        cc.instanceType = convertCompositeType(factory.instanceType);
        cc.staticType = convertCompositeType(factory.staticType);
        cc.isAbstract = factory.isAbstract;
        convertDecorators(factory, cc);
        if (factory.extends) {
            cc.extends = getRefinedReference(factory.extends);
        }
        if (factory.implements) {
            cc.implements = factory.implements.map(getRefinedReference);
        }
        convertTypeParameters(factory, cc);
        return cc;
    }
    function convertInterfaceConstructor(factory) {
        var ic = {};
        ic.instanceType = convertCompositeType(factory.instanceType);
        if (factory.extends) {
            ic.extends = factory.extends.map(getRefinedReference);
        }
        convertTypeParameters(factory, ic);
        return ic;
    }
    function convertTypeAliasConstructor(factory) {
        var tac = {};
        tac.type = convertType(factory.type);
        convertTypeParameters(factory, tac);
        return tac;
    }
    function convertTypeQuery(factory) {
        var typeQuery = createType(model_1.TypeKind.TYPE_QUERY);
        if (factory.type) {
            switch (factory.type.modelKind) {
                case model_1.ModelKind.TYPE:
                    typeQuery.type = convertType(factory.type);
                    break;
                case model_1.ModelKind.VALUE:
                    typeQuery.type = getReference(factory.type);
                    break;
                case model_1.ModelKind.CONTAINER:
                    typeQuery.type = { module: getContainerReference(factory.type) };
                    break;
            }
        }
        return typeQuery;
    }
    function convertValue(factory) {
        var v = {};
        v.valueKind = factory.valueKind;
        v.type = convertType(factory.type);
        if (factory.initializer) {
            v.initializer = convertExpression(factory.initializer);
        }
        return v;
    }
    function convertContainer(factory) {
        var container = createContainer();
        Object.keys(factory.classConstructors).forEach(function (name) {
            container.classConstructors[name] = convertClassConstructor(factory.classConstructors[name]);
        });
        Object.keys(factory.classConstructors).forEach(function (name) {
            container.classConstructors[name] = convertClassConstructor(factory.classConstructors[name]);
        });
        Object.keys(factory.interfaceConstructors).forEach(function (name) {
            container.interfaceConstructors[name] = convertInterfaceConstructor(factory.interfaceConstructors[name]);
        });
        Object.keys(factory.typeAliasConstructors).forEach(function (name) {
            container.typeAliasConstructors[name] = convertTypeAliasConstructor(factory.typeAliasConstructors[name]);
        });
        Object.keys(factory.enums).forEach(function (name) {
            container.enums[name] = convertEnum(factory.enums[name]);
        });
        Object.keys(factory.values).forEach(function (name) {
            container.values[name] = convertValue(factory.values[name]);
        });
        Object.keys(factory.namespaces).forEach(function (name) {
            container.namespaces[name] = convertContainer(factory.namespaces[name]);
        });
        return container;
    }
    function convertCompositeType(factory) {
        var c = createType(model_1.TypeKind.COMPOSITE);
        c.members = {};
        Object.keys(factory.members).forEach(function (name) {
            c.members[name] = convertMember(factory.members[name]);
        });
        if (factory.index) {
            c.index = convertIndex(factory.index);
        }
        if (factory.calls) {
            c.calls = factory.calls.map(convertFunctionType);
        }
        return c;
    }
    function convertIndex(factory) {
        var index = {};
        index.keyType = factory.keyType;
        index.valueType = convertType(factory.valueType);
        return index;
    }
    function convertMember(factory) {
        var member = {};
        member.type = convertType(factory.type);
        member.optional = factory.optional;
        if (factory.initializer) {
            member.initializer = convertExpression(factory.initializer);
        }
        convertDecorators(factory, member);
        return member;
    }
    function convertEnum(factory) {
        var en = createType(model_1.TypeKind.ENUM);
        en.members = factory.members.map(function (memberFactory) {
            return convertEnumMember(memberFactory);
        });
        return en;
    }
    function convertEnumMember(factory) {
        var member = {};
        member.name = factory.name;
        if (factory.initializer) {
            member.initializer = convertExpression(factory.initializer);
        }
        return member;
    }
    function convertFunctionType(factory) {
        var f = createType(model_1.TypeKind.FUNCTION);
        if (factory.type) {
            f.type = convertType(factory.type);
        }
        f.parameters = factory.parameters.map(function (parameterFactory) {
            return convertParameter(parameterFactory);
        });
        convertTypeParameters(factory, f);
        return f;
    }
    function convertParameter(factory) {
        var parameter = {};
        parameter.name = factory.name;
        parameter.optional = factory.optional;
        parameter.type = convertType(factory.type);
        if (factory.initializer) {
            parameter.initializer = convertExpression(factory.initializer);
        }
        convertDecorators(factory, parameter);
        return parameter;
    }
    function convertTupleType(factory) {
        var t = createType(model_1.TypeKind.TUPLE);
        t.elements = factory.elements.map(convertType);
        return t;
    }
    function convertUnionOrIntersectionType(factory) {
        var u = createType(factory.typeKind);
        u.types = factory.types.map(convertType);
        return u;
    }
    function convertTypeParameters(factory, typeConstructor) {
        if (factory.typeParameters && factory.typeParameters.length > 0) {
            typeConstructor.typeParameters = factory.typeParameters.map(function (tpFactory) {
                var tp = createType(model_1.TypeKind.TYPE_PARAMETER);
                tp.name = tpFactory.name;
                if (tpFactory.extends) {
                    tp.extends = convertType(tpFactory.extends);
                }
                return tp;
            });
        }
    }
    function convertDecorators(factory, decorated) {
        if (factory.decorators) {
            decorated.decorators = factory.decorators.map(function (decoratorFactory) {
                return convertDecorator(decoratorFactory);
            });
        }
    }
    function convertDecorator(factory) {
        var decorator = {};
        decorator.decoratorType = getReference(factory.decoratorType);
        if (factory.parameters) {
            decorator.parameters = factory.parameters.map(convertExpression);
        }
        return decorator;
    }
    return function (factory) {
        return function () {
            var u;
            switch (factory.modelKind) {
                case model_1.ModelKind.PACKAGE:
                    u = convertPackage(factory);
                    break;
                case model_1.ModelKind.TYPE:
                    u = convertType(factory);
                    break;
                case model_1.ModelKind.EXPRESSION:
                    u = convertExpression(factory);
                    break;
                case model_1.ModelKind.CONTAINER:
                    u = convertContainer(factory);
                    break;
                case model_1.ModelKind.CLASS_CONSTRUCTOR:
                    u = convertClassConstructor(factory);
                    break;
                case model_1.ModelKind.INTERFACE_CONSTRUCTOR:
                    u = convertClassConstructor(factory);
                    break;
                case model_1.ModelKind.TYPE_ALIAS_CONSTRUCTOR:
                    u = convertClassConstructor(factory);
                    break;
                case model_1.ModelKind.INDEX:
                    u = convertIndex(factory);
                    break;
                case model_1.ModelKind.PARAMETER:
                case model_1.ModelKind.DECORATED_PARAMETER:
                    u = convertParameter(factory);
                    break;
                case model_1.ModelKind.MEMBER:
                case model_1.ModelKind.DECORATED_MEMBER:
                    u = convertMember(factory);
                    break;
                case model_1.ModelKind.SYMBOL:
                case model_1.ModelKind.ENUM_MEMBER:
                    u = convertEnumMember(factory);
                    break;
                case model_1.ModelKind.VALUE:
                    u = convertValue(factory);
                    break;
                case model_1.ModelKind.EXPRESSION:
                    u = convertExpression(factory);
                    break;
                case model_1.ModelKind.DECORATOR:
                    u = convertDecorator(factory);
                    break;
            }
            return u;
        };
    };
}
exports.factoryToSerializable = factoryToSerializable;
//# sourceMappingURL=factoryToSerial.js.map