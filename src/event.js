import EventEmitter from 'events';

class Hooks {

  constructor(emitter) {
    this._emitter = emitter;
  }

  call() {
    this._emitter.emit.apply(this._emitter, arguments);
  }

}

class Events {

  constructor(emitter) {
    this._emitter = emitter;
  }

  on(name, callback) {
    this._emitter.on(name, callback);
  }

}

class Emitter {

  constructor() {
    const emitter = new EventEmitter();
    Object.defineProperty(this, 'events', {
      value: new Events(emitter)
    });
    Object.defineProperty(this, 'hooks', {
      value: new Hooks(emitter)
    });
  }

}

export default Emitter;
