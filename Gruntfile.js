module.exports = function(grunt) {

  grunt.initConfig({
    connect: {
      server: {
        options: {
          port: 3000,
          base: [ 'assets', 'public' ]
        }
      }
    },
    watch: {
      options: {
        livereload: true
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
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', [
    'copy_index',
    'make_help_index',
    'convert_ymls',
    'connect',
    'watch'
  ]);

  grunt.registerTask('production', [
    'make_help_index',
    'convert_ymls',
    'analyze',
    'uglify',
    'concat'
  ]);

  grunt.registerTask('copy_index', 'Copy index page', function() {
    grunt.file.copy('index.html', 'public/index.html');
  });

  var htmlparser = require('htmlparser2');
  htmlparser.void_elements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img',
    'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

  grunt.registerTask('analyze', 'Analyze index.html', function() {
    var index = grunt.file.read('index.html');

    var templates = 'CGH.run(function($templateCache){';
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
      onend: function() {
        prod_index = prod_index.replace(/^\s*$/mg, '');
        prod_index = prod_index.replace(/<\/script>\n{2,}/mg, '</script>\n');
        prod_index = prod_index.trim() + '\n';
        grunt.file.write('public/index.html', prod_index);
        grunt.log.ok('File public/index.html generated.');

        templates += '})';
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
      grunt.file.write(path.join('public', 'help', slug + '.json'),
        JSON.stringify({
          slug: slug,
          title: title,
          content: file.split('\n')
        }, null, 2) + '\n');
    });
    grunt.file.write(path.join('public', 'help.json'),
      JSON.stringify(index, null, 2) + '\n');
  });

  grunt.registerTask('convert_ymls', function() {
    var path = require('path');
    var ymls = grunt.file.expand({
      cwd: 'posts'
    }, '*.yml');
    ymls.forEach(function(yml) {
      var file = grunt.file.readYAML(path.join('posts', yml));
      if (file === null) file = [];
      grunt.file.write(path.join('public', path.basename(yml, '.yml') +
        '.json'), JSON.stringify(file, null, 2) + '\n');
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
