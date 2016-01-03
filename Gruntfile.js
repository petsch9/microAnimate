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
            drop_console: true
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
            unsafe_comps: true
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
            match: /ease/g,
            replacement: 'a'
          },{
            match: /ticks/g,
            replacement: 'b'
          },{
            match: /initial/g,
            replacement: 'c'
          },{
            match: /styles/g,
            replacement: 'd'
          },{
            match: /nextAnim/g,
            replacement: 'f'
          },{
            match: /timeDifference/g,
            replacement: 'h'
          },{
            match: /\.callback/g,
            replacement: '.k'
          },{
            match: /element/g,
            replacement: 'l'
          },{
            match: /options/g,
            replacement: 'm'
          },{
            match: /data/g,
            replacement: 'n'
          },{
            match: /\.animation/g,
            replacement: '.o'
          },{
            match: /\.interval/g,
            replacement: 'p'
          },{
            match: /ticklength/g,
            replacement: 'q'
          },{
            match: /\.current/g,
            replacement: '.r'
          },{
            match: /\.action/g,
            replacement: '.s'
          },{
            match: /\.max/g,
            replacement: '.t'
          },{
            match: /\.loop/g,
            replacement: '.u'
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
