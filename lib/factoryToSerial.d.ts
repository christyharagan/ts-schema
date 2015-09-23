import { ModelElementTemplate } from './model';
import * as f from './factories';
export declare function factoryToSerializable(): <U extends ModelElementTemplate>(factory: f.Factory<U>) => (() => U);
