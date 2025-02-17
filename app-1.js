require("dotenv/config");
const parse = require("parse-duration");
const bolt = require("@slack/bolt");
const { App } = bolt;

// example resource object
//const resources = [{ name: "staging", queue: [{ user, duration }] }];
const resources = [];

// Initializes your app in socket mode with your app token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true, // add this
  appToken: process.env.SLACK_APP_TOKEN, // add this
});

// Listens to incoming messages that contain "hello"
app.message("hello", async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say(`Hey there <@${message.user}>!`);
});

// The echo command simply echoes on command
app.command("/dibs", async ({ command, ack, say }) => {
  // Acknowledge command request
  await ack();

  // given "on staging for 1 hour"
  // match[1] = "staging"
  // match[2] = "1 hour"
  const regex = /on (.+) for (.+)/g;

  // await respond(command.text);
  const match = regex.exec(command.text);

  console.log(JSON.stringify(command));
  console.log(JSON.stringify(resources));

  if (resources.find((r) => match[1].includes(r.name))) {
    await say(`<@${command.user_name}> is in line for \`${match[1]}\``);
  } else {
    console.log(resources[0]?.name, match[1]);
    await say(
      `<@${command.user_name}> is holding onto \`${match[1]}\` for ${match[2]}`
    );
  }

  // clear out resources
  reserveResource(
    command.user_name,
    command.channel_name,
    match[1],
    parse(match[2])
  );
});

(async () => {
  // Start your app
  await app.start();

  app.logger.info("⚡️ Bolt app is running!");
})();

function reserveResource(user, channel, resource, duration) {
  const match = resources.find((r) => r?.name === resource);

  if (match) {
    // enqueue the next waiting person
    match.queue.push({ user, duration });
    console.log("queue'ing user!");
  } else {
    // enqueue the first person
    resources.push({ name: "staging", queue: [{ user, duration }] });

    // start the timeout that waits for first person
    setTimeout(() => {
      checkQueue(resource, channel);
    }, duration);
  }
}

async function checkQueue(resource, channel) {
  let index = resources.findIndex((r) => r?.name === resource);
  const released = resources[index];

  const { user, duration } = released.queue.shift();

  console.log(resource, channel);

  await app.client.chat.postMessage({
    channel: channel,
    text: `<@${user}> has released \`${released.name}\``,
  });

  // delete the resource map entry if it's empty
  if (released.queue.length === 0) {
    delete resources[index];

    // if there's more stuff in the queue...
  } else {
    const user = released.queue[0].user;
    const duration = released.queue[0].duration;
    // announce the next owner
    await app.client.chat.postMessage({
      channel: channel,
      text: `<@${user}> is now holding \`${resource}\` for ${
        duration / 1000
      } seconds`,
    });
    // set the timeout to re-check
    setTimeout(async () => {
      checkQueue(resource, channel);
    }, duration);
  }
}
