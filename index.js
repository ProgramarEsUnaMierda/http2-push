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
  });

  //Creamos una especie de librería js para pasarla
  var textolibreria = '';

  for (i = 0; i < 1000; i++) {
    textolibreria += 'console.log ("Ejecuto la linia ' + i + '");\n'
  }


  //Definimos la llamada del htmlque cargará las librerias con push
  app.get('/conpush', (req, res) => {

    for (filenum = 0; filenum < 15; filenum++) {

      var stream = res.push('/libreriapesada-'+ filenum +'.js', {
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

      stream.end(textolibreria);
    }

    var finalhtml = '';
    for (filenum = 0; filenum < 15; filenum++) {
      finalhtml += '<script src="/libreriapesada-' + filenum + '.js"></script><h1>PUSHED</h1>\n';
    }
    res.end(finalhtml);

  }
);


//Definimos la llamada para las librerias que se pediran sin push
app.get('/libreriaigualdepesada-*.js', (req, res) => {
  res.end (textolibreria);
});


//Definimos la llamda del html que cargara las librerias sin push
app.get('/sinpush', (req, res) => {
  var finalhtml = '';
  for (filenum = 0; filenum < 15; filenum++) {
    finalhtml += '<script src="/libreriaigualdepesada-' + filenum + '.js"></script><h1> NOT PUSHED</h1>\n';
  }
  res.end(finalhtml);
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
    console.log('Escuchando por el puerto: ' + port + '.')
  }

});
