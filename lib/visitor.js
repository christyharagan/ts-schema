function visitModules(modules, visitor) {
    Object.keys(modules).forEach(function (name) {
        var module = modules[name];
        var v = visitor.onModule(module);
        if (v) {
            visitTypeContainer(module, v);
        }
    });
}
exports.visitModules = visitModules;
function visitTypeContainer(container, visitor) {
    if (visitor.onClassConstructor) {
        Object.keys(container.classConstructors).forEach(function (name) {
            var classSchema = container.classConstructors[name];
            var ccVisitor = visitor.onClassConstructor(classSchema);
            if (ccVisitor) {
                visitClassConstructor(classSchema, ccVisitor);
            }
        });
    }
    if (visitor.onInterfaceConstructor) {
        Object.keys(container.interfaceConstructors).forEach(function (name) {
            var interfaceSchema = container.interfaceConstructors[name];
            var icVisitor = visitor.onInterfaceConstructor(interfaceSchema);
            if (icVisitor) {
                visitInterfaceConstructor(interfaceSchema, icVisitor);
            }
        });
    }
    if (visitor.onTypeAliasConstructor) {
        Object.keys(container.typeAliasConstructors).forEach(function (name) {
            var type = container.typeAliasConstructors[name];
            var tVisitor = visitor.onTypeAliasConstructor(type);
            if (tVisitor) {
                visitType(type.type, tVisitor);
            }
        });
    }
    if (visitor.onEnum) {
        Object.keys(container.enums).forEach(function (name) {
            var e = container.enums[name];
            var eVisitor = visitor.onEnum(e);
            if (eVisitor) {
                visitEnum(e, eVisitor);
            }
        });
    }
    if (visitor.onValue) {
        Object.keys(container.values).forEach(function (name) {
            var s = container.values[name];
            var sVisitor = visitor.onValue(s);
            if (sVisitor) {
                visitValue(s, sVisitor);
            }
        });
    }
    if (visitor.onNamespace) {
        Object.keys(container.namespaces).forEach(function (name) {
            var nspace = container.namespaces[name];
            var nsVisitor = visitor.onNamespace(nspace);
            if (nsVisitor) {
                visitTypeContainer(nspace, nsVisitor);
            }
        });
    }
}
exports.visitTypeContainer = visitTypeContainer;
function visitValue(value, visitor) {
    if (visitor.onType) {
        var v = visitor.onType(value.type);
        if (v) {
            visitType(value.type, v);
        }
    }
}
exports.visitValue = visitValue;
function visitEnum(e, visitor) {
    if (visitor.onEnumMember) {
        e.members.forEach(function (member) {
            visitor.onEnumMember(member);
        });
    }
}
exports.visitEnum = visitEnum;
function visitClassConstructor(cls, visitor) {
    if (visitor.onClassConstructorDecorator && cls.decorators) {
        cls.decorators.forEach(function (decorator) {
            visitor.onClassConstructorDecorator(decorator);
        });
    }
    if (visitor.onTypeParameter && cls.typeParameters) {
        cls.typeParameters.forEach(function (typeParameter) {
            visitor.onTypeParameter(typeParameter);
        });
    }
    if (visitor.onExtend && cls.extends) {
        var eVisitor = visitor.onExtend(cls.extends);
        if (eVisitor) {
            visitClass(cls.extends, eVisitor);
        }
    }
    if (visitor.onImplement && cls.implements) {
        cls.implements.forEach(function (impl) {
            var iVisitor = visitor.onImplement(impl);
            if (iVisitor) {
                if (impl.typeKind === 7) {
                    visitInterface(impl, iVisitor);
                }
                else {
                    visitClass(impl, iVisitor);
                }
            }
        });
    }
    if (visitor.onInstanceType) {
        var iVisitor = visitor.onInstanceType(cls.instanceType);
        if (iVisitor) {
            visitCompositeType(cls.instanceType, iVisitor);
        }
    }
    if (visitor.onStaticType) {
        var sVisitor = visitor.onStaticType(cls.staticType);
        if (sVisitor) {
            visitCompositeType(cls.staticType, sVisitor);
        }
    }
}
exports.visitClassConstructor = visitClassConstructor;
function visitClass(cls, visitor) {
    if (visitor.onClassConstructor) {
        var ccVisitor = visitor.onClassConstructor(cls.typeConstructor);
        if (ccVisitor) {
            visitClassConstructor(cls.typeConstructor, ccVisitor);
        }
    }
    if (visitor.onClassDecorator && cls.decorators) {
        cls.decorators.forEach(function (decorator) {
            visitor.onClassDecorator(decorator);
        });
    }
    if (visitor.onTypeArgument && cls.typeArguments) {
        cls.typeArguments.forEach(function (typeArgument, i) {
            visitor.onTypeArgument(typeArgument, cls.typeConstructor.typeParameters[i]);
        });
    }
    if (visitor.onExtend && cls.extends) {
        var eVisitor = visitor.onExtend(cls.extends);
        if (eVisitor) {
            visitClass(cls.extends, eVisitor);
        }
    }
    if (visitor.onImplement && cls.implements) {
        cls.implements.forEach(function (impl) {
            var iVisitor = visitor.onImplement(impl);
            if (iVisitor) {
                if (impl.typeKind === 7) {
                    visitInterface(impl, iVisitor);
                }
                else {
                    visitClass(impl, iVisitor);
                }
            }
        });
    }
    if (visitor.onInstanceType) {
        var iVisitor = visitor.onInstanceType(cls.instanceType);
        if (iVisitor) {
            visitCompositeType(cls.instanceType, iVisitor);
        }
    }
    if (visitor.onStaticType) {
        var sVisitor = visitor.onStaticType(cls.staticType);
        if (sVisitor) {
            visitCompositeType(cls.staticType, sVisitor);
        }
    }
}
exports.visitClass = visitClass;
function visitInterfaceConstructor(inter, visitor) {
    if (visitor.onTypeParameter && inter.typeParameters) {
        inter.typeParameters.forEach(function (typeParameter) {
            visitor.onTypeParameter(typeParameter);
        });
    }
    if (visitor.onExtend && inter.extends) {
        inter.extends.forEach(function (impl) {
            var iVisitor = visitor.onExtend(impl);
            if (iVisitor) {
                if (impl.typeKind === 7) {
                    visitInterface(impl, iVisitor);
                }
                else {
                    visitClass(impl, iVisitor);
                }
            }
        });
    }
    if (visitor.onInstanceType) {
        var iVisitor = visitor.onInstanceType(inter.instanceType);
        if (iVisitor) {
            visitCompositeType(inter.instanceType, iVisitor);
        }
    }
}
exports.visitInterfaceConstructor = visitInterfaceConstructor;
function visitInterface(inter, visitor) {
    if (visitor.onInterfaceConstructor) {
        var icVisitor = visitor.onInterfaceConstructor(inter.typeConstructor);
        if (icVisitor) {
            visitInterfaceConstructor(inter.typeConstructor, icVisitor);
        }
    }
    if (visitor.onTypeArgument && inter.typeArguments) {
        inter.typeArguments.forEach(function (typeArgument, i) {
            visitor.onTypeArgument(typeArgument, inter.typeConstructor.typeParameters[i]);
        });
    }
    if (visitor.onExtend && inter.extends) {
        inter.extends.forEach(function (impl) {
            var iVisitor = visitor.onExtend(impl);
            if (iVisitor) {
                if (impl.typeKind === 7) {
                    visitInterface(impl, iVisitor);
                }
                else {
                    visitClass(impl, iVisitor);
                }
            }
        });
    }
    if (visitor.onInstanceType) {
        var iVisitor = visitor.onInstanceType(inter.instanceType);
        if (iVisitor) {
            visitCompositeType(inter.instanceType, iVisitor);
        }
    }
}
exports.visitInterface = visitInterface;
function visitCompositeType(compositeType, visitor) {
    if (visitor.onMember) {
        Object.keys(compositeType.members).forEach(function (memberName) {
            var member = compositeType.members[memberName];
            var mVisitor = visitor.onMember(member);
            if (mVisitor) {
                visitMember(member, mVisitor);
            }
        });
    }
    if (visitor.onIndex && compositeType.index) {
        visitor.onIndex(compositeType.index);
    }
    if (visitor.onCall && compositeType.calls) {
        compositeType.calls.forEach(function (call) {
            var cVisitor = visitor.onCall(call);
            if (cVisitor) {
                visitFunctionType(call, cVisitor);
            }
        });
    }
}
exports.visitCompositeType = visitCompositeType;
function visitMember(member, visitor) {
    if (visitor.onType) {
        var tVisitor = visitor.onType(member.type, member);
        if (tVisitor) {
            visitType(member.type, tVisitor);
        }
    }
    if (visitor.onMemberDecorator && member.decorators) {
        member.decorators.forEach(function (decorator) {
            visitor.onMemberDecorator(decorator);
        });
    }
}
exports.visitMember = visitMember;
function visitUnionOrIntersectionType(unionType, visitor) {
    if (visitor.onType) {
        unionType.types.forEach(function (type) {
            var v = visitor.onType(type);
            if (v) {
                visitType(type, v);
            }
        });
    }
}
exports.visitUnionOrIntersectionType = visitUnionOrIntersectionType;
function visitTupleType(tupleType, visitor) {
    if (visitor.onType) {
        tupleType.elements.forEach(function (type) {
            var v = visitor.onType(type);
            if (v) {
                visitType(type, v);
            }
        });
    }
}
exports.visitTupleType = visitTupleType;
function visitFunctionType(functionType, visitor) {
    if (visitor.onType && functionType.type) {
        var tVisitor = visitor.onType(functionType.type, functionType);
        if (tVisitor) {
            visitType(functionType.type, tVisitor);
        }
    }
    if (visitor.onParameter) {
        functionType.parameters.forEach(function (parameter) {
            var pVisitor = visitor.onParameter(parameter);
            if (pVisitor) {
                visitParameter(parameter, pVisitor);
            }
        });
    }
    if (visitor.onTypeParameter && functionType.typeParameters) {
        functionType.typeParameters.forEach(function (typeParameter) {
            visitor.onTypeParameter(typeParameter);
        });
    }
}
exports.visitFunctionType = visitFunctionType;
function visitParameter(parameter, visitor) {
    if (visitor.onType) {
        var tVisitor = visitor.onType(parameter.type, parameter);
        if (tVisitor) {
            visitType(parameter.type, tVisitor);
        }
    }
    if (visitor.onParameterDecorator && parameter.decorators) {
        parameter.decorators.forEach(function (decorator) {
            visitor.onParameterDecorator(decorator);
        });
    }
}
exports.visitParameter = visitParameter;
function visitTypeQuery(typeQuery, visitor) {
    switch (typeQuery.modelKind) {
        case 2:
            if (visitor.onNamespace) {
                var v = visitor.onNamespace(typeQuery.type);
                if (v) {
                    visitTypeContainer(typeQuery.type, v);
                }
            }
            break;
        case 14:
            if (visitor.onVariable) {
                var v = visitor.onVariable(typeQuery.type);
                if (v) {
                    visitValue(typeQuery.type, v);
                }
            }
            break;
        case 6:
            visitType(typeQuery.type, visitor);
            break;
    }
}
exports.visitTypeQuery = visitTypeQuery;
function visitType(type, visitor) {
    switch (type.typeKind) {
        case 3:
            if (visitor.onFunctionType) {
                var v = visitor.onFunctionType(type);
                if (v) {
                    visitFunctionType(type, v);
                }
            }
            break;
        case 6:
            if (visitor.onCompositeType) {
                var v = visitor.onCompositeType(type);
                if (v) {
                    visitCompositeType(type, v);
                }
            }
            break;
        case 7:
            if (visitor.onInterface) {
                var v = visitor.onInterface(type);
                if (v) {
                    visitInterface(type, v);
                }
            }
            break;
        case 8:
            var cls = type;
            if (cls.name === 'Array' && cls.typeConstructor.parent.name === '' && visitor.onArrayType) {
                var v = visitor.onArrayType(cls);
                if (v) {
                    visitType(cls.typeArguments[0], v);
                }
            }
            else if (visitor.onClass) {
                var v = visitor.onClass(cls);
                if (v) {
                    visitClass(cls, v);
                }
            }
            break;
        case 2:
            if (visitor.onEnumType) {
                visitor.onEnumType(type);
            }
            break;
        case 9:
            if (visitor.onTypeQuery) {
                var v = visitor.onTypeQuery(type);
                if (v) {
                    visitTypeQuery(type, v);
                }
            }
            break;
        case 5:
            if (visitor.onUnionType) {
                var v = visitor.onUnionType(type);
                if (v) {
                    visitUnionOrIntersectionType(type, v);
                }
            }
            break;
        case 11:
            if (visitor.onUnionType) {
                var v = visitor.onIntersectionType(type);
                if (v) {
                    visitUnionOrIntersectionType(type, v);
                }
            }
            break;
        case 4:
            if (visitor.onTupleType) {
                var v = visitor.onTupleType(type);
                if (v) {
                    visitTupleType(type, v);
                }
            }
            break;
        case 6:
            if (visitor.onCompositeType) {
                var v = visitor.onCompositeType(type);
                if (v) {
                    visitCompositeType(type, v);
                }
            }
            break;
        case 10:
            if (visitor.onTypeAlias) {
                var v = visitor.onTypeAlias(type);
                if (v) {
                    visitType(type.type, v);
                }
            }
            break;
        case 1:
            var p = type;
            switch (p.primitiveTypeKind) {
                case 1:
                    if (visitor.onString) {
                        visitor.onString();
                    }
                    break;
                case 2:
                    if (visitor.onBoolean) {
                        visitor.onBoolean();
                    }
                    break;
                case 3:
                    if (visitor.onNumber) {
                        visitor.onNumber();
                    }
                    break;
                case 4:
                    if (visitor.onVoid) {
                        visitor.onVoid();
                    }
                    break;
                case 5:
                    if (visitor.onAny) {
                        visitor.onAny();
                    }
                    break;
                case 6:
                    if (visitor.onSymbol) {
                        visitor.onSymbol();
                    }
                    break;
            }
            break;
    }
}
exports.visitType = visitType;
//# sourceMappingURL=visitor.js.map