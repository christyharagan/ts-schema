import * as s from './schema'

export interface SchemaVisitor extends ModuleSchemaVisitor {
  onModuleSchema?: (moduleSchema: s.ModuleSchema) => void
}

export interface ModuleSchemaVisitor extends ClassSchemaVisitor, InterfaceSchemaVisitor {
  onClass?: (classSchema: s.ClassSchema, moduleSchema?: s.ModuleSchema) => void
  onInterface?: (interfaceSchema: s.InterfaceSchema, moduleSchema?: s.ModuleSchema) => void
}

export interface ClassSchemaVisitor {
  onClassDecorator?: (decoratorSchema: s.DecoratorSchema, classSchema?: s.ClassSchema, moduleSchema?: s.ModuleSchema) => void
  onClassMember?: (memberSchema: s.MemberSchema, classSchema?: s.ClassSchema, moduleSchema?: s.ModuleSchema) => void
}

export interface InterfaceSchemaVisitor {
  onInterfaceMember?: (memberSchema: s.MemberSchema, interfaceSchema?: s.InterfaceSchema, moduleSchema?: s.ModuleSchema) => void
}

export function schemaVisitor(schema: s.Schema, visitor: SchemaVisitor) {
  Object.keys(schema).forEach(function(name) {
    let subSchema = schema[name]
    if (visitor.onModuleSchema) {
      visitor.onModuleSchema(<s.ModuleSchema>subSchema)
    }
    moduleSchemaVisitor(<s.ModuleSchema>subSchema, visitor)
  })
}

export function moduleSchemaVisitor(moduleSchema: s.ModuleSchema, visitor: ModuleSchemaVisitor) {
  Object.keys(moduleSchema.classes).forEach(function(className: string) {
    let classSchema = moduleSchema.classes[className]
    if (visitor.onClass) {
      visitor.onClass(classSchema, moduleSchema)
    }
    classSchemaVisitor(classSchema, visitor, moduleSchema)
  })
  Object.keys(moduleSchema.interfaces).forEach(function(interfaceName: string) {
    let interfaceSchema = moduleSchema.interfaces[interfaceName]
    if (visitor.onInterface) {
      visitor.onInterface(interfaceSchema, moduleSchema)
    }
    interfaceSchemaVisitor(interfaceSchema, visitor, moduleSchema)
  })
}

export function classSchemaVisitor(classSchema: s.ClassSchema, visitor: ClassSchemaVisitor, moduleSchema?: s.ModuleSchema) {
  if (visitor.onClassDecorator) {
    classSchema.decorators.forEach(function(decoratorSchema) {
      visitor.onClassDecorator(decoratorSchema, classSchema, moduleSchema)
    })
  }
  if (visitor.onClassMember) {
    Object.keys(classSchema.members).forEach(function(memberName) {
      visitor.onClassMember(classSchema.members[memberName], classSchema, moduleSchema)
    })
  }
}

export function interfaceSchemaVisitor(interfaceSchema: s.InterfaceSchema, visitor: InterfaceSchemaVisitor, moduleSchema?: s.ModuleSchema) {
  if (visitor.onInterfaceMember) {
    Object.keys(interfaceSchema.members).forEach(function(memberName) {
      visitor.onInterfaceMember(interfaceSchema.members[memberName], interfaceSchema, moduleSchema)
    })
  }
}