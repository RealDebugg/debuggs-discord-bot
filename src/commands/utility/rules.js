const {
	SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder,
	ActionRowBuilder, SeparatorBuilder, SeparatorSpacingSize,
	ButtonBuilder, ButtonStyle, MessageFlags
} = require('discord.js');
const { guildId, channelIds, roles } = require('../../../config.json');

/**
 * Recursively counts a component and all of its children.
 *
 * Discord's Components V2 limit is 40 total components per message,
 * including nested components.
 */
const getComponentCount = (component) => {
	let count = 1;

	if (component.components) {
		for (const child of component.components) {
			count += getComponentCount(child);
		}
	}

	return count;
};


/**
 * Splits components into message-sized chunks without exceeding
 * Discord's 40-component limit.
 */
const splitComponents = (components, maxComponents = 40) => {
	const chunks = [];

	let currentChunk = [];
	let currentCount = 0;

	for (const component of components) {
		const componentCount = getComponentCount(component);

		if (componentCount > maxComponents) {
			throw new Error(
				`A component contains ${componentCount} components, ` +
				`which exceeds Discord's ${maxComponents}-component limit.`
			);
		}

		// Adding this component would exceed the limit,
		// so start a new message.
		if (currentCount + componentCount > maxComponents) {
			chunks.push(currentChunk);

			currentChunk = [];
			currentCount = 0;
		}

		currentChunk.push(component);
		currentCount += componentCount;
	}

	if (currentChunk.length > 0) {
		chunks.push(currentChunk);
	}

	return chunks;
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rules')
		.setDescription('Generates rules for the server in the current channel.'),

	async execute(interaction) {
		// Check if user has administrator role
		if (!interaction.member.roles.cache.has(roles.administrator)) {
			return interaction.reply({
				content: 'You do not have permission to use this command.',
				flags: MessageFlags.Ephemeral
			});
		}

		const rules = [
			{
				title: '**1. Follow Discord\'s Terms of Service and Community Guidelines at all times.**',
				description: 'As per the rules set by the platform; you must comply to the entire Terms of Service and Community Guidelines.',
				notice: null,
				links: [
					{
						label: 'Terms of Service',
						url: 'https://discord.com/terms',
						emoji: {
							name: '📚',
							id: null,
							animated: false
						}
					},
					{
						label: 'Community Guidelines',
						url: 'https://discord.com/guidelines',
						emoji: {
							name: '🔖',
							id: null,
							animated: false
						}
					}
				]
			},
			{
				title: '**2. Use English to communicate.**',
				description: 'For ease of moderation and to allow everyone to take part in the conversation, please only use English within the server.',
				notice: null,
				links: []
			},
			{
				title: '**3. Be respectful.**',
				description: 'We won\'t tolerate hate speech, discrimination, or derogatory remarks.\nAll content on this server should adhere to the Relevant Discord Policy Explainer listed below.',
				notice: null,
				links: [
					{
						label: 'Discord\'s Hateful Conduct Policy',
						url: 'https://discord.com:2096/safety/hateful-conduct-policy-explainer',
						emoji: {
							name: '🔗',
							id: null,
							animated: false
						}
					}
				]
			},
			{
				title: '**4. Your Discord profile is subject to our rules**',
				description: 'Staff Members may require you to change your name, server tag, avatar, banner, status, about me, pronouns, ....\nProfile content should adhere to all rules, as well as Discord Terms of Service and Community Guidelines.',
				notice: null,
				links: []
			},
			{
				title: '**5. No spam.**',
				description: 'Do not post spam messages on the server.\nDo not ask people to DM you.\nDo not send unsolicited DMs to members of the server.',
				notice: null,
				links: []
			},
			{
				title: '**6. No off-topic advertising.**',
				description: 'Do not share promotional content including, but not limited to: content that has the sole purpose of gathering engagement, links to web shops, or links to other Discord servers. This includes self promotion. Content that is related to a topic at hand may be shared, but the topic must not violate this rule or any others.',
				notice: '💡 If you are unsure of what you wish to share will violate this rule, contact a staff member.',
				links: [
					{
						label: 'Contact a staff member',
						url: `https://discord.com/channels/${guildId}/${channelIds.tickets}`,
						emoji: {
							name: '🎟️',
							id: null,
							animated: false
						}
					}
				]
			},
			{
				title: '**7. No impersonation.**',
				description: 'Do not pretend to be a Discord employee, a member of the staff team, a public figure or major personality, or any other member of the server.',
				notice: null,
				links: [
					{
						label: 'Discord\'s Identity Authenticity Policy',
						url: 'https://discord.com:2096/safety/identity-authenticity-policy-explainer',
						emoji: {
							name: '🔗',
							id: null,
							animated: false
						}
					}
				]
			},
			{
				title: '**8. No sharing/discussing leaked or pirated content.**',
				description: 'This includes any content that is not intended to be in the public domain, classified content, gray/black markets or any illegal content. This also includes cheats and hacks.',
				notice: null,
				links: [
					{
						label: 'Discord\'s Copyright Trademark Policy',
						url: 'https://discord.com/safety/copyright-trademark-policy-explainer',
						emoji: {
							name: '🔗',
							id: null,
							animated: false
						}
					}
				]
			},
			{
				title: '**9. Do not post or request someones personal information.**',
				description: 'This includes any information that could be used to identify anyone; such as selfies, IP address, legal/full name, financial information, contact details outside Discord, specific location, sexuality, ....',
				notice: null,
				links: [
					{
						label: 'Discord\'s Doxxing Policy',
						url: 'https://discord.com:2096/safety/doxxing-policy-explainer',
						emoji: {
							name: '🔗',
							id: null,
							animated: false
						}
					}
				]
			},
			{
				title: '**10. Do not cause drama in public channels.**',
				description: 'Do not discuss any moderation actions, staff activity, issued punishments, and misinformation in public channels.\nIf you have any concerns, you can contact us via a ticket.',
				notice: null,
				links: [
					{
						label: 'Contact a staff member',
						url: `https://discord.com/channels/${guildId}/${channelIds.tickets}`,
						emoji: {
							name: '🎟️',
							id: null,
							animated: false
						}
					}
				]
			},
			{
				title: '**11. No requesting help installing hacking or malicious tools.**',
				description: 'We do not tolerate questions about setting up RATs, Trojans, Malware, or any tools that are used maliciously. This includes any usage of these tools for educational purposes.',
				notice: null,
				links: []
			},
			{
				title: '**12. Do not share cracks, cheats, malicious programs, ....**',
				description: 'To ensure safety for all members on the servers, we do not allow the sharing of these programs in the server or to server members via links or direct file upload.',
				notice: null,
				links: []
			},
			{
				title: '**13. Use proper channels**',
				description: 'Each channel has their own purpose, please use the channels for their purpose, and keep unrelated chatter to a minimum.',
				notice: null,
				links: []
			},
		];

		const responseComponents = [];

		responseComponents.push(new TextDisplayBuilder({ content: 'Welcome to the Debugg Discord Server!' }));

		for (const rule of rules) {
			const rsp = new ContainerBuilder({
				components: [
					new TextDisplayBuilder({ content: rule.title }),
					new TextDisplayBuilder({ content: rule.description })
				]
			});

			if (rule.notice) {
				rsp.components.push(new TextDisplayBuilder({ content: '-# ' + rule.notice }));
			}

			if (rule.links.length > 0) {
				rsp.components.push(new ActionRowBuilder({
					components: rule.links.map(link => new ButtonBuilder({
						style: ButtonStyle.Link,
						url: link.url,
						label: link.label,
						emoji: link.emoji
					}))
				}));
			}

			responseComponents.push(rsp);
		}

		responseComponents.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

		responseComponents.push(new ContainerBuilder({
			components: [
				new TextDisplayBuilder({ content: '**:warning: Important Notice**' }),
				new TextDisplayBuilder({ content: '-# Please note that these rules also apply to DMs to server members. This server makes use of automatic moderation, and therefore scans / logs every message sent. By agreeing to the rules, you agree to this notice.\n-# Agreeing to the rules without fully reading and understanding the rules is a violation of the rules, and will result in a termination from the  server.\n-# The rules listed above might be subject to change without notice.\n-# Upon claiming the vistor role, you accept these rules and agree to keep yourself updated by reading the channel if a new message is posted. A staff member is able to interpret the rules as they see fit and apply them based on the spirit of the rules, not only the letter.' })
			]
		}).setAccentColor([249, 95, 95]));

		responseComponents.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

		responseComponents.push(new ActionRowBuilder({
			components: [
				new ButtonBuilder()
					.setCustomId('rules_accept')
					.setLabel('Accept Rules')
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId('rules_decline')
					.setLabel('Decline Rules')
					.setStyle(ButtonStyle.Danger)
			]
		}));

		/*
		 * Split the containers into messages while respecting
		 * Discord's 40-total-component limit.
		 */
		const messageChunks = splitComponents(responseComponents);

		// Acknowledge the interaction
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		await interaction.deleteReply();

		// Send rules chunks (discord only allows 40 components per message)
		for (const chunk of messageChunks) {
			await interaction.channel.send({
				flags: MessageFlags.IsComponentsV2,
				components: chunk
			});
		}
	},
};