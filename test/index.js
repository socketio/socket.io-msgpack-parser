/* eslint-env mocha */

const customParser = require('..');
const expect = require('expect.js');
const io = require('socket.io');
const ioc = require('socket.io-client');

describe('parser', () => {
  it('allows connection', done => {
    const PORT = 54000;
    const server = io(PORT, {
      parser: customParser
    });

    server.on('connect', (socket) => {
      socket.on('hello', done);
    });

    const client = ioc('ws://localhost:' + PORT, {
      parser: customParser
    });

    client.on('connect', () => {
      client.emit('hello');
    });
  });

  it('supports binary', done => {
    const PORT = 54001;
    const server = io(PORT, {
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

    const client = ioc('ws://localhost:' + PORT, {
      parser: customParser
    });

    client.on('connect', () => {
      const buf = Buffer.from('asdfasdf', 'utf8');
      client.emit('binary', [], { a: 'b' }, buf);
    });
  });

  it('supports acknowledgements', done => {
    const PORT = 54002;
    const server = io(PORT, {
      parser: customParser
    });

    server.on('connect', (socket) => {
      socket.on('ack', (arg1, callback) => {
        callback(42);
      });
    });

    const client = ioc('ws://localhost:' + PORT, {
      parser: customParser
    });

    client.on('connect', () => {
      client.emit('ack', 'question', (answer) => {
        expect(answer).to.eql(42);
        done();
      });
    });
  });

  it('supports non-default namespace', done => {
    const PORT = 54003;
    const server = io(PORT, {
      parser: customParser
    });

    server.of('/chat').on('connect', (socket) => {
      socket.on('hi', done);
    });

    const client = ioc('ws://localhost:' + PORT + '/chat', {
      parser: customParser
    });

    client.on('connect', () => {
      client.emit('hi');
    });
  });

  it('supports broadcasting', done => {
    const PORT = 54004;
    const server = io(PORT, {
      parser: customParser
    });

    server.on('connect', (socket) => {
      server.emit('hey', 'you');
    });

    const client = ioc('ws://localhost:' + PORT, {
      parser: customParser
    });

    client.on('hey', (arg1) => {
      expect(arg1).to.eql('you');
      done();
    });
  });
});
