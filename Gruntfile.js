module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'src/*.js'],
      options: {}
    },
    uglify: {
      main: {
        files: {
          'dist/microAnimate.min.js': 'dist/microAnimate.js'
        },
        options: {
          compress: {
            drop_console: true,
            hoist_vars: true
          }
        }
      },
      unsafe: {
        files: {
          'dist/microAnimate.min.unsafe.js': 'dist/microAnimate.js'
        },
        options: {
          compress: {
            drop_console: true,
            screw_ie8: true,
            unsafe: true,
            unsafe_comps: true,
            hoist_vars: true
          }
        }
      },
    },
    copy: {
      main: {
        expand: true,
        cwd: 'src/',
        src: 'microAnimate.js',
        dest: 'dist/',
        flatten: true,
        filter: 'isFile',
      },
    },
    babel: {
      options: {
        sourceMap: true,
        presets: ['es2015']
      },
      dist: {
        files: {
          'dist/microAnimate.js': 'src/microAnimate.js'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-babel');

  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('default', ['babel:dist', 'uglify:main', 'uglify:unsafe']);

};
