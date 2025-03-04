/**
 * Enum for the ResourceQueue events!
 */
const Events = Object.freeze({
  QUEUED: "QUEUED",
  RESERVED: "RESERVED",
  RELEASED: "RELEASED",
  UPDATED: "UPDATED",
  ERROR_NOT_HOLDING_RESOURCE: "ERROR_NOT_HOLDING_RESOURCE",
  ERROR_ALREADY_IN_QUEUE: "ERROR_ALREADY_IN_QUEUE"
});

module.exports = Events;