var gulp = require('gulp'),
  express = require('express'),
  less = require('gulp-less'),
  sourcemaps = require('gulp-sourcemaps'),
  autoprefixer = require('gulp-autoprefixer'),
  livereload = require('gulp-livereload'),
  eslint = require('gulp-eslint'),
  minifyCss = require('gulp-minify-css'),
  minifyHtml = require('gulp-minify-html'),
  uglify = require('gulp-uglify'),
  copy = require('gulp-copy'),
  gutil = require('gulp-util'),
  browserify = require('browserify'),
  watchify = require('watchify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  runSequence = require('run-sequence'),
  // windows下安装imagemin异常的坎坷
  // imagemin = require('gulp-imagemin'),
  usemin = require('gulp-usemin'),
  rename = require('gulp-rename'),
  rev = require('gulp-rev'),
  gulpif = require('gulp-if'),
  plumber = require('gulp-plumber'),
  vueify = require('vueify'),
  stringify = require('stringify'),
  replace = require('gulp-replace'),
  gfilter = require('gulp-filter'),
  sass = require('gulp-ruby-sass'),
  coffee = require('gulp-coffee'),
  coffeelint = require('gulp-coffeelint'),
  //clean = require('gulp-clean');
  argv = require('yargs').argv,
  coffeeify = require('coffeeify'),
  jade = require('gulp-jade');

gulp.task('serve', function () {
  var port = 4000;
  var app = express();
  app.use(express.static(__dirname));
  var server = app.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);

  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        gutil.log(gutil.colors.red(bind + ' requires elevated privileges'));
        process.exit(1);
        break;
      case 'EADDRINUSE':
        gutil.log(gutil.colors.red(bind + ' is already in use'));
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    gutil.log(gutil.colors.green('Listening on ' + bind));
  }
});

gulp.task('watch:style', function () {
  function stackReload() {
    var reload_args = arguments;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    if (!gulp.isRunning) {
      this.timer = setTimeout(function () {
        livereload.changed.apply(null, reload_args);
      }, 250);
    }
  }
  runSequence('sass', function () {
    return gulp.watch('dist/css/**/*.css').on('change', stackReload);
  });
});

gulp.task('watch:html', function () {
  return gulp.watch(['views/**/*.jade', '*.html'], function (e) {
    gulp.src(e.path)
      .pipe(livereload());
  });
});

gulp.task('watch:script', function () {
  return gulp.watch(['assets/scripts/*.js', '!assets/scripts/bundle.js', './*.js', '!gulpfile.js', './routes/*.js', './api/*.js'], function (event) {
    gulp.src(event.path)
      .pipe(eslint())
      .pipe(eslint.format());
  });
});
gulp.task('watch:coffee', function () {
  return gulp.watch(['assets/scripts/*.coffee'], function (event) {
    gulp.src(event.path)
      .pipe(coffeelint({
        'max_line_length': 'ignore'
      }))
      .pipe(coffeelint.reporter());
  });
});

// browserify files map
var files = [{
  input: 'assets/scripts/app.coffee',
  output: 'app-bundle.js'
}];
var isWatch = false;
var Defer = function (max, callback) {
  this.max = max;
  this.count = 0;
  this.callback = callback;

  this.exec = function () {
    if (this.max === ++this.count) {
      this.callback && this.callback();
    }
  };
};

function bundle(bundler, options) {
  var startTime = new Date().getTime();
  return bundler.bundle()
    .on('error', function (err) {
      gutil.log(err);
    })
    .pipe(source(options.output))
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js/'))
    .on('end', function () {
      var time = (new Date().getTime() - startTime) / 1000;
      gutil.log(options.output + ' was browserified: ' + time + 's');
      setTimeout(function () {
        livereload.reload();
      }, 200);
    });
}

var createBundle = function (file) {
  var bundler = browserify({
    cache: {},
    packageCache: {},
    debug: true
  });
  bundler.add(file.input);
  if (isWatch) {
    bundler = watchify(bundler);
    bundler.on('update', function () {
      bundle(bundler, file);
    });
  }
  bundler.transform(coffeeify);
  bundler.transform(stringify({
    extensions: ['.html'],
    minify: true,
    minifier: {
      extensions: ['.html'],
      options: {
        removeComments: true
      }
    }
  }));
  bundler.transform(vueify);
  return bundle(bundler, file);
};

