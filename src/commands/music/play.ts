import {
	AudioPlayerStatus,
	entersState,
	joinVoiceChannel,
	VoiceConnectionStatus,
} from '@discordjs/voice';
import { Client, CommandInteraction, CacheType, InteractionResponse, SlashCommandBuilder, GuildMember } from 'discord.js';
import { Command } from "../base";
import { MusicSubscription } from "../../utils/music/subscription"
import { Track } from "../../utils/music/track"
import { Utils } from "../../utils/utils"

export class play extends Command {
	constructor() {
		const data = new SlashCommandBuilder()
		.setName('play')
		.setDescription('Adds a song to the queue. Starts playing the queue if it is not already.')
		.addStringOption(option => 
			option.setName('song')
			.setDescription('The song you want to play!')
			.setRequired(true)
			)
		super(data)
	}

	async execute(client: Client<boolean>, interaction: CommandInteraction<CacheType>): Promise<InteractionResponse<boolean>> {
		// Get the guild's already active subscription if it exists.
		let subscription = Utils.subscriptions.get(interaction.guildId)
		// Defer the reply till later.
		await interaction.deferReply();
		// Get the song url or name
		// TODO: Implement check for Strings
		const url = interaction.options.get('song')!.value! as string
		// Subcription Creation
		if(!subscription) {
			// Check to make sure command is being used from a guild and that they are in a Voice Channel
			if(interaction.member instanceof GuildMember && interaction.member.voice.channel) {
				let channel = interaction.member.voice.channel
				subscription = new MusicSubscription(joinVoiceChannel({
					channelId: channel.id,
					guildId: channel.guildId,
					adapterCreator: channel.guild.voiceAdapterCreator,
				}))
				subscription.voiceConnection.on('error', console.warn)
				Utils.subscriptions.set(interaction.guildId, subscription)
			}
		} 
		// No voice channel to join
		if(!subscription) {
			await interaction.followUp('Join a voice channel and then try that again')
			return;
		}

		// Wait for connenction to be established
		try {
			await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 20e3)
		} catch (error) {
			console.warn(error);
			await interaction.followUp('Failed to join a voice channel wihtihn 20 seconds, please try again later!')
			return;
		}

		// Procces request, creating track
		try {
			const track = await Track.from(url, {
				onStart() {
					interaction.followUp({ content: 'Now playing!', ephemeral: true }).catch(console.warn);
				},
				onFinish() {
					interaction.followUp({ content: 'Now finished!', ephemeral: true }).catch(console.warn);
				},
				onError(error) {
					console.warn(error);
					interaction.followUp({ content: `Error: ${error.message}`, ephemeral: true }).catch(console.warn);
				},
			});
			subscription.enqueue(track)
			await interaction.followUp(`Enqueued ** ${track.title}**`)
		} catch (error) {
			console.warn(error)
			await interaction.followUp('Failed to play track, please try again later!')
		}
	}
}