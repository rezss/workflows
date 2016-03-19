(function () {
    "use strict";
    
    /*global process */
    /*global require */
    var gulp = require('gulp'),
        gutil = require('gulp-util'),
        coffee = require('gulp-coffee'),
        concat = require('gulp-concat'),
        browserify = require('gulp-browserify'),
        compass = require('gulp-compass'),
        connect = require('gulp-connect'),
        gulpif = require('gulp-if'),
        uglify = require('gulp-uglify'),
        miniHtml = require('gulp-minify-html'),
        env = process.env.NODE_ENV || 'development',
        coffeeSources,
        jsSources,
        sassSources,
        htmlSources,
        jsonSources,
        outputDir,
        sassStyle;
    
    if (env === 'development') {
        outputDir = 'builds/development/';
        sassStyle = 'expanded';
    } else {
        outputDir = 'builds/production/';
        sassStyle = 'compressed';
    }
    
    coffeeSources = ['components/coffee/tagline.coffee'];
    jsSources = ['components/scripts/rclick.js',
                    'components/scripts/pixgrid.js',
                    'components/scripts/tagline.js',
                    'components/scripts/template.js'];
    sassSources = ['components/sass/style.scss'];
    htmlSources = [outputDir + '*.html'];
    jsonSources = [outputDir + 'js/*.json'];
    
    
    gulp.task('coffee', function () {
        gulp.src(coffeeSources)
            .pipe(coffee({ bare: true })
                  .on('error', gutil.log))
            .pipe(gulp.dest('components/scripts'));
    });
    
    gulp.task('js', function () {
        gulp.src(jsSources)
            .pipe(concat('script.js'))
            .pipe(browserify())
            .pipe(gulpif(env === 'production', uglify()))
            .pipe(gulp.dest(outputDir + 'js'))
            .pipe(connect.reload());
    });
    
    gulp.task('compass', function () {
        gulp.src(sassSources)
            .pipe(compass({
                sass: 'components/sass',
                image: outputDir + 'images',
                css: outputDir + 'css',
                style: sassStyle,
                debug: true
            }))
            .on('error', gutil.log)
            .pipe(connect.reload());
    });
    
    gulp.task('watch', function () {
        gulp.watch(coffeeSources, ['coffee']);
        gulp.watch(jsSources, ['js']);
        gulp.watch('components/sass/*.scss', ['compass']);
        gulp.watch('builds/development/*.html', ['html']);
        gulp.watch(jsonSources, ['json']);
    });
    
    gulp.task('connect', function () {
        connect.server({
            root: outputDir,
            livereload: true
        });
    });
    
    gulp.task('html', function () {
        gulp.src('builds/development/*.html')
            .pipe(gulpif(env === 'production', miniHtml()))
            .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
            .pipe(connect.reload());
    });
    
    gulp.task('json', function () {
        gulp.src(jsonSources)
            .pipe(connect.reload());
    });
    
    gulp.task('default', ['coffee', 'js', 'compass', 'connect', 'watch']);
 
}());

