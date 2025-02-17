require("dotenv/config");
// const parse = require("parse-duration");
const bolt = require("@slack/bolt");
const { App } = bolt;

const { reserveResource, eventEmitter, Events } = require("./src/ResourceQueue");

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
  const match = regex.exec(command.text);

  // call dibs
  reserveResource(
    match[1],
    command.user_name,
    command.channel_name,
    5 * 1000
    // parse(match[2])
  );
});

eventEmitter.on(Events.RELEASED, async (name, user, channel) => {
  await app.client.chat.postMessage({
    channel: channel,
    text: `<@${user}> has released \`${name}\``,
  });
});

eventEmitter.on(Events.RESERVED, async (resource, user, channel, duration) => {
  await app.client.chat.postMessage({
    channel: channel,
    text: `<@${user}> is now holding \`${resource}\` for ${
      duration / 1000
    } seconds`,
  });
});

eventEmitter.on(Events.QUEUED, async (resource, user, channel) => {
  await app.client.chat.postMessage({
    channel: channel,
    text: `<@${user}> is in queue for \`${resource}\``,
  });
});

(async () => {
  // Start your app
  await app.start();

  app.logger.info("⚡️ Bolt app is running!");
})();
