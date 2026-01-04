const { client } = require('../index');
const { channelIds, emojis } = require('../../config.json');
const { prisma } = require('../lib/prisma');
const { invites } = require('./invites');

const randomLeaveMessage = [
	'died mysteriously.',
	'left to join the circus.',
	'lost a duel.',
	'blew up.',
	'was killed by [Intentional Game Design].',
	'was struck by lightning.',
	'ran away screaming.',
	'got rm -rf-ed.',
	'fell into a black hole.',
	'was last seen riding a unicorn.',
	'went to find themselves.',
];

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

	const emoji = client.emojis.cache.get(emojis.join);

	const guildMemberAnnounceChannel = client.channels.cache.get(channelIds.joinAnnouncements);
	if (guildMemberAnnounceChannel) {
		guildMemberAnnounceChannel.send(`${emoji} <@${member.user.id}> joined the server, invited by **${(invitee ? invitee.user.globalName : 'Unknown')}**.` + (oldMember ? ' Welcome back!' : ''));
	}
});

client.on('guildMemberRemove', (member) => {
	client.channels.cache.get(channelIds.memberCount).setName(`🧑‍💻 Member Count: ${member.guild.memberCount}`);

	const guildMemberAnnounceChannel = client.channels.cache.get(channelIds.joinAnnouncements);
	const emoji = client.emojis.cache.get(emojis.leave);
	const randomMessage = randomLeaveMessage[Math.floor(Math.random() * randomLeaveMessage.length)];

	if (guildMemberAnnounceChannel) {
		guildMemberAnnounceChannel.send(`${emoji} ${member.user.globalName} ${randomMessage}`);
	}
});
