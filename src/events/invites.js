const { client } = require('../index');
const { guildId } = require('../../config.json');

const invites = new Map();

async function initInvites() {
	const theGuild = client.guilds.cache.find(
		(guild) => guild.id === guildId);

	const firstInvites = await theGuild.invites.fetch();
	firstInvites.forEach((invite) => {
		const inviterName = theGuild.members.cache.find(member => member.id === invite.inviterId);
		invites.set(invite.code, { name: inviterName.user.globalName, uses: invite.uses });
	});
}

client.on('inviteDelete', (invite) => {
	invites.delete(invite.code);
});

client.on('inviteCreate', (invite) => {
	const theGuild = client.guilds.cache.find(
		(guild) => guild.id === guildId);

	const inviterName = theGuild.members.cache.find(member => member.id === invite.inviterId);
	// Update cache on new invites
	invites.set(invite.code, { name: inviterName.user.globalName, uses: invite.uses });
});

module.exports = { initInvites, invites };