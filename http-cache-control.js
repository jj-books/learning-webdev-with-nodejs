const http = require('http');
const url = require('url');
const fs = require('fs');
const mime = require('mime');

function getMimeType(res) {
  const EXT_MIME_TYPES = mime.types;

  const path = require('path');
  const mime_type = EXT_MIME_TYPES[path.extname(res).slice(1) || 'html'];
  return mime_type;
}

const server = http.createServer((req, res) => {
  const srvUrl = url.parse(`http://${req.url}`);
  let path = srvUrl.path;
  if(path === '/') path = '/index.html';

  const resPath = `resource${path}`.replace(/\?.*/g, '');

  if(!fs.existsSync(resPath)) {
    res.writeHead(404, {'Content-Type': 'text/html'});
    return res.end('<h1>404 Not Found</h1>');
  }

  const resStream = fs.createReadStream(resPath);
  console.log(mime.types);
  res.writeHead(200, {
    'Content-Type': getMimeType(resPath),
    'Cache-Control': 'max-age=86400',
  });

  resStream.pipe(res);
});

server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(10080, () => {
  console.log('opened server on', server.address());
});
