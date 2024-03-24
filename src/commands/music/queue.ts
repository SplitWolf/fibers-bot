import {
	AudioPlayerStatus,
	AudioResource,
	entersState,
	joinVoiceChannel,
	VoiceConnectionStatus,
} from '@discordjs/voice';
import { Client, CommandInteraction, CacheType, InteractionResponse, SlashCommandBuilder } from 'discord.js';
import { Command } from "../base";
import { Utils } from "../../utils/utils"
import { Track } from "../../utils/music/track"


export class queue extends Command {
    constructor() {
        const data = new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Gets the music queue for the server.')
        super(data)
    }
    execute(client: Client<boolean>, interaction: CommandInteraction<CacheType>): Promise<InteractionResponse<boolean>> {
        let subscription = Utils.subscriptions.get(interaction.guildId!)
        if (subscription) {
            const current =
                subscription.audioPlayer.state.status === AudioPlayerStatus.Idle
                    ? `Nothing is currently playing!`
                    : `Playing **${(subscription.audioPlayer.state.resource as AudioResource<Track>).metadata.title}**`;
    
            const queue = subscription.queue
                .slice(0, 5)
                .map((track, index) => `${index + 1}) ${track.title}`)
                .join('\n');
    
            return interaction.reply(`${current}\n\n${queue}`);
        } else {
            return interaction.reply('Not playing in this server!');
        }
    }
    
}