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
  //    dojo-model/ModelCollection

  var _class = declare("dojo-model.ModelCollection", [Stateful], {
    // summary:
    //    Collection of dojo-model.Model objects
    
    // model: object
    //    Model class that the collection contains.
    model: null,

    // store: object
    //    Reference to object implementing interface dojo/store/api/Store
    store: null,

    // models: array
    //    Array of loaded models
    models: null,

    constructor: function(attrs) {
      // attrs: object
      //    Provides attributes to be mixed in this object.
      this._initialize(attrs);
      if (!u.isArray(this.models)) {
        this.models = [];
      }
    },

    fetch: function(options) {
      // summary:
      //    Fetch model objects from the store and add them to this.models attribute
      // return:
      //    array of models
      var deferred = new Deferred();
      if (!this.store) {
        return deferred.reject([new ModelError({code: "NO_STORE", descr: "Data store is not defined"})]);
      }
      when(this.store.query.call(this.store, null, options)).then(
        lang.hitch(this, function(data) {
          if (typeof data.items === "object") {
            this.parse(data.items);
          }
          else {
            this.parse(items);
          }
          deferred.resolve(this);
        }),
        lang.hitch(this, function(error) {
          deferred.reject([this._handleServerError(error)]);
        })
      );
      return deferred.promise;
    },

    parse: function(items) {
      // summary:
      //    Deserialize array of results to this.models
      this.models.length = 0;
      u.each(items, function(item, index) {
        var m = new this.model(item);
        this.models[this.models.length] = m;
      }, this);

      if (typeof this.onParse === "function") {
        this.onParse();
      }
    },

    onParse: function() {
      // summary:
      //    Override this method in order to add custom functionality at the end of parse items loaded from the store
    },

    _initialize: function(attrs) {
      // summary:
      //    Add all properties that much this object properties.
      // attrs: object
      //    Object with attributes
      for (var prop in attrs) {
        if (this.hasOwnProperty(prop)) {
          this.set(prop, attrs[prop]);
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
      else if (error.response.status === 401) {
        return new ModelError({code: "NOT_AUTHORIZED"});
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
