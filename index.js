
var msgpack = require('notepack.io');
var Emitter = require('component-emitter');

/**
 * Packet types (see https://github.com/socketio/socket.io-protocol)
 */

exports.CONNECT = 0;
exports.DISCONNECT = 1;
exports.EVENT = 2;
exports.ACK = 3;
exports.ERROR = 4;
exports.BINARY_EVENT = 5;
exports.BINARY_ACK = 6;

var errorPacket = {
  type: exports.ERROR,
  data: 'parser error'
};

function Encoder () {}

Encoder.prototype.encode = function (packet, callback) {
  switch (packet.type) {
    case exports.CONNECT:
    case exports.DISCONNECT:
    case exports.ERROR:
      return callback([ JSON.stringify(packet) ]);
    default:
      return callback([ msgpack.encode(packet) ]);
  }
};

function Decoder () {}

Emitter(Decoder.prototype);

Decoder.prototype.add = function (obj) {
  if (typeof obj === 'string') {
    this.parseJSON(obj);
  } else {
    this.parseBinary(obj);
  }
};

Decoder.prototype.parseJSON = function (obj) {
  try {
    var decoded = JSON.parse(obj);
    this.emit('decoded', decoded);
  } catch (e) {
    this.emit('decoded', errorPacket);
  }
};

Decoder.prototype.parseBinary = function (obj) {
  try {
    var decoded = msgpack.decode(obj);
    this.emit('decoded', decoded);
  } catch (e) {
    this.emit('decoded', errorPacket);
  }
};

Decoder.prototype.destroy = function () {};

exports.Encoder = Encoder;
exports.Decoder = Decoder;
