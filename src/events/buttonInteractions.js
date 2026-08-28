const { MessageFlags } = require('discord.js');
const { roles } = require('../../config.json');

async function handleButtonInteraction(interaction) {
	if (interaction.customId === 'rules_accept') {
		try {
			await interaction.member.roles.add(roles.rulesAccepted);

			await interaction.reply({
				content: '✅ You have accepted the rules! Welcome to the server.',
				flags: MessageFlags.Ephemeral
			});
		}
		catch (error) {
			console.error('Failed to add role:', error);
			await interaction.reply({
				content: '❌ Failed to assign role. Please contact a staff member. (Bot role may be positioned too low in role hierarchy)',
				flags: MessageFlags.Ephemeral
			});
		}
	}
	else if (interaction.customId === 'rules_decline') {
		await interaction.reply({
			content: '❌ You have declined the rules. You will be removed from the server.',
			flags: MessageFlags.Ephemeral
		});

		try {
			await interaction.member.kick('Declined server rules');
		}
		catch (error) {
			console.error('Failed to kick user:', error);
		}
	}
}

module.exports = { handleButtonInteraction };
