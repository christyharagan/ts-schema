var model_1 = require('./model');
function stringifyModuleReplacer(key, value) {
    if (key === 'typeKind') {
        switch (value) {
            case model_1.TypeKind.PRIMITIVE:
                return 'PRIMITIVE';
            case model_1.TypeKind.ENUM:
                return 'ENUM';
            case model_1.TypeKind.TYPE_QUERY:
                return 'TYPE_QUERY';
            case model_1.TypeKind.TYPE_ALIAS:
                return 'TYPE_ALIAS';
            case model_1.TypeKind.FUNCTION:
                return 'FUNCTION';
            case model_1.TypeKind.TUPLE:
                return 'TUPLE';
            case model_1.TypeKind.UNION:
                return 'UNION';
            case model_1.TypeKind.COMPOSITE:
                return 'COMPOSITE';
            case model_1.TypeKind.INTERFACE:
                return 'INTERFACE';
            case model_1.TypeKind.CLASS:
                return 'CLASS';
            case model_1.TypeKind.TYPE_PARAMETER:
                return 'TYPE_PARAMETER';
        }
        return undefined;
    }
    else {
        return value;
    }
}
exports.stringifyModuleReplacer = stringifyModuleReplacer;
function parseModuleReplacer(key, value) {
    if (key === 'typeKind') {
        switch (value.toUpperCase()) {
            case 'PRIMITIVE':
                return model_1.TypeKind.PRIMITIVE;
            case 'ENUM':
                return model_1.TypeKind.ENUM;
            case 'TYPE_QUERY':
                return model_1.TypeKind.TYPE_QUERY;
            case 'FUNCTION':
                return model_1.TypeKind.FUNCTION;
            case 'TUPLE':
                return model_1.TypeKind.TUPLE;
            case 'UNION':
                return model_1.TypeKind.UNION;
            case 'COMPOSITE':
                return model_1.TypeKind.COMPOSITE;
            case 'INTERFACE':
                return model_1.TypeKind.INTERFACE;
            case 'CLASS':
                return model_1.TypeKind.CLASS;
            default:
                throw new Error('Unrecognised typeKind value: ' + value);
        }
    }
    else {
        return value;
    }
}
exports.parseModuleReplacer = parseModuleReplacer;
function stringifyModules(mods) {
    return JSON.stringify(mods, stringifyModuleReplacer, '  ');
}
exports.stringifyModules = stringifyModules;
function stringifyModule(mod) {
    return JSON.stringify(mod, stringifyModuleReplacer, '  ');
}
exports.stringifyModule = stringifyModule;
function parseModules(modsString) {
    return JSON.parse(modsString, parseModuleReplacer);
}
exports.parseModules = parseModules;
function parseModule(modString) {
    return JSON.parse(modString, parseModuleReplacer);
}
exports.parseModule = parseModule;
//# sourceMappingURL=serialiserParser.js.map