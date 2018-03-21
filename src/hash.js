function defaultHash(args) {
  try {
    return JSON.stringify(args);
  } catch(e) {
    return undefined;
  }
}

export default function hash(c, args) {
  return (typeof c.hash === 'function' ? c.hash : defaultHash)(args);
};
