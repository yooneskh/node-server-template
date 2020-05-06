import { EventEmitter2 } from 'eventemitter2';

const emitter = new EventEmitter2({
  wildcard: true,
  delimiter: '.',
  newListener: false,
  maxListeners: 0
});

// tslint:disable-next-line: no-any
export type EventListener = (...args: any[]) => Promise<void>;

export const YEventManager = {
  on(room: string[], handler: EventListener) {
    emitter.on(room, handler);
  },
  once(room: string[], handler: EventListener) {
    emitter.once(room, handler);
  },
  many(room: string[], times: number, handler: EventListener) {
    emitter.many(room, times, handler);
  },
  any(handler: EventListener) {
    emitter.onAny(handler);
  },
  off(room: string[], handler: EventListener) {
    emitter.removeListener(room, handler);
  },
  // tslint:disable-next-line: no-any
  emit(room: string[], ...values: any[]) {
    setImmediate(() => emitter.emit(room, ...values));
  }
};
