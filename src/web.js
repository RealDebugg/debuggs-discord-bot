const express = require('express');
const { userId, bot } = require('../config.json');
const createIphoneChargeEvent = require('./events/iphoneEvent');

function createWebServer({ client, config }) {
	const app = express();
	app.use(express.json());
	const iphoneChargeEvent = createIphoneChargeEvent(client);

	app.get('/ping', (req, res) => {
		res.json({ status: 'ok' });
	});

	app.get('/active', async (req, res) => {
		try {
			const guild = client.guilds.cache.find((g) => g.id === config.guildId);
			if (!guild) return res.status(404).json({ error: 'guild not found' });

			let member = guild.members.cache.get(userId);
			if (!member) {
				try {
					member = await guild.members.fetch(userId);
				}
				catch {
					return res.status(404).json({ error: 'member not found' });
				}
			}

			const status = member.presence?.status || 'unknown';
			const isOnline = status !== 'offline' && status !== 'unknown';
			return res.json({ isOnline });
		}
		catch (err) {
			return res.status(500).json({ error: err.message });
		}
	});

	app.post('/charge', (req, res) => {
		// Expect JSON body: { isCharging: boolean, batteryLevel: number }
		const body = req.body;
		if (
			!body ||
      typeof body.isCharging === 'undefined' ||
      typeof body.batteryLevel === 'undefined'
		) {
			return res
				.status(400)
				.json({ error: 'missing isCharging or batteryLevel in body' });
		}

		const isCharging = body.isCharging;
		const batteryLevel = Number(body.batteryLevel);

		if (typeof isCharging !== 'boolean') {
			return res.status(400).json({ error: 'isCharging must be boolean' });
		}

		if (
			!Number.isFinite(batteryLevel) ||
      batteryLevel < 0 ||
      batteryLevel > 100 ||
      !Number.isInteger(batteryLevel)
		) {
			return res
				.status(400)
				.json({ error: 'batteryLevel must be an integer between 0 and 100' });
		}

		try {
			iphoneChargeEvent(isCharging, batteryLevel);
		}
		catch (err) {
			return res.status(500).json({ error: err.message });
		}

		return res.json({ status: 'charge event processed' });
	});

	return {
		start: (port) =>
			new Promise((resolve) => {
				const listenPort = port || bot.port || 3000;
				app.listen(listenPort, () => {
					console.log(`Web server listening on port ${listenPort}`);
					resolve();
				});
			}),
		app,
	};
}

module.exports = createWebServer;
