const { src, dest, series, parallel, watch} = require('gulp')
const browserSync = require('browser-sync').create()
const concat = require('gulp-concat')
const sourcemaps = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const plumber = require('gulp-plumber')
const cleanCSS = require('gulp-clean-css')
const sass = require('gulp-sass')
const gcmq = require('gulp-group-css-media-queries')
const autoprefixer = require('gulp-autoprefixer')
const htmlmin = require('gulp-htmlmin')
const htmlmin = require('gulp-webp')
const htmlmin = require('gulp-imagemin')

function scripts() {
    return src('src/js/*.js')
        .pipe(plumber())
        .pipe(sourcemaps.init())
            .pipe(concat('bundle.js'))
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js'}))
        .pipe(sourcemaps.write())
        .pipe(dest('dist/js/'))
}

function styles() {
    return src('src/styles/*.scss')
        .pipe(plumber())
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('index.scss'))
        .pipe(gcmq())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 3 versions'],
            cascade: true,
        }))
        .pipe(cleanCSS())
        .pipe(rename({ extname: '.min.css'}))
        .pipe(dest('dist/styles/'))
}

function html() {
    return src('src/index.html')
        .pipe(plumber())
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(dest('dist/'))
}

function img() {
    return src('src/img/*.{png,jpg,svg,gif,webp}')
        .pipe(plumber())
        .pipe(webp({
            quality: 70,
        }))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false,
            }],
            interlaced: true,
            optimizationLevel: 3,
        }))
        .pipe(dest('dist/img/'))
}

function browsersync() {
    browserSync.init({
        server: { baseDir: 'dist/'},
        notify: false,
        online: true
    })
}

const liveReload = (done) => {
    browserSync.reload();
    done();
};

exports.default = () => {
    browsersync()
    watch('src/index.html', series(html, liveReload))
    watch('src/styles/index.scss', series(styles, liveReload))
    watch('src/js/index.js', series(scripts, liveReload))
    watch('src/img/*.{png,jpg,svg,gif,webp}', series(img, liveReload))
}