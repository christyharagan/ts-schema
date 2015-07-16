import * as s from './schema'

export interface SchemaVisitor extends ModuleSchemaVisitor {
  onModuleSchema?: (moduleSchema: s.Module) => void
}

export interface ModuleSchemaVisitor extends ClassSchemaVisitor, InterfaceSchemaVisitor {
  onClass?: (classSchema: s.Class, moduleSchema?: s.Module) => void
  onInterface?: (interfaceSchema: s.Interface, moduleSchema?: s.Module) => void
}

export interface ClassSchemaVisitor {
  onClassDecorator?: (decoratorSchema: s.Decorator, classSchema?: s.Class, moduleSchema?: s.Module) => void
  onClassMember?: (memberSchema: s.ClassMember, classSchema?: s.Class, moduleSchema?: s.Module) => void
  onClassMemberDecorator?: (decoratorSchema: s.Decorator, memberSchema: s.ClassMember, classSchema?: s.Class, moduleSchema?: s.Module) => void
}

export interface InterfaceSchemaVisitor {
  onInterfaceMember?: (memberSchema: s.InterfaceMember, interfaceSchema?: s.Interface, moduleSchema?: s.Module) => void
}

export function schemaVisitor(schema: s.Schema, visitor: SchemaVisitor) {
  Object.keys(schema).forEach(function(name) {
    let subSchema = schema[name]
    if (visitor.onModuleSchema) {
      visitor.onModuleSchema(subSchema)
    }
    moduleSchemaVisitor(subSchema, visitor)
  })
}

export function moduleSchemaVisitor(moduleSchema: s.Module, visitor: ModuleSchemaVisitor) {
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

export function classSchemaVisitor(classSchema: s.Class, visitor: ClassSchemaVisitor, moduleSchema?: s.Module) {
  if (visitor.onClassDecorator && classSchema.decorators) {
    classSchema.decorators.forEach(function(decoratorSchema) {
      visitor.onClassDecorator(decoratorSchema, classSchema, moduleSchema)
    })
  }
  if (visitor.onClassMember || visitor.onClassMemberDecorator) {
    Object.keys(classSchema.members).forEach(function(memberName) {
      let member = classSchema.members[memberName]
      if (visitor.onClassMember) {
        visitor.onClassMember(member, classSchema, moduleSchema)
      }
      if (visitor.onClassMemberDecorator && member.decorators) {
        member.decorators.forEach(function(decoratorSchema) {
          visitor.onClassMemberDecorator(decoratorSchema, member, classSchema, moduleSchema)
        })
      }
    })
  }
}

export function interfaceSchemaVisitor(interfaceSchema: s.Interface, visitor: InterfaceSchemaVisitor, moduleSchema?: s.Module) {
  if (visitor.onInterfaceMember) {
    Object.keys(interfaceSchema.members).forEach(function(memberName) {
      visitor.onInterfaceMember(interfaceSchema.members[memberName], interfaceSchema, moduleSchema)
    })
  }
}
