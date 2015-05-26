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
      css: {
        files: ['app/**/*.less', 'app/**/*.css', 'style/**/*.less', 'style/**/*.css'],
        tasks: ['default']
      },
      js: {
        files: ['**/*.js'],
        tasks: ['jshint']
      }
    },
    jshint: {
      files: ['app/**/*.js'],
      options: {
        bitwise: true, curly: true, eqeqeq: true, forin: true, funcscope: true, futurehostile: true, latedef: true, nocomma: true, nonbsp: true, nonew: true, notypeof: true, undef: true, unused: 'vars',
        browser: true,
        globals: {
          AbstractListCtrl: true,
          angular: false,
          app: true,
          Chart: false,
          stackBlurCanvasRGB: false
        }
      }
    },
  });

  // Load the plugin that provides the "uglify" task.
  //grunt.loadNpmTasks('grunt-contrib-uglify');
  
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task(s).
  grunt.registerTask('default', ['clean', 'less', 'cssmin', 'concat']);
  grunt.registerTask('watch', ['watch:css', 'watch:js']);
};
