import { Client, CommandInteraction, InteractionResponse, SlashCommandBuilder } from "discord.js";
import { Command } from "./base";


export class ping extends Command {
    constructor() {
        const data = new SlashCommandBuilder().setName('ping').setDescription('Replies with pong and response time.')
        super(data)
    }
    execute(client: Client, interaction: CommandInteraction): Promise<InteractionResponse<boolean>> {
        return interaction.reply(`Pong! \`${new Date(interaction.createdAt).getTime() -  Date.now()}ms\``);
    }
}
