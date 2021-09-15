import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Command } from "./base";


export class ping extends Command {
    constructor() {
        const data = new SlashCommandBuilder().setName('ping').setDescription('Replies with pong and response time.')
        super(data)
    }
    execute(interaction: CommandInteraction): Promise<void> {
        return interaction.reply(`Pong! \`${Math.abs(
            Date.now() - new Date(interaction.createdAt).getTime()
        )}ms\``);
    }
}
