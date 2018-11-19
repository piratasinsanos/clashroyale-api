import sonarqube from 'sonarqube-scanner';
import sourcemaps from 'gulp-sourcemaps';
import compile from 'gulp-typescript';
import nodemon from 'gulp-nodemon';
import tslint from 'gulp-tslint';
import newer from 'gulp-newer';
import gulp from 'gulp';
import path from 'path';
import del from 'del';

// Clean up dist and coverage directory
gulp.task('clean', () => {
  del.sync([
    'dist',
    'coverage',
    '.nyc_output',
    '.scannerwork']);
});

gulp.task('lint', () =>
  gulp.src(['src/*'])
    .pipe(tslint({
      formatter: 'verbose'
    })).pipe(tslint.report()));

// Copy non-js files to dist
gulp.task('copy', () => {
  gulp.src([
    'src/environment/**',
    'src/locales/**',
    'src/resources/**',
    '*.pem'
  ], {
    // eslint-disable-next-line quote-props
    'base': '.'
  }).pipe(newer('dist'))
    .pipe(gulp.dest('dist'));
});

// Compile sources
gulp.task('compile', () => {
  const ts = compile.createProject('tsconfig.json');
  return gulp.src('src/**/*.ts')
    .pipe(sourcemaps.init())
    .pipe(ts({
      noImplicitAny: true
    }))
    .pipe(sourcemaps.write('.', {
      includeContent: false,
      sourceRoot: './'
    }))
    .pipe(gulp.dest('dist'));
});

// Start inversify with restart on file changes
// TODO: echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
gulp.task('start', ['clean', 'copy', 'compile'], () => {
  nodemon({
    ext: 'ts',
    nodeArgs: ['--inspect=3001'],
    // eslint-disable-next-line quote-props,object-curly-spacing
    env: {'NODE_ENV': 'development'},
    script: path.join('dist', 'server.js'),
    ignore: ['node_modules/**/*.js', 'dist/**/*.js']
  });
});

gulp.task('sonar', () => {
  sonarqube({
    serverUrl: process.env.SONAR_HOST_URL,
    token: process.env.SONAR_AUTH_TOKEN,
    options: {
      'sonar.branch': process.env.BRANCH_NAME
    }
  });
});

// default task: clean dist, compile js files and copy non-js files.
gulp.task('default', ['clean', 'copy', 'compile']);
