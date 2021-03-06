// simple express example

// Expose modules in ./support for demo purposes
require.paths.unshift(__dirname + '/../../support');

/*** Module dependencies. ***/
var express = require('express')
  ,  drawback = require('../../lib/drawback')
  ,  http = require('http');

// Path to our public directory
var pub = __dirname + '/public';

var app = express.createServer(
  express.compiler({
    src: pub,
    enable: ['sass']
    }),
  express.staticProvider(pub)
  );

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');


app.get('/', function(req, res){
  res.render('partials/flot', {});
});

// response ajax request
app.get('/getChartData', function(req, res){
  var points = [
    [ 1264993200000, 52 ],
    [ 1280804400000, 90 ],
    [ 1285470000000, 57 ],
    [ 1286679600000, 18 ],
    [ 1288062000000, 7 ],
    [ 1291431600000, 39 ],
    [ 1292455600000, 80 ],
    [ 1294455600000, 58 ]
  ]
  ,  period = {
    start:1264993200000,
    end:1294455600000
  }
  ,  data = {
      points: points,
      period: period
    }

    res.send({data: data});
})

// rendering server side
app.get('/draw/:module_name', function(req, res){
  // retrieve url parameters
  var modname = req.param('module_name')
    ,  url = req.query.url
    ,  forceDownload = req.query.forceDownload == 'true' ? true : false
    ,  dims = {
         width: Number(req.query.width),
         height: Number(req.query.height)
       }

    // create client to request
    var client = http.createClient(3000, 'localhost')
      ,  request = client.request('GET', url, {'host': 'localhost'});
    request.end();

    // get data
    request.on('response', function (response) {
      response.setEncoding('utf8');
      var rawData = '';
      response.on('data', function (chunk) {
        rawData+=chunk;
      });
      response.on('end', function () {
        var data = JSON.parse(rawData)

        // require the module to draw
        ,  moduleDraw = require(pub + '/js/draw/' + modname);

        // draw
        drawback.draw(moduleDraw, {dims: dims, data: data.data}, function(err, buf){
          if(err) res.send(404);

          var header = {};

          if(forceDownload) res.attachment(modname+'.png');
          else header = {'Content-Type': 'image/png'}

          header['Content-Length'] = buf.length;
          res.send(buf, header);
        });
      });
    });

});

app.listen(3000);
console.log('Express app started on port 3000');
