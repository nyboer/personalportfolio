
var express = require('express'),
  app = express(),
  server = require('http').createServer(app),


var port = process.env.PORT || 7114,

server.listen(port, function () {
  console.log('Pages served on port %d', port);
});

function match_list(a, b) {
    var i = a.length;
    if (i !== b.length) {return false;}
    while (i--) {
      if (a[i] !== b[i]) {return false;}
    }
    return true;
  }
  
// Routing
app.use(express.static(__dirname + '/public'));
