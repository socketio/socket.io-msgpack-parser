/* eslint-env mocha */

const customParser = require('../index.js');
const expect = require('expect.js');
const io = require('socket.io');
const ioc = require('socket.io-client');

describe('parser', function () {
  it('allows connection', function (done) {
    let PORT = 54000;
    let server = io(PORT, {
      parser: customParser
    });

    server.on('connect', (socket) => {
      socket.on('hello', done);
    });

    let client = ioc('ws://localhost:' + PORT, {
      parser: customParser
    });

    client.on('connect', () => {
      client.emit('hello');
    });
  });

  it('supports binary', function (done) {
    let PORT = 54001;
    let server = io(PORT, {
      parser: customParser
    });

    server.on('connect', (socket) => {
      socket.on('binary', (arg1, arg2, arg3) => {
        expect(arg1).to.eql([]);
        expect(arg2).to.eql({ a: 'b' });
        expect(Buffer.isBuffer(arg3)).to.be(true);
        done();
      });
    });

    let client = ioc('ws://localhost:' + PORT, {
      parser: customParser
    });

    client.on('connect', () => {
      let buf = new Buffer('asdfasdf', 'utf8');
      client.emit('binary', [], { a: 'b' }, buf);
    });
  });

  it('supports acknowledgements', function (done) {
    let PORT = 54002;
    let server = io(PORT, {
      parser: customParser
    });

    server.on('connect', (socket) => {
      socket.on('ack', (arg1, callback) => {
        callback(42);
      });
    });

    let client = ioc('ws://localhost:' + PORT, {
      parser: customParser
    });

    client.on('connect', () => {
      client.emit('ack', 'question', (answer) => {
        expect(answer).to.eql(42);
        done();
      });
    });
  });

  it('supports non-default namespace', function (done) {
    let PORT = 54003;
    let server = io(PORT, {
      parser: customParser
    });

    server.of('/chat').on('connect', (socket) => {
      socket.on('hi', done);
    });

    let client = ioc('ws://localhost:' + PORT + '/chat', {
      parser: customParser
    });

    client.on('connect', () => {
      client.emit('hi');
    });
  });

  it('supports broadcasting', function (done) {
    let PORT = 54004;
    let server = io(PORT, {
      parser: customParser
    });

    server.on('connect', (socket) => {
      server.emit('hey', 'you');
    });

    let client = ioc('ws://localhost:' + PORT, {
      parser: customParser
    });

    client.on('hey', (arg1) => {
      expect(arg1).to.eql('you');
      done();
    });
  });
});
