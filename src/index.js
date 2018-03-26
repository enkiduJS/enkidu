import Session from './session';

function resolveRunner(runner) {
  return runner; // TODO
}

export default function enkidu(runner, plugins, callback) {
  const session = new Session(plugins);
  runner = resolveRunner(runner);
  runner.run(session, callback);
};
