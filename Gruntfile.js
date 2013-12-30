'use strict';

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-ngmin');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-bump');

    grunt.initConfig({
        pkg: grunt.file.readJSON('bower.json'),
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                singleRun: true,
                options: {
                    files: [
                        'bower_components/angular/angular.js',
                        'bower_components/angular-mocks/angular-mocks.js',
                        'test-utils.js',
                        'mocks/firebase-mock.js',
                        'bower_components/angularfire/angularfire.js',
                        '<%= pkg.name %>.min.js',
                        '<%= pkg.name %>.test.js'
                    ]
                }
            }
        },
        ngmin: {
            dist: {
                files: [{
                    cwd: './',
                    src: '<%= pkg.name %>.src.js',
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
        },
        bump: {
            options: {
                files: ['package.json', 'bower.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['-a'], // '-a' for all files
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'upstream',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
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

    grunt.registerTask('release', [
        'test',
        'build',
        'bump'
    ]);

    grunt.registerTask('default', [
        'test',
        'build'
    ]);
};
