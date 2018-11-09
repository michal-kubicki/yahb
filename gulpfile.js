const gulp = require('gulp'),
    del = require('del'), // Delete files and directories
    rename = require('gulp-rename'), // Rename files
    sass = require('gulp-sass'), // Sass compiler
    uglify = require('gulp-uglify'), // Minify JavaScript
    cleanCSS = require('gulp-clean-css'), // Minify CSS
    purgecss = require('gulp-purgecss'), // Remove unused CSS
    htmlmin = require('gulp-htmlmin'), // Minify HTML
    sourcemaps = require("gulp-sourcemaps"), // Build CSS sourcemaps
    htmlreplace = require('gulp-html-replace'), // This will update links
    autoprefixer = require('gulp-autoprefixer'), // Prefix CSS
    browserSync = require('browser-sync').create(); // Browser Syncing

// Paths 
var paths = {
    sass: {
        src: './src/assets/sass/**/*.{scss,sass}',
        dest: './src/assets/css'
    },
    css: {
        src: './src/assets/css/**/*.css',
        dest: './build/assets/css'
    },
    html: {
        src: './src/**/*.html',
        dest: './build'
    },
    js: {
        src: './src/assets/js/**/*.js',
        dest: './build/assets/js'
    },
    images: {
        src: './src/assets/img/**/*',
        dest: './build/assets/img/'
    },
    icons: {
        src: './src/assets/icons/**/*',
        dest: './build/assets/icons/'
    }
};

// Clean task
gulp.task('minify:clean', function () {
    return del([
        './src/assets/css/**/*.min.css',
        './src/assets/css/**/*.map',
        './src/assets/js/**/*.min.js'
    ], {
        force: true
    });
});

// SASS compiler
gulp.task('process:sass', function () {
    return gulp.src(paths.sass.src)
        .pipe(sass.sync({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest(paths.sass.dest))
        .pipe(browserSync.stream()) // browser sync and refresh
});

// CSS transformator
gulp.task('process:css', () => {
    return gulp.src(paths.css.src)
        /*     .pipe(purgecss({
                  content: ['src/*.html']/*,
                  whitelist: ['show', 'active'],
                  whitelistPatterns: [/$nav-item/, /$dropdown/],
                  whitelistPatternsChildren: [/$nav-item/, /$dropdown/]
                })
              ) */
        .pipe(sourcemaps.init()) // start gulp-sourcemaps
        .pipe(cleanCSS())
        .pipe(rename({
            suffix: '.min'
        })) // rename minimized file
        .pipe(sourcemaps.write('.')) // write sourcemaps
        .pipe(gulp.dest(paths.css.dest)) // output CSS
        .pipe(browserSync.stream()) // browser sync and refresh
});

//PurgeCSS
gulp.task('purge:css', () => {
    return gulp
        .src('src/assets/css/styles.css')
        .pipe(
            purgecss({
                content: ['src/*.html'],
                whitelist: ['show', 'active'],
                whitelistPatterns: [/$nav-item/, /$dropdown/]
                /*,
                          whitelistPatternsChildren: [/$nav-item/, /$dropdown/]*/
            })
        )
        .pipe(gulp.dest('assets/css'))
})

// Watch and complie SASS
gulp.task('watch', () => {
    gulp.watch(paths.sass.src).on('change', gulp.series('process:sass'));
});

// Minify Js
gulp.task('minify:js', function () {
    return gulp.src([
            paths.js.src // path
        ])
        .pipe(uglify()) // minify js
        .pipe(rename({
            suffix: '.min'
        })) // rename minimized file
        .pipe(gulp.dest(paths.js.dest)) // save to this directory
        .pipe(browserSync.stream());
});

// Process HTML
gulp.task('process:html', () => {
    return gulp.src(paths.html.src)
        .pipe(htmlreplace({
            'js': 'assets/js/scripts.min.js',
            'css': 'assets/css/styles.min.css'
        }))
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest(paths.html.dest));
});

// Copy extras to the build directory
gulp.task('copy:extras', function () {
    return gulp.src([
            './src/robots.txt',
            './src/.htaccess',
        ])
        .pipe(gulp.dest(paths.html.dest)) // destination directory
});

// Copy icons
gulp.task('copy:icons', function () {
    return gulp.src([
            paths.icons.src
        ])
        .pipe(gulp.dest(paths.icons.dest)) // destination directory
});

//Copy images
gulp.task('copy:images', function () {
    return gulp.src([
            paths.images.src
        ])
        .pipe(gulp.dest(paths.images.dest)) // destination directory
});


// Start browserSync, sync on changes to SCSS, JS and HTML
gulp.task('dev', function browserDev(done) {
    browserSync.init({
        server: {
            baseDir: "./src/" // root directory to watch
        }
    });
    gulp.watch(paths.sass.src, gulp.series('process:sass',
        function sassBrowserReload(done) {
            browserSync.reload(); // reload on SCSS / CSS changes
            done();
        }));
    gulp.watch([paths.js.src]).on('change', browserSync.reload); // reload on JS changes    
    gulp.watch([paths.html.src]).on('change', browserSync.reload); // reload on HTML changes
    done();
});

gulp.task("build", gulp.series(
    'minify:clean',
    'process:sass',
    'process:css',
    'minify:js',
    'process:html',
    'copy:extras',
    'copy:icons',
    'copy:images'
));

gulp.task("default", gulp.series('dev'));