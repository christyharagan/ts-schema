import * as ts from 'typescript'
import {posix as path} from 'path'
import * as s from './schema'

export interface Files {
  [name: string]: string
}

interface Symbols {
  [localName: string]: s.DeclaredType
}

function typeNodeToType(typeNode: ts.TypeNode|ts.SignatureDeclaration, symbols: Symbols): s.Type {
  if (typeNode.kind === ts.SyntaxKind.TypeReference) {
    let typeReference = <ts.TypeReferenceNode> typeNode
    let typeName = (<ts.Identifier>typeReference.typeName).text
    let args: s.Type[] = []
    if (typeReference.typeArguments) {
      typeReference.typeArguments.forEach(function(typeArgument: ts.TypeNode) {
        args.push(typeNodeToType(typeArgument, symbols))
      })
    }
    let declaredType = symbols[typeName]
    return {
      module: declaredType ? declaredType.module : '',
      type: declaredType ? declaredType.type : typeName,
      args: args
    }
  } else if (typeNode.kind === ts.SyntaxKind.StringKeyword) {
    return 'string'
  } else if (typeNode.kind === ts.SyntaxKind.BooleanKeyword) {
    return 'boolean'
  } else if (typeNode.kind === ts.SyntaxKind.NumberKeyword) {
    return 'number'
  } else if (typeNode.kind === ts.SyntaxKind.AnyKeyword) {
    return 'any'
  } else if (typeNode.kind === ts.SyntaxKind.FunctionType || typeNode.kind === ts.SyntaxKind.MethodSignature || typeNode.kind === ts.SyntaxKind.MethodDeclaration) {
    let funcType = <ts.FunctionOrConstructorTypeNode> typeNode

    let params: Array<s.Parameter> = []
    funcType.parameters.forEach(function(paramDec: ts.ParameterDeclaration) {
      let parameter: s.Parameter = {
        name: (<ts.Identifier>paramDec.name).text,
        type: typeNodeToType(paramDec.type, symbols)
      }

      processDecorators(paramDec, parameter, symbols)

      params.push(parameter)
    })

    let functionSchema: s.FunctionSchema = {
      parameters: params,
      type: (!funcType.type || funcType.type.kind === ts.SyntaxKind.VoidKeyword) ? 'void' : typeNodeToType(funcType.type, symbols)
    }

    processDecorators(funcType, functionSchema, symbols)

    return functionSchema
  } else if (typeNode.kind === ts.SyntaxKind.ArrayType) {
    let arrayType = <ts.ArrayTypeNode> typeNode

    return { element: typeNodeToType(arrayType.elementType, symbols) }
  } else {
    throw {
      message: 'Unknown Type Node',
      typeNode: typeNode
    }
  }
}

function processExpression(expression: ts.Expression, symbols: Symbols): s.Expression {
  if (expression.kind === ts.SyntaxKind.Identifier) {
    let typeName = expression.getFullText()
    return symbols[typeName] || { module: '', type: typeName }
  } else if (expression.kind === ts.SyntaxKind.StringLiteral) {
    return {
      value: (<ts.LiteralExpression>expression).text,
      type: 'string'
    }
  } else if (expression.kind === ts.SyntaxKind.TrueKeyword) {
    return {
      value: true,
      type: 'boolean'
    }
  } else if (expression.kind === ts.SyntaxKind.FalseKeyword) {
    return {
      value: false,
      type: 'boolean'
    }
  } else if (expression.kind === ts.SyntaxKind.NumericLiteral) {
    return {
      value: parseFloat((<ts.LiteralExpression>expression).text),
      type: 'number'
    }
  } else if (expression.kind === ts.SyntaxKind.ObjectLiteralExpression) {
    let object:s.ObjectExpression = {
      properties: {
      }
    }
    let objectLiteral = <ts.ObjectLiteralExpression> expression
    objectLiteral.properties.forEach(function(property) {
      let name = (<ts.Identifier>property.name).text
      let assignment = (<ts.PropertyAssignment>property).initializer
      object.properties[name] = processExpression(assignment, symbols)
    })
    return object
  } else if (expression.kind === ts.SyntaxKind.ArrayLiteralExpression) {
    let array: s.ArrayExpression = []
    let arrayLiteral = <ts.ArrayLiteralExpression> expression
    arrayLiteral.elements.forEach(function(element) {
      array.push(processExpression(element, symbols))
    })
    return array
  }
}

function processDecorators(node: ts.Node, schema: s.DecoratedSchema, symbols: Symbols) {
  schema.decorators = []
  if (node.decorators) {
    node.decorators.forEach(function(decorator: ts.Decorator) {
      if (decorator.expression.kind === ts.SyntaxKind.Identifier) {
        let id = <ts.Identifier> decorator.expression
        schema.decorators.push({ decorator: id.text })
      } else if (decorator.expression.kind === ts.SyntaxKind.CallExpression) {
        let call = <ts.CallExpression> decorator.expression
        let parameters: Array<s.Expression> = []
        call.arguments.forEach(function(arg: ts.Expression) {
          parameters.push(processExpression(arg, symbols))
        })
        schema.decorators.push({
          decorator: (<ts.Identifier>call.expression).text,
          parameters: parameters
        })
      }
    })
  }
}

