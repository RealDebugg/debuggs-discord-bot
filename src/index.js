// TODO: https://discordjs.guide/legacy/app-creation/handling-events
const fs = require('node:fs');
const path = require('node:path');
const {
	Client,
	Collection,
	Events,
	GatewayIntentBits,
	MessageFlags,
	ActivityType,
} = require('discord.js');
const { guildId, channelIds, activity, bot } = require('../config.json');
const createWebServer = require('./web');
const wait = require('timers/promises').setTimeout;

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences,
	],
});
module.exports = { client };
require('./events/guildMember');
const { initInvites } = require('./events/invites');

client.once(Events.ClientReady, async (readyClient) => {
	await wait(1000);

	initInvites();

	console.log(`Ready! Logged in as ${readyClient.user.tag}`);

	client.user.setPresence({
		activities: [{ name: activity, type: ActivityType.Listening }],
		status: 'online',
	});

	const theGuild = client.guilds.cache.find((guild) => guild.id === guildId);
	const members = theGuild.memberCount;

	client.channels.cache
		.get(channelIds.memberCount)
		.setName(`🧑‍💻 Member Count: ${members}`);

	try {
		const web = createWebServer({ client, config: require('../config.json') });
		await web.start(bot.port);
	}
	catch (err) {
		console.error('Failed to start web server', err);
	}
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
			);
		}
	}
}

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			});
		}
		else {
			await interaction.reply({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			});
		}
	}
});

client.login(bot.token);
