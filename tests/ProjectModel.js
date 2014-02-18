define([
  "dojo/_base/declare",
  "dojo-model/Model"
], function(declare, Model) {
  "use strict";

  var _class = declare("ProjectModel", [Model], {
    defaults: {
      one: "1",
      two: "2"
    },

    oneValidator: function() {
      var val = this.get("one");
      if (val !== "1") {
        return {
          errorCode: "ONE_1", 
          errorDescr: "one value should have one value"
        };
      }
      return null;
    }
  });

  return _class;
});
