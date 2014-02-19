"use strict";
// CASPER.js testing framework
// Unit testing of: dojo-model/Model class
// run it:
//  $ casper test ./tests/ModelTest.js
// In the test mode casper variable is preconfigured and cannot be changed

// turn on logging (internal casper logs and external modules logs).
// all console.log() entries should be visible in standard output

casper.options.verbose = true;
casper.options.logLevel = "debug";
/*var casper = require("casper").create({
  verbose: true,
  logLevel: "debug"
});*/

var _ = require("underscore");

casper.on("remote.message", function(msg) {
  this.echo("remote message: " + msg);
});

// web server should be available
casper.start("http://localhost:8081/tests/ModelTest.html", function() {
  this.echo("STARTED");
});

casper.waitForSelector("#modelTest", function() {
  var p = this.evaluate(function() {
    var p = new ProjectModel({three: "3"});
    return p;
  });

  this.test.assert(_.isObject(p), "ProjectModel found and possible to create instance of it.");

  this.test.assert(p.one === "1", "Instance has default value of one property");

  this.test.assert(p.two === "2", "Instance has default value of two property");

  this.test.assert(p.three === "3", "Instance has value of three property");
}, function() {
  this.echo("TIMEOUT");
}, 10000);

casper.then(function() {
  var p = casper.evaluate(function() {
    var p = new ProjectModel({
      id: null,
      children: true,
      codeName: null
    });
    return p;
  });

  this.test.assert(!(_.isNull(p)), "ProjectModel cannot be null");
  this.test.assert(!(_.isNull(p["id"])), "ProjectModel property 'id' cannot be null");
  this.test.assert(_.has(p, "id"), "Test: does object has property id");
});


casper.then(function() {
  // Test validator
  var errors = casper.evaluate(function() {
    var p = new ProjectModel();
    p.set("one", "2");
    return p.validate();
  });

  console.log("ERRORS", JSON.stringify(errors));

  this.test.assert(_.isArray(errors), "Validator should return array of errors");
  
  var res = _.find(errors, function(err) {
    if (_.isObject(err) && _.has(err, "code")) {
      return true;
    }
    else {
      return false;
    }
  });

  this.test.assert(_.isObject(res), "Error should have object with property code");
});

// test fetch method - with dojo/store/Memory
casper.then(function() {
  var p = casper.evaluate(function() {
    var d = [{id: "1", one: "101", two: "102"}];
    var m = new dojo.store.Memory({data: d});
    var p = new ProjectModel({id: "1", store: m});
    
    var promise = p.fetch();
    // simulate synchronous call
    while(!promise.isFulfilled()) {}
    return p;
  });

  console.log("PROJECT: ", JSON.stringify(p));

  this.test.assert(_.isObject(p), "ProjectModel found and possible to create instance of it.");

  this.test.assert(p.id === "1", "ProjectModel id == 1");

  this.test.assert(p.one === "101", "ProjectModel one == 101");

  this.test.assert(p.two === "102", "ProjectModel two == 102");
});

// test save error - with dojo/store/JsonRest
casper.then(function() {
  var project = casper.evaluate(function() {
    var store = new dojo.store.JsonRest({
      target: "http://localhost:8081/api/project"
    });

    var p = new ProjectModel({one: "101", two: "201", store: store});

    var promise = p.save();

    promise.then(
      function(data) {
        window.callPhantom({action: "save_with_error", project: data});
      },
      function(error) {
        window.callPhantom({action: "save_with_error", error: error});
      }
    );
    return p;
  });

  this.test.assert(_.isObject(project), "ProjectModel save with error.");
});

// test save method - with dojo/store/JsonRest
casper.then(function() {
  var project = casper.evaluate(function() {
    var store = new dojo.store.JsonRest({
      target: "http://localhost:8081/api/project",
      idProperty: "id"
    });
    var p = new ProjectModel({one: "1", two: "201", store: store});
    var promise = p.save();
    promise.then(
      function(data) {
        window.callPhantom({action: "save", project: data});
      },
      function(error) {
        window.callPhantom({action: "save", error: error});
      }
    );
    return p;
  });

  this.test.assert(_.isObject(project), "ProjectModel save.");
});

