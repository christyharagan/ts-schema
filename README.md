TypeScript Schema Library
==

Overview
--

Extracts types from TypeScript and can be used to create json schemas.

Usage
--

Install:
```
npm install ts-schema
```

Basic Usage:

```TypeScript
import * as tss from 'ts-schema'

/* Create a new schema from some typescript files */
let schema = tss.generateSchema({
  'myFile': fs.readFileSync('myFile'),
  'myFile2': fs.readFileSync('myFile2')
})

/* Easily walk the schemas */
tss.schemaVisitor(schema, {
  onModuleSchema: function(moduleSchema){
    //
  },
  onClassMember: function(classMember, cls) {
    //
  }
  // etc.
})

/* Serialise the schemas to a JSON file (note: currently not a valid json-schema format... WIP) */
let jsonSchema = JSON.stringify(schema)
```
