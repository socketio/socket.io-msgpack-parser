
const msgpack = require('notepack.io');
const Emitter = require('component-emitter');

/**
 * Packet types (see https://github.com/socketio/socket.io-protocol)
 */

const TYPES = {
  CONNECT: 0,
  DISCONNECT: 1,
  EVENT: 2,
  ACK: 3,
  ERROR: 4,
  BINARY_EVENT: 5,
  BINARY_ACK: 6
};

const errorPacket = {
  type: TYPES.ERROR,
  data: 'parser error'
};

class Encoder {
  encode (packet, callback) {
    switch (packet.type) {
      case TYPES.CONNECT:
      case TYPES.DISCONNECT:
      case TYPES.ERROR:
        return callback([ JSON.stringify(packet) ]);
      default:
        return callback([ msgpack.encode(packet) ]);
    }
  }
}

class Decoder extends Emitter {
  add (obj) {
    if (typeof obj === 'string') {
      this.parseJSON(obj);
    } else {
      this.parseBinary(obj);
    }
  }
  parseJSON (obj) {
    try {
      let decoded = JSON.parse(obj);
      this.emit('decoded', decoded);
    } catch (e) {
      this.emit('decoded', errorPacket);
    }
  }
  parseBinary (obj) {
    try {
      let decoded = msgpack.decode(obj);
      this.emit('decoded', decoded);
    } catch (e) {
      this.emit('decoded', errorPacket);
    }
  }
  destroy () {}
}

module.exports = { Encoder, Decoder };
