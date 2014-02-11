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

  grunt.registerTask('default', [
    'copy_index',
    'make_help_index',
    'convert_ymls',
    'connect',
    'watch'
  ]);

  grunt.registerTask('copy_index', 'Copy index page', function() {
    grunt.file.copy('index.html', 'public/index.html');
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
