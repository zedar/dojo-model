"use strict";

casper.options.verbose = true;
casper.options.logLevel = "debug";

var _ = require("underscore");

casper.on("remote.message", function(msg) {
  this.echo("REMOTE MESSAGE: " + msg);
});

// web server should be available
casper.start("http://localhost:8081/tests/ModelTest.html", function() {
  this.echo("STARTED");
});

casper.waitForSelector("#modelTest", function() {
  var collection = this.evaluate(function() {
    var data = [
      {id: "1", one: "101", two: "201"},
      {id: "2", one: "102", two: "202"}
    ];
    var mstore = new dojo.store.Memory({data: data});
    console.log("BEFORE new ModelCollection");
    var pcollection = new ProjectModelCollection({model: ProjectModel, store: mstore});
    console.log("AFTER new ModelCollection");
    var promise = pcollection.fetch();
    while(!promise.isFulfilled()) {};
    console.log("AFTER FETCH MODELS: ", JSON.stringify(pcollection.models));
    return pcollection;
  });

  console.log("PROJECT MODEL COLLECTION:", JSON.stringify(collection["models"]));

  this.test.assert(_.isObject(collection), "Model Collection is object");
  this.test.assert(_.isArray(collection.models), "Model collection models is array");
  var models = collection.models;
  this.test.assert(models.length === 2, "Model collection models size is 2");
}, function() {
    this.echo("TIMEOUT");
}, 10000);

casper.run(function() {
  this.echo("FINISHED");
  this.exit();
});

