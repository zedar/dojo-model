var http = require("http"),
    connect = require("connect"),
    restify = require("restify"),
    projectSave = require("save")("project");

var server = restify.createServer();

// attach restify to api endpoint
var app = connect()
            .use(connect.logger("dev"))
            .use(connect.static(__dirname + "/.."))
            .use("/api", function(req, res) {
              server.server.emit("request", req, res);
            });


// restify: plugin for setting connection header to close
server.pre(restify.pre.userAgentConnection());

// restify: set default headers
server.use(restify.fullResponse());
// restify: remap body to req.params.
server.use(restify.bodyParser());

server.get("/project/:id", function(req, res, next) {
  projectSave.findOne({_id: req.params.id}, function(error, project) {
    if (error) {
      return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));
    }
    if (project) {
      res.send(project);
    }
    else {
      res.send(404);
    }
  });
});

server.post("/project", function(req, res, next) {
  if (!req.params.one) {
    return next(new restify.InvalidArgumentError("Project name missing."))
  }

  projectSave.create(req.params, function(error, project) {
    if (error) {
      return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));
    }
    project.id = project._id;
    res.send(201, project);
  })
});

server.put("/project/:id", function(req, res, next) {
  if (!req.params.one) {
    return next(new restify.InvalidArgumentError("Project name missing."))
  }
  req.params._id = req.params.id;
  projectSave.update(req.params, function(error, project) {
    if (error) {
      return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));
    }
    project.id = project._id;
    res.send(201, project);
  });
});


http.createServer(app).listen(8081, function() {
  console.log("SERVER RUNNING: http://localhost:8081");
});

