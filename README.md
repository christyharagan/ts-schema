TypeScript Schema Library
===

Overview
--

A reflective type model for TypeScript applications. There are two primary models:

 * A raw model, which is a serialisable format (consider using [typescript-package](https://github.com/christyharagan/typescript-package) for the generation of this from a TypeScript package or project). References to types are stored as a {moduleName:string, name:string} object.
 * A fully resolved model, where all references are replaced with actual instances of that type. This is the model most useful for use.

A high level over-view of the modules in this library are:

 * rawConverter: converts raw models to resolved models.
 * model: contains the type meta-model, both for raw and resolved models
 * factories: used by rawConverter. Contains the code for creating resolved model elements
 * equals: contains equality functions for resolved models
 * typeCloser: elements with type-parameters (classes, interfaces, etc.) are treated as type-constructors. To create an actual type, use typeCloser with arguments for the parameters
 * typeUtils: some useful functions for dealing with types
 * serialiserParser: use this to create a more readable serialised form of a raw model (and for parsing that form)
 * filter: used to reduce raw models to complete sub-models based off specific elements (e.g.: filtered to a closed model for a particular module, or class)
 * toString: used to create a unique identifier for various resolved model elements
 * expressionToLiteral: used to convert a resolved expression model into a pure javascript equivalent
 * visitor: used to easily navigate a resolved model

Usage
--

Install:
```
npm install typescript-schema
```

Basic Usage:

```TypeScript
import * as s from 'typescript-schema'

let rawModules:s.Map<s.Module>

// Given a raw model, filter its contents to only contain types relevant to and referenced by some module
let filteredModules = s.filterRawModules(['moduleA'], rawModules)

// Given a raw model, convert to a resolved one:
let resolvedModules = s.convertRawModules(rawModules)

// Give a raw model, create a nice text format
let str = s.stringify(rawModules)
// And parse it back into a raw model
rawModules = s.parse(str)

let someInterfaceConstructor:s.InterfaceConstructor
let someTypeForT:s.Type
// Given a type constructor (e.g. interface A<T>), create a type
s.closeInterface(someInterfaceConstructor, [someTypeForT])

// Visit the elements in a model
s.modulesVisitor(resolveModules, {
  onModule: function(module){
    return <s.ModuleVisitor> {
      onClassConstructor: function(cc) {
        // etc
      }
    }
  }
})

// Get the unique id for an element
let id = s.interfaceConstructorToString(someInterfaceConstructor)

let decorator:s.Decorator

// For some expression (e.g. from a decorator)
let pureValue = s.expressionToLiteral(decorator.parameters[0])

let someOtherInterfaceConstructor

// Compare two entities
let isEqual = someInterfaceConstructor.equals(someOtherInterfaceConstructor)
```
