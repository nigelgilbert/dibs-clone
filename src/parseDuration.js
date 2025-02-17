/**
 * @todo Remove `parse-duration` – either roll your own or pick a new library
 * @param {string} str
 */
async function parseDuration(str) {
  // ugly boilerplate for ES6 module interop
  const parse = (await import("parse-duration")).default;
  return parse(str);
}

module.exports = parseDuration;
