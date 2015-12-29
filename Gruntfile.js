module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'src/*.js'],
      options: {}
    },
    uglify: {
      options: {
        compress: {
          drop_console: true,
          screw_ie8: true
        }
      },
      my_target: {
        files: {
          'dist/microAnimate.min.js': 'dist/microAnimate.js'
            /*,
                      'dist/microAnimate-es5.min.js': 'src/microAnimate-es5.js'*/
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
  grunt.registerTask('default', ['babel:dist', 'uglify']);

};
