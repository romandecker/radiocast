"use strict";

var app = angular.module( "yourapp" );

app.factory( "$Model", function( $http,
                                 AuthenticationService,
                                 DateService,
                                 dialogs ) {

    var BaseModel = function() {
        this.$setNew();
    };

    BaseModel.prototype.$setNew = function( isNew ) {

        if( arguments.length === 0 ) {
            isNew = true;
        }
        
        Object.defineProperty( this, "$isNew", {
            value: isNew,
            enumerable: false,
            writable: true
        } );
    };
        
    BaseModel.prototype.$save = function() {

        var url = this.$url;
        var method;
        if( !this.$isNew ) {
            url += "/" + this.id;
            method = "PUT";
        } else {
            method = "POST";
        }

        var self = this;

        var data = angular.copy( self );
    
        angular.forEach( this.$dates, function(name) {
            if( name in data && typeof data[name] === "object" ) {
                data[name] = DateService.formatDate( data[name] );
            }
        } );

        return BaseModel.$http( {
            method: method,
            url: url,
            data: data
        } ).then( function( data ) {

            if( self.$isNew ) {
                self.$setNew( false );
            }

            angular.forEach( self.$dates, function(name) {
                if( name in data ) {
                    data[name] = DateService.parseDate( data[name] );
                }
            } );

            angular.copy( data, self );
            
            return self;
        } );
    }; 

    BaseModel.prototype.$delete = function() {

        var self = this;
        return BaseModel.$http( {
            method: "DELETE",
            url: this.$url + "/" + this.id
        } ).then( function(response) {
            self.$setNew();
        } );
    };

    BaseModel.$makeObjectFromResponse = function( data ) {
        var m = new this();
        angular.copy( data, m );
        m.$setNew( false );

        angular.forEach( this.prototype.$dates, function(name) {
            if( name in m ) {
                m[name] = DateService.parseDate( m[name] );
            }
        } );

        return m;
    };

    BaseModel.$buildQueryString = function( params ) {

        var ret = this.prototype.$url;

        params = params || {};
        var names = Object.keys(params);
        if( names.length === 0 ) {
            return ret;
        }

        names.forEach( function( name, index ) {
            if( index === 0 ) {
                ret += "?";
            } else {
                ret += "&";
            }

            ret += encodeURIComponent( name );
            ret += "=";
            
            var value = params[name];
            if( typeof value === "undefined" ) {
                value = "";
            }
            ret += encodeURIComponent( value );
        } );
        
        return ret;
    };

    BaseModel.$get = function( id ) {

        return BaseModel.$http( {
            method: "GET",
            url: this.prototype.$url + "/" + id
        } ).then( BaseModel.$makeObjectFromResponse.bind(this) );
    };

    BaseModel.$http = function( req ) {

        var originalArgs = Array.prototype.slice.call( arguments );

        //proxy directly to angular's $http
        return $http.apply( null, originalArgs ).then( function( response ) {
            return response.data;
        } ).catch( function(response) {
            if( response.status === 401 ) {             // Unauthorized

                if( req.noRetryOnUnauthorized ) {
                    throw response;
                } else {
                    return dialogs.login().then( function() {
                        return BaseModel.$http.apply( null, originalArgs );
                    } ).catch( function() {
                        throw response;
                    } );
                } 
            }
        } );
    };

    BaseModel.$query = function( params ) {

        var self = this;

        return BaseModel.$http( {
            method: "GET",
            url: self.$buildQueryString( params )
        } ).then( function( data ) {

            if( data.constructor === Array ) {
                var ret = data.map( BaseModel.$makeObjectFromResponse.bind(self) );
                ret.$paginated = false;

                return ret;
            } else {
                //expect a paginated collection of the form
                //{
                //  totalCount: Number,
                //  page: Number,
                //  items: Array
                //}

                data.items = data.items.map(
                    BaseModel.$makeObjectFromResponse.bind(self)
                );
                data.$paginated = true;

                return data;
            }
        } );
    };

    BaseModel.extend = function( options, instanceMethods, classMethods ) {

        var Model = function( attributes ) {
            angular.extend( this, attributes );

            if( this.initialize ) {
                this.initialize();
            }
        };

        angular.extend( Model, BaseModel );

        Model.prototype = new BaseModel();
        Model.prototype.toString = function() {
            return options.name || "Model (" + options.url + ")";
        };

        Object.defineProperty( Model.prototype, "$url", {
            writable: false,
            configurable: false,
            enumerable: true,
            value: options.url
        } );

        Object.defineProperty( Model.prototype, "$dates", {
            writable: false,
            configurable: false,
            enumerable: false,
            value: options.dates
        } );

        angular.extend( Model.prototype, instanceMethods );
        angular.extend( Model, classMethods );

        return Model;
    };

    return BaseModel;
} );
