const { client } = require('../index');
const { channelIds } = require('../../config.json');

client.on('guildMemberAdd', (member) => {
	console.log(JSON.stringify(member));
	client.channels.cache.get(channelIds.memberCount).setName(`🧑‍💻 Member Count: ${member.guild.memberCount}`);
	client.channels.cache.get(channelIds.lastMember).setName(`❤️ Last Member: ${member.user.tag}`);
});

client.on('guildMemberRemove', (member) => {
	client.channels.cache.get(channelIds.memberCount).setName(`🧑‍💻 Member Count: ${member.guild.memberCount}`);
});
