var model_1 = require('./model');
var e = require('./equals');
var f = require('./factories');
var tc = require('./typeConstructor');
var expressionToLiteral_1 = require('./expressionToLiteral');
function factoryToReflective(pkg, _typeParameters) {
    pkg = pkg || {
        modules: {}
    };
    _typeParameters = _typeParameters || {};
    var context = {
        typeArgs: {},
        closedTypes: {},
        closedTypeCallbacks: []
    };
    function createModelElement(modelKind, equals) {
        return {
            modelKind: modelKind,
            equals: equals
        };
    }
    function createType(typeKind, equals) {
        var t = createModelElement(6, equals);
        t.typeKind = typeKind;
        return t;
    }
    function createExpression(expressionKind, equals) {
        var e = createModelElement(13, equals);
        e.expressionKind = expressionKind;
        return e;
    }
    function createContainer(containerKind) {
        var c = createModelElement(2, e.containerEquals);
        c.containerKind = containerKind;
        c.classConstructors = {};
        c.interfaceConstructors = {};
        c.typeAliasConstructors = {};
        c.enums = {};
        c.values = {};
        c.namespaces = {};
        return c;
    }
    function createContained(modelKind, name, parent) {
        var contained = createModelElement(modelKind, e.containedEquals);
        contained.name = name;
        contained.parent = parent;
        contained.equals = e.containedEquals;
        switch (modelKind) {
            case 3:
                parent.classConstructors[name] = contained;
                break;
            case 4:
                parent.interfaceConstructors[name] = contained;
                break;
            case 5:
                parent.typeAliasConstructors[name] = contained;
                break;
            case 14:
                parent.values[name] = contained;
                break;
            case 6:
                parent.enums[name] = contained;
                break;
            case 2:
                parent.namespaces[name] = contained;
                break;
        }
        return contained;
    }
    function convertPackage(factory) {
        Object.keys(factory.modules).forEach(function (name) {
            convertContainer(factory.modules[name]);
        });
        return pkg;
    }
    function convertType(factory, typeParameters) {
        switch (factory.typeKind) {
            case 1:
                var primitiveFactory = factory;
                switch (primitiveFactory.primitiveTypeKind) {
                    case 1:
                        return model_1.reflective.STRING;
                    case 2:
                        return model_1.reflective.BOOLEAN;
                    case 3:
                        return model_1.reflective.NUMBER;
                    case 4:
                        return model_1.reflective.VOID;
                    case 5:
                        return model_1.reflective.ANY;
                    case 6:
                        return model_1.reflective.SYMBOL;
                }
            case 2:
                return getReference(factory);
            case 3:
                return convertFunctionType(factory, typeParameters);
            case 4:
                return convertTupleType(factory, typeParameters);
            case 5:
            case 11:
                return convertUnionOrIntersectionType(factory, typeParameters);
            case 6:
                return convertCompositeType(factory, typeParameters);
            case 7:
                return convertInterface(factory, typeParameters);
            case 8:
                return convertClass(factory, typeParameters);
            case 9:
                return convertTypeQuery(factory, typeParameters);
            case 10:
                return convertTypeAlias(factory, typeParameters);
            case 12:
                return typeParameters[factory.name];
        }
    }
    function convertExpression(factory) {
        switch (factory.expressionKind) {
            case 1:
                var primitiveFactory = factory;
                var primitiveExpression = createExpression(factory.expressionKind, e.primitiveExpressionEquals);
                primitiveExpression.primitiveTypeKind = primitiveFactory.primitiveTypeKind;
                primitiveExpression.primitiveValue = primitiveFactory.primitiveValue;
                return primitiveExpression;
            case 2:
                var enumFactory = factory;
                var enumExpression = createExpression(factory.expressionKind, e.enumExpressionEquals);
                enumExpression.enum = getReference(enumFactory.enum);
                enumExpression.value = enumFactory.value;
                return enumExpression;
            case 3:
                var functionFactory = factory;
                var functionExpression = createExpression(factory.expressionKind, e.functionExpressionEquals);
                functionExpression.functionType = convertType(functionFactory.functionType, {});
                return functionExpression;
            case 4:
                var classFactory = factory;
                var classExpression = createExpression(factory.expressionKind, e.classExpressionEquals);
                classExpression.class = convertType(classFactory.class, {});
                return classExpression;
            case 5:
                var objectFactory = factory;
                var objectExpression = createExpression(factory.expressionKind, e.objectExpressionEquals);
                objectExpression.properties = {};
                Object.keys(objectFactory.properties).forEach(function (name) {
                    objectExpression.properties[name] = convertExpression(objectFactory.properties[name]);
                });
                return objectExpression;
            case 6:
                var arrayFactory = factory;
                var arrayExpression = createExpression(factory.expressionKind, e.arrayExpressionEquals);
                arrayExpression.elements = arrayFactory.elements.map(convertExpression);
                return arrayExpression;
            case 7:
                var classRefExpression = createExpression(factory.expressionKind, e.classReferenceExpressionEquals);
                classRefExpression.classReference = getReference(factory.classReference);
                return classRefExpression;
            case 8:
                var valueFactory = factory;
                var valueExpression = createExpression(factory.expressionKind, e.valueExpressionEquals);
                valueExpression.value = getReference(valueFactory.value);
                return valueExpression;
            case 9:
                var functionCallFactory = factory;
                var functionCallExpression = createExpression(factory.expressionKind, e.functionCallExpressionEquals);
                functionCallExpression.function = convertExpression(functionCallFactory.function);
                functionCallExpression.arguments = functionCallFactory.arguments.map(convertExpression);
                return functionCallExpression;
            case 10:
                var propAccessFactory = factory;
                var propAccessExpression = createExpression(factory.expressionKind, e.propertyAccessExpressionEquals);
                propAccessExpression.parent = convertExpression(propAccessFactory.parent);
                propAccessFactory.property = propAccessFactory.property;
                return propAccessExpression;
            case 11:
                var newFactory = factory;
                var newExpression = createExpression(factory.expressionKind, e.newExpressionEquals);
                newExpression.classReference = convertExpression(newFactory.classReference);
                newExpression.arguments = newFactory.arguments.map(convertExpression);
                return newExpression;
        }
    }
    function convertClass(factory, typeParameters) {
        var cc = getReference(factory.typeConstructor);
        var typeArgs = getTypeArgs(factory, typeParameters);
        var cls;
        var _construct = function (parentTypeArgs) {
            if (cls['_construct']) {
                var c = tc.constructClass(cc, typeArgs, parentTypeArgs || context.typeArgs, context.closedTypes);
                function populate() {
                    cls.instanceType = copyCompositeType(c.instanceType, cls);
                    cls.staticType = copyCompositeType(c.staticType, cls);
                    cls.extends = c.extends;
                    cls.implements = c.implements;
                    cls.typeArguments = c.typeArguments;
                    copyDecorators(c.decorators, cls);
                }
                if (c['_onFinished']) {
                    c['_onFinished'](populate);
                }
                else {
                    populate();
                }
                delete cls['_construct'];
            }
            return cls;
        };
        cls = {
            _construct: _construct,
            modelKind: 6,
            name: cc.name,
            typeKind: 8,
            typeConstructor: cc,
            constructorParent: cc.parent,
            equals: e.constructableTypeEquals
        };
        context.closedTypeCallbacks.push(_construct);
        return cls;
    }
    function getContainerReference(containerFactory) {
        var parentFactory = containerFactory;
        var namespaces = [];
        while (parentFactory.containerKind === 2) {
            namespaces.splice(0, 0, parentFactory);
            parentFactory = parentFactory.parent;
        }
        var container = pkg.modules[parentFactory.name];
        if (!pkg.modules[parentFactory.name]) {
            container = createContainer(1);
            pkg.modules[parentFactory.name] = container;
        }
        namespaces.forEach(function (ns) {
            var name = ns.name;
            var parent = container;
            container = parent.namespaces[name];
            if (!container) {
                var ns_1 = createContainer(2);
                ns_1.name = name;
                ns_1.parent = parent;
                container = ns_1;
                parent.namespaces[name] = container;
            }
        });
        return container;
    }
    function getReference(containedFactory) {
        var contained;
        var container = getContainerReference(containedFactory.parent);
        switch (containedFactory.modelKind) {
            case 3:
                contained = container.classConstructors[containedFactory.name];
                if (!contained) {
                    contained = createContained(3, containedFactory.name, container);
                }
                break;
            case 4:
                contained = container.interfaceConstructors[containedFactory.name];
                if (!contained) {
                    contained = createContained(4, containedFactory.name, container);
                }
                break;
            case 5:
                contained = container.typeAliasConstructors[containedFactory.name];
                if (!contained) {
                    contained = createContained(5, containedFactory.name, container);
                }
                break;
            case 14:
                contained = container.values[containedFactory.name];
                if (!contained) {
                    contained = createContained(14, containedFactory.name, container);
                }
                break;
            case 6:
                contained = container.enums[containedFactory.name];
                if (!contained) {
                    contained = createContained(6, containedFactory.name, container);
                }
                break;
            case 2:
                contained = container.namespaces[containedFactory.name];
                if (!contained) {
                    contained = createContained(2, containedFactory.name, container);
                }
                break;
        }
        return contained;
    }
    function copyElement(oldElement) {
        return {
            modelKind: oldElement.modelKind,
            equals: oldElement.equals
        };
    }
    function copyDecorators(oldDecorators, decorated) {
        if (oldDecorators) {
            decorated.decorators = oldDecorators.map(function (oldDecorator) {
                var newDecorator = copyElement(oldDecorator);
                newDecorator.parent = decorated;
                newDecorator.parameters = oldDecorator.parameters;
                return newDecorator;
            });
        }
    }
    function copyCompositeType(ct, parent) {
        var copy = {
            members: {},
            modelKind: 6,
            typeKind: 6,
            equals: e.compositeTypeEquals
        };
        Object.keys(ct.members).forEach(function (name) {
            var member = ct.members[name];
            copy.members[name] = {
                parent: copy,
                name: name,
                type: member.type,
                optional: member.optional,
                initializer: member.initializer,
                modelKind: member.modelKind,
                equals: e.memberEquals
            };
            copyDecorators(member.decorators, copy.members[name]);
        });
        if (ct.index) {
            copy.index = {
                parent: copy,
                keyType: ct.index.keyType,
                valueType: ct.index.valueType,
                modelKind: 7,
                equals: e.indexEquals
            };
        }
        if (ct.calls) {
            copy.calls = ct.calls.map(function (call) {
                return call;
            });
        }
        copy.parent = parent;
        return copy;
    }
    function convertInterface(factory, typeParameters) {
        var ic = getReference(factory.typeConstructor);
        var typeArgs = getTypeArgs(factory, typeParameters);
        var int;
        var _construct = function (parentTypeArgs) {
            if (int['_construct']) {
                var i = tc.constructInterface(ic, typeArgs, parentTypeArgs || context.typeArgs, context.closedTypes);
                function populate() {
                    int.typeArguments = i.typeArguments;
                    int.extends = i.extends;
                    int.instanceType = copyCompositeType(i.instanceType, int);
                }
                if (i['_onFinished']) {
                    i['_onFinished'](populate);
                }
                else {
                    populate();
                }
                delete int['_construct'];
            }
            return int;
        };
        int = {
            _construct: _construct,
            modelKind: 6,
            name: ic.name,
            typeKind: 7,
            typeConstructor: ic,
            constructorParent: ic.parent,
            equals: e.constructableTypeEquals
        };
        context.closedTypeCallbacks.push(_construct);
        return int;
    }
    function convertClassConstructor(factory, parentTypeParameters, parent) {
        var cc = parent.classConstructors[factory.name];
        if (!cc) {
            cc = createContained(3, factory.name, parent);
            parent.classConstructors[factory.name] = cc;
        }
        var typeParameters = {};
        Object.keys(parentTypeParameters).forEach(function (name) {
            typeParameters[name] = parentTypeParameters[name];
        });
        convertTypeParameters(factory, cc, typeParameters);
        cc.instanceType = convertCompositeType(factory.instanceType, typeParameters, cc);
        cc.staticType = convertCompositeType(factory.staticType, typeParameters, cc);
        cc.isAbstract = factory.isAbstract;
        convertDecorators(factory, cc);
        if (factory.extends) {
            cc.extends = convertClass(factory.extends, typeParameters);
        }
        if (factory.implements) {
            cc.implements = factory.implements.map(function (impl) {
                if (impl.typeKind === 7) {
                    return convertInterface(impl, typeParameters);
                }
                else {
                    return convertClass(impl, typeParameters);
                }
            });
        }
        return cc;
    }
    function convertInterfaceConstructor(factory, parentTypeParameters, parent) {
        var ic = parent.interfaceConstructors[factory.name];
        if (!ic) {
            ic = createContained(4, factory.name, parent);
            parent.interfaceConstructors[factory.name] = ic;
        }
        var typeParameters = {};
        Object.keys(parentTypeParameters).forEach(function (name) {
            typeParameters[name] = parentTypeParameters[name];
        });
        convertTypeParameters(factory, ic, typeParameters);
        ic.instanceType = convertCompositeType(factory.instanceType, typeParameters, ic);
        if (factory.extends) {
            ic.extends = factory.extends.map(function (ext) {
                if (ext.typeKind === 7) {
                    return convertInterface(ext, typeParameters);
                }
                else {
                    return convertClass(ext, typeParameters);
                }
            });
        }
        return ic;
    }
    function convertTypeAliasConstructor(factory, parentTypeParameters, parent) {
        var tac = parent.typeAliasConstructors[factory.name];
        if (!tac) {
            tac = createContained(5, factory.name, parent);
            parent.typeAliasConstructors[factory.name] = tac;
        }
        var typeParameters = {};
        Object.keys(parentTypeParameters).forEach(function (name) {
            typeParameters[name] = parentTypeParameters[name];
        });
        convertTypeParameters(factory, tac, typeParameters);
        tac.type = convertType(factory.type, typeParameters);
        return tac;
    }
    function getTypeArgs(factory, typeParameters) {
        var factoryTypeArguments = factory.typeArguments;
        if (factoryTypeArguments.length === 0 && factory.typeConstructor.typeParameters.length > 0) {
            factoryTypeArguments = factory.typeConstructor.typeParameters.map(function () {
                return new f.PrimitiveTypeFactory(5);
            });
        }
        return factoryTypeArguments.map(function (arg) {
            return convertType(arg, typeParameters);
        });
    }
    function convertTypeAlias(factory, typeParameters) {
        var tac = getReference(factory.typeConstructor);
        var typeArgs = getTypeArgs(factory, typeParameters);
        var ta = {};
        var _construct = function (parentTypeArgs) {
            if (ta['_construct']) {
                var t = tc.constructTypeAlias(tac, typeArgs, parentTypeArgs || context.typeArgs, context.closedTypes);
                function populate() {
                    ta.type = t.type;
                }
                if (ta['_onFinished']) {
                    ta['_onFinished'](populate);
                }
                else {
                    populate();
                }
                delete ta['_construct'];
            }
            return ta;
        };
        ta = {
            _construct: _construct,
            modelKind: 6,
            name: tac.name,
            typeKind: 10,
            typeConstructor: tac,
            constructorParent: tac.parent,
            typeArguments: typeArgs,
            equals: e.constructableTypeEquals
        };
        context.closedTypeCallbacks.push(_construct);
        return ta;
    }
    function convertTypeQuery(factory, typeParameters) {
        var typeQuery = createType(9, e.typeQueryEquals);
        if (factory.type) {
            switch (factory.type.modelKind) {
                case 6:
                    typeQuery.type = convertType(factory.type, typeParameters);
                    break;
                case 14:
                case 2:
                    typeQuery.type = getReference(factory.type);
                    break;
            }
        }
        return typeQuery;
    }
    function convertValue(factory, typeParameters, parent) {
        var v = parent.values[factory.name];
        if (!v) {
            v = createContained(14, factory.name, parent);
            parent.values[factory.name] = v;
        }
        v.valueKind = factory.valueKind;
        v.type = convertType(factory.type, typeParameters);
        if (factory.initializer) {
            v.initializer = convertExpression(factory.initializer);
        }
        return v;
    }
    function convertContainer(factory, parent) {
        var container;
        if (parent) {
            container = parent.namespaces[factory.name];
            if (!container) {
                container = createContained(2, factory.name, parent);
                container.containerKind = 2;
                container.classConstructors = {};
                container.interfaceConstructors = {};
                container.typeAliasConstructors = {};
                container.enums = {};
                container.values = {};
                container.namespaces = {};
            }
        }
        else {
            container = pkg.modules[factory.name];
            if (!container) {
                container = createContainer(factory.containerKind);
                container.name = factory.name;
                pkg.modules[factory.name] = container;
            }
        }
        Object.keys(factory.classConstructors).forEach(function (name) {
            convertClassConstructor(factory.classConstructors[name], {}, container);
        });
        Object.keys(factory.interfaceConstructors).forEach(function (name) {
            convertInterfaceConstructor(factory.interfaceConstructors[name], {}, container);
        });
        Object.keys(factory.typeAliasConstructors).forEach(function (name) {
            convertTypeAliasConstructor(factory.typeAliasConstructors[name], {}, container);
        });
        Object.keys(factory.enums).forEach(function (name) {
            convertEnum(factory.enums[name], container);
        });
        Object.keys(factory.values).forEach(function (name) {
            convertValue(factory.values[name], {}, container);
        });
        Object.keys(factory.namespaces).forEach(function (name) {
            convertContainer(factory.namespaces[name], container);
        });
        return container;
    }
    function convertCompositeType(factory, typeParameters, parent) {
        var c = createType(6, e.compositeTypeEquals);
        if (parent) {
            c.parent = parent;
        }
        c.members = {};
        Object.keys(factory.members).forEach(function (name) {
            c.members[name] = convertMember(factory.members[name], typeParameters, c);
        });
        if (factory.index) {
            c.index = convertIndex(factory.index, typeParameters, c);
        }
        if (factory.calls) {
            c.calls = factory.calls.map(function (call) {
                return convertFunctionType(call, typeParameters);
            });
        }
        return c;
    }
    function convertIndex(factory, typeParameters, parent) {
        var index = createModelElement(7, e.indexEquals);
        index.parent = parent;
        index.keyType = factory.keyType;
        index.valueType = convertType(factory.valueType, typeParameters);
        return index;
    }
    function convertMember(factory, typeParameters, parent) {
        var member = createModelElement(10, e.memberEquals);
        member.parent = parent;
        member.name = factory.name;
        member.type = convertType(factory.type, typeParameters);
        member.optional = factory.optional;
        if (factory.initializer) {
            member.initializer = convertExpression(factory.initializer);
        }
        convertDecorators(factory, member);
        return member;
    }
    function convertEnum(factory, parent) {
        var en = parent.enums[factory.name];
        if (!en) {
            en = createContained(6, factory.name, parent);
            parent.enums[factory.name] = en;
            en.typeKind = 2;
        }
        en.valueMap = {};
        var previousValue = -1;
        en.members = factory.members.map(function (memberFactory) {
            var member = convertEnumMember(memberFactory, en, previousValue);
            previousValue = expressionToLiteral_1.expressionToLiteral(member.initializer);
            en.valueMap[member.name] = member;
            return member;
        });
        return en;
    }
    function convertEnumMember(factory, parent, previousValue) {
        var member = createModelElement(15, e.enumMemberEquals);
        member.parent = parent;
        member.name = factory.name;
        if (factory.initializer) {
            member.initializer = convertExpression(factory.initializer);
        }
        else {
            member.initializer = {
                primitiveValue: 3,
                modelKind: 13,
                expressionKind: 1,
                equals: e.primitiveExpressionEquals,
                primitiveTypeKind: previousValue + 1
            };
        }
        return member;
    }
    function convertFunctionType(factory, parentTypeParameters) {
        var typeParameters = {};
        Object.keys(parentTypeParameters).forEach(function (name) {
            typeParameters[name] = parentTypeParameters[name];
        });
        var f = createType(3, e.functionTypeEquals);
        convertTypeParameters(factory, f, typeParameters);
        if (factory.type) {
            f.type = convertType(factory.type, typeParameters);
        }
        f.parameters = factory.parameters.map(function (parameterFactory) {
            return convertParameter(parameterFactory, typeParameters, f);
        });
        return f;
    }
    function convertParameter(factory, typeParameters, parent) {
        var parameter = createModelElement(8, e.parameterEquals);
        parameter.parent = parent;
        parameter.name = factory.name;
        parameter.type = convertType(factory.type, typeParameters);
        parameter.optional = factory.optional;
        if (factory.initializer) {
            parameter.initializer = convertExpression(factory.initializer);
        }
        convertDecorators(factory, parameter);
        return parameter;
    }
    function convertTupleType(factory, typeParameters) {
        var t = createType(4, e.tupleTypeEquals);
        t.elements = factory.elements.map(function (type) {
            return convertType(type, typeParameters);
        });
        return t;
    }
    function convertUnionOrIntersectionType(factory, typeParameters) {
        var u = createType(factory.typeKind, e.unionOrIntersectionTypeEquals);
        u.types = factory.types.map(function (type) {
            return convertType(type, typeParameters);
        });
        return u;
    }
    function convertTypeParameter(factory, typeConstructor, typeParameters) {
        var tp = createType(12, e.typeParameterEquals);
        tp.parent = typeConstructor;
        tp.name = factory.name;
        if (factory.extends) {
            tp.extends = convertType(factory.extends, typeParameters);
        }
        return tp;
    }
    function convertTypeParameters(factory, typeConstructor, typeParameters) {
        if (factory.typeParameters && factory.typeParameters.length > 0) {
            typeConstructor.typeParameters = factory.typeParameters.map(function (tpFactory) {
                return convertTypeParameter(tpFactory, typeConstructor, typeParameters);
            });
            typeConstructor.typeParameters.forEach(function (typeParameter) {
                typeParameters[typeParameter.name] = typeParameter;
            });
        }
    }
    function convertDecorator(factory, decorated) {
        var decorator = createModelElement(12, e.decoratorEquals);
        decorator.parent = decorated;
        decorator.decoratorType = getReference(factory.decoratorType);
        if (factory.parameters) {
            decorator.parameters = factory.parameters.map(convertExpression);
        }
        return decorator;
    }
    function convertDecorators(factory, decorated) {
        if (factory.decorators) {
            decorated.decorators = factory.decorators.map(function (decoratorFactory) {
                return convertDecorator(decoratorFactory, decorated);
            });
        }
    }
    return function (factory, parent) {
        return function () {
            var u;
            switch (factory.modelKind) {
                case 1:
                    u = convertPackage(factory);
                    break;
                case 6:
                    u = convertType(factory, _typeParameters);
                    break;
                case 13:
                    u = convertExpression(factory);
                    break;
                case 2:
                    u = convertContainer(factory, parent);
                    break;
                case 3:
                    u = convertClassConstructor(factory, _typeParameters, parent);
                    break;
                case 4:
                    u = convertClassConstructor(factory, _typeParameters, parent);
                    break;
                case 5:
                    u = convertClassConstructor(factory, _typeParameters, parent);
                    break;
                case 7:
                    u = convertIndex(factory, _typeParameters, parent);
                    break;
                case 8:
                case 9:
                    u = convertParameter(factory, _typeParameters, parent);
                    break;
                case 10:
                case 11:
                    u = convertMember(factory, _typeParameters, parent);
                    break;
                case 15:
                    u = convertEnumMember(factory, parent);
                    break;
                case 14:
                    u = convertValue(factory, _typeParameters, parent);
                    break;
                case 13:
                    u = convertExpression(factory);
                    break;
                case 12:
                    u = convertDecorator(factory, parent);
                    break;
            }
            context.closedTypeCallbacks.forEach(function (cb) {
                cb();
            });
            return u;
        };
    };
}
exports.factoryToReflective = factoryToReflective;
//# sourceMappingURL=factoryToReflective.js.map