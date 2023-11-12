export function wait(timeoutSeconds) {
  return new Promise((r) => setTimeout(r, timeoutSeconds * 1000));
}
