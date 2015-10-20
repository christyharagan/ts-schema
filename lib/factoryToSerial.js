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
        while (parent.containerKind === 2) {
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
            case 1:
                var primitiveFactory = factory;
                switch (primitiveFactory.primitiveTypeKind) {
                    case 1:
                        return model_1.serializable.STRING;
                    case 2:
                        return model_1.serializable.BOOLEAN;
                    case 3:
                        return model_1.serializable.NUMBER;
                    case 4:
                        return model_1.serializable.VOID;
                    case 5:
                        return model_1.serializable.ANY;
                    case 6:
                        return model_1.serializable.SYMBOL;
                }
            case 2:
                return getReference(factory);
            case 3:
                return convertFunctionType(factory);
            case 4:
                return convertTupleType(factory);
            case 5:
            case 11:
                return convertUnionOrIntersectionType(factory);
            case 6:
                return convertCompositeType(factory);
            case 7:
                return getRefinedReference(factory);
            case 8:
                if (factory.typeConstructor) {
                    return getRefinedReference(factory);
                }
                else {
                    var protoClassFactory = factory;
                    var protoClass = createType(8);
                    protoClass.instanceType = convertType(protoClassFactory.instanceType);
                    protoClass.staticType = convertType(protoClassFactory.staticType);
                    return protoClass;
                }
            case 9:
                return convertTypeQuery(factory);
            case 10:
                return getRefinedReference(factory);
            case 12:
                return {
                    module: '@',
                    name: factory.name
                };
        }
    }
    function convertExpression(factory) {
        switch (factory.expressionKind) {
            case 1:
                var primitiveFactory = factory;
                var primitiveExpression = createExpression(factory.expressionKind);
                primitiveExpression.primitiveTypeKind = primitiveFactory.primitiveTypeKind;
                primitiveExpression.primitiveValue = primitiveFactory.primitiveValue;
                return primitiveExpression;
            case 2:
                var enumFactory = factory;
                var enumExpression = createExpression(factory.expressionKind);
                enumExpression.enum = getReference(enumFactory.enum);
                enumExpression.value = enumFactory.value;
                return enumExpression;
            case 3:
                var functionFactory = factory;
                var functionExpression = createExpression(factory.expressionKind);
                functionExpression.functionType = convertType(functionFactory.functionType);
                return functionExpression;
            case 4:
                var classFactory = factory;
                var classExpression = createExpression(factory.expressionKind);
                classExpression.class = convertType(classFactory.class);
                return classExpression;
            case 5:
                var objectFactory = factory;
                var objectExpression = createExpression(factory.expressionKind);
                objectExpression.properties = {};
                Object.keys(objectFactory.properties).forEach(function (name) {
                    objectExpression.properties[name] = convertExpression(objectFactory.properties[name]);
                });
                return objectExpression;
            case 6:
                var arrayFactory = factory;
                var arrayExpression = createExpression(factory.expressionKind);
                arrayExpression.elements = arrayFactory.elements.map(convertExpression);
                return arrayExpression;
            case 7:
                var classRefExpression = createExpression(factory.expressionKind);
                classRefExpression.classReference = getReference(factory.classReference);
                return classRefExpression;
            case 8:
                var valueFactory = factory;
                var valueExpression = createExpression(factory.expressionKind);
                valueExpression.value = getReference(valueFactory.value);
                return valueExpression;
            case 9:
                var functionCallFactory = factory;
                var functionCallExpression = createExpression(factory.expressionKind);
                functionCallExpression.function = convertExpression(functionCallFactory.function);
                functionCallExpression.arguments = functionCallFactory.arguments.map(convertExpression);
                return functionCallExpression;
            case 10:
                var propAccessFactory = factory;
                var propAccessExpression = createExpression(factory.expressionKind);
                propAccessExpression.parent = convertExpression(propAccessFactory.parent);
                propAccessFactory.property = propAccessFactory.property;
                return propAccessExpression;
            case 11:
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
        var typeQuery = createType(9);
        if (factory.type) {
            switch (factory.type.modelKind) {
                case 6:
                    typeQuery.type = convertType(factory.type);
                    break;
                case 14:
                    typeQuery.type = getReference(factory.type);
                    break;
                case 2:
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
        var c = createType(6);
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
        var en = createType(2);
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
        var f = createType(3);
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
        var t = createType(4);
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
                var tp = createType(12);
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
                case 1:
                    u = convertPackage(factory);
                    break;
                case 6:
                    u = convertType(factory);
                    break;
                case 13:
                    u = convertExpression(factory);
                    break;
                case 2:
                    u = convertContainer(factory);
                    break;
                case 3:
                    u = convertClassConstructor(factory);
                    break;
                case 4:
                    u = convertClassConstructor(factory);
                    break;
                case 5:
                    u = convertClassConstructor(factory);
                    break;
                case 7:
                    u = convertIndex(factory);
                    break;
                case 8:
                case 9:
                    u = convertParameter(factory);
                    break;
                case 10:
                case 11:
                    u = convertMember(factory);
                    break;
                case 16:
                case 15:
                    u = convertEnumMember(factory);
                    break;
                case 14:
                    u = convertValue(factory);
                    break;
                case 13:
                    u = convertExpression(factory);
                    break;
                case 12:
                    u = convertDecorator(factory);
                    break;
            }
            return u;
        };
    };
}
exports.factoryToSerializable = factoryToSerializable;
//# sourceMappingURL=factoryToSerial.js.map