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
          'dist/microAnimate.min.unsafe.js': 'dist/microAnimate.min.js'
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
        files: {
          'dist/microAnimate-es6.js': 'src/microAnimate.js',
        },
      },demo: {
        files: {
          'demo/microAnimate.js': 'src/microAnimate.js',
        },
      },
    },
    /* UglifyJS doesnt uglify properties, so we do it by hand*/
    replace: {
      dist: {
        options: {
          patterns: [{
            match: /options/g,
            replacement: 'a'
          }, {
            match: /element/g,
            replacement: 'b'
          }, {
            match: /duration/g,
            replacement: 'c'
          }, {
            match: /ticklength/g,
            replacement: 'd'
          }, {
            match: /totalTicks/g,
            replacement: 'e'
          }, {
            match: /animation/g,
            replacement: 'f'
          }, {
            match: /interval/g,
            replacement: 'g'
          }, {
            match: /ease/g,
            replacement: 'h'
          }, {
            match: /retainEndState/g,
            replacement: 'i'
          }, {
            match: /styles/g,
            replacement: 'j'
          }, {
            match: /transition/g,
            replacement: 'k'
          }, {
            match: /callback/g,
            replacement: 'l'
          }, {
            match: /initial/g,
            replacement: 'm'
          }, {
            match: /current/g,
            replacement: 'n'
          }, {
            match: /max/g,
            replacement: 'o'
          },  {
            match: /data/g,
            replacement: 'p'
          },  {
            match: /nextFrameAction/g,
            replacement: 'q'
          },  {
            match: /isPaused/g,
            replacement: 'r'
          },  {
            match: /loop/g,
            replacement: 's'
          }, {
            match: /nextAnim/g,
            replacement: 't'
          },  {
            match: /timeDifference/g,
            replacement: 'u'
          }]
        },
        files: {
          'dist/microAnimate.min.js': 'dist/microAnimate.js'
        }
      }
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

  grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['copy:main', 'babel:dist','copy:demo', 'replace:dist', 'uglify:unsafe', 'uglify:main']);

};
