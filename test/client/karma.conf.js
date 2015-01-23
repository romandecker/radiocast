"use strict";

module.exports = function( config ) {

    config.set( {
        frameworks: ["mocha"],

        basePath: "../..",

        files: [
            "app/public/bower_components/jquery/dist/jquery.min.js",
            "app/public/bower_components/bootstrap/dist/js/bootstrap.min.js",
            "app/public/bower_components/angular/angular.min.js",
            "app/public/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js",
            "app/public/bower_components/angular-route/angular-route.js",
            "app/public/bower_components/angular-resource/angular-resource.js",
            "app/public/bower_components/angular-cookies/angular-cookies.min.js",
            "app/public/bower_components/angular-mocks/angular-mocks.js",
            "app/public/bower_components/chai/chai.js",
            "app/public/bower_components/chai-spies/chai-spies.js",
            "app/public/app.js",
            "app/public/routes.js",
            "app/public/controllers/**/*.js",
            "app/public/services/**/*.js",
            "app/public/directives/**/*.js",
            "app/public/filters/**/*.js",
            "app/public/utils/**/*.js",
            "test/client/testutils.js",
            "test/client/**/*.test.js"
        ],

        reporters: ["mocha", "coverage"],
        preprocessors: {
            "app/public/!(bower_components)/**/*.js": "coverage",
        },

        coverageReporter: {
            type: "lcov",
            dir: "test/reports/client/coverage"
        },

        browsers: ["PhantomJS"]

    } );
};
