"use strict";

module.exports = function (grunt) {

    grunt.initConfig({
        jshint: {
            files: ["Gruntfile.js", "src/*.js"],
            options: {}
        },
        uglify: {
            main: {
                files: {
                    "dist/esAnimate-es5.min.js": ".tmp/esAnimate-es5.js"
                },
                options: {
                    compress: {
                        drop_console: true
                    }
                }
            }
        },
        copy: {
            pre: {
                files: {
                    "dist/esAnimate.js": "src/esAnimate.js",
                },
            },
            main: {
                files: {
                    "dist/esAnimate-es5.js": ".tmp/esAnimate-es5.js",
                    "dist/esAnimate-es5.js.map": ".tmp/esAnimate-es5.js.map",
                },
            }
        },

        babel: {
            options: {
                sourceMap: true,
                presets: ["es2015"]
            },
            dist: {
                files: {
                    ".tmp/esAnimate-es5.js": "src/esAnimate.js"
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-babel");
    grunt.loadNpmTasks("grunt-replace");
    grunt.loadNpmTasks("grunt-contrib-uglify");

    grunt.registerTask("default", [
        "copy:pre",
        "babel:dist",
        "uglify:main",
        "copy:main"
    ]);

};
