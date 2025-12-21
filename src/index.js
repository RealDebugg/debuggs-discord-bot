require("dotenv").config();
const {
  Client,
  Events,
  GatewayIntentBits,
  ActivityType,
} = require("discord.js");
const { guildId, channelIds, activity } = require("../config.json");
const createWebServer = require("./web");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});
module.exports = { client };
require("./events/guildMember");

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  client.user.setPresence({
    activities: [{ name: activity, type: ActivityType.Listening }],
    status: "online",
  });

  let members = client.guilds.cache.find(
    (guild) => guild.id === guildId
  ).memberCount;
  client.channels.cache
    .get(channelIds.memberCount)
    .setName(`🧑‍💻 Member Count: ${members}`);

  try {
    const web = createWebServer({ client, config: require("../config.json") });
    await web.start(process.env.PORT);
  } catch (err) {
    console.error("Failed to start web server", err);
  }
});

client.login(process.env.DISCORD_TOKEN);
