
# socket.io-msgpack-parser

An alternative to the default [socket.io-parser](https://github.com/socketio/socket.io-parser), encoding and decoding packets with [msgpack](http://msgpack.org/).

With that parser, the browser build will be a bit heavier (an additional 7.5 KB minified, 3.0 KB gzipped), but each message will be smaller (sent as binary).

Please note that you MUST use the parser on both sides (server & client).

See also:

- the default parser: https://github.com/socketio/socket.io-parser
- a parser based on JSON.stringify/parse: https://github.com/darrachequesne/socket.io-json-parser

Compatibility table:

| Parser version | Socket.IO server version |
|----------------| ------------------------ |
| 2.x            | 1.x / 2.x                |
| 3.x            | 3.x / 4.x                |

## Usage

```js
const io = require('socket.io');
const ioc = require('socket.io-client');
const customParser = require('socket.io-msgpack-parser');

const server = io(PORT, {
  parser: customParser
});

const socket = ioc('ws://localhost:' + PORT, {
  parser: customParser
});

socket.on('connect', () => {
  socket.emit('hello');
});
```

## Format

`socket.emit('hello', 'you')` will create the following packet:

```json
{
  "type": 2,
  "nsp": "/",
  "data": ["hello", "you"]
}
```

which will be encoded by the parser as:

`<Buffer 83 a4 74 79 70 65 02 a3 6e 73 70 a1 2f a4 64 61 74 61 92 a5 68 65 6c 6c 6f a3 79 6f 75>`

More information about the exchange protocol can be found [here](https://github.com/socketio/socket.io-protocol).
