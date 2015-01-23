Nodeseed
========

A good starting point for node.js web-applications using express.js and angular.

Setup
-----

This is a node.js application so you're gonna need node.js installed on your
system.

The application is split into a backEnd and a frontEnd: The backEnd is
basically a RESTful API (backed by an SQL database) created with express.js.
The frontEnd is implemented with AngularJS and consumes the API the backEnd
provides.

To get started, install the following node packages globally on your system:

    npm install
    npm install -g grunt-cli    # for the grunt-executable
    npm install -g bower        # for the bower-executable

Once you have cloned this repo, `cd` into it and execute `npm install`.
This will install all node-dependencies. 

Now that you have your backEnd dependencies all nice set up, go ahead and
install the frontEnd dependencies as well:
    
    bower install       # this will install angular, jquery, bootstrap, etc.

## Database stuff

The application is backed by an SQL database, preferably MySQL (actually, a lot
of databases should work, but we'll stick to MySQL here). If you haven't
already, go ahead and install a mysql server on your machine.

It's best if you create a user and database(s) that the application can use
just for itself. You should create 3 databases - one for each environment
(check the Configuration section for more info on environments). What you name
the user (as well as his password) is completely up to you, just make sure to
put the same values in your local configuration file. To help you with
creating the necessary DBs and DB-Users with their correct permissions, check
out `scripts/create_db.sql` in this repo.


## Initial configuration

In the `config/` folder of this repository, you should find the application's
configuration files. Go ahead and create a file called `local.json` there. This
file is deliberately gitignored and should contain your own personal
configuration options for the application (such as the db-user-password you
chose for your database user). Fill it with the following:

    {
        "db": {
            "connection": {
                "user": "yourapp",
                "password": "yourpassword"
            }
        }
    }

Good on you! You should now be able to start the application by running
`grunt server`. Access it via http://localhost:3000/


The Gruntfile
-------------
The gruntfile handles all the tasks associated with the application. Its tasks
include:

* `server`: Start the development server. All javascript files will be linted
  before the server starts. Once the server is running, the task watches for
  changes to server-relevant javascript-files and restarts the server if
  necessary. Also includes livereload so you don't have to press that pesky F5
  key.
* `test`: Start the application in the `test`-environment and perform the tests.
* `lint`: Simply lint all javascript files and print results to stdout.
* `doc`: Generate documentation. If you're looking at this in a webbrowser,
  chances are, you already did this, yay! Documentation will be put into `doc/`.
* `express:<env>` for `<env>` use `development`, `production` or `test` to start
  the app in the according environment. Use `express:production` to start the
  application in production mode!

Configuration
-------------

The application is environment-driven, that means it can be started in 3 modes:

* `development`: Your bread-and-butter mode, when you develop new features,
  the application will typically run in this environment.
* `test`: This environment is used by the automatic test suite, when you run
  `grunt test`, the application will automatically start in this environment.
* `production`: This is the environment used in production mode.

Application configuration is handled by node-config
(https://github.com/lorenwest/node-config) and all config files are located in
`config/`. You can use `json` and `js` (and more!) as file extensions for all
configuration files, but for the sake of simplicity in this explanation, `js` is
assumed from now on. This has the added benefit, that you can actually compute
configuration values. 

`config/default.json` contains basic configuration options that are the same
across all environments. To configure environment-specific stuff, use
`config/<environment.js>` which will override the default settings. To further
override these settings, you can use `config/local.js` or
`config/local-<environment>.js` which are gitignored, so they are perfect for
storing locally specific settings such as a database password.

Database
--------
The application expects one of the following SQL-servers:
* MySQL (default)
* PostgreSQL
* SQLite
* and more (whatever bookshelf.js/knex.js support)

The application's connection settings are stored in `config/default.json`, 
`config/<environment>.json` and `config/local.json`. Configure your SQL-server
to be listening for incoming connections at the endpoint specified there. Also
make sure the required user(s) and database(s) exist and that the appropriate
privileges are set. Everything else (creating the schema, etc.) will be handled
by the application (using migrations).

Example for configuring a mysql server (`scripts/create_db.sql`)

    mysql -u root
    mysql> CREATE DATABASE dbname_development;
    mysql> CREATE DATABASE dbname_test;
    mysql> CREATE DATABASE dbname_production;
    mysql> CREATE USER "username"@"localhost" IDENTIFIED BY "userpassword";
    mysql> GRANT ALL PRIVILEGES ON dbname_development.* TO
           "username"@"localhost";
    mysql> GRANT ALL PRIVILEGES ON dbname_test.* TO
            "username"@"localhost";
    mysql> GRANT ALL PRIVILEGES ON dbname_production.* TO
            "username"@"localhost";
    mysql> exit
    
Models
------
Models reside in the `app/models` directory.

### What a model should look like
The application expects models to be a node.js-module whose `exports`-object is
a function returning a single bookshelf.js-Model. So typically, your models will
look like this:

    "use strict";
    var bookshelf = require( "./base" );

    module.exports = bookshelf.model( "Cat", {
        tableName: "cats"
        /* ... */
    } );


For more info on how to define bookshelf.js-models see
http://bookshelfjs.org/#Model.
    
You can then use your defined models in your controllers like this:

    var User = require( "../models/User" );

    /* ... */

    User.fetchAll().then( function( users ) {
        res.render( "users/index", { users: users } );
    } ).catch( function(error) {
        res.status( 500 ).json( error );
    } );

For more info on querying models check http://bookshelfjs.org/ and
http://knexjs.org/ which bookshelf is using internally.

Migrations
----------
Your models will rely on a database. To keep your database schema easily
updatable, knex migrations are used.

Migrations are placed in `app/migrations` and run via `grunt migrate:<command>`.
There is no knexfile for these migrations as described in the knex migrations
docs, instead the gruntfile will compute the necessary configuration for each
command (as it differs for each environment).

Most commands are specific to an environment, so the syntax for most
migration-related commands is as follows:

    migrate:<environment>:<command>

This will perform the given command for the specified environment
(`development`, `test` or `production`) The available commands are:

* `migrate:<environment>:latest`: Migrate to the latest version
* `migrate:<environment>:rollback`: Rollback one version
* `migrate:<environment>:currentVersion`: Print the current migration version
* `migrate:make:<migrationname>`: Create the migration with the given name
  (independent of environment)

Seeds
-----
Seeds are used to fill your database with sensible data for its first start. As
`grunt-knex-migrate` doesn't support this feature yet, seeding is done via a
custom node-script (`app/seeds/seed.js`). Everything concerning seeds is managed
via grunt, similar to the way migrations work:

* `seed:<environment>:make:<seedname>`: Creates a seed with the given name for
  the given environment
* `seed:<environment>:run`: Runs all seeds for the given environment

Tests
-----
As the application is split into two parts (front-end and back-end), so are the
tests. Back-End tests, or API-tests are stored in the `test/api` directory and
basically perform HTTP-requests against the backend. Client-side tests are
stored in the `test/client` directory and they test only the client-side by
mocking the backend-side. Reports will be generated in `test/reports/`.

Testing-related grunt-tasks:
* `grunt test`: Runs all tests (api and client)
* `grunt test:api`: Runs api tests only
* `grunt test:api:coverage`: Runs api tests and outputs coverage information
  to `test/reports/api/coverage`
* `grunt test:client`: Runs client tests only. Coverage information is auto-on
  for client side tests, which can screw up line-numbers in case of errors. Use
  `grunt test:client:continuous` to disable coverage.
* `grunt test:client:continuous`: Run client tests and watch for changes. This
  will automatically re-run tests each time a relevant file changes.

TODO
----

* Reset whole DB for API-tests
* Ability to run single tests
* Watch: restart express (not only tests) when an app-file changes
