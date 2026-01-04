const { client } = require('../index');
const { channelIds } = require('../../config.json');
const { prisma } = require('../lib/prisma');
const { invites } = require('./invites');

client.on('guildMemberAdd', async (member) => {
	client.channels.cache.get(channelIds.memberCount).setName(`🧑‍💻 Member Count: ${member.guild.memberCount}`);
	client.channels.cache.get(channelIds.lastMember).setName(`❤️ Last Member: ${member.user.tag}`);

	const oldMember = await prisma.GuildMembers.findFirst({
		where: {
			userGuildId: member.user.id + '.' + member.guild.id,
		}
	});

	if (!oldMember) {
		await prisma.GuildMembers.create({
			data: {
				userGuildId: member.user.id + '.' + member.guild.id,
			}
		});
	}

	const newInvites = await member.guild.invites.fetch();
	const invite = newInvites.find(i => i.uses > invites.get(i.code).uses);
	const invitee = member.guild.members.cache.find(inviter => inviter.id === invite.inviterId);

	const guildMemberAddChannel = client.channels.cache.get(channelIds.joinAnnouncements);
	if (guildMemberAddChannel) {
		guildMemberAddChannel.send(`<@${member.user.id}> joined the server, invited by **${(invitee ? invitee.user.globalName : 'Unknown')}**.` + (oldMember ? ' Welcome back!' : ''));
	}
});

client.on('guildMemberRemove', (member) => {
	client.channels.cache.get(channelIds.memberCount).setName(`🧑‍💻 Member Count: ${member.guild.memberCount}`);
});
