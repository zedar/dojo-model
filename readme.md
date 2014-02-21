# dojo-model

Baseclasses for model objects with methods that simplify interaction with data store.
Store could be any object implementing dojo/store/api/store interface.

## dojo-model.Model

### Example of Model class usage

Definition of new model object *ProjectModel*. It has default attributes *name* and *children* defined. 
When new object instance is created and no *name* and *children* attributes are provided, then they will get default values.
Every attribute could have it's own *Validator* and *Serializer*.  
Attribute's validator is called internally in *validate()* method.  
Attribute's serialized is called internally in *toJSON()* method.

    define(["dojo/_base/declare", "dojo-model/Model", "dojo-model/ModelError"], function(declare, Model, ModelError) {
      var _class = declare("ProjectModel", [Model], {
        defaults: {
          name: "Project",
          children: true
        },

        nameValidator: function() {
          var v = this.get("name");
          if (!v) {
            return new ModelError({code: "MISSING_NAME", descr: "The name is missing"});
          }
          return null;
        },

        childrenSerializer: function() {
          var ch = this.get("children");
          if (typeof ch === "boolean") {
            return [];
          }
          else {
            return ch;
          }
        }
      });

      return _class;
    });


### Model methods

Model objects have got methods that interact with store (either memory or rest store).

* fetch()

Fetch method loads model from the store. It assumes that model has *id* attribute. After the successfull store call
*parse()* method copies attributes to model object's attributes.  
This method returns dojo *Promise*, so data are loaded asynchronously from the store.

    project.fetch().then(
      function(project) {
        console.log("LOADED project: ", project);
      },
      function(error) {
        console.log("LOADING ERROR: ", error);
      }
    );

* save()

Save method either creates new object in store or changes attributes of existing object in store.  
New object is created via the call to *POST* http method.  
Existing object is updated via the call to *PUT* http method.

    project.save().then(
      function(project) {
        console.log("SAVED project: ", project);
      },
      function(error) {
        console.log("SAVING error: ", error);
      }
    );


* parse(data)

Parse attributes passed as data object to object's attributes. This method is called internally in *fetch()* method.

* toJSON()

Create new javascript object. Skip attributes defined in property *transient* (for example *store* attribute).  
If attribute have *Serializer* method defined it is called.

### New model object

Create new store object.

    var store = new dojo.store.JsonRest({
      target: "http://localhost:8081/api/project/"
    });

Create new model object. Put store as reference.

    var project = new ProjectModel({
      name: "MyProject",
      children: true,
      store: store
    });

Set model object id and fetch its data from the store.

    project.set("id", "1");
    project.fetch().then(function(project) {
      console.log("LOADED project: ", project);
    });

Change model object's attributes and save then to the store.

    project.set("name", "MyNewName");
    project.save().then(function(project) {
      console.log("SAVED project: ", project);
    });

## dojo-model.ModelCollection

Collection is a set of Models. It is possible to fetch whole collection form the data store (implementation of
dojo/store/api/store interface).

### Example of usage

You can either create your own collection class or use *ModelCollection* as it is.

  define(["dojo/_base/declare", "dojo-model.ModelCollection", "ProjectModel"], function(declare, ModelCollection, ProjectModel) {
    var _class = declare("ProjectModelCollection", [ModelCollection], {
      model: ProjectModel
    });

    return _class;
  });

### Methods

* fetch()

Fetch method loads collection (array) of models from the store. 
After the successfull store call for every loaded item new instance of assigned model (attribute of collection) is created.
This method returns dojo *Promise*, so data are loaded asynchronously from the store.

    projectModelCollection.fetch().then(
      function(project) {
        console.log("LOADED projects: ", this.models);
      },
      function(error) {
        console.log("LOADING ERROR: ", error);
      }
    );

## Installation and testing

Download the project from github

Install dependencies

    $ bower install

Init testing application

    $ cd app
    $ npm install
    $ cd ..

Run testing application

    $ cd app
    $ node app.js

Run casperjs tests

    $ cd tests
    $ casperjs test tests/ModelTest.js


