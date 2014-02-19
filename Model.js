define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/Stateful",
  "dojo/Deferred",
  "dojo/promise/Promise",
  "dojo/when",
  "dojo-underscore/underscore",
  "dojo-model/ModelError"
], function(declare, lang, Stateful, Deferred, Promise, when, u, ModelError) {
  "use strict";
  // module:
  //  dojo-model/Model

  var _class = declare("dojo-model.Model", [Stateful], {
    // summary:
    //    Base class for the model classes. 
    //    Includes support for default property values.
    defaults: {},

    // store: object
    //    Reference to object implementing interface dojo/store/api/Store
    //    For example: dojo/store/JsonRest or dojo/store/Memory
    store: null,

    // transient: []
    //    Array of transient properties. Properties of these names are not stored in store
    transient: ["store"],

    constructor: function(attrs) {
      // attrs: Object?
      //    Provides attributes to be mixed in the object. The attributes defined as defaults but not provided in attrs
      //    are added to the class
      this._initialize(attrs);
    },

    validate: function() {
      // summary:
      //    For every property find Validator function and call it. Collect errors.
      //    If validator do not catch error then should return null.
      //    Do not validate transient properties.
      // returns:
      //    Object[] - array of errors as returned from Validator function
      var errors = [];
      for (var prop in this) {
        if (this.hasOwnProperty(prop) && !u.contains(this.transient, prop)) {
          var validator = this[prop + "Validator"];
          if (typeof validator === "function") {
            var err = validator.apply(this, []);
            if (err) {
              err.addTo(errors);
            }
          }
        }
      }
      return errors.length > 0 ? errors : null;
    },

    fetch: function(options) {
      // summary:
      //    Fetch object's state from the store. Reset all attributes, except id.
      //    Id attribute has to be set in constructor or throughout the set("id", value) method.
      // options - optional http headers compatible with dojo/store/api/Store.
      var deferred = new Deferred();
      var id = this.get("id");

      if (!id) {
        return deferred.reject([new ModelError({code: "NO_ID", descr: "Object's id is missing"})]);
      }
      if (!this.store) {
        return deferred.reject([new ModelError({code: "NO_STORE"})]);
      }
      when(this.store.get.call(this.store, id, options)).then(
        lang.hitch(this, function(data) {
          this.parse(data);
          deferred.resolve(this);
        }),
        lang.hitch(this, function(error) {
          deferred.reject(this._handleServerError(error));
        })
      );
      return deferred.promise;
    },

    save: function(options) {
      // summary:
      //    Save model to the store.
      //    Before save, call validate() method. If error no save take place.
      //    If this.id is not defined call dojo/store add (HTTP POST) method, else call put (HTTP PUT) method.
      var deferred = new Deferred();
      var errors = this.validate();
      if (errors) {
        return deferred.reject(errors);
      }
      
      var data = this.toJSON();
      
      when(this.store.put.call(this.store, data, options)).then(
        lang.hitch(this, function(model) {
          this.set("id", model.id);
          deferred.resolve(this);
        }),
        lang.hitch(this, function(error) {
          deferred.reject(this._handleServerError(error));
        })
      );
      return deferred.promise;
    },

    parse: function(data) {
      // summary:
      //    Deserialize data to the current properties
      this._initialize(data);
    },

    toJSON: function() {
      // summary:
      //    Return copy of model's attributes for JSON.stringify.
      //    This method does not return JSON string.
      var data = {};
      for (var prop in this) {
        if (this.hasOwnProperty(prop) && !u.contains(this.transient, prop)) {
          var serializer = this[prop + "Serializer"];
          if (typeof serializer === "function") {
            data[prop] = serializer.apply(this, []);
          }
          else {
            data[prop] = this.get(prop);
          }
        }
      }
      return data;
    },

    _initialize: function(attrs) {
      // summary:
      //    Add all properties of attrs object to this object. Add not provided attributes from defaults
      // attrs: Object?
      //    Object with attributes
      var props = u.defaults({}, attrs, u.result(this, "defaults"));
      for (var prop in props) {
        if (props.hasOwnProperty(prop)) {
          this.set(prop, props[prop]);
        }
      }
    },

    _handleServerError: function(error) {
      if (!error.response) {
        return new ModelError({code: "UNKNOWN_ERROR"});
      }
      else if (error.response.status === 400) {
        return new ModelError({code: "UNKNOWN_ERROR"});
      }
      else if (error.response.status === 403) {
        return new ModelError({code: "FORBIDDED"});
      }
      else if (error.response.status === 404) {
        return new ModelError({code: "NOT_FOUND"});
      }
      else if (error.response.status === 422) {
        return new ModelError({code: "INVALID_INPUT"});
      }
      else {
        return new ModelError({code: "UNKNOWN_ERROR"});
      }
    }
  });

  return _class;
});
