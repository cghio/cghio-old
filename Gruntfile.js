var fs   = require('fs');
var path = require('path');

function connectMiddlewares(connect, options, middlewares) {
  middlewares.unshift(function(req, res, next) {
    var file = '.' + req.url;
    if (file.slice(-1) === '/') file += 'index.html';
    var dot = file.lastIndexOf('.');
    var ext = dot > -1 ? file.slice(dot + 1) : '';
    var index = 0, content;
    var p1 = path.join('assets', file), p2 = path.join('public', file);
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
    clean: {
      public: [ 'public/css', 'public/js' ],
      javascript: [ 'public/js/*.javascript.js' ],
      webp: [ 'public/images/*.webp' ]
    },
    less: {
      cghio: {
        files: {
          'public/css/cghio.css': [ 'assets/css/app.less' ]
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
          'public/js/vendors.js': [
            'assets/js/vendor/fastclick.js',
            'assets/js/vendor/markdown.js'
          ]
        }
      },
      app: {
        files: {
          'public/js/cghio.js': [
            'assets/js/main.js',
            'public/js/templates.javascript.js',
            'public/js/values.javascript.js'
          ]
        }
      }
    },
    concat: {
      angular: {
        files: {
          'public/js/angular.js': [
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
          'public/js/templates.javascript.js': 'index.html'
        }
      }
    },
    values: {
      CGH: {
        options: {
          constant: true,
          files: {
            'public/js/values.javascript.js': {
              'help.json': makeHelpIndex
            }
          }
        },
        files: {
          'public/js/values.javascript.js': [ 'posts/*.yml', 'posts/help/*.md' ]
        }
      }
    },
    rename: {
      assets: {
        options: {
          callback: function(befores, afters) {
            var publicdir = require('fs').realpathSync('public');
            var path = require('path');
            var index = grunt.file.read('public/index.html'), before, after;
            for (var i = 0; i < befores.length; i++) {
              before = path.relative(publicdir, befores[i]);
              after = path.relative(publicdir, afters[i]);
              index = index.replace(before, after);
            }
            grunt.file.write('public/index.html', index);
          }
        },
        files: [
          { src: [ 'public/css/*.css', 'public/js/*.js' ] }
        ]
      }
    },
    cwebp: {
      images: {
        options: {
          arguments: [ '-q', 50 ],
          concurrency: 20
        },
        files: [
          { src: [ 'public/images/*.jpg', 'public/images/*.png' ] }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-angular-values');
  grunt.loadNpmTasks('grunt-rename-assets');
  grunt.loadNpmTasks('grunt-webp-compress');
  grunt.loadNpmTasks('grunt-yet-another-angular-templates');

  grunt.registerTask('default', [
    'clean',
    'less',
    'copy-index',
    'values',
    'cwebp',
    'connect',
    'watch'
  ]);

  grunt.registerTask('production', [
    '_production',
    'clean',
    'less',
    'values',
    'yaat',
    'uglify',
    'concat',
    'clean:javascript',
    'cwebp',
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
    grunt.file.copy('index.production.html', 'public/index.html');
    grunt.log.ok('Copied index.production.html to public/index.html.');
  });

  grunt.registerTask('copy-index', 'Copy index page', function() {
    grunt.file.copy('index.html', 'public/index.html');
    grunt.log.ok('Copied index.html to public/index.html.');
  });

  grunt.registerTask('compress', 'Compress assets files', function() {
    var finish = this.async();
    var fs = require('fs');
    var exec = require('child_process').exec;
    exec('gzip -f1k css/*.css js/*.js', {
      cwd: fs.realpathSync('public')
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
