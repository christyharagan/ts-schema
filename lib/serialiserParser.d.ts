import { serializable as m, KeyValue } from './model';
export declare function stringifyModuleReplacer(key: string, value: any): any;
export declare function parseModuleReplacer(key: string, value: any): any;
export declare function stringifyModules(mods: KeyValue<m.Container>): string;
export declare function stringifyModule(mod: m.Container): string;
export declare function parseModules(modsString: string): KeyValue<m.Container>;
export declare function parseModule(modString: string): m.Container;
