import { Client, CommandInteraction, CacheType, InteractionResponse, SlashCommandBuilder } from 'discord.js';
import { Utils } from '../../utils/utils';
import { Command } from "../base";



export class resume extends Command {
    constructor() {
        const data = new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resumes the the currently playing song.')
        super(data)
    }
    execute(client: Client<boolean>, interaction: CommandInteraction<CacheType>): Promise<InteractionResponse<boolean>> {
        let subscription = Utils.subscriptions.get(interaction.guildId)
        if (subscription) {
            subscription.audioPlayer.unpause();
            return interaction.reply({ content: `Resumed!`, ephemeral: true });
        } else {
            return interaction.reply('Not playing in this server!');
        }
    }
}