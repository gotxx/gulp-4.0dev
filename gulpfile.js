var pathObj = require('path'),
    gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
    useref = require('gulp-useref'),
    uglify = require('gulp-uglify'),
    gulpIf = require('gulp-if'),
    cssnano = require('gulp-cssnano'),
    sass = require('gulp-sass'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    del = require('del'),
    plumber = require('gulp-plumber'),
    notify = require('gulp-notify'),
    lazypipe = require('lazypipe'),
    sourcemaps = require('gulp-sourcemaps');

var errorTemplate = (error) => `<%= error.plugin %>\n<%= error.relativePath %> line: <%= error.line %>\n<%= error.messageOriginal %>`;

var base = {
  src: './src',
  dest: './dest',
  folder: '/assets'
};

var path = {
  style: {
    src: pathObj.join( __dirname, base.src, base.folder, '/sass/**/*.scss' ),
    watch: base.src + base.folder + '/sass/**/*.scss',
    serve: pathObj.join( __dirname, base.src, base.folder, '/css/' ),
    dest: pathObj.join( __dirname, base.dest, base.folder, '/css/' )

  },
  script: {
    src: pathObj.join( __dirname, base.src, base.folder, '/js/**/*.js' ),
    watch: base.src + base.folder + '/js/**/*.js',
    serve: pathObj.join( __dirname, base.src, base.folder, '/js/'),
    dest: pathObj.join( __dirname, base.dest, base.folder, '/js/'),
  },
  images: {
    src: pathObj.join( __dirname, base.src, base.folder, '/images/**/*.+(png|jpg|gif|svg)' ),
    serve: pathObj.join( __dirname, base.src, base.folder, '/images/' ),
    dest: pathObj.join( __dirname, base.dest, base.folder, '/images/' )
  },
  fonts: {
    src: pathObj.join( __dirname, base.src, base.folder, '/fonts/**/*.+(ttc|ttf|otf|woff|woff2|eot|svg)' ),
    serve: pathObj.join( __dirname, base.src, base.folder, '/fonts/' ),
    dest: pathObj.join( __dirname, base.dest, base.folder, '/fonts/' )
  },
  html: {
    src: pathObj.join( __dirname, base.src, '/*.html' ),
    watch: base.src + '/*.html',
    serve: pathObj.join( __dirname, base.src ),
    dest: pathObj.join( __dirname, base.dest )
  }
};


gulp.task('sass', () => {
  return gulp.src( path.style.src )
    .pipe(plumber({ errorHandler: notify.onError({ message: errorTemplate }) }))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write('./'))
    .pipe(plumber.stop())
    .pipe(gulp.dest( path.style.serve ))
    .pipe(browserSync.reload({ stream: true }));
});


gulp.task('dest:serve', () => {
  browserSync.init({
    server: {
      baseDir: path.html.serve
    }
  });
});

gulp.task('useref', () => {
  return gulp.src( path.html.src )
    .pipe(plumber({ errorHandler: notify.onError({ message: errorTemplate }) }))
    // .pipe(sourcemaps.init())
    .pipe(useref({}, lazypipe().pipe(sourcemaps.init, { loadMaps: true })))
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(sourcemaps.write('./'))
    .pipe(plumber.stop())
    .pipe(gulp.dest( path.html.dest ));
});

gulp.task('images', (done) => {
  return gulp.src( path.images.src )
    .pipe(plumber({ errorHandler: notify.onError({ message: errorTemplate }) }))
    .pipe(cache(imagemin()))
    .pipe(plumber.stop())
    .pipe(gulp.dest( path.images.dest ));
    done();
});

gulp.task('fonts', (done) => {
  return gulp.src( path.fonts.src )
    .pipe(gulp.dest( path.fonts.dest ));
    done();
});

gulp.task('html', (done) => {
  return gulp.src( path.html.src )
    .pipe(gulp.dest( path.html.dest ));
    done();

});

gulp.task('clean:dest', (done) => {
  del.sync([ base.dest ]);
  done();
});

gulp.task('cache:clear', (callback) => {
  return cache.clearAll(callback)
});

gulp.task('build', gulp.series('clean:dest', 'sass', gulp.parallel( 'useref', gulp.series('cache:clear', 'images'), 'fonts')));


gulp.task('browserSync', () => {
  browserSync.init({
    server: {
      baseDir: 'src'
    }
  });
});

gulp.task('watch', () => {
    gulp.watch( path.style.watch , gulp.parallel('sass'));
    gulp.watch( path.html.watch ).on('change', browserSync.reload);
    gulp.watch( path.script.watch ).on('change', browserSync.reload);
});

gulp.task('default', gulp.series('sass', gulp.parallel('browserSync', 'watch')));