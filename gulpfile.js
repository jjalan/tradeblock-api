var gulp = require('gulp');
var nodemon = require('gulp-nodemon')
var babel = require('gulp-babel');
var eslint = require('gulp-eslint');
 
var SRC_DIC = "src";
var DEST_DIR = 'dist';

gulp.task('compile', function () {
  var stream = gulp.src([SRC_DIC+'/**/*.js', !SRC_DIC+'/**/*.json'])
  .pipe(babel({
    presets: ['env']
  }))
  .pipe(gulp.dest(DEST_DIR))
  return stream;
});
gulp.task('copy_locales', function () {
  var stream = gulp.src([SRC_DIC+'/locales/*.json'])
  .pipe(gulp.dest(DEST_DIR+'/locales/'));
  return stream;
});
gulp.task('lint', function () {
  var stream = gulp.src([SRC_DIC+'/**/*.js'])
  .pipe(eslint({fix:true}))
  .pipe(eslint.format())
  .pipe(eslint.failAfterError());
  return stream;
});

gulp.task('build', ['compile', 'copy_locales']);
gulp.task('serve', ['build'], function () {
  var stream = nodemon({
    script: DEST_DIR,
    watch: SRC_DIC,
    tasks: ['build']
  })
 
  return stream;
});