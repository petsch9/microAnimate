module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'src/*.js'],
      options: {}
    },
    uglify: {
      main: {
        files: {
          'dist/microAnimate.min.js': 'dist/microAnimate.min.js'
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
          'dist/microAnimate-es6.js': 'src/microAnimate.js'
        },
      },
    },
    /* UglifyJS doesnt uglify properties, so we do it by hand*/
    replace: {
      dist: {
        options: {
          patterns: [{
            match: /\.options/g,
            replacement: '.o'
          },{
            match: /\.element/g,
            replacement: '.e'
          },{
            match: /\.duration/g,
            replacement: '.d'
          },{
            match: /\.ticklength/g,
            replacement: '.t'
          },{
            match: /\.totalTicks/g,
            replacement: '.k'
          },{
            match: /\.animation/g,
            replacement: '.a'
          },{
            match: /\.interval/g,
            replacement: '.i'
          }, {
            match: /\.ease/g,
            replacement: '.s'
          }, {
            match: /\.retainEndState/g,
            replacement: '.r'
          },  {
            match: /\.styles/g,
            replacement: '.c'
          },  {
            match: /\.transition/g,
            replacement: '.z'
          }, {
            match: /\.callback/g,
            replacement: '.b'
          },  ]
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

  grunt.registerTask('default', ['copy:main', 'babel:dist', 'replace:dist','uglify:unsafe', 'uglify:main']);

};
