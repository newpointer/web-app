//
var fs      = require('fs-extra'),
    path    = require('path'),
    _       = require('lodash'),
    i18n    = require('nullpointer-i18n-bin'),
    wb      = require('nullpointer-web-bin');


//
var buildMeta           = {},
    defaultGruntConfig  = {};

//
module.exports.getDefaultGruntConfig = function(path) {
    return defaultGruntConfig;
};

//
module.exports.getBuildMeta = function(path) {
    return buildMeta;
};

//
module.exports.setBuildMeta = function(meta) {
    console.log('***', __dirname);

    var main = require(path.resolve(meta.cwd, 'src/' + meta.name + '/main'));

    buildMeta = _.extend({}, meta, {
        main: main,
        indexHtmlPath: 'target/web-resources-build/' + meta.name + '/src/' + meta.name + '/index.html',
        buildIdReplacement: '\\${' + meta.name + '.build.id}',
        langs: main._APP_CONFIG.lang.langs,
        hash: null
    });

    // test stub
    _.each(buildMeta.main._RESOURCES_CONFIG.packages, function(p){
        if (p.name === 'test') {
            p.location = 'src/' + p.location;
            return false;
        }
    });

    defaultGruntConfig = {
        clean: {
            'project-deps': ['node_modules'],
            'web-deps': ['bower_components', 'external_components'],
            target: ['target'],
            dist: ['dist']
        },

        jshint: {
            options: {
                force: true,
                browser: true,
                '-W069': true
            },
            src: [
                'src/**/*.js'
            ]
        },

        copy: {
            'test-stub': {
                expand: true,
                cwd: __dirname + '/stubs/test',
                src: '**',
                dest: 'target/web-resources-process/src/test'
            },
            'dist': {
                expand: true,
                flatten: true,
                cwd: 'target/web-resources-build/' + buildMeta.name,
                src: [
                    'build.properties',
                    'src/' + buildMeta.name + '/favicon.ico',
                    'src/' + buildMeta.name + '/main.js',
                    'src/' + buildMeta.name + '/index.html'
                ],
                dest: 'dist/' + buildMeta.name,
                options: {
                    noProcess: '**/*.{ico,properties,js,xml}',
                    process: function (content, srcpath) {
                        if (srcpath === buildMeta.indexHtmlPath) {
                            return content.replace(new RegExp(buildMeta.buildIdReplacement, 'g'), buildMeta.hash);
                        }

                        return content;
                    }
                }
            }
        },

        bower: {
            install: {
                options: {
                    targetDir: 'external_components',
                    layout: 'byComponent',
                    install: true,
                    verbose: true,
                    cleanTargetDir: true,
                    cleanBowerDir: false,
                    bowerOptions: {
                        forceLatest: true,
                        production: false
                    }
                }
            }
        },

        i18n: {
            'ui': {
                options: {
                    pattern:        '**/*.+(js|html)',
                    inputDir:       path.resolve(buildMeta.cwd, 'src'),
                    inputRootPath:  path.resolve(buildMeta.cwd, ''),
                    outputDir:      path.resolve(buildMeta.cwd, 'i18n/ui'),
                    bundleDir:      path.resolve(buildMeta.cwd, 'src/l10n/ui'),
                    baseLang:       buildMeta.langs[0],
                    langs:          buildMeta.langs
                }
            }
        },

        'process-resources': {
            'external_components': {
                options: {
                    inputDir: path.resolve(buildMeta.cwd, 'external_components'),
                    outputDir: path.resolve(buildMeta.cwd, 'target/web-resources-process/external_components'),

                    urlToBase64: true,

                    // значение будет взято из аргумента [grunt process-resources:build:true|false], см. register task web-resources
                    skipProcess: null
                }
            },
            'src': {
                options: {
                    inputDir: path.resolve(buildMeta.cwd, 'src'),
                    outputDir: path.resolve(buildMeta.cwd, 'target/web-resources-process/src'),

                    urlToBase64: true,

                    // значение будет взято из аргумента [grunt process-resources:build:true|false], см. register task web-resources
                    skipProcess: null
                }
            }
        },

        'web-resources': {
            'build': {
                options: {
                    propertiesFile: path.resolve(buildMeta.cwd, 'target/web-resources-build/' + buildMeta.name + '/build.properties'),
                    buildIdPropertyName: buildMeta.appId ? (buildMeta.appId + '.build.id') : null,
                    mainFile: path.resolve(buildMeta.cwd, 'target/web-resources-build/' + buildMeta.name + '/src/' + buildMeta.name + '/main.js'),

                    requirejs: _.extend({}, buildMeta.main._RESOURCES_CONFIG, {
                        dir: path.resolve(buildMeta.cwd, 'target/web-resources-build/' + buildMeta.name),
                        baseUrl: path.resolve(buildMeta.cwd, 'target/web-resources-process'),

                        less: {
                            rootpath: buildMeta.rootpath,
                            relativeUrls: true
                        },

                        wrap: {
                            start: 'var APP_BUILD_TYPE = "' + buildMeta.APP_BUILD_TYPE + '";\n'
                        },

                        optimize: 'uglify2',
                        uglify2: {
                            mangle: true,
                            output: {
                                comments: /-- DO_NOT_DELETE --/
                            }
                        },

                        removeCombined: false,
                        preserveLicenseComments: false
                    }),

                    // значение будет взято из аргумента [grunt web-resources-xxx:build:true|false], см. register task web-resources
                    skipOptimize: null
                }
            }
        }
    };
};

//
module.exports.initGrunt = function(grunt, gruntConfig) {
    //
    grunt.initConfig(gruntConfig || defaultGruntConfig);

    //
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-bower-task');

    //
    grunt.task.registerMultiTask('i18n', function(arg1) {
        var done = this.async();

        i18n.run(this.data.options, function(){
            done();
        });
    });

    //
    grunt.task.registerMultiTask('process-resources', function(skip) {
        var done        = this.async(),
            options     = this.data.options,
            skipProcess = (skip === 'true');

        fs.removeSync(options.outputDir);
        fs.mkdirsSync(options.outputDir);

        wb.processResources.run(_.extend(options, {
            skipProcess: skipProcess
        }), function(){
            done();
        });
    });

    //
    grunt.task.registerMultiTask('web-resources', function(skipOptimize) {
        var done            = this.async(),
            options         = this.data.options,
            skipOptimize    = (skipOptimize === 'true');

        fs.removeSync(options.requirejs.dir);
        fs.mkdirsSync(options.requirejs.dir);

        wb.requirejsOptimize.run(_.extend(options, {
            skipOptimize: skipOptimize
        }), function(hash){
            buildMeta.hash = hash;
            done();
        });
    });

    //
    grunt.registerTask('init', ['clean:web-deps', 'bower']);
    grunt.registerTask('dist', ['clean:dist', 'copy:dist']);
    grunt.registerTask('build', [
        'clean:target', 'clean:web-deps',
        'init',
        'jshint',
        'process-resources:external_components:false',
        'process-resources:src:false',
        'copy:test-stub',
        'web-resources:build:false',
        'dist'
    ]);
    grunt.registerTask('cleanup', ['clean:target', 'clean:web-deps', 'clean:project-deps']);
};
