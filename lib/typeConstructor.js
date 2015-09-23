var model_1 = require('./model');
var e = require('./equals');
var s = require('./toString');
function constructTypeAlias(typeAliasConstructor, typeArgs, parentTypeArgs, closedTypes, typeAlias) {
    typeAlias = typeAlias || {};
    typeAlias.modelKind = model_1.ModelKind.TYPE;
    typeAlias.name = typeAliasConstructor.name;
    typeAlias.typeKind = model_1.TypeKind.TYPE_ALIAS;
    typeAlias.typeConstructor = typeAliasConstructor;
    typeAlias.typeArguments = typeArgs;
    typeAlias.equals = e.containedEquals;
    var fqName = s.typeAliasConstructorToString(typeAliasConstructor);
    var previouslyClosed = getPreviouslyClosed(fqName, closedTypes, typeArgs, parentTypeArgs);
    if (previouslyClosed) {
        typeAlias.type = previouslyClosed.type;
    }
    else {
        typeAlias.type = typeAliasConstructor.type;
        addClosed(fqName, closedTypes, typeAlias, parentTypeArgs);
    }
    typeAlias.type = substituteType(parentTypeArgs, closedTypes, typeAlias.type);
    return typeAlias;
}
exports.constructTypeAlias = constructTypeAlias;
function constructClass(classConstructor, typeArgs, parentTypeArgs, closedTypes, cls) {
    return processClass(classConstructor, typeArgs, parentTypeArgs, closedTypes, classConstructor.instanceType, classConstructor.staticType, classConstructor.extends, classConstructor.implements, classConstructor.decorators, cls);
}
exports.constructClass = constructClass;
function processClass(classConstructor, typeArgs, parentTypeArgs, closedTypes, instanceType, staticType, clsExtends, clsImplements, decorators, cls) {
    cls = cls || {};
    cls.modelKind = model_1.ModelKind.TYPE;
    cls.name = classConstructor.name;
    cls.typeKind = model_1.TypeKind.CLASS;
    cls.typeConstructor = classConstructor;
    cls.constructorParent = classConstructor.parent;
    cls.typeArguments = typeArgs;
    cls.equals = e.containedEquals;
    var fqName = s.classConstructorToString(classConstructor);
    var previouslyClosed = getPreviouslyClosed(fqName, closedTypes, typeArgs, parentTypeArgs);
    if (previouslyClosed) {
        cls.instanceType = copyCompositeType(previouslyClosed.instanceType, cls);
        cls.staticType = copyCompositeType(previouslyClosed.staticType, cls);
        cls.extends = previouslyClosed.extends;
        cls.implements = previouslyClosed.implements;
        copyDecorators(previouslyClosed.decorators, cls);
    }
    else {
        var allArgs = getAllArgs(classConstructor.typeParameters, typeArgs, parentTypeArgs);
        closedTypes = closedTypes || {};
        cls.instanceType = processCompositeType(allArgs, closedTypes, instanceType, true);
        cls.staticType = processCompositeType(allArgs, closedTypes, staticType, true);
        cls.instanceType.parent = cls;
        cls.staticType.parent = cls;
        addClosed(fqName, closedTypes, cls, parentTypeArgs);
        if (decorators) {
            cls.decorators = decorators.map(function (decorator) {
                return {
                    modelKind: model_1.ModelKind.DECORATOR,
                    parent: cls,
                    equals: e.decoratorEquals,
                    decoratorType: decorator.decoratorType,
                    parameters: decorator.parameters
                };
            });
        }
        if (clsExtends) {
            if (!clsExtends.typeKind) {
                if (clsExtends.modelKind) {
                    var cc = clsExtends;
                    var typeArgs_1 = (cc).typeParameters ? (cc).typeParameters.map(function () {
                        return model_1.reflective.ANY;
                    }) : [];
                    clsExtends = constructClass(cc, typeArgs_1, parentTypeArgs, closedTypes);
                }
                else {
                    var construct = clsExtends['_construct'];
                    construct(allArgs);
                    delete clsExtends['_construct'];
                }
            }
            cls.extends = processClass(clsExtends.typeConstructor, clsExtends.typeArguments, allArgs, closedTypes, clsExtends.instanceType, clsExtends.staticType, clsExtends.extends, clsExtends.implements, clsExtends.decorators);
        }
        if (clsImplements) {
            cls.implements = [];
            cls.implements = clsImplements.map(function (impl) {
                if (!impl.typeKind) {
                    if (impl.modelKind) {
                        var ic = impl;
                        var typeArgs_2 = (ic).typeParameters ? (ic).typeParameters.map(function () {
                            return model_1.reflective.ANY;
                        }) : [];
                        impl = constructInterface(ic, typeArgs_2, parentTypeArgs, closedTypes);
                    }
                    else {
                        var construct = impl['_construct'];
                        construct(allArgs);
                        delete impl['_construct'];
                    }
                }
                return processInterface(impl.typeConstructor, impl.typeArguments, allArgs, closedTypes, impl.instanceType, impl.extends);
            });
        }
    }
    return cls;
}
function constructInterface(interfaceConstructor, typeArgs, parentTypeArgs, closedTypes, int) {
    return processInterface(interfaceConstructor, typeArgs, parentTypeArgs, closedTypes, interfaceConstructor.instanceType, interfaceConstructor.extends, int);
}
exports.constructInterface = constructInterface;
function processInterface(interfaceConstructor, typeArgs, parentTypeArgs, closedTypes, instanceCompositeType, intExtends, int) {
    int = int || {};
    int.modelKind = model_1.ModelKind.TYPE;
    int.name = interfaceConstructor.name;
    int.typeKind = model_1.TypeKind.INTERFACE;
    int.typeConstructor = interfaceConstructor;
    int.constructorParent = interfaceConstructor.parent;
    int.typeArguments = typeArgs;
    int.equals = e.containedEquals;
    var fqName = s.interfaceConstructorToString(interfaceConstructor);
    var previouslyClosed = getPreviouslyClosed(fqName, closedTypes, typeArgs, parentTypeArgs);
    if (previouslyClosed) {
        int.instanceType = copyCompositeType(previouslyClosed.instanceType, int);
        int.extends = previouslyClosed.extends;
    }
    else {
        var allArgs = getAllArgs(interfaceConstructor.typeParameters, typeArgs, parentTypeArgs);
        closedTypes = closedTypes || {};
        int.instanceType = processCompositeType(allArgs, closedTypes, interfaceConstructor.instanceType, false);
        int.instanceType.parent = int;
        addClosed(fqName, closedTypes, int, parentTypeArgs);
        if (intExtends) {
            int.extends = [];
            int.extends = intExtends.map(function (extend) {
                if (!extend.typeKind) {
                    if (extend.modelKind) {
                        var ic = extend;
                        var typeArgs_3 = (ic).typeParameters ? (ic).typeParameters.map(function () {
                            return model_1.reflective.ANY;
                        }) : [];
                        extend = constructInterface(ic, typeArgs_3, parentTypeArgs, closedTypes);
                    }
                    else {
                        var construct = extend['_construct'];
                        construct(allArgs);
                        delete extend['_construct'];
                    }
                }
                return processInterface(extend.typeConstructor, extend.typeArguments, allArgs, closedTypes, extend.instanceType, extend.extends);
            });
        }
    }
    return int;
}
function copyDecorators(decorators, parent) {
    if (decorators) {
        parent.decorators = decorators.map(function (decorator) {
            return {
                parent: parent,
                decoratorType: decorator.decoratorType,
                parameters: decorator.parameters,
                modelKind: model_1.ModelKind.DECORATOR,
                equals: e.decoratorEquals
            };
        });
    }
}
function copyCompositeType(ct, parent) {
    var copy = {
        members: {},
        modelKind: model_1.ModelKind.TYPE,
        typeKind: model_1.TypeKind.COMPOSITE,
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
            modelKind: model_1.ModelKind.INDEX,
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
function addClosed(fqName, closedTypes, closedInstance, parentTypeArgs) {
    var closedTypesForName = closedTypes[fqName];
    if (!closedTypesForName) {
        closedTypesForName = [];
        closedTypes[fqName] = closedTypesForName;
    }
    closedTypesForName.push([closedInstance, parentTypeArgs]);
}
function getPreviouslyClosed(fqName, closedTypes, typeArgs, parentTypeArgs) {
    if (closedTypes[fqName]) {
        var closedTypesForName = closedTypes[fqName];
        for (var i = 0; i < closedTypesForName.length; i++) {
            var closedType = closedTypesForName[i];
            var closedTypeArgs = closedType[0].typeArguments;
            var isMatch = true;
            for (var j = 0; j < closedTypeArgs.length; j++) {
                if (!closedTypeArgs[j].equals(typeArgs[j])) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) {
                if ((closedType[1] && !parentTypeArgs) || (!closedType[1] && parentTypeArgs)) {
                    isMatch = false;
                }
                else {
                    var closedParentTypeArgs = closedType[1];
                    var keys = Object.keys(closedParentTypeArgs);
                    for (var j = 0; j < keys.length; j++) {
                        var key = keys[j];
                        if (!parentTypeArgs[key]) {
                            isMatch = false;
                            break;
                        }
                        else if (!closedParentTypeArgs[key].equals(parentTypeArgs[key])) {
                            isMatch = false;
                            break;
                        }
                    }
                }
                if (isMatch) {
                    return closedType[0];
                }
            }
        }
    }
}
function substituteType(allArgs, closedTypes, type) {
    if (type.typeKind) {
        return type;
    }
    else {
        var p = type;
        return allArgs[p.name] || p;
    }
}
function processCompositeType(allArgs, closedTypes, oldCompositeType, isDecorated) {
    var newCompositeType = {
        modelKind: model_1.ModelKind.TYPE,
        members: {},
        equals: e.compositeTypeEquals,
        typeKind: model_1.TypeKind.COMPOSITE
    };
    Object.keys(oldCompositeType.members).forEach(function (name) {
        var member = oldCompositeType.members[name];
        newCompositeType.members[name] = {
            modelKind: model_1.ModelKind.MEMBER,
            parent: newCompositeType,
            equals: e.compositeTypeEquals,
            name: name,
            type: substituteType(allArgs, closedTypes, member.type),
            optional: member.optional
        };
        if (isDecorated) {
            newCompositeType.members[name].decorators = member.decorators;
        }
    });
    if (oldCompositeType.index) {
        newCompositeType.index = {
            modelKind: model_1.ModelKind.INDEX,
            parent: newCompositeType,
            equals: e.compositeTypeEquals,
            keyType: oldCompositeType.index.keyType,
            valueType: substituteType(allArgs, closedTypes, oldCompositeType.index.valueType)
        };
    }
    if (oldCompositeType.calls) {
        newCompositeType.calls = oldCompositeType.calls.map(function (call) {
            var newCall = {
                modelKind: model_1.ModelKind.TYPE,
                typeKind: model_1.TypeKind.FUNCTION,
                equals: e.functionTypeEquals,
                typeParameters: call.typeParameters,
                parameters: call.parameters.map(function (parameter) {
                    var newParameter = {
                        modelKind: parameter.decorators ? model_1.ModelKind.DECORATED_PARAMETER : model_1.ModelKind.PARAMETER,
                        parent: newCall,
                        equals: e.parameterEquals,
                        name: parameter.name,
                        type: substituteType(allArgs, closedTypes, parameter.type)
                    };
                    if (isDecorated && parameter.decorators) {
                        newParameter.decorators = parameter.decorators;
                    }
                    return newParameter;
                })
            };
            if (call.type) {
                newCall.type = substituteType(allArgs, closedTypes, call.type);
            }
            return newCall;
        });
    }
    return newCompositeType;
}
function getAllArgs(typeParams, typeArgs, parentTypeArgs) {
    var names = parentTypeArgs ? Object.keys(parentTypeArgs) : null;
    var allArgs = {};
    if (parentTypeArgs) {
        names.forEach(function (name) {
            allArgs[name] = parentTypeArgs[name];
        });
    }
    if (typeParams) {
        typeParams.forEach(function (typeParam, i) {
            allArgs[typeParam.name] = typeArgs[i];
        });
    }
    return allArgs;
}
//# sourceMappingURL=typeConstructor.js.map