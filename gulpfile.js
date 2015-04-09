var argv = require('minimist')(process.argv.slice(2));
var _ = require('lodash');
var fs = require('fs');
var wrench = require('wrench');
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

// Compile Javascript
gulp.task('scripts', function() {
    return gulp.src('editor/main.js')
    .pipe(browserify({
        debug: false,
        transform: ['stringify', 'require-globify']
    }))
    //.pipe(uglify())
    .pipe(rename('application.js'))
    .pipe(gulp.dest('./build/static/js'));
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
    del(['build/**'], cb);
});

// Link a folder for packages
gulp.task('link', function(callback) {
    var origin = argv.origin;
    var prefix = argv.prefix || "package-";

    if (!origin) {
        throw 'Need --origin';
    }

    origin = path.resolve(process.cwd(), origin);
    var filenames = fs.readdirSync(origin);

    _.each(filenames, function(filename) {
        if (filename.slice(0, prefix.length) != prefix) return;

        var from = path.resolve(origin, filename);
        var to = path.resolve(__dirname, "packages", filename.slice(prefix.length));

        console.log('Link', filename, 'to', to);

        var stat = null;

        try { stat = fs.lstatSync(to); } catch (e) {};

        if (stat && stat.isSymbolicLink()) {
            fs.unlinkSync(to);
        } else if (fs.existsSync(to)) {
            wrench.rmdirSyncRecursive(to);
        }

        fs.symlinkSync(from, to, 'dir');
    });

    callback();
});

gulp.task('default', function(cb) {
    runSequence('clean', ['scripts', 'styles', 'html', 'assets'], cb);
});