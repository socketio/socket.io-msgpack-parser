/* eslint-env mocha */

const customParser = require("..");
const expect = require("expect.js");
const io = require("socket.io");
const ioc = require("socket.io-client");
const msgpack = require("notepack.io");

describe("parser", () => {
  it("allows connection", (done) => {
    const PORT = 54000;
    const server = io(PORT, {
      parser: customParser,
    });

    server.on("connect", (socket) => {
      socket.on("hello", () => {
        client.close();
        server.close();
        done();
      });
    });

    const client = ioc("ws://localhost:" + PORT, {
      parser: customParser,
    });

    client.on("connect", () => {
      client.emit("hello");
    });
  });

  it("supports binary", (done) => {
    const PORT = 54001;
    const server = io(PORT, {
      parser: customParser,
    });

    server.on("connect", (socket) => {
      socket.on("binary", (arg1, arg2, arg3) => {
        expect(arg1).to.eql([]);
        expect(arg2).to.eql({ a: "b" });
        expect(Buffer.isBuffer(arg3)).to.be(true);
        client.close();
        server.close();
        done();
      });
    });

    const client = ioc("ws://localhost:" + PORT, {
      parser: customParser,
    });

    client.on("connect", () => {
      const buf = Buffer.from("asdfasdf", "utf8");
      client.emit("binary", [], { a: "b" }, buf);
    });
  });

  it("supports acknowledgements", (done) => {
    const PORT = 54002;
    const server = io(PORT, {
      parser: customParser,
    });

    server.on("connect", (socket) => {
      socket.on("ack", (arg1, callback) => {
        callback(42);
      });
    });

    const client = ioc("ws://localhost:" + PORT, {
      parser: customParser,
    });

    client.on("connect", () => {
      client.emit("ack", "question", (answer) => {
        expect(answer).to.eql(42);
        client.close();
        server.close();
        done();
      });
    });
  });

  it("supports multiplexing", (done) => {
    const PORT = 54003;
    const server = io(PORT, {
      parser: customParser,
    });

    server.of("/chat").on("connect", (socket) => {
      socket.on("hi", () => {
        client.close();
        server.close();
        done();
      });
    });

    const client = ioc("ws://localhost:" + PORT + "/chat", {
      parser: customParser,
    });

    client.on("connect", () => {
      client.emit("hi");
    });
  });

  it("supports namespace error", (done) => {
    const PORT = 54003;
    const server = io(PORT, {
      parser: customParser,
    });

    server.use((socket, next) => {
      next(new Error("invalid"));
    });

    const client = ioc("ws://localhost:" + PORT, {
      parser: customParser,
    });

    client.on("connect_error", (err) => {
      expect(err).to.eql("invalid");
      client.close();
      server.close();
      done();
    });
  });

  it("supports broadcasting", (done) => {
    const PORT = 54004;
    const server = io(PORT, {
      parser: customParser,
    });

    server.on("connect", (socket) => {
      server.emit("hey", "you");
    });

    const client = ioc("ws://localhost:" + PORT, {
      parser: customParser,
    });

    client.on("hey", (arg1) => {
      expect(arg1).to.eql("you");
      client.close();
      server.close();
      done();
    });
  });

  it("throws an error upon invalid format", () => {
    const decoder = new customParser.Decoder();

    const test = (input, expectedError) => {
      expect(() => decoder.add(input)).to.throwError(expectedError);
    };

    test(Buffer.from([]), /Could not parse/);

    test(msgpack.encode({}), /invalid packet type/);
    test(msgpack.encode({ type: "a" }), /invalid packet type/);
    test(msgpack.encode({ type: 7 }), /invalid packet type/);
    test(msgpack.encode(Buffer.from([1])), /invalid packet type/);

    test(msgpack.encode({ type: 2 }), /invalid namespace/);
    test(msgpack.encode({ type: 2, nsp: 2 }), /invalid namespace/);

    test(msgpack.encode({ type: 2, nsp: "/" }), /invalid payload/);
    test(msgpack.encode({ type: 2, nsp: "/", data: 4 }), /invalid payload/);
    test(msgpack.encode({ type: 4, nsp: "/", data: [] }), /invalid payload/);

    test(
      msgpack.encode({ type: 2, nsp: "/", data: [], id: "a" }),
      /invalid packet id/
    );
  });
});
