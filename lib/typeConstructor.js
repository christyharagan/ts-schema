var e = require('./equals');
var s = require('./toString');
var v = require('./visitor');
function constructTypeAlias(typeAliasConstructor, typeArgs, parentTypeArgs, closedTypes) {
    _a = processTypeArgs(typeAliasConstructor, parentTypeArgs || {}, typeArgs), typeArgs = _a[0], parentTypeArgs = _a[1];
    return processTypeAlias(typeAliasConstructor, typeArgs, parentTypeArgs, closedTypes);
    var _a;
}
exports.constructTypeAlias = constructTypeAlias;
function processTypeAlias(typeAliasConstructor, typeArgs, parentTypeArgs, closedTypes) {
    var fqName = s.typeAliasConstructorToString(typeAliasConstructor);
    var previouslyClosed = getPreviouslyClosed(closedTypes, fqName, typeArgs);
    if (previouslyClosed) {
        return previouslyClosed;
    }
    else {
        var typeAlias = {
            modelKind: 6,
            name: typeAliasConstructor.name,
            typeKind: 10,
            typeConstructor: typeAliasConstructor,
            constructorParent: typeAliasConstructor.parent,
            typeArguments: typeArgs,
            equals: e.containedEquals,
            type: null
        };
        addClosed(fqName, closedTypes, typeAlias);
        typeAlias.type = substituteType(parentTypeArgs, closedTypes, typeAlias.type);
        typeAlias['finish']();
        return typeAlias;
    }
}
function constructClass(classConstructor, typeArgs, parentTypeArgs, closedTypes) {
    _a = processTypeArgs(classConstructor, parentTypeArgs || {}, typeArgs), typeArgs = _a[0], parentTypeArgs = _a[1];
    return processClass(classConstructor, typeArgs, parentTypeArgs, closedTypes, classConstructor.instanceType, classConstructor.staticType, classConstructor.extends, classConstructor.implements, classConstructor.decorators);
    var _a;
}
exports.constructClass = constructClass;
function processClass(classConstructor, typeArgs, allArgs, closedTypes, instanceType, staticType, clsExtends, clsImplements, decorators) {
    var fqName = s.classConstructorToString(classConstructor);
    var previouslyClosed = getPreviouslyClosed(closedTypes, fqName, typeArgs);
    if (previouslyClosed) {
        return previouslyClosed;
    }
    else {
        var cls = {
            modelKind: 6,
            name: classConstructor.name,
            typeKind: 8,
            typeConstructor: classConstructor,
            constructorParent: classConstructor.parent,
            typeArguments: typeArgs,
            equals: e.containedEquals,
            instanceType: null,
            staticType: null
        };
        addClosed(fqName, closedTypes, cls);
        closedTypes = closedTypes || {};
        cls.instanceType = substituteType(allArgs, closedTypes, instanceType);
        cls.staticType = substituteType(allArgs, closedTypes, staticType);
        cls.instanceType.parent = cls;
        cls.staticType.parent = cls;
        if (decorators) {
            cls.decorators = decorators.map(function (decorator) {
                return {
                    modelKind: 12,
                    parent: cls,
                    equals: e.decoratorEquals,
                    decoratorType: decorator.decoratorType,
                    parameters: decorator.parameters
                };
            });
        }
        if (clsExtends) {
            cls.extends = substituteType(allArgs, closedTypes, clsExtends);
        }
        if (clsImplements) {
            cls.implements = [];
            cls.implements = clsImplements.map(function (impl) {
                return substituteType(allArgs, closedTypes, impl);
            });
        }
        cls['finish']();
        return cls;
    }
}
function constructInterface(interfaceConstructor, typeArgs, parentTypeArgs, closedTypes) {
    _a = processTypeArgs(interfaceConstructor, parentTypeArgs || {}, typeArgs), typeArgs = _a[0], parentTypeArgs = _a[1];
    return processInterface(interfaceConstructor, typeArgs, parentTypeArgs, closedTypes, interfaceConstructor.instanceType, interfaceConstructor.extends);
    var _a;
}
exports.constructInterface = constructInterface;
function processInterface(interfaceConstructor, typeArgs, allArgs, closedTypes, instanceCompositeType, intExtends) {
    var fqName = s.interfaceConstructorToString(interfaceConstructor);
    var previouslyClosed = getPreviouslyClosed(closedTypes, fqName, typeArgs);
    if (previouslyClosed) {
        return previouslyClosed;
    }
    else {
        var int = {
            modelKind: 6,
            name: interfaceConstructor.name,
            typeKind: 7,
            typeConstructor: interfaceConstructor,
            constructorParent: interfaceConstructor.parent,
            equals: e.containedEquals,
            typeArguments: typeArgs,
            instanceType: undefined
        };
        addClosed(fqName, closedTypes, int);
        closedTypes = closedTypes || {};
        int.instanceType = substituteType(allArgs, closedTypes, instanceCompositeType);
        int.instanceType.parent = int;
        if (intExtends) {
            if (!Array.isArray(intExtends)) {
                console.log(interfaceConstructor);
            }
            int.extends = [];
            int.extends = intExtends.map(function (extend) {
                return substituteType(allArgs, closedTypes, extend);
            });
        }
        int['finish']();
        return int;
    }
}
function processTypeArgs(typeConstructor, parentTypeArgs, typeArgs) {
    var newParentArgs = {};
    Object.keys(function (name) {
        newParentArgs[name] = parentTypeArgs[name];
    });
    return [(typeConstructor.typeParameters || []).map(function (typeParameter, i) {
            if (parentTypeArgs[typeParameter.name]) {
                return parentTypeArgs[typeParameter.name];
            }
            else if (typeArgs) {
                var typeArg = typeArgs[i];
                parentTypeArgs[typeParameter.name] = typeArg;
                return typeArg;
            }
            else {
                return typeParameter;
            }
        }), parentTypeArgs];
}
function addClosed(fqName, closedTypes, closedType) {
    var closedTypesForName = closedTypes[fqName];
    if (!closedTypesForName) {
        closedTypesForName = [];
        closedTypes[fqName] = closedTypesForName;
    }
    var cbs = [];
    closedType['_onFinished'] = function (cb) {
        cbs.push(cb);
    };
    closedType['finish'] = function () {
        cbs.forEach(function (cb) {
            cb();
        });
        delete closedType['finished'];
        delete closedType['_onFinished'];
    };
    closedTypesForName.push(closedType);
}
function getPreviouslyClosed(closedTypes, fqName, typeArgs) {
    if (closedTypes[fqName]) {
        var closedTypesForName = closedTypes[fqName];
        for (var i = 0; i < closedTypesForName.length; i++) {
            var closedType = closedTypesForName[i];
            var closedTypeArgs = closedType.typeArguments;
            var isMatch = true;
            for (var j = 0; j < closedTypeArgs.length; j++) {
                if (!closedTypeArgs[j].equals(typeArgs[j])) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) {
                return closedType;
            }
        }
    }
}
function copyElement(oldElement) {
    return {
        modelKind: oldElement.modelKind,
        equals: oldElement.equals
    };
}
function copyType(oldType) {
    return {
        modelKind: 6,
        typeKind: oldType.typeKind,
        equals: oldType.equals
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
function copyTypeParameters(allArgs, closedTypes, oldTypeParameters, typeConstructor) {
    if (oldTypeParameters) {
        typeConstructor.typeParameters = oldTypeParameters.map(function (oldTypeParameter) {
            var typeParameter = copyElement(oldTypeParameter);
            typeParameter.parent = typeConstructor;
            typeParameter.typeKind = 12;
            if (oldTypeParameter.extends) {
                typeParameter.extends = substituteType(allArgs, closedTypes, oldTypeParameter.extends);
            }
            return typeParameter;
        });
    }
}
function substituteType(allArgs, closedTypes, type, parent) {
    var newType;
    if (type['_construct']) {
        return type['_construct'](allArgs);
    }
    else {
        v.visitType(type, {
            onCompositeType: function (oldCompositeType) {
                var newCompositeType = copyType(oldCompositeType);
                newCompositeType.members = {};
                if (oldCompositeType.calls) {
                    newCompositeType.calls = [];
                }
                if (parent) {
                    newCompositeType.parent = parent;
                }
                newType = newCompositeType;
                return {
                    onMember: function (oldMember) {
                        var newMember = copyElement(oldMember);
                        newMember.name = oldMember.name;
                        newMember.parent = newCompositeType;
                        newMember.optional = oldMember.optional;
                        newMember.initializer = oldMember.initializer;
                        newMember.type = substituteType(allArgs, closedTypes, oldMember.type);
                        copyDecorators(oldMember.decorators, newMember);
                        newCompositeType.members[oldMember.name] = newMember;
                    },
                    onIndex: function (oldIndex) {
                        var newIndex = copyElement(oldIndex);
                        newIndex.parent = newCompositeType;
                        newIndex.keyType = oldIndex.keyType;
                        newIndex.valueType = substituteType(allArgs, closedTypes, oldIndex.valueType);
                        newCompositeType.index = newIndex;
                    },
                    onCall: function (oldCall) {
                        newCompositeType.calls.push(substituteType(allArgs, closedTypes, oldCall));
                    }
                };
            },
            onFunctionType: function (oldFunctionType) {
                var functionType = copyElement(oldFunctionType);
                functionType.parameters = [];
                copyTypeParameters(allArgs, closedTypes, oldFunctionType.typeParameters, functionType);
                newType = functionType;
                return {
                    onType: function (oldType) {
                        functionType.type = substituteType(allArgs, closedTypes, oldType);
                    }, onParameter: function (oldParameter) {
                        var parameter = copyElement(oldParameter);
                        parameter.parent = functionType;
                        parameter.name = oldParameter.name;
                        parameter.optional = oldParameter.optional;
                        parameter.initializer = oldParameter.initializer;
                        parameter.type = substituteType(allArgs, closedTypes, oldParameter.type);
                        copyDecorators(oldParameter.decorators, parameter);
                        functionType.parameters.push(parameter);
                    }
                };
            },
            onUnionType: function (oldUnionType) {
                var unionType = copyElement(oldUnionType);
                unionType.types = oldUnionType.types.map(function (type) {
                    return substituteType(allArgs, closedTypes, type);
                });
                newType = unionType;
            },
            onIntersectionType: function (oldIntersectionType) {
                var intersectionType = copyElement(oldIntersectionType);
                intersectionType.types = oldIntersectionType.types.map(function (type) {
                    return substituteType(allArgs, closedTypes, type);
                });
                newType = intersectionType;
            },
            onTupleType: function (oldTupleType) {
                var tupleType = copyElement(oldTupleType);
                tupleType.types = oldTupleType.elements.map(function (type) {
                    return substituteType(allArgs, closedTypes, type);
                });
                newType = tupleType;
            },
            onClass: function (oldClass) {
                newType = processClass(oldClass.typeConstructor, processTypeArgs(oldClass.typeConstructor, allArgs)[0], allArgs, closedTypes, oldClass.instanceType, oldClass.staticType, oldClass.extends, oldClass.implements, oldClass.decorators);
            },
            onInterface: function (oldInterface) {
                newType = processInterface(oldInterface.typeConstructor, processTypeArgs(oldInterface.typeConstructor, allArgs)[0], allArgs, closedTypes, oldInterface.instanceType, oldInterface.extends);
            },
            onTypeAlias: function (oldTypeAlias) {
                newType = processTypeAlias(oldTypeAlias.typeConstructor, processTypeArgs(oldTypeAlias.typeConstructor, allArgs)[0], allArgs, closedTypes);
            },
            onTypeParameter: function (typeParameter) {
                newType = allArgs[typeParameter.name] || typeParameter;
            }
        });
        if (!newType) {
            newType = type;
        }
    }
    return newType;
}
//# sourceMappingURL=typeConstructor.js.map