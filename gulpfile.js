var gulp= require('gulp')
var dts = require('dts-generator');

gulp.task('default', function(){
  dts  .generate({
    name: 'typescript-schema',
    baseDir: './lib',
    files: [ './index.ts' ],
    out: './typescript-schema.d.ts',
    main: 'index'
  });
})
