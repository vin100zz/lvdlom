module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['tmp'],
    cssmin: {
      css: {
        files: [{
          expand: true,
          src: ['style/**/sprites/*.css'],
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
      tasks: ['default'],
      options: {
        livereload: true,
      },
    },
    jshint: {
      files: ['app/**/*.js'],
      options: {
        curly: true, eqeqeq: true, forin: true, funcscope: true, futurehostile: true, latedef: 'nofunc', nocomma: true, nonbsp: true, nonew: true, notypeof: true, undef: true, unused: 'vars',
        browser: true,
        globals: {
          AbstractListCtrl: true,
          angular: false,
          app: true,
          Chart: false,
          google: true,
          stackBlurCanvasRGB: false
        }
      }
    },
    responsive_images: {
      clubs: {
        options: {
          engine: 'im',
          rename: false,
          sizes: [{
            width: '10%',
            height: '10%'
          }]
        },
        files: [{
          expand: true,
          src: ['style/clubs/large/*.png'],
          dest: 'tmp/'
        }]
      },
      sources: {
        options: {
          engine: 'im',
          rename: false,
          sizes: [{
            width: '50%',
            height: '50%'
          }]
        },
        files: [{
          expand: true,
          src: ['style/sources/logos/*.png'],
          dest: 'tmp/'
        }]
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
      },
      sources: {
        src: 'tmp/style/sources/logos/*.png',
        dest: 'style/sources/sprites/sprite.png',
        imgPath: 'sources/sprites/sprite.png',
        destCss: 'style/sources/sprites/sprite.css',
        cssVarMap: function (sprite) {
          sprite.name = 'source.source-' + sprite.name;
        }
      }
    },
    includeSource: {
      index: {
        files: {
          'index.html': 'index.tpl.html'
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
  grunt.loadNpmTasks('grunt-beep');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.loadNpmTasks('grunt-spritesmith');
  grunt.loadNpmTasks('grunt-include-source');

  // Default task(s).
  grunt.registerTask('default', ['clean', 'less', 'cssmin', 'concat', 'beep']);
  grunt.registerTask('clubs', ['clean', 'sprite:clubs', 'default']);
  grunt.registerTask('sources', ['clean', 'responsive_images:sources', 'sprite:sources', 'default']);

  // resize images (from 'large' folder):
  // find -name '*.png' -exec magick {} -resize 18x18 ../small/{} \;
  // grunt clubs
};
