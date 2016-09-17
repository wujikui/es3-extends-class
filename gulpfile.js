const gulp = require('gulp');
const gulpEslint = require('gulp-eslint');
const gulpHeader = require('gulp-header');
const gulpPreprocess = require('gulp-preprocess');
const gulpRename = require('gulp-rename');
const gulpRm = require('gulp-rm');
const gulpSourcemaps = require('gulp-sourcemaps');
const gulpUglify = require('gulp-uglify');

const pkg = require('./package.json');

const SRC_ENTRY = './src/index.js';
const DIST_PATH = './dist/';
const DIST_NAME = 'extends-class';

gulp.task('dev', function () {
    return gulp.src([SRC_ENTRY])
        .pipe(gulpPreprocess({context: {NODE_ENV: 'development', DEBUG: true, pkg: pkg}}))
        .pipe(gulpRename('~dev-' + DIST_NAME + '.js')) // stores temp file for check eslint's errors
        .pipe(gulp.dest(DIST_PATH))
        .pipe(gulpEslint())
        .pipe(gulpEslint.format())
        .pipe(gulpEslint.failAfterError())
        .pipe(gulpRename(DIST_NAME + '.js'))
        .pipe(gulpHeader(['/**',
            ' * <%= pkg.name %> - <%= pkg.description %>',
            ' * @version v<%= pkg.version %>',
            ' * @link <%= pkg.homepage %>',
            ' * @license <%= pkg.license %>',
            ' */',
            ''].join('\n'), {pkg: pkg}))
        .pipe(gulp.dest(DIST_PATH))
        ;
});

gulp.task('release', function () {
    return gulp.src([SRC_ENTRY])
        .pipe(gulpPreprocess({context: {NODE_ENV: 'production', DEBUG: false, pkg: pkg}}))
        .pipe(gulpRename('~release-' + DIST_NAME + '.js')) // stores temp file for check eslint's errors
        .pipe(gulp.dest(DIST_PATH))
        .pipe(gulpEslint())
        .pipe(gulpEslint.format())
        .pipe(gulpEslint.failAfterError())
        .pipe(gulpRename(DIST_NAME + '.js'))
        .pipe(gulpHeader('// <%= pkg.name %>@<%= pkg.version %> - <%= pkg.license %> - <%= pkg.homepage %>\n', {pkg: pkg}))
        .pipe(gulpSourcemaps.init())
        .pipe(gulpUglify({
            compress: {screw_ie8: true},
            mangle: {screw_ie8: true},
            preserveComments: 'license'
        }))
        .pipe(gulpRename({extname: '.min.js'}))
        .pipe(gulpSourcemaps.write('./'))
        .pipe(gulp.dest(DIST_PATH))
        ;
});

gulp.task('default', ['dev', 'release'], function () {
    return gulp.src(DIST_PATH + '~*', {read: false})
        .pipe(gulpRm())
});
