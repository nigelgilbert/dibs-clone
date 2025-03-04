require("dotenv/config");
const bolt = require("@slack/bolt");
const { App } = bolt;
const parseDuration = require("./src/parseDuration");
const { parseOnCommand, parseOffCommand } = require("./src/parseCommand");
const msToTimeStr = require("./src/msToTimeStr");
const {
  reserveResource,
  releaseResource,
  eventEmitter,
  Events,
} = require("./src/ResourceQueue");

// Initializes your app in socket mode with your app token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false,
  appToken: process.env.SLACK_APP_TOKEN,
});

// For now, 1 static channel is fine for our usecase
const channel = process.env.CHANNEL;

// The echo command simply echoes on command
app.command("/ng-dibs", async ({ command, ack, say }) => {
  // Acknowledge command request
  await ack();

  if (command.text.includes("on")) {
    // given "on staging for 1 hour"
    // match[1] = "staging"
    // match[2] = "1 hour"
    const match = parseOnCommand(command.text);
    const duration = await parseDuration(match[2]);

    // call dibs
    reserveResource(match[1], command.user_name, duration);
  } else if (command.text.includes("off")) {
    // given "off staging"
    // match[1] = "staging"
    const match = parseOffCommand(command.text);
    releaseResource(match[1], command.user_name);
  }
});

eventEmitter.on(Events.RELEASED, async (name, user) => {
  await app.client.chat.postMessage({
    channel: channel,
    text: `<@${user}> has released \`${name}\``,
  });
});

eventEmitter.on(Events.RESERVED, async (resource, user, duration) => {
  await app.client.chat.postMessage({
    channel: channel,
    text: `<@${user}> is now holding \`${resource}\` for ${msToTimeStr(
      duration
    )}`,
  });
});

eventEmitter.on(Events.QUEUED, async (resource, user) => {
  await app.client.chat.postMessage({
    channel: channel,
    text: `<@${user}> is in queue for \`${resource}\``,
  });
});

eventEmitter.on(Events.UPDATED, async (resource, user, duration) => {
  await app.client.chat.postMessage({
    channel: channel,
    text: `<@${user}> is still holding \`${resource}\` for ${msToTimeStr(
      duration
    )}`,
  });
});

eventEmitter.on(Events.ERROR_NOT_HOLDING_RESOURCE, async (resource, user) => {
  await app.client.chat.postMessage({
    channel: channel,
    text: `Cannot release \`${resource}\` because <@${user}> does not have dibs!`,
  });
});

eventEmitter.on(Events.ERROR_ALREADY_IN_QUEUE, async (resource, user) => {
  await app.client.chat.postMessage({
    channel: channel,
    text: `<@${user}> is already in queue for \`${resource}\``,
  });
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  app.logger.info("⚡️ Bolt app is running!");
})();
