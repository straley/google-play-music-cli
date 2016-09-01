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
    callback(JSON.parse(results));
  });
};

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/api/find/artist/:name', (request, response) => {
  action(['find','artist', request.params.name], function(results) {
    response.json(results);
  });
});

app.get('/api/find/track/:name', (request, response) => {
  action(['find','track', request.params.name], function(results) {
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

app.get('/api/play/:id', (request, response) => {
  action(['play',request.params.id], function(results) {
    response.json(results);
  });
});

app.get('/api/status', (request, response) => {
  action(['status'], function(results) {
    response.json(results);
  });
});

app.get('/api/search/artist/:id', (request, response) => {
  action(['search', 'artist', request.params.id], function(results) {
    response.json(results);
  });
});

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
});
