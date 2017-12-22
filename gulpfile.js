var gulp = require('gulp');
var watch = require('gulp-watch');
var less = require('gulp-less');
var path = require('path');
var LessAutoprefix = require('less-plugin-autoprefix');
var autoprefix = new LessAutoprefix({browsers: ['last 4 versions']});
var LessPluginCleanCSS = require('less-plugin-clean-css'),
    cleanCSSPlugin = new LessPluginCleanCSS({advanced: true});
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var spritesmith = require('gulp.spritesmith');
const imagemin = require('gulp-imagemin');
var injectSvg = require('gulp-inject-svg');

var svgSprite = require('gulp-svg-sprites'),
    svgmin = require('gulp-svgmin'),
    cheerio = require('gulp-cheerio'),
    replace = require('gulp-replace');

browserSync = require("browser-sync"),
    reload = browserSync.reload;
// big PATH
var TemplatePath = 'palyvotemplate';
var TemplateAppPath = 'palyvotemplate_app';
var projectTarget = "http://localhost/palyvo.com.ua/www/default.php";
var path = {
    build: { //prod
        html: TemplatePath,
        js: TemplatePath + '/js/',
        css: TemplatePath + '/css/',
        img: TemplatePath + '/images/',
        fonts: TemplatePath + '/fonts/'
    },
    src: { //develop
        html: TemplateAppPath+'*default.php',
        js: TemplateAppPath+'/js/*.js',
        style: TemplateAppPath+'/less/*.less',
        img: TemplateAppPath+'/images/**/*.*',
        sprite: TemplateAppPath+'/images/*.png',
        fonts: TemplateAppPath+'/fonts/**/*.*'
    },
    watch: { //watch folder _ files
        html: TemplateAppPath + '/*default.php',
        js: TemplateAppPath+'/js/*.js',
        style: TemplateAppPath+'/less/**/*.less',
        img: TemplateAppPath+'/images/**/*.*',
        sprite: TemplateAppPath+'/images/*.png',
        fonts: TemplateAppPath+'/fonts/**/*.*'
    },
    clean: './'+TemplatePath
};
//work with html
gulp.task('html:build', function () {
    return gulp.src(path.src.html)
        .pipe(injectSvg())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});
//work with less
gulp.task('less:build', function () {
    return gulp.src(path.src.style)
        .pipe(sourcemaps.init())
        .pipe(less({
            plugins: [autoprefix, cleanCSSPlugin]
        }))
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});
//work with js
gulp.task('js:build', function () {
    return gulp.src(path.src.js)
        .pipe(uglify())
        .pipe(gulp.dest(path.build.js));
});
//work with images
gulp.task('image:build', function () {
    return gulp.src(path.src.img)
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({plugins: [{removeViewBox: true}]})
        ]))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));

});
//sprites
gulp.task('sprite:build', function () {
    var spriteData =
        gulp.src(path.src.sprite)
            .pipe(spritesmith({
                imgName: 'sprite.png',
                cssName: 'sprite.css',
            }));

    spriteData.img.pipe(gulp.dest(path.build.img));
    spriteData.css.pipe(gulp.dest(path.build.css));

});

//SVG Sprite + normalization

gulp.task('svgSprite:Build', function () {
    return gulp.src(path.src.sprite + '/icons/*.svg')
    // minify svg
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        // remove all fill and style declarations in out shapes
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[style]').removeAttr('style');
            },
            parserOptions: { xmlMode: true }
        }))
        // cheerio plugin create unnecessary string '>', so replace it.
        .pipe(replace('&gt;', '>'))
        // build svg sprite
        .pipe(svgSprite({
                mode: "symbols",
                preview: false,
                selector: "icon-%f",
                svg: {
                    symbols: 'symbol_sprite.html'
                }
            }
        ))
        .pipe(gulp.dest(path.src.sprite + 'i/'));
});

//all start
gulp.task('build', [
    'html:build',
    'js:build',
    'less:build',
    'image:build',
    'sprite:build',
    'svgSprite:Build'
]);
//all watch
gulp.task('watch', function () {
    watch([path.watch.html], function (event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function (event, cb) {
        gulp.start('less:build');
    });
    watch([path.watch.js], function (event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function (event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.img], function (event, cb) {
        gulp.start('sprite:build');
    });
    watch([path.watch.fonts], function (event, cb) {
        gulp.start('svgSprite:Build');
    });
    watch([path.watch.fonts], function (event, cb) {
        gulp.start('fonts:build');
    });
});
//servers
gulp.task('webserver', function () {
    browserSync.init({
        proxy: {
            target: projectTarget
        }
    });
});
//clera if i neeed!!
gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});
//all run command: gulp
gulp.task('default', ['build', 'webserver', 'watch']);






