var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var m = require('./model');
var AbstractFactory = (function () {
    function AbstractFactory(modelKind) {
        this.modelKind = modelKind;
    }
    AbstractFactory.prototype.construct = function (constructorConstructor) {
        if (!this._constructor) {
            var self_1 = this;
            var _constructor = constructorConstructor(this);
            this._constructor = function () {
                self_1._constructor = undefined;
                return _constructor();
            };
        }
        return this._constructor;
    };
    return AbstractFactory;
})();
exports.AbstractFactory = AbstractFactory;
var AbstractExpressionFactory = (function (_super) {
    __extends(AbstractExpressionFactory, _super);
    function AbstractExpressionFactory(kind) {
        _super.call(this, 13);
        this.expressionKind = kind;
    }
    return AbstractExpressionFactory;
})(AbstractFactory);
exports.AbstractExpressionFactory = AbstractExpressionFactory;
var AbstractTypeFactory = (function (_super) {
    __extends(AbstractTypeFactory, _super);
    function AbstractTypeFactory(kind) {
        _super.call(this, 6);
        this.typeKind = kind;
    }
    return AbstractTypeFactory;
})(AbstractFactory);
exports.AbstractTypeFactory = AbstractTypeFactory;
var FunctionExpressionFactory = (function (_super) {
    __extends(FunctionExpressionFactory, _super);
    function FunctionExpressionFactory() {
        _super.call(this, 3);
    }
    return FunctionExpressionFactory;
})(AbstractExpressionFactory);
exports.FunctionExpressionFactory = FunctionExpressionFactory;
var FunctionCallExpressionFactory = (function (_super) {
    __extends(FunctionCallExpressionFactory, _super);
    function FunctionCallExpressionFactory() {
        _super.call(this, 9);
    }
    FunctionCallExpressionFactory.prototype.createFunction = function (kind) {
        if (!this.function) {
            var func = expressionFactory(kind);
            this.function = func;
        }
        return this.function;
    };
    FunctionCallExpressionFactory.prototype.addArgument = function (kindOrExpression) {
        var argument = expressionFactory(kindOrExpression);
        this.arguments.push(argument);
        return argument;
    };
    return FunctionCallExpressionFactory;
})(AbstractExpressionFactory);
exports.FunctionCallExpressionFactory = FunctionCallExpressionFactory;
var PropertyAccessExpressionFactory = (function (_super) {
    __extends(PropertyAccessExpressionFactory, _super);
    function PropertyAccessExpressionFactory() {
        _super.call(this, 10);
    }
    PropertyAccessExpressionFactory.prototype.createParent = function (kindOrExpression) {
        if (!this.parent) {
            var parent_1 = expressionFactory(kindOrExpression);
            this.parent = parent_1;
        }
        return this.parent;
    };
    return PropertyAccessExpressionFactory;
})(AbstractExpressionFactory);
exports.PropertyAccessExpressionFactory = PropertyAccessExpressionFactory;
var ValueExpressionFactory = (function (_super) {
    __extends(ValueExpressionFactory, _super);
    function ValueExpressionFactory() {
        _super.call(this, 8);
    }
    return ValueExpressionFactory;
})(AbstractExpressionFactory);
exports.ValueExpressionFactory = ValueExpressionFactory;
var EnumExpressionFactory = (function (_super) {
    __extends(EnumExpressionFactory, _super);
    function EnumExpressionFactory() {
        _super.call(this, 2);
    }
    return EnumExpressionFactory;
})(AbstractExpressionFactory);
exports.EnumExpressionFactory = EnumExpressionFactory;
var ClassExpressionFactory = (function (_super) {
    __extends(ClassExpressionFactory, _super);
    function ClassExpressionFactory() {
        _super.call(this, 4);
    }
    ClassExpressionFactory.prototype.createClass = function () {
        if (!this.class) {
            this.class = new ProtoClassFactory();
        }
        return this.class;
    };
    return ClassExpressionFactory;
})(AbstractExpressionFactory);
exports.ClassExpressionFactory = ClassExpressionFactory;
var ClassReferenceExpressionFactory = (function (_super) {
    __extends(ClassReferenceExpressionFactory, _super);
    function ClassReferenceExpressionFactory() {
        _super.call(this, 7);
    }
    return ClassReferenceExpressionFactory;
})(AbstractExpressionFactory);
exports.ClassReferenceExpressionFactory = ClassReferenceExpressionFactory;
var NewExpressionFactory = (function (_super) {
    __extends(NewExpressionFactory, _super);
    function NewExpressionFactory() {
        _super.call(this, 11);
    }
    return NewExpressionFactory;
})(AbstractExpressionFactory);
exports.NewExpressionFactory = NewExpressionFactory;
var ObjectExpressionFactory = (function (_super) {
    __extends(ObjectExpressionFactory, _super);
    function ObjectExpressionFactory() {
        _super.call(this, 5);
        this.properties = {};
    }
    ObjectExpressionFactory.prototype.addProperty = function (key, kindOrExpression) {
        var ec = expressionFactory(kindOrExpression);
        this.properties[key] = ec;
        return ec;
    };
    return ObjectExpressionFactory;
})(AbstractExpressionFactory);
exports.ObjectExpressionFactory = ObjectExpressionFactory;
var ArrayExpressionFactory = (function (_super) {
    __extends(ArrayExpressionFactory, _super);
    function ArrayExpressionFactory() {
        _super.call(this, 6);
        this.elements = [];
    }
    ArrayExpressionFactory.prototype.addElement = function (kindOrExpression) {
        var ec = expressionFactory(kindOrExpression);
        this.elements.push(ec);
        return ec;
    };
    return ArrayExpressionFactory;
})(AbstractExpressionFactory);
exports.ArrayExpressionFactory = ArrayExpressionFactory;
var PrimitiveExpressionFactory = (function (_super) {
    __extends(PrimitiveExpressionFactory, _super);
    function PrimitiveExpressionFactory(primitiveTypeKind, primitiveValue) {
        _super.call(this, 1);
        this.primitiveTypeKind = primitiveTypeKind;
        this.primitiveValue = primitiveValue;
    }
    return PrimitiveExpressionFactory;
})(AbstractExpressionFactory);
exports.PrimitiveExpressionFactory = PrimitiveExpressionFactory;
var DecoratorFactory = (function (_super) {
    __extends(DecoratorFactory, _super);
    function DecoratorFactory(parent) {
        _super.call(this, 12);
        this.parameters = [];
        this.parent = parent;
    }
    return DecoratorFactory;
})(AbstractFactory);
exports.DecoratorFactory = DecoratorFactory;
var PrimitiveTypeFactory = (function (_super) {
    __extends(PrimitiveTypeFactory, _super);
    function PrimitiveTypeFactory(primitiveTypeKind) {
        _super.call(this, 1);
        this.primitiveTypeKind = primitiveTypeKind;
    }
    return PrimitiveTypeFactory;
})(AbstractTypeFactory);
exports.PrimitiveTypeFactory = PrimitiveTypeFactory;
var TupleTypeFactory = (function (_super) {
    __extends(TupleTypeFactory, _super);
    function TupleTypeFactory() {
        _super.call(this, 4);
        this.elements = [];
    }
    return TupleTypeFactory;
})(AbstractTypeFactory);
exports.TupleTypeFactory = TupleTypeFactory;
var UnionOrIntersectionTypeFactory = (function (_super) {
    __extends(UnionOrIntersectionTypeFactory, _super);
    function UnionOrIntersectionTypeFactory(typeKind) {
        _super.call(this, typeKind);
        this.types = [];
    }
    return UnionOrIntersectionTypeFactory;
})(AbstractTypeFactory);
exports.UnionOrIntersectionTypeFactory = UnionOrIntersectionTypeFactory;
var EnumMemberFactory = (function (_super) {
    __extends(EnumMemberFactory, _super);
    function EnumMemberFactory(parent, name) {
        _super.call(this, 15);
        this.name = name;
        this.parent = parent;
    }
    return EnumMemberFactory;
})(AbstractFactory);
exports.EnumMemberFactory = EnumMemberFactory;
var EnumFactory = (function (_super) {
    __extends(EnumFactory, _super);
    function EnumFactory(parent, name) {
        _super.call(this, 2);
        this.members = [];
        this.name = name;
        this.parent = parent;
    }
    EnumFactory.prototype.addMember = function (name) {
        var memberConstructor = new EnumMemberFactory(this, name);
        this.members.push(memberConstructor);
        return memberConstructor;
    };
    return EnumFactory;
})(AbstractTypeFactory);
exports.EnumFactory = EnumFactory;
var TypeQueryFactory = (function (_super) {
    __extends(TypeQueryFactory, _super);
    function TypeQueryFactory() {
        _super.call(this, 9);
    }
    return TypeQueryFactory;
})(AbstractTypeFactory);
exports.TypeQueryFactory = TypeQueryFactory;
var ValueFactory = (function (_super) {
    __extends(ValueFactory, _super);
    function ValueFactory(parent, name) {
        _super.call(this, 14);
        this.name = name;
        this.parent = parent;
    }
    return ValueFactory;
})(AbstractFactory);
exports.ValueFactory = ValueFactory;
var AbstractParameterFactory = (function (_super) {
    __extends(AbstractParameterFactory, _super);
    function AbstractParameterFactory(parent, name, optional) {
        _super.call(this, 8);
        this.parent = parent;
        this.name = name;
        this.optional = optional;
    }
    return AbstractParameterFactory;
})(AbstractFactory);
exports.AbstractParameterFactory = AbstractParameterFactory;
var DecoratedParameterFactory = (function (_super) {
    __extends(DecoratedParameterFactory, _super);
    function DecoratedParameterFactory(parent, name, isOptional) {
        _super.call(this, parent, name, isOptional);
        this.modelKind = 9;
    }
    DecoratedParameterFactory.prototype.addDecorator = function () {
        return decoratorFactory(this);
    };
    return DecoratedParameterFactory;
})(AbstractParameterFactory);
exports.DecoratedParameterFactory = DecoratedParameterFactory;
var ParameterFactory = (function (_super) {
    __extends(ParameterFactory, _super);
    function ParameterFactory() {
        _super.apply(this, arguments);
    }
    return ParameterFactory;
})(AbstractParameterFactory);
exports.ParameterFactory = ParameterFactory;
var AbstractFunctionTypeFactory = (function (_super) {
    __extends(AbstractFunctionTypeFactory, _super);
    function AbstractFunctionTypeFactory(isDecorated) {
        _super.call(this, 3);
        this.parameters = [];
        this.typeParameters = [];
        this.isDecorated = isDecorated;
    }
    AbstractFunctionTypeFactory.prototype.addTypeParameter = function (name) {
        var typeParameterConstructor = new TypeParameterFactory(this, name);
        this.typeParameters.push(typeParameterConstructor);
        return typeParameterConstructor;
    };
    AbstractFunctionTypeFactory.prototype.addParameter = function (name, isOptional) {
        var parameterConstructor = (this.isDecorated ? new DecoratedParameterFactory(this, name, isOptional) : new ParameterFactory(this, name, isOptional));
        this.parameters.push(parameterConstructor);
        return parameterConstructor;
    };
    return AbstractFunctionTypeFactory;
})(AbstractTypeFactory);
exports.AbstractFunctionTypeFactory = AbstractFunctionTypeFactory;
var DecoratedFunctionTypeFactory = (function (_super) {
    __extends(DecoratedFunctionTypeFactory, _super);
    function DecoratedFunctionTypeFactory() {
        _super.call(this, true);
    }
    return DecoratedFunctionTypeFactory;
})(AbstractFunctionTypeFactory);
exports.DecoratedFunctionTypeFactory = DecoratedFunctionTypeFactory;
var FunctionTypeFactory = (function (_super) {
    __extends(FunctionTypeFactory, _super);
    function FunctionTypeFactory() {
        _super.call(this, false);
    }
    return FunctionTypeFactory;
})(AbstractFunctionTypeFactory);
exports.FunctionTypeFactory = FunctionTypeFactory;
var AbstractMemberFactory = (function (_super) {
    __extends(AbstractMemberFactory, _super);
    function AbstractMemberFactory(parent, name, optional) {
        _super.call(this, 10);
        this.name = name;
        this.optional = optional;
    }
    return AbstractMemberFactory;
})(AbstractFactory);
exports.AbstractMemberFactory = AbstractMemberFactory;
var DecoratedMemberFactory = (function (_super) {
    __extends(DecoratedMemberFactory, _super);
    function DecoratedMemberFactory(parent, name, optional) {
        _super.call(this, parent, name, optional);
        this.decorators = [];
        this.modelKind = 11;
    }
    DecoratedMemberFactory.prototype.addDecorator = function () {
        return decoratorFactory(this);
    };
    return DecoratedMemberFactory;
})(AbstractMemberFactory);
exports.DecoratedMemberFactory = DecoratedMemberFactory;
var MemberFactory = (function (_super) {
    __extends(MemberFactory, _super);
    function MemberFactory() {
        _super.apply(this, arguments);
    }
    return MemberFactory;
})(AbstractMemberFactory);
exports.MemberFactory = MemberFactory;
var IndexFactory = (function (_super) {
    __extends(IndexFactory, _super);
    function IndexFactory(parent) {
        _super.call(this, 7);
        this.parent = parent;
    }
    return IndexFactory;
})(AbstractFactory);
exports.IndexFactory = IndexFactory;
var AbstractCompositeTypeFactory = (function (_super) {
    __extends(AbstractCompositeTypeFactory, _super);
    function AbstractCompositeTypeFactory(isDecorated) {
        _super.call(this, 6);
        this.members = {};
        this.calls = [];
        this.isDecorated = isDecorated;
    }
    AbstractCompositeTypeFactory.prototype.addMember = function (name, optional) {
        var memberConstructor = (this.isDecorated ? new DecoratedMemberFactory(this, name, optional) : new MemberFactory(this, name, optional));
        this.members[name] = memberConstructor;
        return memberConstructor;
    };
    AbstractCompositeTypeFactory.prototype.createIndex = function (keyType) {
        if (!this.index) {
            var indexConstructor = new IndexFactory(this);
            indexConstructor.keyType = keyType;
            this.index = indexConstructor;
        }
        return this.index;
    };
    return AbstractCompositeTypeFactory;
})(AbstractTypeFactory);
exports.AbstractCompositeTypeFactory = AbstractCompositeTypeFactory;
var DecoratedCompositeTypeFactory = (function (_super) {
    __extends(DecoratedCompositeTypeFactory, _super);
    function DecoratedCompositeTypeFactory(parent) {
        _super.call(this, true);
        this.parent = parent;
    }
    return DecoratedCompositeTypeFactory;
})(AbstractCompositeTypeFactory);
exports.DecoratedCompositeTypeFactory = DecoratedCompositeTypeFactory;
var CompositeTypeFactory = (function (_super) {
    __extends(CompositeTypeFactory, _super);
    function CompositeTypeFactory(parent, isDecorated) {
        _super.call(this, isDecorated);
        this.parent = parent;
    }
    return CompositeTypeFactory;
})(AbstractCompositeTypeFactory);
exports.CompositeTypeFactory = CompositeTypeFactory;
var TypeParameterFactory = (function (_super) {
    __extends(TypeParameterFactory, _super);
    function TypeParameterFactory(parent, name) {
        _super.call(this, 12);
        this.parent = parent;
        this.name = name;
    }
    return TypeParameterFactory;
})(AbstractTypeFactory);
exports.TypeParameterFactory = TypeParameterFactory;
var AbstractConstructableTypeFactory = (function (_super) {
    __extends(AbstractConstructableTypeFactory, _super);
    function AbstractConstructableTypeFactory() {
        _super.apply(this, arguments);
        this.typeArguments = [];
    }
    return AbstractConstructableTypeFactory;
})(AbstractTypeFactory);
exports.AbstractConstructableTypeFactory = AbstractConstructableTypeFactory;
var ClassFactory = (function (_super) {
    __extends(ClassFactory, _super);
    function ClassFactory() {
        _super.call(this, 8);
        this.implements = [];
        this.decorators = [];
    }
    ClassFactory.prototype.addDecorator = function () {
        return decoratorFactory(this);
    };
    return ClassFactory;
})(AbstractConstructableTypeFactory);
exports.ClassFactory = ClassFactory;
var InterfaceFactory = (function (_super) {
    __extends(InterfaceFactory, _super);
    function InterfaceFactory() {
        _super.call(this, 7);
        this.extends = [];
    }
    return InterfaceFactory;
})(AbstractConstructableTypeFactory);
exports.InterfaceFactory = InterfaceFactory;
var TypeAliasFactory = (function (_super) {
    __extends(TypeAliasFactory, _super);
    function TypeAliasFactory() {
        _super.call(this, 10);
    }
    return TypeAliasFactory;
})(AbstractConstructableTypeFactory);
exports.TypeAliasFactory = TypeAliasFactory;
var ProtoClassFactory = (function (_super) {
    __extends(ProtoClassFactory, _super);
    function ProtoClassFactory() {
        _super.call(this, 8);
    }
    ProtoClassFactory.prototype.createInstanceType = function () {
        if (!this.instanceType) {
            var instanceTypeConstructor = new CompositeTypeFactory(this, false);
            this.instanceType = instanceTypeConstructor;
        }
        return this.instanceType;
    };
    ProtoClassFactory.prototype.createStaticType = function () {
        if (!this.staticType) {
            var staticTypeConstructor = new CompositeTypeFactory(this, false);
            this.staticType = staticTypeConstructor;
        }
        return this.staticType;
    };
    return ProtoClassFactory;
})(AbstractTypeFactory);
exports.ProtoClassFactory = ProtoClassFactory;
var AbstractTypeConstructorFactory = (function (_super) {
    __extends(AbstractTypeConstructorFactory, _super);
    function AbstractTypeConstructorFactory(modelKind, parent, name) {
        _super.call(this, modelKind);
        this.typeParameters = [];
        this.parent = parent;
        this.name = name;
    }
    AbstractTypeConstructorFactory.prototype.addTypeParameter = function (name) {
        return typeParameterFactory(this, name);
    };
    return AbstractTypeConstructorFactory;
})(AbstractFactory);
exports.AbstractTypeConstructorFactory = AbstractTypeConstructorFactory;
var InterfaceConstructorFactory = (function (_super) {
    __extends(InterfaceConstructorFactory, _super);
    function InterfaceConstructorFactory(parent, name) {
        _super.call(this, 4, parent, name);
        this.extends = [];
        this.typeParameters = [];
    }
    InterfaceConstructorFactory.prototype.createInstanceType = function () {
        if (!this.instanceType) {
            var instanceTypeConstructor = new CompositeTypeFactory(this, false);
            this.instanceType = instanceTypeConstructor;
        }
        return this.instanceType;
    };
    return InterfaceConstructorFactory;
})(AbstractTypeConstructorFactory);
exports.InterfaceConstructorFactory = InterfaceConstructorFactory;
var TypeAliasConstructorFactory = (function (_super) {
    __extends(TypeAliasConstructorFactory, _super);
    function TypeAliasConstructorFactory(parent, name) {
        _super.call(this, 5, parent, name);
    }
    return TypeAliasConstructorFactory;
})(AbstractTypeConstructorFactory);
exports.TypeAliasConstructorFactory = TypeAliasConstructorFactory;
var ClassConstructorFactory = (function (_super) {
    __extends(ClassConstructorFactory, _super);
    function ClassConstructorFactory(parent, name) {
        _super.call(this, 3, parent, name);
        this.implements = [];
        this.decorators = [];
    }
    ClassConstructorFactory.prototype.createInstanceType = function () {
        if (!this.instanceType) {
            var instanceTypeConstructor = new DecoratedCompositeTypeFactory(this);
            this.instanceType = instanceTypeConstructor;
        }
        return this.instanceType;
    };
    ClassConstructorFactory.prototype.createStaticType = function () {
        if (!this.staticType) {
            var staticTypeConstructor = new DecoratedCompositeTypeFactory(this);
            this.staticType = staticTypeConstructor;
        }
        return this.staticType;
    };
    ClassConstructorFactory.prototype.addDecorator = function () {
        return decoratorFactory(this);
    };
    return ClassConstructorFactory;
})(AbstractTypeConstructorFactory);
exports.ClassConstructorFactory = ClassConstructorFactory;
var AbstractContainerFactory = (function (_super) {
    __extends(AbstractContainerFactory, _super);
    function AbstractContainerFactory(kind, name) {
        _super.call(this, 2);
        this.classConstructors = {};
        this.interfaceConstructors = {};
        this.typeAliasConstructors = {};
        this.enums = {};
        this.values = {};
        this.namespaces = {};
        this.name = name;
        this.containerKind = kind;
    }
    AbstractContainerFactory.prototype.addClassConstructor = function (name) {
        var cc = this.classConstructors[name];
        if (cc) {
            return cc;
        }
        else {
            var ccc = new ClassConstructorFactory(this, name);
            this.classConstructors[name] = ccc;
            return ccc;
        }
    };
    AbstractContainerFactory.prototype.addInterfaceConstructor = function (name) {
        var ic = this.interfaceConstructors[name];
        if (ic) {
            return ic;
        }
        else {
            var icc = new InterfaceConstructorFactory(this, name);
            this.interfaceConstructors[name] = icc;
            return icc;
        }
    };
    AbstractContainerFactory.prototype.addTypeAliasConstructor = function (name) {
        var ta = this.typeAliasConstructors[name];
        if (ta) {
            return ta;
        }
        else {
            var tac = new TypeAliasConstructorFactory(this, name);
            this.typeAliasConstructors[name] = tac;
            return tac;
        }
    };
    AbstractContainerFactory.prototype.addEnum = function (name) {
        var et = this.enums[name];
        if (et) {
            return et;
        }
        else {
            var etc = new EnumFactory(this, name);
            this.enums[name] = etc;
            return etc;
        }
    };
    AbstractContainerFactory.prototype.addValue = function (name) {
        var s = this.values[name];
        if (s) {
            return s;
        }
        else {
            var sc = new ValueFactory(this, name);
            this.values[name] = sc;
            return sc;
        }
    };
    AbstractContainerFactory.prototype.addNamespace = function (name) {
        var ns = this.namespaces[name];
        if (ns) {
            return ns;
        }
        else {
            var nsc = new NamespaceFactory(this, name);
            this.namespaces[name] = nsc;
            return nsc;
        }
    };
    return AbstractContainerFactory;
})(AbstractFactory);
exports.AbstractContainerFactory = AbstractContainerFactory;
var ModuleFactory = (function (_super) {
    __extends(ModuleFactory, _super);
    function ModuleFactory(name) {
        _super.call(this, 1, name);
    }
    return ModuleFactory;
})(AbstractContainerFactory);
exports.ModuleFactory = ModuleFactory;
var NamespaceFactory = (function (_super) {
    __extends(NamespaceFactory, _super);
    function NamespaceFactory(parent, name) {
        _super.call(this, 2, name);
        this.parent = parent;
    }
    return NamespaceFactory;
})(AbstractContainerFactory);
exports.NamespaceFactory = NamespaceFactory;
var PackageFactory = (function (_super) {
    __extends(PackageFactory, _super);
    function PackageFactory() {
        _super.call(this, 1);
        this.modules = {};
    }
    return PackageFactory;
})(AbstractFactory);
exports.PackageFactory = PackageFactory;
function expressionFactory(kindOrExpression) {
    if (kindOrExpression.modelKind) {
        return kindOrExpression;
    }
    else {
        var kind = kindOrExpression;
        switch (kind) {
            case 1:
                return new PrimitiveExpressionFactory();
            case 4:
                return new ClassExpressionFactory();
            case 5:
                return new ObjectExpressionFactory();
            case 6:
                return new ArrayExpressionFactory();
            case 2:
                return new EnumExpressionFactory();
            case 8:
                return new ValueExpressionFactory();
            case 3:
                return new FunctionExpressionFactory();
            case 7:
                return new ClassReferenceExpressionFactory();
            case 9:
                return new FunctionCallExpressionFactory();
            case 10:
                return new PropertyAccessExpressionFactory();
            case 11:
                return new NewExpressionFactory();
        }
    }
}
exports.expressionFactory = expressionFactory;
function decoratorFactory(instance) {
    var decoratorConstructor = new DecoratorFactory(instance);
    instance.decorators.push(decoratorConstructor);
    return decoratorConstructor;
}
function typeParameterFactory(instance, name) {
    if (!instance.typeParameters) {
        instance.typeParameters = [];
    }
    var typeParameterConstructor = new TypeParameterFactory(instance, name);
    instance.typeParameters.push(typeParameterConstructor);
    return typeParameterConstructor;
}
//# sourceMappingURL=factories.js.map