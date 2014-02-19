define([
  "dojo/_base/declare",
  "dojo/Stateful"
], function(declare, Stateful) {
  "use strict";
  // module:
  //    dojo-model.ModelError

  var _class = declare("dojo-model.ModelError", [Stateful], {
    // summary:
    //    Class representing errors returned by dojo-model.Model objects
    
    // code: string
    //    Error code name
    code: null,

    // descr: string
    //    Error description
    descr: null,

    constructor: function(attrs) {
      // summary:
      //    Initialize object with attributes. Set only attributes that are defined in this object.
      this._initialize(attrs);
    },


    addTo: function(errors) {
      // summary:
      //    Add this errors to the array of errors. If input array is not defined new array is created.
      if (!errors) {
        errors = [];
      }
      errors.push(this);
      return errors;
    },

    _initialize: function(attrs) {
      // summary:
      //    Set this object attributes based on the input attrs.
      // attrs: object?
      //    Object with input attributes
      for (var prop in attrs) {
        if (this.hasOwnProperty(prop)) {
          this.set(prop, attrs[prop]);
        }
      }
    }

  });

  return _class;
});
