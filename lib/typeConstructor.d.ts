import { reflective as m, KeyValue } from './model';
export declare type ClosedTypes = KeyValue<[m.Interface | m.Class | m.TypeAlias<any>, KeyValue<m.Type>][]>;
export declare function constructTypeAlias<T extends m.Type>(typeAliasConstructor: m.TypeAliasConstructor<T>, typeArgs: m.Type[], parentTypeArgs?: KeyValue<m.Type>, closedTypes?: ClosedTypes, typeAlias?: m.TypeAlias<T>): m.TypeAlias<T>;
export declare function constructClass(classConstructor: m.ClassConstructor, typeArgs: m.Type[], parentTypeArgs?: KeyValue<m.Type>, closedTypes?: ClosedTypes, cls?: m.Class): m.Class;
export declare function constructInterface(interfaceConstructor: m.InterfaceConstructor, typeArgs: m.Type[], parentTypeArgs?: KeyValue<m.Type>, closedTypes?: ClosedTypes, int?: m.Interface): m.Interface;
