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
      files: ['app/**/*.less', 'app/**/*.css', 'style/**/*.less', 'style/**/*.css', '!style/minified.min.css'],
      tasks: ['default']
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
    sprite: {
      clubs: {
        src: 'style/clubs/small/*.png',
        dest: 'style/clubs/sprites/small.png',
        imgPath: 'clubs/sprites/small.png',
        destCss: 'style/clubs/sprites/small.css',
        cssVarMap: function (sprite) {
          sprite.name = 'club.club-' + sprite.name;
        }
      },
      flags: {
        src: 'style/flags/small/*.png',
        dest: 'style/flags/sprites/small.png',
        imgPath: 'flags/sprites/small.png',
        destCss: 'style/flags/sprites/small.css',
        cssVarMap: function (sprite) {
          sprite.name = 'flag.flag-' + sprite.name + ':before';
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  //grunt.loadNpmTasks('grunt-contrib-uglify');
  
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-spritesmith');

  // Default task(s).
  grunt.registerTask('default', ['clean', 'less', 'cssmin', 'concat']);
  grunt.registerTask('sprites', ['sprite', 'default']);
};
