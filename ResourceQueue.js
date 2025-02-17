import { EventEmitter } from "node:events";

const eventEmitter = new EventEmitter();

function replacer(key, value) {
  if (key == "timeout") return true;
  else return value;
}

/**
 * [
 *   {
 *     name: string,
 *     queue: [{ user: string, duration: number }],
 *     timeout: NodeJS.Timeout,
 *     channel: string
 *   },
 * ];
 */
const resources = [];

/**
 *
 * @param {string} name
 * @param {string} user
 * @param {string} channel
 * @param {number} duration
 */
function dibs(name, user, channel, duration) {
  const existingResource = resources.find((r) => r?.name === name);

  if (existingResource) {
    // @todo – branching logic
    // check if it's the same user... if it is, then just update the timeout

    // enqueue the next waiting person
    existingResource.queue.push({ user, duration });
    eventEmitter.emit("QUEUED", name, user, channel);
    console.log(JSON.stringify(resources, replacer));

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

    console.log(JSON.stringify(resources, replacer));
    eventEmitter.emit("RESERVED", name, user, channel, duration);
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

  console.log(JSON.stringify(resources, replacer));

  // delete the resource map entry if it's empty
  if (released.queue.length === 0) {
    eventEmitter.emit("RELEASED", released.name, user, channel);
    // delete resources[index];
    // better than `delete` – this way GC can remove objects without `null` indices
    resources.splice(index, 1);

    console.log(JSON.stringify(resources, replacer));

    // if there's more stuff in the queue...
  } else {
    queueNextPerson(released, channel);
  }
}

async function queueNextPerson(resource, channel) {
  const user = resource.queue[0].user;
  const duration = resource.queue[0].duration;

  console.log(JSON.stringify(resources, replacer));
  eventEmitter.emit("RESERVED", resource.name, user, channel, duration);

  // set the timeout to re-check
  setTimeout(async () => {
    checkQueue(resource.name, channel);
  }, duration);
}

export { dibs, eventEmitter };
