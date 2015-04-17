var _ = require('lodash');
var path = require('path');
var gulp = require('gulp');
var del = require('del');
var less = require('gulp-less');
var browserify = require('gulp-browserify');
var minifyCSS = require('gulp-minify-css');
var runSequence = require('gulp-run-sequence');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var stringify = require('stringify');
var merge = require('merge-stream');
var child_process = require('child_process');

var debug = !!process.env.DEBUG;

function exec(cmd, cb) {
    var c = child_process.exec.apply(child_process, arguments);
    c.stdout.pipe(process.stdout);
    c.stderr.pipe(process.stderr);
}

// Compile Javascript
gulp.task('scripts', function() {
    var out = gulp.src('editor/main.js')
    .pipe(browserify({
        debug: false,
        transform: ['stringify', 'require-globify']
    }));

    if (!debug) out = out.pipe(uglify())

    return out.pipe(rename('application.js'))
    .pipe(gulp.dest('./build/static/js'));
});

// Dedupe modules
gulp.task('dedupe', function (cb) {
    exec('npm dedupe', cb);
});

// Copy html
gulp.task('html', function() {
    return gulp.src('editor/index.html')
    .pipe(rename('index.html'))
    .pipe(gulp.dest('./build/'));
});

// Copy assets
gulp.task('assets', function() {
    var resources = gulp.src([
        'editor/resources/fonts/**/*.*',
        'editor/resources/images/**/*.*'
    ], {
        base: 'editor/resources'
    })
    .pipe(gulp.dest('build/static'));

    var octicons = gulp.src([
        'node_modules/octicons/octicons/*.{ttf,eot,svg,ttf,woff}'
    ])
    .pipe(gulp.dest('build/static/fonts/octicons'));

    return merge(resources, octicons);
});

// Less to css
gulp.task('styles', function() {
    return gulp.src('./editor/resources/stylesheets/main.less')
    .pipe(less({
        paths: [ path.join(__dirname) ]
    }))
    .pipe(minifyCSS())
    .pipe(rename('application.css'))
    .pipe(gulp.dest('./build/static/css'));
});

// Clean output
gulp.task('clean', function(cb) {
    del([
        '.tmp/**',
        'build/**',
        'packages/*/pkg-build.js'
    ], cb);
});

// Build client code
gulp.task('build', function(cb) {
    runSequence('clean', 'dedupe', ['scripts', 'styles', 'html', 'assets'], cb);
});

// Dedupe modules
gulp.task('preinstall-addons', function (cb) {
    exec('./bin/codebox.js install --root=./.tmp/packages', cb);
});

// Copy everything to .tmp
gulp.task('copy-tmp', function() {
    return gulp.src([
        // Most files except the ones below
        "./**",

        // Ignore gitignore
        "!.gitignore",

        // Ignore dev related things
        "!./tmp/**",
        "!./.git/**",
        "!./packages/**",
        "!./node_modules/**",
        '!./node_modules',
        "!./test/**",
        '!./test',

    ])
    .pipe(gulp.dest('.tmp'));
});

// Publish to NPM
gulp.task('pre-publish', function(cb) {
    runSequence('clean', 'build', 'copy-tmp', 'preinstall-addons', cb);
});
gulp.task('publish', ['pre-publish'], function(cb) {
    exec('cd ./.tmp && npm publish', cb);
});

gulp.task('default', function(cb) {
    runSequence('build', cb);
});
