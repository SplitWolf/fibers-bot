import { Client, CommandInteraction, CacheType, InteractionResponse, SlashCommandBuilder } from 'discord.js';
import { Utils } from '../../utils/utils';
import { Command } from "../base";



export class skip extends Command {
    constructor() {
        const data = new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the the currently playing song.')
        super(data)
    }
    execute(client: Client<boolean>, interaction: CommandInteraction<CacheType>): Promise<InteractionResponse<boolean>> {
        let subscription = Utils.subscriptions.get(interaction.guildId)
        if (subscription) {
            subscription.audioPlayer.stop();
            return interaction.reply({ content: `Skipped!`, ephemeral: true });
        } else {
            return interaction.reply('Not playing in this server!');
        }
    }
}