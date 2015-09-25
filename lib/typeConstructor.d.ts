import { reflective as m, KeyValue } from './model';
export declare type ClosedTypes = KeyValue<m.ConstructableType<any>[]>;
export declare function constructTypeAlias<T extends m.Type>(typeAliasConstructor: m.TypeAliasConstructor<T>, typeArgs: m.Type[], parentTypeArgs?: KeyValue<m.Type>, closedTypes?: ClosedTypes): m.TypeAlias<T>;
export declare function constructClass(classConstructor: m.ClassConstructor, typeArgs: m.Type[], parentTypeArgs?: KeyValue<m.Type>, closedTypes?: ClosedTypes): m.Class;
export declare function constructInterface(interfaceConstructor: m.InterfaceConstructor, typeArgs: m.Type[], parentTypeArgs?: KeyValue<m.Type>, closedTypes?: ClosedTypes): m.Interface;
