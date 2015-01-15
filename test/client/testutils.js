"use strict";

/* jshint freeze: false */
/* jshint newcap: false */

//polyfill for func.bind() (missing in phantomJS)
if(!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

window.testutils = {
    MockFactory: function() {

        var dialogs = {
        };

        this.mockedDialogs = {

            confirm: chai.spy( function() {

                return {
                    then: function( succ, err ) {
                        dialogs.confirm = {
                            succ: succ || function(){},
                            err: err || function(){}
                        };
                    }
                };
            } ),

            confirmOk: function() {
                dialogs.confirm.succ();
            },

            confirmCancel: function() {
                dialogs.confirm.err();
            }
        };
    },
};
