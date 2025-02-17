/**
 * JSON.stringify `replacer` function is necessary because `NodeJS.Timeout` is circular
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#replacer
 * @param {string} key
 * @param {any} value
 * @returns
 */
function replaceTimeoutKey(key, value) {
  if (key == "timeout") return true;
  else return value;
}

/**
 * `console.log` the `resources` array when `VERBOSE` is enabled in `.env`
 * @param {Resource[]} resources
 */
function logResources(resources) {
  process.env.VERBOSE &&
    console.log(JSON.stringify(resources, replaceTimeoutKey));
}

module.exports = { logResources };
