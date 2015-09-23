import { reflective as m, KeyValue, ModelElementTemplate } from './model';
import * as f from './factories';
export declare function factoryToReflective(pkg?: m.Package, _typeParameters?: KeyValue<m.TypeParameter<any>>): <U extends ModelElementTemplate>(factory: f.Factory<U>) => (() => U);
