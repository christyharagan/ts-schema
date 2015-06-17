var gulp= require('gulp')
var dts = require('dts-generator');

gulp.task('default', function(){
  dts  .generate({
    name: 'typescript-schema',
    baseDir: './module',
    excludes: ['./typings/node/node.d.ts', './typings/typescript/lib.es6.d.ts', './typings/typescript/typescript.d.ts'],
    files: [ './index.ts' ],
    out: './typescript-schema.d.ts'
  });
})
