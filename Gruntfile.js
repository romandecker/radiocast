"use strict";

var istanbul = require( "istanbul" );
var fs = require( "fs" );

// prevent jshint flagging the node_env parameter of express
/* jshint camelcase: false */

module.exports = function( grunt ) {

    grunt.loadNpmTasks( "grunt-express-server" );
    grunt.loadNpmTasks( "grunt-contrib-watch" );
    grunt.loadNpmTasks( "grunt-focus" );
    grunt.loadNpmTasks( "grunt-contrib-jshint" );
    grunt.loadNpmTasks( "grunt-contrib-clean" );
    grunt.loadNpmTasks( "grunt-mocha-test" );
    grunt.loadNpmTasks( "grunt-curl" );
    grunt.loadNpmTasks( "grunt-zip" );
    grunt.loadNpmTasks( "grunt-jsdoc" );
    grunt.loadNpmTasks( "grunt-env" );
    grunt.loadNpmTasks( "grunt-knex-migrate" );
    grunt.loadNpmTasks( "grunt-open" );
    grunt.loadNpmTasks( "grunt-karma" );
    grunt.loadNpmTasks( "grunt-sass" );
    grunt.loadNpmTasks( "grunt-node-inspector" );
    grunt.loadNpmTasks( "grunt-execute" );
    grunt.loadNpmTasks( "grunt-mocha-istanbul" );
    grunt.loadNpmTasks( "grunt-protractor-runner" );

    grunt.initConfig( {
        watch: {
            /* 
             * Takes care of restarting the express server when a file is
             * changed. Note that restarting the server will trigger linting as
             * well.
             */
            express: {
                files: ["app.js",
                        "app/*.js",
                        "app/models/**/*.js",
                        "app/controllers/**/*.js"],
                tasks: ["lint", "express:development"],
                options: { spawn: false }
            },
            public: {
                files: ["app/views/**/*.html",
                        "app/views/**/*.ejs",
                        "app/public/**/*.html",
                        "app/public/**/*.css",
                        "app/public/**/*.js"],
                options: { livereload: true }
            },
            sass: {
                files: ["app/public/scss/**/*.scss"],
                tasks: ["sass"]
            },
            tests: {
                files: ["app.js",
                        "app/*.js",
                        "app/models/**/*.js",
                        "app/controllers/**/*.js"],
                        // actual test files will be added dynamically by
                        // test tasks
                tasks: ["mochaTest"]
            }
        },
        focus: {
            development: {
                include: ["express", "public", "sass"]
            },
            test: {
                include: ["test"]
            }
        },
        express: {
            /* 
             * Starts server in environment according to sub-task.
             * express:development for development environment,
             * express:test for test environment and
             * express:production for production.
             */
            options: {
                script: "app.js"
            },
            debug: { options: { node_env: "development", debug: true } },
            development: { options: { node_env: "development" }    },
            production: { options: { node_env: "production" } },
            test: {
                options: {
                    node_env: "test",
                    output: "Listening on port.*"
                }
            },
        },
        env: {
            options: {},
            development: { NODE_ENV: "development" },
            test: { NODE_ENV: "test" },
            production: { NODE_ENV: "production" },
            coverage: { COVERAGE: "true" }
        },
        knexmigrate: {
            config: function( cb ) {

                var config = require( "config" );
                var db = config.get( "db" );


                var cfg = {
                    directory: "app/migrations",
                    tableName: "knex_migrations",
                    database: {
                        client: db.client,
                        connection: {
                            user: db.connection.user,
                            password: db.connection.password,
                            database: db.connection.database
                        }
                    },
                    pool: {
                        max: 1
                    } }; 
                cb( null, cfg );
            }
        },
        execute: {
            makeSeed: {
                src: ["app/seeds/seed.js"],
                options: {
                    args: ["make"]
                }
            },
            runSeed: {
                src: ["app/seeds/seed.js"],
                options: {
                    args: ["run"]
                }
            }
        },
        jshint: {
            all: ["app.js",
                  "app/**/*.js",
                  "test/**/*.js"],
            options: {
                ignores: ["node_modules/**/*",
                          "app/public/bower_components/**/*",
                          "test/reports/**/*.js"
                         ],
                jshintrc: true
            }
        },
        mochaTest: {
            test: {
                options: {
                    clearRequireCache: true,
                    reporter: "spec"
                },
                src: ["test/api/**/*.test.js"]
            }
        },
        mocha_istanbul: {
            coverage: {
                src: "test/api",
                options: {
                    mask:  "*.test.js",
                    coverageFolder: "test/reports/api/coverage_direct",
                    quiet: true
                }
            }
        },
        karma: {
            single: {
                configFile: "test/client/karma.conf.js",
                singleRun: true
            },
            continuous: {
                configFile: "test/client/karma.conf.js",
                reporters: ["mocha"],
                preprocessors: null,
                coverageReporter: null
            }
        },
        curl: {
            coverage: {
                dest: "test/reports/api/coverage.zip",
                src: "http://localhost:3001/coverage/download"
            },
        },
        unzip: {
            coverage: {
                dest: "test/reports/api/coverage_indirect",
                src: "test/reports/api/coverage.zip"
            }
        },
        protractor: {
            options: {
                
            },
            e2e: {
                configFile: "test/e2e/conf.js"
            }
        },
        mochaProtractor: {
            options: {
                browsers: ["Chrome"],
                baseUrl: "http://localhost:3001/"
            },
            files: ["test/e2e/**/*.test.js"]
        },
        sass: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    "app/public/css/style.css": "app/public/scss/*.scss"
                }
            }
        },
        "node-inspector": {
            custom: {
                options: {
                    "web-port": 1337,
                    "web-host": "localhost",
                    "save-live-edit": true,
                    "hidden": ["node_modules"]
                }
            }
        },
        clean: {
            intermediateCoverage: [
                "test/reports/api/coverage_direct",
                "test/reports/api/coverage_indirect",
            ],
            doc: ["doc/**/*"],
            seleniumStopLog: ["logs/seleniumStop.log"]
        },
        jsdoc: {
            dist: {
                src: ["app.js",
                      "app/**/*.js",
                      "test/**/*.js",
                      "!app/public/bower_components/**/*",
                      "!test/reports/**/*",
                      "README.md"],
                options: {
                    destination: "doc",
                    template: "node_modules/grunt-jsdoc/node_modules/" + 
                              "ink-docstrap/template",
                    configure: "node_modules/grunt-jsdoc/node_modules/" + 
                                "ink-docstrap/template/jsdoc.conf.json"
                }
            }
        },
        open: {
            coverage: {
                path: "test/reports/api/coverage/lcov-report/index.html"
            },
            inspector: {
                path: "http://localhost:1337/debug?port=5858"
            }
        }
    } );

    //simple alias
    grunt.registerTask( "lint",
                        "Lint every project-owned JS-file",
                        "jshint" );
    grunt.registerTask( "doc",
                        "Generate project documentation in doc/",
                        "jsdoc" );

    var envs = ["development", "test", "production"];
    var knexCommands = ["latest", "rollback", "currentVersion"];

    envs.forEach( function(env) {
        grunt.registerTask( "seed:" + env + ":make",
                            "Create a new " + env + " seed file.", function( name ) {

            console.log( "passing", name );
            grunt.task.run( "env:" + env );
            grunt.config.set( "execute.makeSeed.options.args", ["make", name] );
            grunt.option( "args", [ "make", name ] );
            grunt.task.run( "execute:makeSeed" );
        } );

        grunt.registerTask(
            "seed:" + env + ":run",
            "Run all seed files for " + env,
            [ "env:" + env, "execute:runSeed" ]
        );
    } );

    //register migration tasks
    knexCommands.forEach( function(cmd) {
        envs.forEach( function(env) {
            grunt.registerTask( "migrate:" + env + ":" + cmd,
                                "Run the " + cmd + " command in " + env + 
                                " environment.",
                                [ "env:" + env, "knexmigrate:" + cmd ] );
        } );
    } );

    //register make migration task (this one doesn't need an environment)
    grunt.registerTask( "migrate:make",
                        "Create migration (usage: grunt " + 
                        "migrate:make:<migration_name>",
                        function( name ) {
        if( !name ) {
            throw new Error( "No migration name given! Specify like this: " + 
                             "migrate:make:<migration_name>" );
        }

        grunt.task.run( "knexmigrate:make:" + name );
    } );


    //lint once, then start server and watch for changes
    grunt.registerTask( "server", ["lint",
                                   "express:development",
                                   "focus:development"] );

    grunt.registerTask( "server:debug", ["express:debug",
                                         "open:inspector",
                                         "node-inspector"] );

    //start the server in test setup and then run the tests
    grunt.registerTask( "test:api", 
                        "Run the API tests", 
                        ["express:test", "mochaTest"] );

    grunt.registerTask( "test:api:coverage",
                        "Run the API tests and output coverage information",
                        ["env:coverage",
                          "express:test",
                          "mocha_istanbul",
                          "curl:coverage",
                          "unzip:coverage",
                          "coverage:collect",
                          "clean:intermediateCoverage",
                          "open:coverage"] );

    grunt.registerTask( "coverage:collect", function() {
        console.log( "collecting coverage information..." );

        var collector = new istanbul.Collector(
            {},
            "test/reports/api/coverage"
        );

        var files = [
            "test/reports/api/coverage_direct/coverage.json",
            "test/reports/api/coverage_indirect/coverage.json"
        ];

        files.forEach( function( file ) {
            collector.add( JSON.parse(fs.readFileSync(file)) );
        } );

        var report = istanbul.Report.create(
            "lcov",
            { dir: "test/reports/api/coverage" }
        );
        report.writeReport( collector, true );

    } );

    grunt.registerTask( "test:api:file",
                        "Run one test file from the API tests",
                        function( file, mode ) {


        if( mode !== "rerun" ) {
            grunt.task.run( "express:test" );
        }

        var path = "test/api/" + file + ".test.js";
        grunt.config( "mochaTest.test.src", path );

        if( mode === "continuous" ) {
            var files = grunt.config( "watch.tests.files" );
            files.push( path );
            grunt.config( "watch.tests.files", files );
            grunt.config( "watch.tests.tasks",
                          ["test:api:file:" + file + ":rerun"] );
            grunt.task.run( "watch:tests" );
        } else {
            grunt.task.run( "mochaTest" );
        }

    } );

    grunt.registerTask( "test:api:continuous",
                        "Run all api tests continuously",
                        function() {

        grunt.task.run( "express:test" );
        var path = "test/api/**/*.test.js";
        grunt.config( "mochaTest.test.src", path );

        var files = grunt.config( "watch.tests.files" );
        files.push( path );
        grunt.config( "watch.tests.files", files );
        grunt.task.run( "watch:tests" );

    } );

    grunt.registerTask( "test:client", "test:client:single" );

    grunt.registerTask( "test:client:single",
                        "Run the client tests once",
                        "karma:single" );

    grunt.registerTask( "test:client:continuous",
                        "Run the client tests continuously",
                        "karma:continuous" );

    grunt.registerTask( "test:e2e",
                        "Run the end-to-end tests",
                        ["express:test",
                         "protractor:e2e"]);

    grunt.registerTask( "test",
                        "Run all tests",
                        ["test:client:single", "test:api"] );
    
};
