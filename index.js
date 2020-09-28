
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

var isInteger = Number.isInteger || function (value) {
  return typeof value === 'number' &&
    isFinite(value) &&
    Math.floor(value) === value;
};

var isString = function (value) { return typeof value === 'string'; };

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
  var decoded = JSON.parse(obj);
  this.checkPacket(decoded);
  this.emit('decoded', decoded);
};

Decoder.prototype.parseBinary = function (obj) {
  var decoded = msgpack.decode(obj);
  this.checkPacket(decoded);
  this.emit('decoded', decoded);
};

function isDataValid (decoded) {
  switch (decoded.type) {
    case exports.CONNECT:
    case exports.DISCONNECT:
      return decoded.data === undefined;
    case exports.ERROR:
      return isString(decoded.data);
    default:
      return Array.isArray(decoded.data);
  }
}

Decoder.prototype.checkPacket = function (decoded) {
  var isTypeValid = isInteger(decoded.type) && decoded.type >= exports.CONNECT && decoded.type <= exports.BINARY_ACK;
  if (!isTypeValid) {
    throw new Error('invalid packet type');
  }

  if (!isString(decoded.nsp)) {
    throw new Error('invalid namespace');
  }

  if (!isDataValid(decoded)) {
    throw new Error('invalid payload');
  }

  var isAckValid = decoded.id === undefined || isInteger(decoded.id);
  if (!isAckValid) {
    throw new Error('invalid packet id');
  }
};

Decoder.prototype.destroy = function () {};

exports.Encoder = Encoder;
exports.Decoder = Decoder;
