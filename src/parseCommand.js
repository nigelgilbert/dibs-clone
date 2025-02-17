/**
 * @param {string} str `command.text` from the Slack API
 */
function parseCommand(str) {
  // remove instances of multiple whitespace characters
  const formatted = str.replace(/\s+/g, ' ');
  // simple command regex
  const regex = /on (.+) for (.+)/g;
  const match = regex.exec(formatted);
  return match;
}

module.exports = parseCommand;
