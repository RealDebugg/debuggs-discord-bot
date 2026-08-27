const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, ActionRowBuilder, SeparatorBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

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
		// TODO: Fix description in rule 3, 4, 5, 10
		// TODO: Fix emojis in links
		// TODO: Fix tickets channel links
		const rules = [
			{
				title: '**1. Follow Discord\'s Terms of Service and Community Guidelines at all times.**',
				description: 'As per the rules set by the platform; you must comply to the entire Terms of Service and Community Guidelines.',
				notice: null,
				links: [
					{
						label: ':books: Terms of Service',
						url: 'https://discord.com/terms'
					},
					{
						label: ':bookmark: Community Guidelines',
						url: 'https://discord.com/guidelines'
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
				description: `We won't tolerate hate speech, discrimination, or derogatory remarks.
                All content on this server should adhere to the Relevant Discord Policy Explainer listed below.`,
				notice: null,
				links: [
					{
						label: ':link: Discord\'s Hateful Conduct Policy',
						url: 'https://discord.com:2096/safety/hateful-conduct-policy-explainer'
					}
				]
			},
			{
				title: '**4. Your Discord profile is subject to our rules**',
				description: `Staff Members may require you to change your name, server tag, avatar, banner, status, about me, pronouns, ....
                Profile content should adhere to all rules, as well as Discord Terms of Service and Community Guidelines.`,
				notice: null,
				links: []
			},
			{
				title: '**5. No spam.**',
				description: `Do not post spam messages on the server.
                Do not ask people to DM you.
                Do not send unsolicited DMs to members of the server.`,
				notice: null,
				links: []
			},
			{
				title: '**6. No off-topic advertising.**',
				description: 'Do not share promotional content including, but not limited to: content that has the sole purpose of gathering engagement, links to web shops, or links to other Discord servers. This includes self promotion. Content that is related to a topic at hand may be shared, but the topic must not violate this rule or any others.',
				notice: ':bulb: If you are unsure of what you wish to share will violate this rule, contact a staff member.',
				links: [
					{
						label: ':tickets: Contact a staff member',
						url: 'https://google.com',
					}
				]
			},
			{
				title: '**7. No impersonation.**',
				description: 'Do not pretend to be a Discord employee, a member of the staff team, a public figure or major personality, or any other member of the server.',
				notice: null,
				links: [
					{
						label: ':link: Discord\'s Identity Authenticity Policy',
						url: 'https://discord.com:2096/safety/identity-authenticity-policy-explainer'
					}
				]
			},
			{
				title: '**8. No sharing/discussing leaked or pirated content.**',
				description: 'This includes any content that is not intended to be in the public domain, classified content, gray/black markets or any illegal content. This also includes cheats and hacks.',
				notice: null,
				links: [
					{
						label: ':link: Discord\'s Copyright Trademark Policy',
						url: 'https://discord.com/safety/copyright-trademark-policy-explainer'
					}
				]
			},
			{
				title: '**9. Do not post or request someones personal information.**',
				description: 'This includes any information that could be used to identify anyone; such as selfies, IP address, legal/full name, financial information, contact details outside Discord, specific location, sexuality, ....',
				notice: null,
				links: [
					{
						label: ':link: Discord\'s Doxxing Policy',
						url: 'https://discord.com:2096/safety/doxxing-policy-explainer'
					}
				]
			},
			{
				title: '**10. Do not cause drama in public channels.**',
				description: `Do not discuss any moderation actions, staff activity, issued punishments, and misinformation in public channels.
                If you have any concerns, you can contact us via a ticket.`,
				notice: null,
				links: [
					{
						label: ':tickets:  Contact a staff member',
						url: 'https://google.com',
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

		for (const rule of rules) {
			const rsp = new ContainerBuilder({
				components: [
					new TextDisplayBuilder({ content: rule.title }),
					new TextDisplayBuilder({ content: rule.description })
				]
			});

			if (rule.notice) {
				rsp.components.push(new TextDisplayBuilder({ content: rule.notice }));
			}

			if (rule.links.length > 0) {
				rsp.components.push(new ActionRowBuilder({
					components: rule.links.map(link => new ButtonBuilder({
						style: ButtonStyle.Link,
						url: link.url,
						label: link.label
					}))
				}));
			}

			responseComponents.push(rsp);
		}

		/*
		 * Split the containers into messages while respecting
		 * Discord's 40-total-component limit.
		 */
		const messageChunks = splitComponents(responseComponents);


		/*
		 * Send the first chunk as the interaction response.
		 */
		await interaction.reply({
			flags: MessageFlags.IsComponentsV2,
			components: messageChunks[0]
		});


		/*
		 * Send any remaining chunks as follow-up messages.
		 */
		for (const chunk of messageChunks.slice(1)) {
			await interaction.followUp({
				flags: MessageFlags.IsComponentsV2,
				components: chunk
			});
		}
	},
};