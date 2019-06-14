const gulp  = require('gulp');

gulp.task('now:config', () => {
  return gulp
    .src(['now/now.json'])
    .pipe(gulp.dest('dist'));
});

gulp.task('default', gulp.series(['now:config']));
