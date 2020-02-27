import { EventEmitter2, Listener } from 'eventemitter2';

const emitter = new EventEmitter2({
  wildcard: true,
  delimiter: '.',
  newListener: false,
  maxListeners: 0
});

export const YEventManager = {
  on(room: string[], handler: Listener) {
    emitter.on(room, handler);
  },
  once(room: string[], handler: Listener) {
    emitter.once(room, handler);
  },
  many(room: string[], times: number, handler: Listener) {
    emitter.many(room, times, handler);
  },
  any(handler: Listener) {
    emitter.onAny(handler);
  },
  off(room: string[], handler: Listener) {
    emitter.removeListener(room, handler);
  },
  // tslint:disable-next-line: no-any
  emit(room: string[], ...values: any[]) {
    emitter.emit(room, ...values);
  }
};