function processFile(moduleName: string, code: string): s.ModuleSchema {
  let sourceFile = ts.createSourceFile(moduleName, code, ts.ScriptTarget.ES5, true)
  let moduleSchema: s.ModuleSchema = {
    name: moduleName,
    interfaces: {},
    classes: {}
  }
  let symbols: Symbols = {}

  // First phase: Extract type tokens

  ts.forEachChild(sourceFile, function(child: ts.Node) {
    if (child.kind === ts.SyntaxKind.InterfaceDeclaration || child.kind === ts.SyntaxKind.ClassDeclaration) {
      let name = (<ts.Identifier>(<ts.Declaration>child).name).text
      symbols[name] = {
        module: moduleName,
        type: name
      }
    } else if (child.kind === ts.SyntaxKind.ImportDeclaration) {
      let importDec = <ts.ImportDeclaration> child
      let module = importDec.moduleSpecifier.getFullText().trim()
      module = module.substring(1, module.length - 1)
      if (module.charAt(0) === '.') {
        module = path.join(path.dirname(moduleName), module)
      }
      module = fileNameToModuleName(module)

      let namedBindings = importDec.importClause.namedBindings

      if (namedBindings && namedBindings.kind === ts.SyntaxKind.NamedImports) {
        let namedImports = <ts.NamedImportsOrExports> namedBindings
        namedImports.elements.forEach(function(specifier: ts.ImportOrExportSpecifier) {
          if (specifier.propertyName) {
            symbols[specifier.name.text] = { module: module, type: specifier.propertyName.text }
          } else {
            symbols[specifier.name.text] = { module: module, type: specifier.name.text }
          }
        })
      }
    }
  })

  // Second phase: Populate module schema

  ts.forEachChild(sourceFile, function(child: ts.Node) {
    if (child.kind === ts.SyntaxKind.InterfaceDeclaration) {
      let intDec = <ts.InterfaceDeclaration> child
      let intName = intDec.name.text

      let intSchema: s.InterfaceSchema = {
        name: intName,
        members: {}
      }
      moduleSchema.interfaces[intName] = intSchema

      intDec.members.forEach(function(declaration: ts.Declaration) {
        let name = (<ts.Identifier>declaration.name).text
        let methDec = <ts.SignatureDeclaration> declaration

        if (methDec.parameters) {
          intSchema.members[name] = {
            name: name,
            type: typeNodeToType(methDec, symbols)
          }
        } else {
          intSchema.members[name] = {
            name: name,
            type: typeNodeToType(methDec.type, symbols)
          }
        }
      })
    } else if (child.kind === ts.SyntaxKind.ClassDeclaration) {
      let clsDec = <ts.ClassDeclaration> child
      let name = clsDec.name.text

      let clsSchema: s.ClassSchema = {
        name: name,
        members: {},
        implements: []
      }
      moduleSchema.classes[name] = clsSchema

      processDecorators(clsDec, clsSchema, symbols)

      clsDec.heritageClauses.forEach(function(heritageClause: ts.HeritageClause) {
        if (heritageClause.token === ts.SyntaxKind.ImplementsKeyword) {
          heritageClause.types.forEach(function(heritageClauseElement: ts.HeritageClauseElement) {
            if (heritageClauseElement.expression.kind === ts.SyntaxKind.Identifier) {
              let identifer = <ts.Identifier>heritageClauseElement.expression
              clsSchema.implements.push(symbols[identifer.text] || { module: '', type: identifer.text })
            }
          })
        }
      })

      clsDec.members.forEach(function(member: ts.ClassElement) {
        if (member.kind === ts.SyntaxKind.MethodDeclaration) {
          let methodDec = <ts.MethodDeclaration> member
          let name = (<ts.Identifier>methodDec.name).text
          clsSchema.members[name] = {
            name: name,
            type: typeNodeToType(methodDec, symbols)
          }
        }
      })
    }
  })

  return moduleSchema
}

export function fileNameToModuleName(fileName: string): string {
  fileName = fileName.replace(/\\/g, '/')
  if (fileName.indexOf('.ts') === fileName.length - 3 || fileName.indexOf('.js') === fileName.length - 3) {
    fileName = fileName.substring(0, fileName.length - 3)
  }
  return fileName
}

export function generateSchema(files: Files): s.Schema {
  let schema: s.Schema = {}

  Object.keys(files).forEach(function(fileName: string) {
    let file = files[fileName]
    fileName = fileNameToModuleName(fileName)
    schema[fileName] = processFile(fileName, <string> file)
  })

  return schema
}
