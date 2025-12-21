const { EmbedBuilder } = require("discord.js");
const { channelIds, userId, guildId } = require("../../config.json");

let lastBatteryTime = 0;

// Export a factory to avoid circular dependency with index.js
module.exports = function createIphoneChargeEvent(client) {
  return async function iphoneChargeEvent(isCharging, batteryLevel) {
    const message = await getMessage(client, isCharging, batteryLevel);

    const channel = client.channels.cache.get(channelIds.iphoneAnnouncements);
    if (channel) {
      channel.send({ embeds: [message] }).catch(console.error);
    } else {
      console.warn("iphoneAnnouncements channel not found");
    }

    lastBatteryTime = Date.now();
  };
};

async function getMessage(client, isCharging, batteryLevel) {
  const guild = client.guilds.cache.find((g) => g.id === guildId);
  if (!guild) throw new Error("guild not found");

  let member = guild.members.cache.get(userId);
  if (!member) {
    try {
      member = await guild.members.fetch(userId);
    } catch (fetchErr) {
      throw new Error("member not found");
    }
  }

  let memberName = member.user.globalName || member.user.username;

  const title = isCharging
    ? `⚡ ${memberName} just plugged in their phone!`
    : `🔋 ${memberName} just unplugged their phone!`;
  const timeTitle = isCharging ? "Last charged:" : "Charged for:";
  const diffMs = lastBatteryTime ? Date.now() - lastBatteryTime : 0;
  const hours = Math.floor(diffMs / 3600000);
  const time = `${hours} ${isCharging ? "hours ago" : "hours"}`;

  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setDescription(title)
    .addFields(
      { name: "Current battery level:", value: `${batteryLevel}%` },
      { name: timeTitle, value: time }
    );

  return embed;
}
