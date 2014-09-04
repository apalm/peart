var gulp = require('gulp');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');
var es6ify = require('es6ify');

var paths = {
  styles: ['static/scss/style.scss'],
  stylesWatch: [
    'static/scss/*.scss',
    'static/scss/components/*.scss',
    'static/scss/utils/*.scss'
  ],
  scripts: ['app/index.js'],
  scriptsWatch: [
    '*.js',
    'app/index.js',
    'app/actions/*.js',
    'app/components/*.js',
    'app/constants/*.js'
  ]
};

gulp.task('styles', function() {
  return gulp.src(paths.styles)
    .pipe(sass())
    .pipe(minifyCss())
    .pipe(gulp.dest('build'));
});

gulp.task('scripts', function() {
  return gulp.src(paths.scripts)
    .pipe(browserify({transform: es6ify, insertGlobals: true}))
    .pipe(uglify())
    .pipe(gulp.dest('build'));
});

gulp.task('default', ['styles', 'scripts']);

gulp.task('watch', ['default'], function() {
  gulp.watch(paths.stylesWatch, ['styles']);
  gulp.watch(paths.scriptsWatch, ['scripts']);
});
