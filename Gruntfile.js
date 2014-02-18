module.exports = function(grunt) {

  grunt.initConfig({
    connect: {
      server: {
        options: {
          hostname: '*',
          port: 33333,
          base: [ 'assets', 'public' ]
        }
      }
    },
    clean: {
      api: [ 'public/api' ],
      public_css: [ 'public/css/*.css' ],
      public_js: [ 'public/js/*.js' ],
      compressed: [ 'public/**/*.gz' ],
      templates: [ 'public/js/templates.js', 'public/js/templates.js.gz' ]
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
      md: {
        files: [ 'posts/help/*.md' ],
        tasks: [ 'make_help_index' ]
      },
      html: {
        files: [ 'index.html' ],
        tasks: [ 'copy_index' ]
      },
      js: {
        files: [ 'assets/js/*.js' ]
      },
      yml: {
        files: [ 'posts/*.yml' ],
        tasks: [ 'convert_ymls' ]
      },
      css: {
        files: [ 'assets/css/**/*.css', 'assets/css/**/*.less' ],
        tasks: [ 'less' ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', [
    'clean',
    'less',
    'copy_index',
    'make_help_index',
    'convert_ymls',
    'connect',
    'watch'
  ]);

  grunt.registerTask('production', [
    '_production',
    'clean',
    'less',
    'make_help_index',
    'convert_ymls',
    'analyze',
    'uglify',
    'concat',
    'hash',
    'compress',
    'clean:templates'
  ]);

  grunt.registerTask('p', [
    'production',
    'connect',
    'watch'
  ]);

  grunt.JSONStringify = function(obj) {
    return JSON.stringify(obj, null, 2);
  }

  grunt.registerTask('_production', function() {
    var less = grunt.config('less') || {};
    less.options = less.options || {};
    less.options.cleancss = true;
    grunt.config('less', less);
    grunt.JSONStringify = function(obj) {
      return JSON.stringify(obj);
    }
    grunt.log.ok('Updated Grunt configs.');
  })

  grunt.registerTask('copy_index', 'Copy index page', function() {
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

  var htmlparser = require('htmlparser2');
  htmlparser.void_elements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img',
    'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

  grunt.registerTask('hash', 'Hash filenames of assets', function() {
    var prod_index = '';
    var index = grunt.file.read('public/index.html');
    var crypto = require('crypto'), fs = require('fs');
    var parser = new htmlparser.Parser({
      onopentag: function(name, attribs) {
        if ((name === 'link' && attribs.rel === 'stylesheet') ||
          name === 'script') {
          var src_tag = 'src', ext = '';
          if (name === 'link') src_tag = 'href';
          var old_filename = 'public' + attribs[src_tag];
          if (fs.existsSync(old_filename)) {
            var js = fs.readFileSync(old_filename);
            shasum = crypto.createHash('sha1');
            shasum.update(js);
            var hash = shasum.digest('hex');
            var dot = attribs[src_tag].lastIndexOf('.');
            if (dot === -1) dot = undefined;
            var new_src = attribs[src_tag].slice(0, dot);
            new_src += '-' + hash + attribs[src_tag].slice(dot);
            var new_filename = 'public' + new_src;
            fs.renameSync(old_filename, new_filename);
            grunt.log.ok('File ' + old_filename + ' renamed to ' + new_filename);
            attribs[src_tag] = new_src;
          }
        }
        prod_index += '<' + name;
        for (var attrib in attribs) {
          prod_index += ' ' + attrib + '="' + attribs[attrib] + '"';
        }
        prod_index += '>';
      },
      ontext: function(text) {
        prod_index += text;
      },
      onclosetag: function(name) {
        if (htmlparser.void_elements.indexOf(name.toLowerCase()) > -1) return;
        prod_index += '</' + name + '>';
      },
      onprocessinginstruction: function(name, data) {
        prod_index += '<' + data + '>';
      },
      oncomment: function(data) {
        prod_index += '<!--' + data + '-->';
      },
      onend: function() {
        prod_index = prod_index.trim() + '\n';
        grunt.file.write('public/index.html', prod_index);
        grunt.log.ok('File public/index.html generated.');
      }
    });
    parser.write(index);
    parser.end();
  });

  grunt.registerTask('analyze', 'Analyze index.html', function() {
    var index = grunt.file.read('index.html');

    var templates = 'CGH.run([\'$templateCache\', function($templateCache){';
    var tpl = { name: '', content: '' };
    var prod_index = '';
    var prod_tasks = {
      concat: { options: {}, dest: {}, src: {} },
      uglify: { options: {}, dest: {}, src: {} }
    };
    var tasks = Object.keys(prod_tasks);
    var skip_this_tag = false;

    var parser = new htmlparser.Parser({
      onopentag: function(name, attribs) {
        var is_script = (name === 'script');
        if (is_script) {
          tpl.name = '';
          tpl.content = '';

          if (attribs.hasOwnProperty('development')) {
            skip_this_tag = true;
          }
          if (attribs.hasOwnProperty('production')) {
            attribs.src = attribs.production;
            delete attribs.production;
          }
        }
        if (is_script) {
          for (var i = 0; i < tasks.length; i++) {
            var task = tasks[i];
            var target_name = attribs[task];
            if (!target_name) continue;
            prod_tasks[task].dest[target_name] = prod_tasks[task].dest[target_name] || [];
            prod_tasks[task].src[target_name] = prod_tasks[task].src[target_name] || [];
            if (attribs.dest) {
              if (attribs.options) {
                prod_tasks[task].options[target_name] = JSON.parse(attribs.options);
              }
              prod_tasks[task].dest[target_name].push(attribs.dest);
            }
            if (attribs.src || attribs['real-src']) {
              var src = attribs['real-src'] || ('assets' + attribs.src);
              src = src.replace(/[\n\s]{2,}/g, '');
              prod_tasks[task].src[target_name].push(src);
            }
            if (attribs.dest) {
              attribs = { src: attribs.dest };
            } else {
              skip_this_tag = true;
            }
          }
        }
        if (is_script && attribs.type === 'text/ng-template') {
          tpl.name = attribs.id;
        } else {
          if (skip_this_tag === false) {
            prod_index += '<' + name;
            for (var attrib in attribs) {
              prod_index += ' ' + attrib + '="' + attribs[attrib] + '"';
            }
            prod_index += '>';
          }
        }
      },
      ontext: function(text) {
        if (tpl.name !== '') {
          tpl.content += text;
        } else {
          if (skip_this_tag === false) {
            prod_index += text;
          }
        }
      },
      onclosetag: function(name) {
        if (name === 'script' && tpl.name !== '') {
          tpl.content = tpl.content.replace(/^\s{2,}/mg, '');
          templates += '$templateCache.put(' + JSON.stringify(tpl.name) + ',' +
            JSON.stringify(tpl.content.trim()) + ');';
        } else {
          if (htmlparser.void_elements.indexOf(name.toLowerCase()) > -1) return;
          if (skip_this_tag === false) {
            prod_index += '</' + name + '>';
          } else {
            skip_this_tag = false;
          }
        }
      },
      onprocessinginstruction: function(name, data) {
        prod_index += '<' + data + '>';
      },
      oncomment: function(data) {
        prod_index += '\n  <!--' + data + '-->\n';
      },
      onend: function() {
        prod_index = prod_index.replace(/^\s*$/mg, '');
        prod_index = prod_index.replace(/(<link.+?>)\n{2,}/mg, '$1\n');
        prod_index = prod_index.replace(/<\/script>\n{2,}/mg, '</script>\n');
        prod_index = prod_index.replace(/-->\n{2,}/g, '-->\n');
        prod_index = prod_index.replace(/^\s{2}<\//mg, '</');
        prod_index = prod_index.replace(/<\/(.+?)></g, '</$1>\n\n<');
        prod_index = prod_index.trim() + '\n';
        grunt.file.write('public/index.html', prod_index);
        grunt.log.ok('File public/index.html generated.');

        templates += '}])';
        grunt.file.write('public/js/templates.js', ';' + templates + ';');

        for (var i = 0; i < tasks.length; i++) {
          var task = tasks[i];
          var task_config = grunt.config(task) || {};
          for (var pu in prod_tasks[task].src) {
            var files = {};
            for (var dest in prod_tasks[task].dest[pu]) {
              files['public' + prod_tasks[task].dest[pu][dest]] = prod_tasks[task].src[pu];
            }
            task_config[pu] = {
              options: prod_tasks[task].options[pu],
              files: files
            };
          }
          if (Object.keys(task_config).length === 0) {
            task_config = {
              no_need: {}
            };
          }
          grunt.config(task, task_config);
          // console.log(JSON.stringify(task_config, null, 2));
          grunt.log.ok('Modified ' + task + ' tasks.');
        }
      }
    });
    parser.write(index);
    parser.end();
  });

  grunt.registerTask('make_help_index', 'Generate help index JSON file', function() {
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
      grunt.file.write(path.join('public', 'api', 'help', slug + '.json'),
        grunt.JSONStringify({
          slug: slug,
          title: title,
          content: file
        }) + '\n');
    });
    grunt.file.write(path.join('public', 'api', 'help.json'),
      grunt.JSONStringify(index) + '\n');
    grunt.log.ok('Updated help index.');
  });

  grunt.registerTask('convert_ymls', function() {
    var path = require('path');
    var ymls = grunt.file.expand({
      cwd: 'posts'
    }, '*.yml');
    ymls.forEach(function(yml) {
      var from = path.join('posts', yml);
      var to = path.join('public', 'api', path.basename(yml, '.yml') + '.json');
      var file = grunt.file.readYAML(from);
      if (file === null) file = [];
      grunt.file.write(to, grunt.JSONStringify(file) + '\n');
      grunt.log.ok('Converted ' + from + ' to ' + to);
    });
  });

  grunt.registerTask('download_angular', 'Download Angular code', function(version) {
    if (!version) grunt.fail.fatal('Please provide version! ' +
      'Go to http://code.angularjs.org/ to see list of versions.');
    var finish = this.async();
    var base = 'http://code.angularjs.org/' + version + '/';
    var needs = [
      'angular.js',
      'angular-route.js',
      'angular-sanitize.js',
    ];
    var urls = [];
    needs.forEach(function(need) {
      urls.push(base + need);
      urls.push(base + need.replace(/\.js$/, '.min.js'));
    });
    var http = require('http');
    var fs = require('fs');
    var path = require('path');

    var url_index = 0;
    function download(callback) {
      var url = urls[url_index];
      var filename = path.basename(url);
      var file = fs.createWriteStream('assets/js/vendor/' + filename);
      grunt.log.write('Start downloading ' + url);
      http.get(url, function(response) {
        if (response.statusCode !== 200) {
          throw new Error('Fail to download. Status: ' + response.statusCode);
        }
        var total = parseInt(response.headers['content-length']);
        var acc = 0;
        response.on('data', function(data) {
          file.write(data);
          acc += data.length;
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          process.stdout.write((acc / total * 100).toFixed(2) + '%, ' + acc +
            ' of ' + total + ' bytes of ' + filename + ' downloaded... ');
        });
        response.on('end', function() {
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          grunt.log.ok('Downloaded ' + url);

          url_index++;
          if (urls[url_index]) {
            download(callback);
          } else {
            callback();
          }
        });
      }).on('error', function(error) {
        grunt.fail.fatal(error);
      });
    }
    download(finish);
  });

};
