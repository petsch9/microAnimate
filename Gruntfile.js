module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'src/*.js'],
      options: {}
    },
    uglify: {
      main: {
        files: {
          'dist/microAnimate.min.js': '.tmp/microAnimate.js'
        },
        options: {
          compress: {
            drop_console: true
          }
        }
      },
      unsafe: {
        files: {
          'dist/microAnimate.min.unstable.js': '.tmp/microAnimate.replaced.js'
        },
        options: {
          compress: {
            drop_console: true,
            screw_ie8: true,
            unsafe: true,
            unsafe_comps: true
          }
        }
      },
    },
    copy: {
      pre: {
        files: {
          'dist/microAnimate-es6.js': 'src/microAnimate.js',
        },
      },
      main: {
        files: {
          'dist/microAnimate.js': '.tmp/microAnimate.js',
          'dist/microAnimate.js.map': '.tmp/microAnimate.js.map',
        },
      },
      demo: {
        files: {
          'demo/microAnimate.js': 'dist/microAnimate.min.unstable.js',
        },
      },
    },
    /* UglifyJS doesnt uglify properties, so we do it by hand*
     * The properties left out are not included for a reason, adding them will break functionality
     * UPDATE: yep we shouldnt do this, too much work
     */
    replace: {
      dist: {
        options: {
          patterns: [{
            match: /ease/g,
            replacement: 'a'
          }, {
            match: /tickTotal/g,
            replacement: 'b'
          }, {
            match: /initial/g,
            replacement: 'c'
          }, {
            match: /styles/g,
            replacement: 'd'
          }, {
            match: /animationNext/g,
            replacement: 'f'
          }, {
            match: /timeDifference/g,
            replacement: 'h'
          }, {
            match: /\.callback/g,
            replacement: '.k'
          }, {
            match: /element/g,
            replacement: 'l'
          }, {
            match: /\.options/g,
            replacement: '.m'
          }, {
            match: /\.data/g,
            replacement: '.n'
          }, {
            match: /\.animation/g,
            replacement: '.o'
          }, {
            match: /\.interval/g,
            replacement: '.p'
          }, {
            match: /tickLength/g,
            replacement: 'q'
          }, {
            match: /current/g,
            replacement: 'r'
          }, {
            match: /max/g,
            replacement: 'e'
          }, {
            match: /\.action/g,
            replacement: '.s'
          }, {
            match: /index/g,
            replacement: 't'
          }, {
            match: /retainEndState/g,
            replacement: 'u'
          }, {
            match: /tickCurrent/g,
            replacement: 'v'
          }, {
            match: /relativePercentage/g,
            replacement: 'x'
          }]
        },
        files: {
          '.tmp/microAnimate.replaced.js': '.tmp/microAnimate.js'
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
          '.tmp/microAnimate.js': 'src/microAnimate.js'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['copy:pre', 'babel:dist',
    'replace:dist', 'uglify:unsafe', 'uglify:main',
    'copy:main', 'copy:demo'
  ]);

};
