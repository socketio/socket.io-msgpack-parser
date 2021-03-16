declare module 'socket.io-msgpack-parser' {
  export class Encoder {
    new()
    encode(packet: any): ArrayBuffer
  }
  export class Decoder {
    new()
    add(obj: any): void
    checkPacket(decoded: any): void
    destroy(): void
    decode(packet: any): any
    // mixin from 'component-emitter'
    addListener(event: string, listener: (...args: any[]) => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
    once(event: string, listener: (...args: any[]) => void): this;
    removeListener(event: string, listener: (...args: any[]) => void): this;
    removeEventListener(event: string): this;
    off(event: string, listener: (...args: any[]) => void): this;
    removeAllListeners(): this;
    listeners(event: string): Function[];
    emit(event: string, ...args: any[]): this;
    hasListeners(event: string): boolean;
    // known event
    on(event: 'decoded', listener: (...args: any[]) => void): this;
  }
  export const protocol = 5
  export enum PacketType {
    CONNECT = 0,
    DISCONNECT = 1,
    EVENT = 2,
    ACK = 3,
    CONNECT_ERROR = 4,
  }
}
