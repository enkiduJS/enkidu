class Hooks {

  constructor(events) {
    this._events = events;
  }

  call() {
    this._events.emit.apply(this._events, arguments);
  }

}

export default Hooks;
