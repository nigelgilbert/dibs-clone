const EventEmitter = require("events");
const { logResources } = require("./logResources.js");
const Events = require("./Events.js");

const eventEmitter = new EventEmitter();

/**
 * @typedef {Object} UserQueue
 * @property {string} user
 * @property {number} duration
 */

/**
 * @typedef {Object} Resource
 * @property {string} name
 * @property {UserQueue[]} queue
 * @property {NodeJS.Timeout} timeout
 */

/** @type {Resource[]} */
const resources = [];

/**
 *
 * @param {string} name
 * @param {string} user
 * @param {number} duration
 */
function reserveResource(name, user, duration) {
  const existingResource = resources.find((r) => r?.name === name);

  if (existingResource) {
    // check if it's the same user... if it is, then just update the timeout
    if (existingResource.queue[0].user === user) {
      clearTimeout(existingResource.timeout);
      existingResource.timeout = setTimeout(() => {
        _releaseResource(name);
      }, duration);
      eventEmitter.emit(Events.UPDATED, name, user, duration);
    } else {
      // check that they're not in queue already
      if (!existingResource.queue.find((entry) => entry.user === user)) {
        // enqueue the next waiting person
        existingResource.queue.push({ user, duration });
        eventEmitter.emit(Events.QUEUED, name, user);
        logResources(resources);
      } else {
        // just emit an error if they're already in queue
        eventEmitter.emit(Events.ERROR_ALREADY_IN_QUEUE, name, user);
      }
    }
  } else {
    // start the timeout that checks the queue once it's done
    const timeout = setTimeout(() => {
      _releaseResource(name);
    }, duration);

    // start a new queue
    resources.push({
      name,
      queue: [{ user, duration }],
      timeout,
    });

    eventEmitter.emit(Events.RESERVED, name, user, duration);
    logResources(resources);
  }
}

/**
 * @param {string} resource
 */
async function _releaseResource(name) {
  let index = resources.findIndex((r) => r?.name === name);

  const released = resources[index];

  const { user, duration } = released.queue.shift();

  // delete the resource map entry if it's empty
  if (released.queue.length === 0) {
    resources.splice(index, 1);
    eventEmitter.emit(Events.RELEASED, released.name, user);
    logResources(resources);
  } else {
    // if there's more stuff in the queue...
    _queueNextPerson(released);
  }
}

async function _queueNextPerson(resource) {
  const user = resource.queue[0].user;
  const duration = resource.queue[0].duration;

  eventEmitter.emit(Events.RESERVED, resource.name, user, duration);
  logResources(resources);

  // set the timeout to re-check
  resource.timeout = setTimeout(async () => {
    _releaseResource(resource.name);
  }, duration);
}

/**
 * Externally facing `releaseResource` with safety checks!
 * This ensures that any rando can't just release your resource!
 * @param {string} name
 * @param {string} user
 */
function releaseResource(name, user) {
  const resource = resources.find((r) => r?.name === name);
  if (resource.queue[0].user === user) {
    clearTimeout(resource.timeout);
    _releaseResource(name);
  } else {
    eventEmitter.emit(Events.ERROR_NOT_HOLDING_RESOURCE, name, user);
  }
}

module.exports = { reserveResource, releaseResource, eventEmitter, Events };
