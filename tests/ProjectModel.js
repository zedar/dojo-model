define([
  "dojo/_base/declare",
  "dojo-model/Model",
  "dojo-model/ModelError"
], function(declare, Model, ModelError) {
  "use strict";

  var _class = declare("ProjectModel", [Model], {
    defaults: {
      one: "1",
      two: "2"
    },

    oneValidator: function() {
      var val = this.get("one");
      if (val !== "1") {
        return new ModelError({code: "ONE_1", descr: "one value should have one value"});
      }
      return null;
    }
  });

  return _class;
});
