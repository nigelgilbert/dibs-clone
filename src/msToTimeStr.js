/**
 * Courtesy of ChatGPT
 */
function msToTimeStr(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const parts = [];

  if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours % 24 > 0)
    parts.push(`${hours % 24} hour${hours % 24 > 1 ? "s" : ""}`);
  if (minutes % 60 > 0)
    parts.push(`${minutes % 60} minute${minutes % 60 > 1 ? "s" : ""}`);

  return parts.join(" ");
}

module.exports = msToTimeStr;
