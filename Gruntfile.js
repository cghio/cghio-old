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
      index: {
        files: [ 'public/index.html' ]
      },
      js: {
        files: [ 'assets/js/*.js' ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', [ 'connect', 'watch' ]);

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
    });
    grunt.file.write(path.join('public', 'help.json'),
      JSON.stringify(index, null, 2) + '\n');
  });

};