var createBundles = function (bundles, defer) {
  files.forEach(function (file) {
    createBundle(file).on('end', function () {
      defer.exec();
    })
  });
};

gulp.task('watch:bundle', function (done) {
  isWatch = true;
  var d = new Defer(files.length, function () {
    done();
  });
  createBundles(files, d);
});

gulp.task('build:bundle', function (done) {
  var d = new Defer(files.length, function () {
    done();
  });
  createBundles(files, d);
});

gulp.task('minify:css', function () {
  sass('./assets/styles/**/*.sass', {
      sourcemap: true,
      stopOnError: false
    })
    .on('error', sass.logError)
    .pipe(minifyCss())
    .pipe(rename(function (path) {
      path.basename += ".min";
    }))
    .pipe(gulp.dest('./dist/css'));
});

var minifyFilesCache = [];
gulp.task('minify:js', function () {
  var filter = gfilter(['*', '!*.min.js']);
  return gulp.src('./dist/js/*.js')
    .pipe(filter)
    .pipe(uglify())
    .pipe(rename(function (path) {
      minifyFilesCache.push(path.basename + path.extname);
      path.basename += ".min";
    }))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('replace:jsPath', function () {
  var reg = new RegExp('<script[^>]+src=[\"\'].+(' + minifyFilesCache.join('|') + ')[^>]*>', 'g');
  var filter = gfilter(['*', '!node_modules/']);
  return gulp.src('./*.html')
    .pipe(filter)
    .pipe(replace(reg, function (match, p1) {
      return match.replace(p1, function (match) {
        return match.replace('.js', '.min.js');
      });
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('jade', function () {
  gulp.watch(['./assets/templates/*.jade', '!./assets/templates/layout.jade'], function (event) {
    gulp.src(event.path)
      .pipe(plumber())
      .pipe(jade({
        pretty: true
      }))
      .pipe(gulp.dest('./dist'))
      .pipe(livereload());
  });
});

gulp.task('coffee', function () {
  gulp.watch('./assets/scripts/**/*.coffee', function (event) {
    gulp.src(event.path)
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(coffee())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('./dist/js'))
      .pipe(livereload());
  });
});

function sassAction (path) {
  return sass(path, {
      sourcemap: true,
      stopOnError: false
    })
    .on('error', sass.logError)
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/css'));
}

gulp.task('sass', function () {
  gulp.watch('./assets/styles/**/*.sass', function (event) {
    sassAction(event.path)
      .pipe(livereload());
  });
});

gulp.task('make:sass', function () {
  sassAction('./assets/styles/**/*.sass');
});

// ↓↓↓↓ something useful,but not be used in this project ↓↓↓↓

// mapping the original paths to the revisioned paths
gulp.task('rev', function () {
  var filter = gfilter(['*', '!*.min.css']);
  gulp.src('dist/css/*.css')
    .pipe(filter)
    .pipe(minifyCss())
    .pipe(rev())
    .pipe(rename(function (path) {
      path.basename += ".min";
    }))
    .pipe(gulp.dest('dist/css/'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('dist'));
});
// copy directories and files
gulp.task('copy:something', function () {
  return gulp.src('./path/to/**/*')
    .pipe(gulp.dest('./path/to/dist/dir/'));
});
// usemin task
gulp.task('usemin', function () {
  return gulp.src('./*.html')
    .pipe(usemin({
      css: [minifyCss, rev],
      html: [function () {
        return minifyHtml({
          empty: true,
          conditionals: true,
          loose: true
        });
      }],
      js: [uglify, rev]
    }))
    .pipe(gulp.dest('./build'));
});
// less
gulp.task('less', function () {
  gulp.src('asset/styles/*.less')
    // prevent pipe breaking caused by errors
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/css/'));
});
// END;
gulp.task('devTask', function () {
  runSequence('serve', 'make:sass', ['watch:html', 'watch:style', 'watch:coffee', 'watch:script'], 'watch:bundle', function () {
    livereload.listen();
  });
});

gulp.task('build', function () {
  runSequence('build:bundle', 'minify:js', 'minify:css');
});

var spawn = require('child_process').spawn;
var kill = require('tree-kill');
gulp.task('dev', function () {
  var process;

  function restart() {
    if (process) {
      kill(process.pid, 'SIGKILL');
    }
    process = spawn('gulp.cmd', ['devTask'], {
      stdio: 'inherit'
    });
  }

  gulp.watch('gulpfile.js', function () {
    restart();
  });
  restart();
});
