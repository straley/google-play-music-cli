const express = require('express')
const app = express()
const port = 8080

const action = (params, callback) => {
  const spawn = require('child_process').spawn;
  const action = spawn(__dirname + '/action', params);
  let results = "";
  action.stdout.on('data', (data) => {
    results += data;
  });
  action.on('close', (code) => {
    let json = "[]";
    try {
      json = JSON.parse(results);
    }
    catch (e) {
      console.log(":::::action:", params);
      console.log(">", results);
    }
    callback(json);
  });
};

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/index.js', function(req, res){
  res.sendFile(__dirname + '/index.js');
});

app.get('/api/search/:category/:name', (request, response) => {
  action(['search', request.params.category, request.params.name], function(results) {
    console.log(results);
    response.json(results);
  });
});

app.get('/api/play', (request, response) => {
  action(['play'], function(results) {
    response.json(results);
  });
});

app.get('/api/pause', (request, response) => {
  action(['pause'], function(results) {
    response.json(results);
  });
});

app.get('/api/forward', (request, response) => {
  action(['forward'], function(results) {
    response.json(results);
  });
});

app.get('/api/rewind', (request, response) => {
  action(['rewind'], function(results) {
    response.json(results);
  });
});

app.get('/api/play/:album/:track', (request, response) => {
  action(['play',request.params.album,request.params.track], function(results) {
    response.json(results);
  });
});

app.get('/api/status', (request, response) => {
  action(['status'], function(results) {
    response.json(results);
  });
});

app.get('/api/artist/:category/:id', (request, response) => {
  action(['artist', request.params.category, request.params.id], function(results) {
    response.json(results);
  });
});

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
});
