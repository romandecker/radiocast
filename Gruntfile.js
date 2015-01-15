"use strict";

// prevent jshint flagging the node_env parameter of express
/* jshint camelcase: false */

module.exports = function( grunt ) {

    grunt.loadNpmTasks( "grunt-express-server" );
    grunt.loadNpmTasks( "grunt-contrib-watch" );
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
                    }
                };
                
                cb( null, cfg );
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
                options: { },
                src: ["test/api/**/*.test.js"]
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
            }
        },
        unzip: {
            coverage: {
                dest: "test/reports/api/",
                src: "test/reports/api/coverage.zip"
            }
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
        clean: {
            coverageZip: ["test/reports/api/coverage.zip"],
            doc: ["doc/**/*"]
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
                path: "test/reports/api/lcov-report/index.html"
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
    grunt.registerTask( "server", ["lint", "express:development", "watch"] );

    //start the server in test setup and then run the tests
    grunt.registerTask( "test:api", 
                        "Run the API tests", 
                        ["express:test", "mochaTest"] );

    grunt.registerTask( "test:api:coverage",
                        "Run the API tests and output coverage information",
                        ["env:coverage",
                          "express:test",
                          "mochaTest",
                          "curl:coverage",
                          "unzip:coverage",
                          "clean:coverageZip",
                          "open:coverage"] );

    grunt.registerTask( "test:client", "test:client:single" );

    grunt.registerTask( "test:client:single",
                        "Run the client tests once",
                        "karma:single" );

    grunt.registerTask( "test:client:continuous",
                        "Run the client tests continuously",
                        "karma:continuous" );

    grunt.registerTask( "test",
                        "Run all tests",
                        ["test:client:single", "test:api"] );
    
};
