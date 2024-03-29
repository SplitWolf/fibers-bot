import { Client, GatewayIntentBits, Interaction, Collection, ActivityType, InteractionType } from 'discord.js';
import glob  from 'glob';
import { Command } from './commands/base';
require('dotenv').config();


// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
let commands = new Collection<String, Command>();
let commandFiles: string[];
// Files to exculde from the command search because they are not commands
const excludes: string[] = ["base", "ratwisdom", "hypixel"];

loadCommands();

// When the client is ready, run this code (only once)
client.once('ready', () => {

	console.log("-----------------------------------------------------------");
	console.log(
		`Logged in as ${client.user!.username}#${client.user!.discriminator} running version 2.1.0`
	);
	client.user!.setActivity({ name: "/help", type: ActivityType.Listening });
	console.log(`${client.user!.username} is on ${client.guilds.cache.size} server(s)!`);
	console.log("-----------------------------------------------------------");
});

client.on("interactionCreate", async (interaction: Interaction) => {
	if (interaction.type !== InteractionType.ApplicationCommand) return;
	if (!interaction.isChatInputCommand()) return;

	const command = commands.get(interaction.commandName);

	if (!command) return;
//Add permission check before running command.
	try {
		if(command.hasPermission(interaction)) {
			await command.execute(client, interaction);
		} else {
			//TODO: Fix implementation to decode permission string
			interaction.reply(`You do not have the permissions: ${command.userPermissions} to run this command!`);
		}
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
})

function loadCommands() {
	console.log('Loading commands...')
	commands = new Collection<String, Command>();
	glob(__dirname + "/commands/**/*", (err, res) => {
		if (err) {
			console.log(err)
		} else {
			commandFiles = res.filter(file => file.endsWith(
				process.env.DEVELOPMENT == 'true' ? '.ts' : '.js'
			));
			commandFiles = commandFiles.filter((file) => !excludes.some((exclude) => file.includes(exclude)));
			(async () => {
				for (const file of commandFiles) {
					const cmdImp = await import(file)
					if (Object.keys(cmdImp).length !== 0) {
						// if(Object.keys(cmdImp)[0].toString() === "default")
						// 	continue;
						const cmd: Command = new cmdImp[Object.keys(cmdImp)[0].toString()];
						commands.set(cmd.data.name, cmd)
					}
				}
			})();
		}
	})
}

// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN);