// TODO: Implement namespaces (on hold until 1.5 is released)
// TODO: Implement module imports
// TODO: Implement only exposing exported types
// TODO: Support "import * as x" style imports
// TODO: Finish expression type determination (currently used for class properties)
// TODO: Improve decorators so they reference a type/instance rather than just a string
// TODO: Support implicit types from the accessor body
// TODO: Support enums
// TODO: Support function calls in expressions

import * as ts from 'typescript'
import {posix as path} from 'path'
import * as s from './schema'

export interface Files {
  [name: string]: string
}

interface Symbols {
  [localName: string]: s.RawReference
}

type Type = s.Type
type TypeNode = ts.TypeNode

function processHeritageClause(container:s.RawContainer, symbols: Symbols, heritageClause: ts.HeritageClause): (s.RawReference|s.RefinedType<s.RawReference>)[] {
  return heritageClause.types.map(function(heritageClauseElement: ts.HeritageClauseElement) {
    let identifer = <ts.Identifier>heritageClauseElement.expression
    let declaredType = symbols[identifer.text]

    if (heritageClauseElement.typeArguments) {
      let refinedType:s.RefinedType<s.RawReference> = {
        typeKind: s.TypeKind.REFINED,
        parameters: [],
        type:declaredType
      }

      heritageClauseElement.typeArguments.forEach(function(typeArgument){
        refinedType.parameters.push(typeNodeToType(container, symbols, typeArgument))
      })
      return refinedType
    } else {
      return declaredType
    }
  })
}

function processTypeParameters(container:s.RawContainer, symbols: Symbols, typeParameters: ts.TypeParameterDeclaration[]): s.TypeParameter[] {
  if (typeParameters) {
    return typeParameters.map(function(typeParameter: ts.TypeParameterDeclaration){
      let typeParameterSchema:s.TypeParameter = {
        name: typeParameter.name.text
      }
      if (typeParameter.constraint) {
        typeParameterSchema.extends = typeNodeToType(container, symbols, typeParameter.constraint)
      }
      return typeParameterSchema
    })
  }
}

function determineTypeFromExpression(expression:ts.Expression) {
  switch(expression.kind) {
    case ts.SyntaxKind.StringLiteral:
      return {typeKind: s.TypeKind.STRING}
    case ts.SyntaxKind.TrueKeyword:
    case ts.SyntaxKind.FalseKeyword:
      return {typeKind: s.TypeKind.BOOLEAN}
    case ts.SyntaxKind.NumericLiteral:
      return {typeKind: s.TypeKind.NUMBER}
    case ts.SyntaxKind.NewExpression:
    case ts.SyntaxKind.Identifier:
    case ts.SyntaxKind.ObjectLiteralExpression:
    case ts.SyntaxKind.ArrayLiteralExpression:
      // TODO
      return {typeKind: s.TypeKind.ANY}
  }
}

function typeNodeToType(container:s.RawContainer, symbols: Symbols, typeNode: ts.TypeNode|ts.Declaration): s.Type {
  switch(typeNode.kind) {
    case ts.SyntaxKind.TypeAliasDeclaration:
      let aliasDec = <ts.TypeAliasDeclaration> typeNode
      let aliasName = aliasDec.name.text
      return {
        typeKind: s.TypeKind.ALIAS,
        name: aliasName,
        type: typeNodeToType(container, symbols, aliasDec.type)
      }
    case ts.SyntaxKind.InterfaceDeclaration:
      let intDec = <ts.InterfaceDeclaration> typeNode
      let intName = intDec.name.text

      let intSchema: s.RawInterface = {
        typeKind: s.TypeKind.INTERFACE,
        name: intName,
        members: {},
        extends: [],
        parameters: []
      }

      if (intDec.heritageClauses) {
        intDec.heritageClauses.forEach(function(heritageClause: ts.HeritageClause){
          if (heritageClause.token === ts.SyntaxKind.ExtendsKeyword) {
            intSchema.extends = processHeritageClause(container, symbols, heritageClause)
          }
        })
      }

      intSchema.typeParameters = processTypeParameters(container, symbols, intDec.typeParameters)

      intDec.members.forEach(function(declaration: ts.Declaration) {
        let name = (<ts.Identifier>declaration.name).text
        let methDec = <ts.SignatureDeclaration> declaration

        if (methDec.parameters) {
          intSchema.members[name] = {
            name: name,
            type: typeNodeToType(container, symbols, methDec)
          }
        } else {
          intSchema.members[name] = {
            name: name,
            type: typeNodeToType(container, symbols, methDec.type)
          }
        }
      })

      return intSchema
    case ts.SyntaxKind.ClassDeclaration:
      let clsDec = <ts.ClassDeclaration> typeNode
      let name = clsDec.name.text

      let clsSchema: s.RawClass = {
        typeKind: s.TypeKind.CLASS,
        name: name,
        members: {},
        implements: []
      }

      processDecorators(clsDec, clsSchema, symbols)

      if (clsDec.heritageClauses) {
        clsDec.heritageClauses.forEach(function(heritageClause: ts.HeritageClause) {
          if (heritageClause.token === ts.SyntaxKind.ImplementsKeyword) {
            clsSchema.implements = processHeritageClause(container, symbols, heritageClause)
          } else if (heritageClause.token === ts.SyntaxKind.ExtendsKeyword) {
            clsSchema.extends = processHeritageClause(container, symbols,heritageClause)[0]
          }
        })
      }
      if (clsDec.typeParameters) {
        clsSchema.typeParameters = processTypeParameters(container, symbols, clsDec.typeParameters)
      }

      clsDec.members.forEach(function(member: ts.ClassElement) {
        let name:string
        let type:s.Type

        switch (member.kind) {
          case ts.SyntaxKind.MethodDeclaration:
            let methodDec = <ts.MethodDeclaration> member
            name = (<ts.Identifier>methodDec.name).text
            type = typeNodeToType(container, symbols, methodDec)
            break
          case ts.SyntaxKind.PropertyDeclaration:
            let propertyDec = <ts.PropertyDeclaration> member
            name = (<ts.Identifier>propertyDec.name).text
            //let type:s.Type
            if (!propertyDec.type) {
              if (propertyDec.initializer) {
                type = determineTypeFromExpression(propertyDec.initializer)
              } else {
                type = {typeKind: s.TypeKind.ANY}
              }
            } else {
              type = typeNodeToType(container, symbols, propertyDec.type)
            }
            break
          case ts.SyntaxKind.GetAccessor:
            let getAccessor = <ts.AccessorDeclaration> member
            name = (<ts.Identifier>getAccessor.name).text
            // TODO: Support implicit types from the accessor body
            type = typeNodeToType(container, symbols, getAccessor.type)
            break
        }

        if (name && type) {
          let classMember:s.RawClassMember = {
            name: name,
            type: type
          }
          processDecorators(member, classMember, symbols)

          clsSchema.members[name] = classMember
        }
      })

      return clsSchema
    case ts.SyntaxKind.TypeReference:
      let typeReference = <ts.TypeReferenceNode> typeNode
      let typeName = (<ts.Identifier>typeReference.typeName).text
      let declaredType = symbols[typeName]
      let rawReference:s.RawReference =  {
        typeKind: null,
        module: declaredType ? declaredType.module : '',
        name: declaredType ? declaredType.name : typeName
      }

      if (typeReference.typeArguments) {
        let args: s.Type[] = []
        typeReference.typeArguments.forEach(function(typeArgument: ts.TypeNode) {
          args.push(typeNodeToType(container, symbols, typeArgument))
        })
        return {
          typeKind: s.TypeKind.REFINED,
          type: rawReference,
          parameters: args
        }
      } else {
        return rawReference
      }
    case ts.SyntaxKind.StringKeyword:
      return {typeKind: s.TypeKind.STRING}
    case ts.SyntaxKind.BooleanKeyword:
      return {typeKind: s.TypeKind.BOOLEAN}
    case ts.SyntaxKind.NumberKeyword:
      return {typeKind: s.TypeKind.NUMBER}
    case ts.SyntaxKind.AnyKeyword:
      return {typeKind: s.TypeKind.ANY}
    case ts.SyntaxKind.FunctionType:
    case ts.SyntaxKind.MethodSignature:
    case ts.SyntaxKind.MethodDeclaration:
      let funcType = <ts.FunctionOrConstructorTypeNode> typeNode

      let params: Array<s.Parameter> = []
      funcType.parameters.forEach(function(paramDec: ts.ParameterDeclaration) {
        let parameter: s.Parameter = {
          name: (<ts.Identifier>paramDec.name).text,
          type: typeNodeToType(container, symbols, paramDec.type)
        }

        processDecorators(paramDec, parameter, symbols)

        params.push(parameter)
      })

      let functionSchema: s.FunctionType = {
        typeKind: s.TypeKind.FUNCTION,
        parameters: params,
        type: (!funcType.type || funcType.type.kind === ts.SyntaxKind.VoidKeyword) ? undefined : typeNodeToType(container, symbols, funcType.type)
      }

      return functionSchema
    case ts.SyntaxKind.ArrayType:
      let arrayType = <ts.ArrayTypeNode> typeNode

      return {
        typeKind: s.TypeKind.ARRAY,
        element: typeNodeToType(container, symbols, arrayType.elementType)
      }
    case ts.SyntaxKind.TupleType:
      let tupleType = <ts.TupleTypeNode> typeNode

      let elements:s.Type[] = tupleType.elementTypes.map(<(TypeNode)=>Type>typeNodeToType.bind(null, symbols))
      return {
        typeKind: s.TypeKind.TUPLE,
        elements: elements
      }
    case ts.SyntaxKind.UnionType:
      let unionType = <ts.UnionTypeNode> typeNode

      let types:s.Type[] = unionType.types.map(<(TypeNode)=>Type>typeNodeToType.bind(null, symbols))
      return {
        typeKind: s.TypeKind.UNION,
        types: types
      }
    default:
      throw {
        message: 'Unknown Type Node',
        typeNode: typeNode
      }
  }
}

function processExpression(expression: ts.Expression, symbols: Symbols): s.Expression {
  switch(expression.kind) {
    case ts.SyntaxKind.Identifier:
      let typeName = expression.getFullText().trim()
      let declaredType = symbols[typeName]
      return <s.RawClassExpression>{
        expressionKind: s.ExpressionKind.CLASS,
        module: declaredType? declaredType.module : '',
        name: declaredType? declaredType.name : typeName
      }
    case ts.SyntaxKind.StringLiteral:
      return <s.Literal<string>>{
        expressionKind: s.ExpressionKind.STRING,
        value: (<ts.LiteralExpression>expression).text
      }
    case ts.SyntaxKind.TrueKeyword:
      return <s.Literal<boolean>>{
        expressionKind: s.ExpressionKind.BOOLEAN,
        value: true
      }
    case ts.SyntaxKind.FalseKeyword:
      return <s.Literal<boolean>>{
        expressionKind: s.ExpressionKind.BOOLEAN,
        value: false
      }
    case ts.SyntaxKind.NumericLiteral:
      return <s.Literal<number>>{
        expressionKind: s.ExpressionKind.NUMBER,
        value: parseFloat((<ts.LiteralExpression>expression).text)
      }
    case ts.SyntaxKind.ObjectLiteralExpression:
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
    case ts.SyntaxKind.ArrayLiteralExpression:
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

function processDecorators(node: ts.Node, schema: s.Decorated, symbols: Symbols) {
  schema.decorators = []
  if (node.decorators) {
    node.decorators.forEach(function(decorator: ts.Decorator) {
      if (decorator.expression.kind === ts.SyntaxKind.Identifier) {
        let id = <ts.Identifier> decorator.expression
        schema.decorators.push({ decorator: id.text })
      } else if (decorator.expression.kind === ts.SyntaxKind.CallExpression) {
        let call = <ts.CallExpression> decorator.expression
        schema.decorators.push({
          decorator: (<ts.PropertyAccessExpression>call.expression).getText(),
          parameters: call.arguments.map(function(arg: ts.Expression) {
            return processExpression(arg, symbols)
          })
        })
      }
    })
  }
}

function processFile(moduleName: string, code: string): s.RawContainer {
  let sourceFile = ts.createSourceFile(moduleName, code, ts.ScriptTarget.ES5, true)
  let moduleSchema: s.RawContainer = {
    name: moduleName,
    types: [],
    namespaces: []
  }
  let symbols: Symbols = {}

  // First phase: Extract type tokens

  ts.forEachChild(sourceFile, function(child: ts.Node) {
    if (child.kind === ts.SyntaxKind.InterfaceDeclaration || child.kind === ts.SyntaxKind.ClassDeclaration || child.kind === ts.SyntaxKind.TypeAliasDeclaration) {
      let name = (<ts.Identifier>(<ts.Declaration>child).name).text
      symbols[name] = {
        typeKind: null,
        module: moduleName,
        name: name
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
            symbols[specifier.name.text.trim()] = { typeKind: null, module: module, name: specifier.propertyName.text.trim() }
          } else {
            symbols[specifier.name.text.trim()] = { typeKind: null, module: module, name: specifier.name.text.trim() }
          }
        })
      }
    }
  })

  // Second phase: Populate module schema

  ts.forEachChild(sourceFile, function(child: ts.Node) {
    let name = (<ts.ModuleDeclaration>child).name
    if (name && symbols[name.text.trim()]) {
      moduleSchema.types.push(typeNodeToType(moduleSchema, symbols, <ts.Declaration> child))
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

export function generateRawSchema(files: Files): s.RawSchema {
  let schema: s.RawSchema = []

  Object.keys(files).forEach(function(fileName: string) {
    let file = files[fileName]
    fileName = fileNameToModuleName(fileName)
    schema.push(processFile(fileName, <string> file))
  })

  return schema
}
