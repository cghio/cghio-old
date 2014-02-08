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

};
