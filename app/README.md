# Testing application

There is node.js application used for testing dojo-model.

## Dependecies
All dependencies are in app/package.json but the main are: connect and restify.
Restify is library that simplifies creation of REST APIs.

  $ npm install connect --save
  $ npm install restify --save

save is library that simplifies saving and restoring data to in memory store

  $ npm install save --save

## Run testing application

  $ npm install
  $ node app.js
  $ cd ..
  $ casperjs test tests/ModelTest.js
