const EventEmitter = require("events");
const { logResources } = require("./logResources.js");
const Events = require("./events.js");

const eventEmitter = new EventEmitter();

/**
 * @typedef {Object} QueueItem
 * @property {string} user
 * @property {string} channel
 */

/**
 * @typedef {Object} Resource
 * @property {string} name
 * @property {QueueItem[]} queue
 * @property {NodeJS.Timeout} timeout
 * @property {string} channel
 */

/** @type {Resource[]} */
const resources = [];

/**
 *
 * @param {string} name
 * @param {string} user
 * @param {string} channel
 * @param {number} duration
 */
function reserveResource(name, user, channel, duration) {
  const existingResource = resources.find((r) => r?.name === name);

  if (existingResource) {
    // check if it's the same user... if it is, then just update the timeout
    if (existingResource.queue[0].user === user) {
      clearTimeout(existingResource.timeout);
      existingResource.timeout = setTimeout(() => {
        checkQueue(name, channel);
      }, duration);
      eventEmitter.emit(Events.UPDATED, name, user, channel, duration);
    } else {
      // enqueue the next waiting person
      existingResource.queue.push({ user, duration });
      eventEmitter.emit(Events.QUEUED, name, user, channel);
      logResources(resources);
    }
  } else {
    // start the timeout that checks the queue once it's done
    const timeout = setTimeout(() => {
      checkQueue(name, channel);
    }, duration);

    // start a new queue
    resources.push({
      name,
      channel,
      queue: [{ user, duration }],
      timeout,
    });

    eventEmitter.emit(Events.RESERVED, name, user, channel, duration);
    logResources(resources);
  }
}

/**
 * @param {string} resource
 * @param {string} channel
 */
async function checkQueue(name, channel) {
  let index = resources.findIndex((r) => r?.name === name);
  const released = resources[index];

  const { user, duration } = released.queue.shift();

  // delete the resource map entry if it's empty
  if (released.queue.length === 0) {
    resources.splice(index, 1);
    eventEmitter.emit(Events.RELEASED, released.name, user, channel);
    logResources(resources);
  } else {
    // if there's more stuff in the queue...
    queueNextPerson(released, channel);
  }
}

async function queueNextPerson(resource, channel) {
  const user = resource.queue[0].user;
  const duration = resource.queue[0].duration;

  eventEmitter.emit(Events.RESERVED, resource.name, user, channel, duration);
  logResources(resources);

  // set the timeout to re-check
  setTimeout(async () => {
    checkQueue(resource.name, channel);
  }, duration);
}

module.exports = { reserveResource, eventEmitter, Events };
