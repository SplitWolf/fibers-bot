import { Client, CommandInteraction, CacheType, InteractionResponse, SlashCommandBuilder } from 'discord.js';
import { Utils } from '../../utils/utils';
import { Command } from "../base";

export class leave extends Command {
    constructor() {
        const data = new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Stops the the bot playing songs.')
        super(data)
    }
    execute(client: Client<boolean>, interaction: CommandInteraction<CacheType>): Promise<InteractionResponse<boolean>> {
        let subscription = Utils.subscriptions.get(interaction.guildId)
        if (subscription) {
            subscription.stop()
            //TODO: Fix connection destruction no re-creation bug

            subscription.voiceConnection.disconnect()
            subscription.voiceConnection.destroy()
            return interaction.reply({ content: `Stopped!`, ephemeral: true });
        } else {
            return interaction.reply('Not playing in this server!');
        }
    }
}