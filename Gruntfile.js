module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['tmp'],
    cssmin: {
      css: {
        files: [{
          expand: true,
          src: ['app/**/*.css', 'style/**/*.css', '!**/*.min.css'],
          dest: 'tmp/cssmin',
          ext: '.min.css'
        }]
      }
    },
    concat: {
      css: {
        src: ['tmp/cssmin/**/*.min.css', 'tmp/less/**/*.css'],
        dest: 'style/minified.min.css'
      }
    },
    less: {
      development: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2
        },
        files: [
          {
            expand: true,
            src: ['app/**/*.less', 'style/**/*.less'],
            dest: 'tmp/less',
            ext: '.css'
          }
        ]
      }
    },
    watch: {
      files: ['**/*.less', '**/*.css', '**/*.css'],
      tasks: ['default']
    }
  });

  // Load the plugin that provides the "uglify" task.
  //grunt.loadNpmTasks('grunt-contrib-uglify');
  
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['clean', 'less', 'cssmin', 'concat']);

};
