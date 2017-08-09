
# socket.io-msgpack-parser

An alternative to the default [socket.io-parser](https://github.com/socketio/socket.io-parser), encoding and decoding packets with [msgpack](http://msgpack.org/).

With that parser, the browser build will be a bit heavier (an additional 7.5 KB minified, 3.0 KB gzipped), but each message will be smaller (sent as binary).

## Usage

```js
const io = require('socket.io');
const ioc = require('socket.io-client');
const customParser = require('socket.io-msgpack-parser');

let server = io(PORT, {
  parser: customParser
});

let client = ioc('ws://localhost:' + PORT, {
  parser: customParser
});

client.on('connect', () => {
  client.emit('hello');
});
```
