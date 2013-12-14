'use strict';

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-ngmin');
    grunt.loadNpmTasks('grunt-karma');

    grunt.initConfig({
        pkg: grunt.file.readJSON('bower.json'),
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                singleRun: true,
                options: {
                    files: ['<%= pkg.name %>.js', '<%= pkg.name %>.test.js']
                }
            }
        },
        ngmin: {
            dist: {
                files: [{
                    cwd: './',
                    src: '<%= pkg.name %>.js',
                    dest: '<%= pkg.name %>.min.js'
                }]
            }
        },
        uglify: {
            dist: {
                files: {
                    '<%= pkg.name %>.min.js': [
                        '<%= pkg.name %>.min.js'
                    ]
                }
            }
        }
    });

    grunt.registerTask('test', [
        'build',
        'karma:unit'
    ]);

    grunt.registerTask('build', [
        'ngmin',
        'uglify'
    ]);

    grunt.registerTask('default', [
        'test',
        'build'
    ]);
};
