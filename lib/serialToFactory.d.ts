import { serializable as m, KeyValue } from './model';
import * as f from './factories';
export declare function convertRawModules(modules: KeyValue<m.Container>): KeyValue<f.ModuleFactory>;
