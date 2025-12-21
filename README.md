This is a random bot I started working on to improve my Discord server as well as connect my Discord with my website by sending certain data over an API for my website to fetch.
It's nothing impressive, just something I lazily put together for funs sake and since I haven't done Discord development in a loooong while. Feel free to steal the code for something you're working on or improve on it.

As of writing this, it runs on Discord.JS v14.25.x.

# Setup:

To setup and prepare the bot, create a copy of the example.env file and rename it to .env.

In here, paste your bot token from the Discord Developer Portal and ensure that all 3 intents are enabled for the bot.

Copy and paste the example.config.json and rename it to config.json. Then fill out these with:
- `guildId`: The Server ID of your Discord Server
- `memberCount`: The channel you want the bot to keep up to date with your server count. (The bot will rename a channel with 🧑‍💻 Member Count: x)
- `lastMember`: The channel you want the bot to keep up to date with your last joined member name. (The bot will rename a channel with ❤️ Last Member: x)
- `iphoneAnnouncements`: The channel where the bot will drop your iPhone charging announcements (if API endpoint is used).
- `userId`: YOUR Discord User ID
- `activity`: The text the bot will show under it's activity.

# Local testing:

```bash
npm install && npm run start
```

# Docker:

Build and run the docker image:

```bash
docker build -t discord-bot . && docker run -d --name discord_bot --env-file .env -p 5050:5050 discord-bot
```

# API

To view the API endpoint's and some examples of how to use it, download Bruno and open the folder inside of the bruno folder.
- The "Active" endpoint is used to check whether the user specified in the config.json is currently online on discord. Returns true if online or false if offline.
- The "Ping" endpoint just returns OK if the API is responsive.
- The "iPhone Charging State" endpoint can be used in an iPhone Shortcut to make it send a message in a channel when you start charging your phone and/or unplug it, by sending a POST request with the battery state and a boolean if its charging or not.