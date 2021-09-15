import * as fs from 'fs'
import { Client, Intents, Interaction, Permissions, Collection } from 'discord.js';
import * as glob from 'glob';
import { Command } from './commands/base';
require('dotenv').config();

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const commands = new Collection<String, Command>();
let commandFiles: string[];

glob(__dirname + "/commands/**/*", (err, res) => {
	if (err) {
		console.log(err)
	} else {
		commandFiles = res.filter(file => file.endsWith('.ts'));
		commandFiles = commandFiles.filter(file => !file.includes('base'));
		(async () => {
			for (const file of commandFiles) {
				const cmdImp = await import(file)
				if (Object.keys(cmdImp).length !== 0) {
					const cmd: Command = new cmdImp[Object.keys(cmdImp)[0].toString()];
					commands.set(cmd.data.name, cmd)
				}
			}
		})();
	}
})

// When the client is ready, run this code (only once)
client.once('ready', () => {

	console.log("-----------------------------------------------------------");
	console.log(
		`Logged in as ${client.user.username}#${client.user.discriminator} running version 2.0.0`
	);
	client.user.setActivity({ name: "/help", type: "LISTENING" });
	console.log(`${client.user.username} is on ${client.guilds.cache.size} server(s)!`);
	console.log("-----------------------------------------------------------");
});

client.on("interactionCreate", async (interaction: Interaction) => {
	if (!interaction.isCommand()) return;

	const command = commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
})


// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN);