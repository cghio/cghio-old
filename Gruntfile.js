var fs   = require('fs');
var path = require('path');

function connectMiddlewares(connect, options, middlewares) {
  middlewares.unshift(function(req, res, next) {
    var file = '.' + req.url;
    if (file.slice(-1) === '/') file += 'index.html';
    var dot = file.lastIndexOf('.');
    var ext = dot > -1 ? file.slice(dot + 1) : '';
    var index = 0, content;
    var p1 = path.join('assets', file), p2 = path.join('dist', file);
    var paths = [ p1 + '.gz', p1, p2 + '.gz', p2 ];
    while (1) {
      try {
        if (paths[index]) content = fs.readFileSync(paths[index]);
        break;
      } catch(e) {
        index++;
      }
    }
    if (content === undefined) return next();
    if (paths[index].slice(-3) === '.gz') {
      res.setHeader('Content-Encoding', 'gzip');
    }
    res.setHeader('Content-Type', connect.mime.types[ext]);
    res.end(content);
  });
  return middlewares;
}

module.exports = function(grunt) {

  grunt.initConfig({
    connect: {
      server: {
        options: {
          hostname: '*',
          port: 33333,
          middleware: connectMiddlewares
        }
      }
    },
    copy: {
      public: {
        expand: true,
        cwd: 'public',
        src: '**',
        dest: 'dist/'
      }
    },
    clean: {
      dist: [ 'dist/*' ],
      javascript: [ 'dist/js/*.javascript.js' ]
    },
    less: {
      cghio: {
        files: {
          'dist/css/cghio.css': [ 'assets/css/app.less' ]
        }
      }
    },
    watch: {
      options: {
        livereload: true
      },
      posts: {
        files: [ 'posts/**/*' ],
        tasks: [ 'values' ]
      },
      html: {
        files: [ 'index.html' ],
        tasks: [ 'copy-index' ]
      },
      js: {
        files: [ 'assets/js/*.js' ]
      },
      css: {
        files: [ 'assets/css/**/*.css', 'assets/css/**/*.less' ],
        tasks: [ 'less' ]
      }
    },
    uglify: {
      vendors: {
        files: {
          'dist/js/vendors.js': [
            'assets/js/vendor/fastclick.js',
            'assets/js/vendor/markdown.js'
          ]
        }
      },
      app: {
        files: {
          'dist/js/cghio.js': [
            'assets/js/main.js',
            'dist/js/templates.javascript.js',
            'dist/js/values.javascript.js',
            'assets/js/init.js',
          ]
        }
      }
    },
    concat: {
      angular: {
        files: {
          'dist/js/angular.js': [
            'assets/js/vendor/angular.min.js',
            'assets/js/vendor/angular-route.min.js',
            'assets/js/vendor/angular-sanitize.min.js'
          ]
        }
      }
    },
    yaat: {
      CGH: {
        files: {
          'dist/js/templates.javascript.js': 'index.html'
        }
      }
    },
    values: {
      CGH: {
        options: {
          constant: true,
          files: {
            'dist/js/values.javascript.js': {
              'help.json': makeHelpIndex
            }
          }
        },
        files: {
          'dist/js/values.javascript.js': [ 'posts/*.yml', 'posts/help/*.md' ]
        }
      }
    },
    rename: {
      assets: {
        options: {
          callback: function(befores, afters) {
            var distdir = require('fs').realpathSync('dist');
            var path = require('path');
            var index = grunt.file.read('dist/index.html'), before, after;
            for (var i = 0; i < befores.length; i++) {
              before = path.relative(distdir, befores[i]);
              after = path.relative(distdir, afters[i]);
              index = index.replace(before, after);
            }
            grunt.file.write('dist/index.html', index);
          }
        },
        files: [
          { src: [ 'dist/css/*.css', 'dist/js/*.js' ] }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-angular-values');
  grunt.loadNpmTasks('grunt-rename-assets');
  grunt.loadNpmTasks('grunt-yet-another-angular-templates');

  grunt.registerTask('default', [
    'clean',
    'copy',
    'make-font-datauri',
    'less',
    'copy-index',
    'values',
    'connect',
    'watch'
  ]);

  grunt.registerTask('production', [
    'clean',
    '_production',
    'copy',
    'make-font-datauri',
    'less',
    'values',
    'yaat',
    'uglify',
    'concat',
    'clean:javascript',
    'rename',
    'compress'
  ]);

  grunt.registerTask('make', [
    'production'
  ]);

  grunt.registerTask('p', [
    'production',
    'connect',
    'watch'
  ]);

  grunt.registerTask('_production', 'Update configs for production mode.',
    function() {
    var less = grunt.config('less') || {};
    less.options = less.options || {};
    less.options.cleancss = true;
    grunt.config('less', less);
    grunt.log.ok('Updated Grunt configs.');
    grunt.file.copy('index.production.html', 'dist/index.html');
    grunt.log.ok('Copied index.production.html to dist/index.html.');
  });

  grunt.registerTask('copy-index', 'Copy index page', function() {
    grunt.file.copy('index.html', 'dist/index.html');
    grunt.log.ok('Copied index.html to dist/index.html.');
  });

  grunt.registerTask('make-font-datauri', function() {
    var path = require('path'), fs = require('fs');
    var font = path.join(__dirname, 'dist', 'fonts', 'Ubuntu.woff');
    var b64  = fs.readFileSync(font).toString('base64');
    var f = '';
    f += "@font-face {" + '\n'
    f += "  font-family: 'Ubuntu';" + '\n'
    f += "  font-style: normal;" + '\n'
    f += "  font-weight: 400;" + '\n'
    f += "  src: local('Ubuntu'), url(data:application/x-font-woff;charset=utf-8;base64," +
      b64 + ") format('woff');" + '\n'
    f += "}" + '\n'
    var d = path.join(__dirname, 'assets', 'css', 'generated', 'fonts.css');
    grunt.file.write(d, f);
    grunt.log.ok('Updated ' + d.replace(__dirname + '/', '').cyan + '.');
  });

  grunt.registerTask('compress', 'Compress assets files', function() {
    var finish = this.async();
    var fs = require('fs');
    var exec = require('child_process').exec;
    exec('gzip -f1k css/*.css js/*.js', {
      cwd: fs.realpathSync('dist')
    }, function(error, stdout, stderr) {
      if (stderr) grunt.fail.fatal(stderr);
      if (error) grunt.fail.fatal(error);
      grunt.log.ok('Asset files compressed.')
      finish();
    })
  });

  function makeHelpIndex() {
    var path = require('path');
    var help_dir = 'posts/help';
    var help_files = grunt.file.expand({
      cwd: help_dir
    }, '*.md');
    var index = [];
    help_files.forEach(function(help_file) {
      var file = grunt.file.read(path.join(help_dir, help_file));
      var yfm = file.match(/^---((.|\n)*)---\n/);
      var title = '';
      if (yfm) {
        yfm = yfm[1].trim();
        title = yfm.match(/^title:\s*(.*)$/mi)
        if (title) title = title[1].trim();
        title = title.replace(/^(["']?)(.*)\1$/, '$2');
      }
      var slug = path.basename(help_file, path.extname(help_file));
      index.push({
        slug: slug,
        title: title
      });
    });
    return index;
  }

  grunt.registerTask('push', 'Tell server to update website.', function() {
    var finish = this.async();
    var spawn = require('child_process').spawn;
    var ssh = spawn('ssh', ['cgh.io', (function script_to_update() {
      /*!
        cd /srv/cghio
        git fetch --all
        git reset --hard origin/master
        npm i
        grunt production
      */
      return arguments.callee.toString().match(/\/\*!?([\S\s]*?)\*\//)[1]
        .replace(/^\s{2,}/gm, '').trim();
    })()]);
    ssh.stdout.pipe(process.stdout);
    ssh.stderr.pipe(process.stderr);
    ssh.on('close', finish);
  });

};
