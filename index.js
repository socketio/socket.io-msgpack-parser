var msgpack = require("notepack.io");
var Emitter = require("component-emitter");

exports.protocol = 5;

/**
 * Packet types (see https://github.com/socketio/socket.io-protocol)
 */

var PacketType = (exports.PacketType = {
  CONNECT: 0,
  DISCONNECT: 1,
  EVENT: 2,
  ACK: 3,
  CONNECT_ERROR: 4,
});

var isInteger =
  Number.isInteger ||
  function (value) {
    return (
      typeof value === "number" &&
      isFinite(value) &&
      Math.floor(value) === value
    );
  };

var isString = function (value) {
  return typeof value === "string";
};

var isObject = function (value) {
  return Object.prototype.toString.call(value) === "[object Object]";
};

function Encoder() {}

Encoder.prototype.encode = function (packet) {
  return [msgpack.encode(packet)];
};

function Decoder() {}

Emitter(Decoder.prototype);

Decoder.prototype.add = function (obj) {
  var decoded = msgpack.decode(obj);
  this.checkPacket(decoded);
  this.emit("decoded", decoded);
};

function isDataValid(decoded) {
  switch (decoded.type) {
    case PacketType.CONNECT:
      return decoded.data === undefined || isObject(decoded.data);
    case PacketType.DISCONNECT:
      return decoded.data === undefined;
    case PacketType.CONNECT_ERROR:
      return isString(decoded.data) || isObject(decoded.data);
    default:
      return Array.isArray(decoded.data);
  }
}

Decoder.prototype.checkPacket = function (decoded) {
  var isTypeValid =
    isInteger(decoded.type) &&
    decoded.type >= PacketType.CONNECT &&
    decoded.type <= PacketType.CONNECT_ERROR;
  if (!isTypeValid) {
    throw new Error("invalid packet type");
  }

  if (!isString(decoded.nsp)) {
    throw new Error("invalid namespace");
  }

  if (!isDataValid(decoded)) {
    throw new Error("invalid payload");
  }

  var isAckValid = decoded.id === undefined || isInteger(decoded.id);
  if (!isAckValid) {
    throw new Error("invalid packet id");
  }
};

Decoder.prototype.destroy = function () {};

exports.Encoder = Encoder;
exports.Decoder = Decoder;
