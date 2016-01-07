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
          'demo/microAnimate.js': 'dist/microAnimate.js',
        },
      },
    },
    /* UglifyJS doesnt uglify properties, so we do it by hand*
    * The properties left out are not included for a reason, adding them will break functionality
    */
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
            match: /animationNext/g,
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
            replacement: '.p'
          },{
            match: /ticklength/g,
            replacement: 'q'
          },{
            match: /current/g,
            replacement: 'r'
          },{
            match: /max/g,
            replacement: 'e'
          },{
            match: /\.action/g,
            replacement: '.s'
          },{
            match: /index/g,
            replacement: 't'
          },{
            match: /retainEndState/g,
            replacement: 'u'
          },{
            match: /loop/g,
            replacement: 'v'
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
