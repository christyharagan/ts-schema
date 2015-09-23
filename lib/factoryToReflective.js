var model_1 = require('./model');
var e = require('./equals');
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
        var t = createModelElement(model_1.ModelKind.TYPE, equals);
        t.typeKind = typeKind;
        return t;
    }
    function createExpression(expressionKind, equals) {
        var e = createModelElement(model_1.ModelKind.EXPRESSION, equals);
        e.expressionKind = expressionKind;
        return e;
    }
    function createContainer(containerKind) {
        var c = createModelElement(model_1.ModelKind.CONTAINER, e.containerEquals);
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
        switch (modelKind) {
            case model_1.ModelKind.CLASS_CONSTRUCTOR:
                parent.classConstructors[name] = contained;
                break;
            case model_1.ModelKind.INTERFACE_CONSTRUCTOR:
                parent.interfaceConstructors[name] = contained;
                break;
            case model_1.ModelKind.TYPE_ALIAS_CONSTRUCTOR:
                parent.typeAliasConstructors[name] = contained;
                break;
            case model_1.ModelKind.VALUE:
                parent.values[name] = contained;
                break;
            case model_1.ModelKind.TYPE:
                parent.enums[name] = contained;
                break;
            case model_1.ModelKind.CONTAINER:
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
            case model_1.TypeKind.PRIMITIVE:
                var primitiveFactory = factory;
                switch (primitiveFactory.primitiveTypeKind) {
                    case model_1.PrimitiveTypeKind.STRING:
                        return model_1.reflective.STRING;
                    case model_1.PrimitiveTypeKind.BOOLEAN:
                        return model_1.reflective.BOOLEAN;
                    case model_1.PrimitiveTypeKind.NUMBER:
                        return model_1.reflective.NUMBER;
                    case model_1.PrimitiveTypeKind.VOID:
                        return model_1.reflective.VOID;
                    case model_1.PrimitiveTypeKind.ANY:
                        return model_1.reflective.ANY;
                    case model_1.PrimitiveTypeKind.SYMBOL:
                        return model_1.reflective.SYMBOL;
                }
            case model_1.TypeKind.ENUM:
                return getReference(factory);
            case model_1.TypeKind.FUNCTION:
                return convertFunctionType(factory, typeParameters);
            case model_1.TypeKind.TUPLE:
                return convertTupleType(factory, typeParameters);
            case model_1.TypeKind.UNION:
            case model_1.TypeKind.INTERSECTION:
                return convertUnionOrIntersectionType(factory, typeParameters);
            case model_1.TypeKind.COMPOSITE:
                return convertCompositeType(factory, typeParameters);
            case model_1.TypeKind.INTERFACE:
                return convertInterface(factory, typeParameters);
            case model_1.TypeKind.CLASS:
                return convertClass(factory, typeParameters);
            case model_1.TypeKind.TYPE_QUERY:
                return convertTypeQuery(factory, typeParameters);
            case model_1.TypeKind.TYPE_ALIAS:
                return convertTypeAlias(factory, typeParameters);
            case model_1.TypeKind.TYPE_PARAMETER:
                return typeParameters[factory.name];
        }
    }
    function convertExpression(factory) {
        switch (factory.expressionKind) {
            case model_1.ExpressionKind.PRIMITIVE:
                var primitiveFactory = factory;
                var primitiveExpression = createExpression(factory.expressionKind, e.primitiveExpressionEquals);
                primitiveExpression.primitiveTypeKind = primitiveFactory.primitiveTypeKind;
                primitiveExpression.primitiveValue = primitiveFactory.primitiveValue;
                return primitiveExpression;
            case model_1.ExpressionKind.ENUM:
                var enumFactory = factory;
                var enumExpression = createExpression(factory.expressionKind, e.enumExpressionEquals);
                enumExpression.enum = getReference(enumFactory.enum);
                enumExpression.value = enumFactory.value;
                return enumExpression;
            case model_1.ExpressionKind.FUNCTION:
                var functionFactory = factory;
                var functionExpression = createExpression(factory.expressionKind, e.functionExpressionEquals);
                functionExpression.functionType = convertType(functionFactory.functionType, {});
                return functionExpression;
            case model_1.ExpressionKind.CLASS:
            case model_1.ExpressionKind.OBJECT:
            case model_1.ExpressionKind.ARRAY:
            case model_1.ExpressionKind.CLASS_REFERENCE:
            case model_1.ExpressionKind.VALUE:
            case model_1.ExpressionKind.FUNCTION_CALL:
            case model_1.ExpressionKind.PROPERTY_ACCESS:
        }
    }
    function convertClass(factory, typeParameters) {
        var cc = getReference(factory.typeConstructor);
        if (cc.modelKind === model_1.ModelKind.INTERFACE_CONSTRUCTOR) {
            console.log(factory);
        }
        var typeArgs = factory.typeArguments.map(function (arg) {
            return convertType(arg, typeParameters);
        });
        var cls;
        var _construct = function (_typeArgs) {
            if (cls['_construct']) {
                delete cls['_construct'];
            }
        };
        cls = {
            _construct: _construct
        };
        context.closedTypeCallbacks.push(_construct);
        return cls;
    }
    function getContainerReference(containerFactory) {
        var parentFactory = containerFactory;
        var namespaces = [];
        while (parentFactory.containerKind === model_1.ContainerKind.NAMESPACE) {
            namespaces.splice(0, 0, parentFactory);
            parentFactory = parentFactory.parent;
        }
        var container = pkg.modules[parentFactory.name];
        if (!pkg.modules[parentFactory.name]) {
            container = createContainer(model_1.ContainerKind.MODULE);
            pkg.modules[parentFactory.name] = container;
        }
        namespaces.forEach(function (ns) {
            var name = ns.name;
            var parent = container;
            container = parent.namespaces[name];
            if (!container) {
                var ns_1 = createContainer(model_1.ContainerKind.NAMESPACE);
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
            case model_1.ModelKind.CLASS_CONSTRUCTOR:
                contained = container.classConstructors[containedFactory.name];
                if (!contained) {
                    contained = createContained(model_1.ModelKind.CLASS_CONSTRUCTOR, containedFactory.name, container);
                }
                break;
            case model_1.ModelKind.INTERFACE_CONSTRUCTOR:
                contained = container.interfaceConstructors[containedFactory.name];
                if (!contained) {
                    contained = createContained(model_1.ModelKind.INTERFACE_CONSTRUCTOR, containedFactory.name, container);
                }
                break;
            case model_1.ModelKind.TYPE_ALIAS_CONSTRUCTOR:
                contained = container.typeAliasConstructors[containedFactory.name];
                if (!contained) {
                    contained = createContained(model_1.ModelKind.TYPE_ALIAS_CONSTRUCTOR, containedFactory.name, container);
                }
                break;
            case model_1.ModelKind.VALUE:
                contained = container.values[containedFactory.name];
                if (!contained) {
                    contained = createContained(model_1.ModelKind.VALUE, containedFactory.name, container);
                }
                break;
            case model_1.ModelKind.TYPE:
                contained = container.enums[containedFactory.name];
                if (!contained) {
                    contained = createContained(model_1.ModelKind.TYPE, containedFactory.name, container);
                }
                break;
            case model_1.ModelKind.CONTAINER:
                contained = container.namespaces[containedFactory.name];
                if (!contained) {
                    contained = createContained(model_1.ModelKind.CONTAINER, containedFactory.name, container);
                }
                break;
        }
        return contained;
    }
    function convertInterface(factory, typeParameters) {
        var ic = getReference(factory.typeConstructor);
        var typeArgs = factory.typeArguments.map(function (arg) {
            return convertType(arg, typeParameters);
        });
        var int;
        var _construct = function (_typeArgs) {
            if (int['_construct']) {
                delete int['_construct'];
            }
        };
        int = {
            _construct: _construct
        };
        context.closedTypeCallbacks.push(_construct);
        return int;
    }
    function convertClassConstructor(factory, parentTypeParameters, parent) {
        var cc = parent.classConstructors[factory.name];
        if (!cc) {
            cc = createContained(model_1.ModelKind.CLASS_CONSTRUCTOR, factory.name, parent);
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
                return convertInterface(impl, typeParameters);
            });
        }
        return cc;
    }
    function convertInterfaceConstructor(factory, parentTypeParameters, parent) {
        var ic = parent.interfaceConstructors[factory.name];
        if (!ic) {
            ic = createContained(model_1.ModelKind.INTERFACE_CONSTRUCTOR, factory.name, parent);
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
                return convertInterface(ext, typeParameters);
            });
        }
        return ic;
    }
    function convertTypeAliasConstructor(factory, parentTypeParameters, parent) {
        var tac = parent.typeAliasConstructors[factory.name];
        if (!tac) {
            tac = createContained(model_1.ModelKind.TYPE_ALIAS_CONSTRUCTOR, factory.name, parent);
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
    function convertTypeAlias(factory, typeParameters) {
        var tac = getReference(factory.typeConstructor);
        var typeArgs = factory.typeArguments.map(function (arg) {
            return convertType(arg, typeParameters);
        });
        var ta = {};
        var _construct = function (_typeArgs) {
            if (ta['_construct']) {
                delete ta['_construct'];
            }
        };
        ta = {
            _construct: _construct
        };
        context.closedTypeCallbacks.push(_construct);
        return ta;
    }
    function convertTypeQuery(factory, typeParameters) {
        var typeQuery = createType(model_1.TypeKind.TYPE_QUERY, e.typeQueryEquals);
        if (factory.type) {
            switch (factory.type.modelKind) {
                case model_1.ModelKind.TYPE:
                    typeQuery.type = convertType(factory.type, typeParameters);
                    break;
                case model_1.ModelKind.VALUE:
                case model_1.ModelKind.CONTAINER:
                    typeQuery.type = getReference(factory.type);
                    break;
            }
        }
        return typeQuery;
    }
    function convertValue(factory, typeParameters, parent) {
        var v = parent.values[factory.name];
        if (!v) {
            v = createContained(model_1.ModelKind.VALUE, factory.name, parent);
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
                container = createContained(model_1.ModelKind.CONTAINER, factory.name, parent);
                container.containerKind = model_1.ContainerKind.NAMESPACE;
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
        var c = createType(model_1.TypeKind.COMPOSITE, e.compositeTypeEquals);
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
        var index = createModelElement(model_1.ModelKind.INDEX, e.indexEquals);
        index.parent = parent;
        index.keyType = factory.keyType;
        index.valueType = convertType(factory.valueType, typeParameters);
        return index;
    }
    function convertMember(factory, typeParameters, parent) {
        var member = createModelElement(model_1.ModelKind.MEMBER, e.memberEquals);
        member.parent = parent;
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
            en = createContained(model_1.ModelKind.TYPE, factory.name, parent);
            parent.enums[factory.name] = en;
            en.typeKind = model_1.TypeKind.ENUM;
        }
        en.members = factory.members.map(function (memberFactory) {
            return convertEnumMember(memberFactory, en);
        });
        return en;
    }
    function convertEnumMember(factory, parent) {
        var member = createModelElement(model_1.ModelKind.ENUM_MEMBER, e.enumMemberEquals);
        member.parent = parent;
        member.name = factory.name;
        if (factory.initializer) {
            member.initializer = convertExpression(factory.initializer);
        }
        return member;
    }
    function convertFunctionType(factory, parentTypeParameters) {
        var typeParameters = {};
        Object.keys(parentTypeParameters).forEach(function (name) {
            typeParameters[name] = parentTypeParameters[name];
        });
        var f = createType(model_1.TypeKind.FUNCTION, e.functionTypeEquals);
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
        var parameter = createModelElement(model_1.ModelKind.PARAMETER, e.parameterEquals);
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
        var t = createType(model_1.TypeKind.TUPLE, e.tupleTypeEquals);
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
    function convertTypeParameters(factory, typeConstructor, typeParameters) {
        if (factory.typeParameters && factory.typeParameters.length > 0) {
            typeConstructor.typeParameters = factory.typeParameters.map(function (tpFactory) {
                var tp = createType(model_1.TypeKind.TYPE_PARAMETER, e.typeParameterEquals);
                tp.parent = typeConstructor;
                tp.name = tpFactory.name;
                if (tpFactory.extends) {
                    tp.extends = convertType(tpFactory.extends, typeParameters);
                }
                return tp;
            });
            typeConstructor.typeParameters.forEach(function (typeParameter) {
                typeParameters[typeParameter.name] = typeParameter;
            });
        }
    }
    function convertDecorators(factory, decorated) {
        if (factory.decorators) {
            decorated.decorators = factory.decorators.map(function (decoratorFactory) {
                var decorator = createModelElement(model_1.ModelKind.DECORATOR, e.decoratorEquals);
                decorator.decoratorType = getReference(decoratorFactory.decoratorType);
                if (decoratorFactory.parameters) {
                    decorator.parameters = decoratorFactory.parameters.map(convertExpression);
                }
                return decorator;
            });
        }
    }
    return function (factory, parent) {
        return function () {
            var u;
            switch (factory.modelKind) {
                case model_1.ModelKind.PACKAGE:
                    u = convertPackage(factory);
                    break;
                case model_1.ModelKind.TYPE:
                    u = convertType(factory, _typeParameters);
                    break;
                case model_1.ModelKind.EXPRESSION:
                    u = convertExpression(factory);
                    break;
                case model_1.ModelKind.CONTAINER:
                    u = convertContainer(factory, parent);
                    break;
                case model_1.ModelKind.CLASS_CONSTRUCTOR:
                    u = convertClassConstructor(factory, _typeParameters, parent);
                    break;
                case model_1.ModelKind.INTERFACE_CONSTRUCTOR:
                    u = convertClassConstructor(factory, _typeParameters, parent);
                    break;
                case model_1.ModelKind.TYPE_ALIAS_CONSTRUCTOR:
                    u = convertClassConstructor(factory, _typeParameters, parent);
                    break;
                case model_1.ModelKind.INDEX:
                case model_1.ModelKind.PARAMETER:
                case model_1.ModelKind.DECORATED_PARAMETER:
                case model_1.ModelKind.MEMBER:
                case model_1.ModelKind.SYMBOL:
                case model_1.ModelKind.ENUM_MEMBER:
                case model_1.ModelKind.VALUE:
                case model_1.ModelKind.EXPRESSION:
                case model_1.ModelKind.DECORATOR:
                case model_1.ModelKind.DECORATED_MEMBER:
                    var decoratedMemberFactory = factory;
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