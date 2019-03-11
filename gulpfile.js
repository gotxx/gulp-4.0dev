var gulp = require('gulp'),
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
    sourcemaps = require('gulp-sourcemaps');

gulp.task('sass', function() {
  return gulp.src('app/assets/sass/**/*.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write('./'))
    .pipe(plumber.stop())
    .pipe(gulp.dest('app/assets/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('dist:serve', () => {
  browserSync.init({
    server: {
      baseDir: 'dist'
    }
  });
});

gulp.task('useref', () => {
  return gulp.src('app/*.html')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(sourcemaps.write('./'))
    .pipe(plumber.stop())
    .pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
  return gulp.src('app/assets/images/**/*.+(png|jpg|gif|svg)')
    .pipe(plumber())
    .pipe(cache(imagemin()))
    .pipe(plumber.stop())
    .pipe(gulp.dest('dist/assets/images'));
});

gulp.task('fonts', () => {
  return gulp.src('app/assets/fonts/**/*')
    .pipe(gulp.dest('dist/assets/fonts'));
});

gulp.task('clean:dist', (done) => {
  del.sync(['dist']);
  done();
});

gulp.task('cache:clear', (callback) => {
  return cache.clearAll(callback)
});

gulp.task('build', gulp.series('clean:dist', gulp.parallel('sass', 'useref', 'images', 'fonts')));

gulp.task('browserSync', () => {
  browserSync.init({
    server: {
      baseDir: 'app'
    }
  });
});

gulp.task('watch', () => {
    gulp.watch('app/assets/sass/**/*.scss', gulp.parallel('sass'));
    gulp.watch('app/*.html').on('change', browserSync.reload);
    gulp.watch('app/assets/js/**/*.js').on('change', browserSync.reload);
});

gulp.task('default', gulp.series('sass', gulp.parallel('browserSync', 'watch')));