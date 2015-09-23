import * as m from './model';
import * as f from './factories';
export declare function filterModules(moduleNames: string[] | ((moduleName: string) => boolean), modules: m.KeyValue<f.ModuleFactory>): m.KeyValue<f.ModuleFactory>;
