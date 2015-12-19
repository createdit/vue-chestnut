var express = require('express');
var superagent = require('superagent');
var path = require('path');
var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});
app.get('/api/weather/:city', function(req, res, next) {
  superagent.get('http://api.lib360.net/open/weather.json')
    .query({
      city: req.params.city
    })
    .end(function(err, sres) {
      if (err) {
        return next(err);
      }
      var data = JSON.parse(sres.text);
      var result = {
        weather: data.data[0].Weather,
        tempMin: data.data[0].TempMin,
        tempMax: data.data[0].TempMax,
        wind: data.data[0].Wind,
        pm25: data.pm25
      };
      res.send(result);
    });
});

module.exports = app;
