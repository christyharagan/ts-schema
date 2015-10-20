function stringifyModuleReplacer(key, value) {
    if (key === 'typeKind') {
        switch (value) {
            case 1:
                return 'PRIMITIVE';
            case 2:
                return 'ENUM';
            case 9:
                return 'TYPE_QUERY';
            case 10:
                return 'TYPE_ALIAS';
            case 3:
                return 'FUNCTION';
            case 4:
                return 'TUPLE';
            case 5:
                return 'UNION';
            case 6:
                return 'COMPOSITE';
            case 7:
                return 'INTERFACE';
            case 8:
                return 'CLASS';
            case 12:
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
                return 1;
            case 'ENUM':
                return 2;
            case 'TYPE_QUERY':
                return 9;
            case 'FUNCTION':
                return 3;
            case 'TUPLE':
                return 4;
            case 'UNION':
                return 5;
            case 'COMPOSITE':
                return 6;
            case 'INTERFACE':
                return 7;
            case 'CLASS':
                return 8;
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