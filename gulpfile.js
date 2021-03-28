const project_folder = 'dist'
const source_folder   = 'src'
const {src, dest} = require('gulp')
const gulp = require('gulp')
const browsersync = require('browser-sync').create()
const fileinclude = require('gulp-file-include')
const del = require('del')
const scss = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const gcmq = require('gulp-group-css-media-queries')
const cleanCSS = require('gulp-clean-css')
const rename = require('gulp-rename')
const uglify = require('gulp-uglify-es').default
const babel = require('gulp-babel')
const imagemin = require('gulp-imagemin')
const svgSprite = require('gulp-svg-sprite')
const ttf2woff = require('gulp-ttf2woff')
const ttf2woff2 = require('gulp-ttf2woff2')
const fs = require('fs')
const plumber = require('gulp-plumber')
const sourcemaps = require('gulp-sourcemaps')
// const webp = require('gulp-webp')
// const webpHTML = require('gulp-webp-html')
// const webpCSS = require('gulp-webpcss')

const path = {
    build: {
        html: project_folder + '/',
        css: project_folder + '/css/',
        js: project_folder + '/js/',
        img: project_folder + '/img/',
        fonts: project_folder + '/fonts/',
    },
    src: {
        html: [
            source_folder + '/*.html',
            '!' + source_folder + '/_*.html'
        ],
        css: source_folder + '/scss/style.scss',
        js: source_folder + '/js/index.js',
        img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
        fonts: source_folder + '/fonts/*.ttf',
    },
    watch: {
        html: source_folder + '/**/*.html',
        css: source_folder + '/scss/**/*.scss',
        js: source_folder + '/js/**/*.js',
        img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}'
    },
    clean: './' + project_folder + '/'
}


function clean(params) {
    return del(path.clean)
}

function html() {
    return src(path.src.html)
        .pipe(plumber())
        .pipe(fileinclude())
        // .pipe(webpHTML())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

function images() {
    return src(path.src.img)
        // .pipe(
        //     webp({
        //         quality: 10
        //     })
        // )
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{ removeViewBox: false}],
                interlaces: true,
                optimizationLevel: 3
            })
        )
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

function js() {
    return src(path.src.js)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(fileinclude())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(rename({extname: '.min.js'}))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}

function fonts(params) {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts))
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts))
}

function css() {
    return src(path.src.css)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(
            scss({
                outputStyle: 'expanded'
        }))
        .pipe(
            autoprefixer({
                overrideBrowserslist: ['last 5 versions'],
                cascade: true
        }))
        .pipe(gcmq())
        // .pipe(webpCSS())
        .pipe(dest(path.build.css))
        .pipe(cleanCSS())
        .pipe(rename({extname: '.min.css'}))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
        
}

gulp.task('svgSprite', function () {
    return gulp.src([source_folder + '/iconsprite/*.svg'])
    .pipe(svgSprite({
        mode: {
            stack: {
                sprite: '../icons/icons.svg',
            }
        }
    }))
    .pipe(dest(path.build.img))
})

// function fontsStyle(params) {

//     let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
//     if (file_content == '') {
//         fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
//         return fs.readdir(path.build.fonts, function (err, items) {
//             if (items) {
//                 let c_fontname;
//                 for (var i = 0; i < items.length; i++) {
//                     let fontname = items[i].split('.');
//                     fontname = fontname[0];
//                     if (c_fontname != fontname) {
//                         fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
//                     }
//                     c_fontname = fontname;
//                 }
//             }
//         })
//     }
// }
    
// function cb() { }

function watchFiles(params) {
    gulp.watch([path.watch.html], html)
    gulp.watch([path.watch.css], css)
    gulp.watch([path.watch.js], js)
    gulp.watch([path.watch.img], images)
}

function browserSync(params) {
    browsersync.init({
       server: {
           baseDir: './' + project_folder + '/'
       },
       port: 3000,
       notify: false
    })
}

const build = gulp.series(gulp.parallel(js, css, html, images, fonts))
// const build = gulp.series(gulp.parallel(js, css, html, images, fonts), fontsStyle)
const watch = gulp.parallel(build, watchFiles, browserSync)

// exports.fontsStyle = fontsStyle
exports.fonts = fonts
exports.images = images
exports.js = js
exports.css = css
exports.html = html
exports.build = build
exports.watch = watch
exports.default = watch