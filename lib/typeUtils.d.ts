import { reflective as m } from './model';
export declare function isFunctionVoid(f: m.FunctionType): boolean;
export declare function isSubType(potentialSubType: m.Class | m.Interface, potentialSuperType: m.Class | m.Interface): any;
export declare function isFunctionType(type: m.Type): any;