// test save method of existing object - with dojo/store/JsonRest
casper.then(function() {
  var project = casper.evaluate(function() {
    var store = new dojo.store.JsonRest({
      target: "http://localhost:8081/api/project/"
    });

    var p = new ProjectModel({id: "1", one: "1", two: "301", store: store});

    var promise = p.save();
    promise.then(
      function(data) {
        window.callPhantom({action: "update", project: data});
      },
      function(error) {
        window.callPhantom({action: "update_with_error", error: error});
      }
    );
    return p;

  });

  this.test.assert(_.isObject(project), "ProjectModel save/update.");
});

// test fetch with error - with dojo/store/JsonRest
casper.then(function() {
  var project = casper.evaluate(function() {
    var store = new dojo.store.JsonRest({
      target: "http://localhost:8081/api/project/",
      idProperty: "id"
    });
    
    // Object without id
    var p = new ProjectModel({store: store});

    var promise = p.fetch();
    promise.then(
      function(data) {
        window.callPhantom({action: "fetch", project: data});
      },
      function(error) {
        window.callPhantom({action: "fetch_with_error", error: error});
      }
    );
    return p;
  });

  this.test.assert(_.isObject(project), "ProjectModel fetch with error.");
});

// test fetch method - with dojo/store/JsonRest
// It is async call, so we have to use casper.on("remote.callback") in order to catch async result
casper.then(function() {
  // evaluate code in the browser
  var project = casper.evaluate(function() {
    var store = new dojo.store.JsonRest({
      target: "http://localhost:8081/api/project/",
      idProperty: "id"
    });
    var p = new ProjectModel({id: "1", store: store});

    var promise = p.fetch();
    promise.then(
      function(data) {
        window.callPhantom({action: "fetch", project: data});
      },
      function(error) {
        window.callPhantom({action: "fetch_with_error", error: error});
      }
    );
    return p;
  });

  console.log("PROJECT (JsonRest): ", JSON.stringify(project));

  this.test.assert(_.isObject(project), "ProjectModel found and possible to create instance of it.");

  this.test.assert(project.id === "1", "ProjectModel id == 1");
});

// catch async result from the dojo/store/JsonRest call
casper.on("remote.callback", function(data) {
  console.log("PROJECT CALLBACK (JsonRest): ", JSON.stringify(data));
  if (data.action === "save") {
    var project = data.project;
    this.test.assert(_.isObject(project), "ProjectModel.save.");
    this.test.assert(_.isString(project.id), "ProjectModel id DEFINED");
    this.test.assert(project.two === "201", "ProjectModel one == 201");
  }
  else if (data.action === "save_with_error") {
    var error = data.error;

    this.test.assert(_.isObject(error), "ProjectModel save - got error");
    this.test.assert(_.isArray(error), "ProjectModel save - array of errors");
  }
  else if (data.action === "update") {
    var project = data.project;
    this.test.assert(_.isObject(project), "ProjectModel.update.");
    this.test.assert(_.isString(project.id), "ProjectModel.update id DEFINED");
    this.test.assert(project.two === "301", "ProjectModel.update two == 301");
  }
  else if (data.action === "update_with_error") {
    var error = data.error;

    this.test.assert(_.isObject(error), "ProjectModel update - got error");
    this.test.assert(_.isArray(error), "ProjectModel update - array of errors");
  }
  else if (data.action === "fetch") {
    var project = data.project;
    this.test.assert(_.isObject(project), "ProjectModel found and possible to create instance of it.");
    this.test.assert(project.id === "1", "ProjectModel id == 1");
    this.test.assert(project.two === "301", "ProjectModel one == 301");
  }
  else if (data.action === "fetch_with_error") {
    var error = data.error;

    this.test.assert(_.isObject(error), "ProjectModel fetch - got error");
    this.test.assert(_.isArray(error), "ProjectModel fetch - array of errors");
  }
});

casper.run(function() {
  this.echo("FINISHED");
  this.exit();
});
