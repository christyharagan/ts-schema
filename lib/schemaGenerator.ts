import * as ts from 'typescript'
import {posix as path} from 'path'
import * as s from './schema'

export interface Files {
  [name: string]: string
}

interface Symbols {
  [localName: string]: s.DeclaredType
}

type Type = s.Type
type TypeNode = ts.TypeNode

function typeNodeToType(symbols: Symbols, typeNode: ts.TypeNode|ts.SignatureDeclaration): s.Type {
  if (typeNode.kind === ts.SyntaxKind.TypeReference) {
    let typeReference = <ts.TypeReferenceNode> typeNode
    let typeName = (<ts.Identifier>typeReference.typeName).text
    let args: s.Type[] = []
    if (typeReference.typeArguments) {
      typeReference.typeArguments.forEach(function(typeArgument: ts.TypeNode) {
        args.push(typeNodeToType(symbols, typeArgument))
      })
    }
    let declaredType = symbols[typeName]
    return {
      typeKind: s.TypeKind.REFERENCE,
      module: declaredType ? declaredType.module : '',
      type: declaredType ? declaredType.type : typeName,
      args: args
    }
  } else if (typeNode.kind === ts.SyntaxKind.StringKeyword) {
    return {typeKind: s.TypeKind.STRING}
  } else if (typeNode.kind === ts.SyntaxKind.BooleanKeyword) {
    return {typeKind: s.TypeKind.BOOLEAN}
  } else if (typeNode.kind === ts.SyntaxKind.NumberKeyword) {
    return {typeKind: s.TypeKind.NUMBER}
  } else if (typeNode.kind === ts.SyntaxKind.AnyKeyword) {
    return {typeKind: s.TypeKind.ANY}
  } else if (typeNode.kind === ts.SyntaxKind.FunctionType || typeNode.kind === ts.SyntaxKind.MethodSignature || typeNode.kind === ts.SyntaxKind.MethodDeclaration) {
    let funcType = <ts.FunctionOrConstructorTypeNode> typeNode

    let params: Array<s.Parameter> = []
    funcType.parameters.forEach(function(paramDec: ts.ParameterDeclaration) {
      let parameter: s.Parameter = {
        name: (<ts.Identifier>paramDec.name).text,
        type: typeNodeToType(symbols, paramDec.type)
      }

      processDecorators(paramDec, parameter, symbols)

      params.push(parameter)
    })

    let functionSchema: s.FunctionSchema = {
      typeKind: s.TypeKind.FUNCTION,
      parameters: params,
      type: (!funcType.type || funcType.type.kind === ts.SyntaxKind.VoidKeyword) ? undefined : typeNodeToType(symbols, funcType.type)
    }

    processDecorators(funcType, functionSchema, symbols)

    return functionSchema
  } else if (typeNode.kind === ts.SyntaxKind.ArrayType) {
    let arrayType = <ts.ArrayTypeNode> typeNode

    return {
      typeKind: s.TypeKind.ARRAY,
      element: typeNodeToType(symbols, arrayType.elementType)
      }
  } else if (typeNode.kind === ts.SyntaxKind.TupleType) {
    let tupleType = <ts.TupleTypeNode> typeNode

    let elements:s.Type[] = tupleType.elementTypes.map(<(TypeNode)=>Type>typeNodeToType.bind(null, symbols))
    return {
      typeKind: s.TypeKind.TUPLE,
      elements: elements
    }
  } else if (typeNode.kind === ts.SyntaxKind.UnionType) {
    let unionType = <ts.UnionTypeNode> typeNode

    let types:s.Type[] = unionType.types.map(<(TypeNode)=>Type>typeNodeToType.bind(null, symbols))
    return {
      typeKind: s.TypeKind.UNION,
      types: types
    }
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
    let declaredType = symbols[typeName]
    return {
      expressionKind: s.ExpressionKind.TYPE_REFERENCE,
      module: declaredType? declaredType.module : '',
      type: declaredType? declaredType.type : typeName
    }
  } else if (expression.kind === ts.SyntaxKind.StringLiteral) {
    return {
      expressionKind: s.ExpressionKind.STRING,
      value: (<ts.LiteralExpression>expression).text
    }
  } else if (expression.kind === ts.SyntaxKind.TrueKeyword) {
    return {
      expressionKind: s.ExpressionKind.BOOLEAN,
      value: true
    }
  } else if (expression.kind === ts.SyntaxKind.FalseKeyword) {
    return {
      expressionKind: s.ExpressionKind.BOOLEAN,
      value: false
    }
  } else if (expression.kind === ts.SyntaxKind.NumericLiteral) {
    return {
      expressionKind: s.ExpressionKind.NUMBER,
      value: parseFloat((<ts.LiteralExpression>expression).text)
    }
  } else if (expression.kind === ts.SyntaxKind.ObjectLiteralExpression) {
    let object:s.ObjectExpression = {
      expressionKind: s.ExpressionKind.OBJECT,
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
    let array: s.ArrayExpression = {
      expressionKind: s.ExpressionKind.ARRAY,
      elements: []
    }
    let arrayLiteral = <ts.ArrayLiteralExpression> expression
    arrayLiteral.elements.forEach(function(element) {
      array.elements.push(processExpression(element, symbols))
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
          decorator: (<ts.PropertyAccessExpression>call.expression).name.text,
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
            type: typeNodeToType(symbols, methDec)
          }
        } else {
          intSchema.members[name] = {
            name: name,
            type: typeNodeToType(symbols, methDec.type)
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
              let declaredType = symbols[identifer.text]
              let impl:s.TypeReference = {
                typeKind: s.TypeKind.REFERENCE,
                module: declaredType ? declaredType.module : '',
                type: declaredType ? declaredType.type : identifer.text
              }
              clsSchema.implements.push(impl)
              if (heritageClauseElement.typeArguments) {
                impl.typeArguments = heritageClauseElement.typeArguments.map(<(TypeNode)=>Type>typeNodeToType.bind(null, symbols))
              }
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
            type: typeNodeToType(symbols, methodDec)
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
