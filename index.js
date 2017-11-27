const port = 3000;
const spdy = require('spdy');
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

app.get('/', function (req, res) {
  res.send(`<h1>DEMO DE LLAMADAS HTTP/2 PUSH VS NO PUSH</h1>
<p> Carga una librería js con <a href="/conpush">llamadas PUSH</a> </p>
<p> Carga una librería js sin <a href="/sinpush">llamadas PUSH</a>`);
})

app.get('/conpush', (req, res) => {
  var stream = res.push('/libreriapesada.js', {
    status: 200, // optional
    method: 'GET', // optional
    request: {
      accept: '*/*'
    },
    response: {
      'content-type': 'application/javascript'
    }
  });

  stream.on('error', function() {
  });

  var textolibreria = '';

  for (i = 0; i < 1000; i++) {         
    textolibreria += 'console.log ("Ejecuto la linia ' + i + '");\n'
   }
     stream.end(textolibreria);
  
  res.end('<script src="/libreriapesada.js"></script><h1>PUSHED</h1>')
});


app.get('/libreriaigualdepesada.js', (req, res) => {
	var textolibreria = '';

	for (i = 0; i < 1000; i++) { 
 	   textolibreria += 'console.log ("Ejecuto la linia ' + i + '");\n' ;
	}
	res.end (textolibreria);
});

app.get('/sinpush', (req, res) => {
  res.end('<script src="/libreriaigualdepesada.js"></script><h1>NOT PUSHED</h1>')
});





const options = {
    key: fs.readFileSync(__dirname + '/server.key'),
    cert:  fs.readFileSync(__dirname + '/server.crt')
};

spdy
  .createServer(options, app)
  .listen(port, (error) => {

    if (error) {
      console.error(error)
      return process.exit(1)
    } else {
      console.log('Listening on port: ' + port + '.')
    }

  });
