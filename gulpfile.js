var gulp = require('gulp');
var watch = require('gulp-watch');
var less = require('gulp-less');
var path = require('path');
var LessAutoprefix = require('less-plugin-autoprefix');
var autoprefix = new LessAutoprefix({ browsers: ['last 4 versions'] });
var LessPluginCleanCSS = require('less-plugin-clean-css'),
    cleanCSSPlugin = new LessPluginCleanCSS({advanced: true});
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var pump = require('pump');
var spritesmith = require('gulp.spritesmith');
const imagemin = require('gulp-imagemin');
var injectSvg = require('gulp-inject-svg');
browserSync = require("browser-sync"),
    reload = browserSync.reload;
// big PATH
var path = {
    build: { //prod
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: { //develop
        html: 'app/*index.php, app/*index-ru.php, app/*index-en.php',
        js: 'app/js/*.js',
        style: 'app/less/*.less',
        img: 'app/img/**/*.*',
        sprite: 'app/img/*.png',
        fonts: 'app/fonts/**/*.*'
    },
    watch: { //watch folder _ files
        html: 'app/*index.php',
        js: 'app/js/*.js',
        style: 'app/less/**/*.less',
        img: 'app/img/**/*.*',
        sprite: 'build/img/*.png',
        fonts: 'app/fonts/**/*.*'
    },
    clean: './build'
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
gulp.task('sprite:build', function(){
    var spriteData =
        gulp.src(path.src.sprite)
            .pipe(spritesmith({
                imgName: 'sprite.png',
                cssName: 'sprite.css',
            }));

    spriteData.img.pipe(gulp.dest(path.build.img));
    spriteData.css.pipe(gulp.dest(path.build.css));

});
//all start
gulp.task('build', [
    'html:build',
    'js:build',
    'less:build',
    'image:build',
    'sprite:build',
]);
//all watch
gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('less:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('sprite:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});
//servers
gulp.task('webserver', function () {
    browserSync.init({
        proxy: {
            target: "http://localhost/snailsfarm/www/build/index.php",
        }
    });
});
//clera if i neeed!!
gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});
//all run command: gulp
gulp.task('default', ['build', 'webserver', 'watch']);






