import { Command } from "../base";
import { Client, CommandInteraction, CacheType, InteractionResponse, SlashCommandBuilder, GuildMember, AttachmentBuilder, EmbedBuilder } from "discord.js";
import { HypixelApi } from '../../utils/apis/hypixelapi'
import { MojangApi } from '../../utils/apis/mojangapi'
import { Utils } from '../../utils/utils';



export class hypixel extends Command {
    constructor() {
        const data = new SlashCommandBuilder()
        .setName('hypixel')
        .setDescription('Gives some hypixel stats for the provided minecraft user name')
        .addStringOption(option => 
			option.setName('username')
			.setDescription('The minecraft IGN (In-game Name) you want to look up.')
			.setRequired(true))
        super(data);
    }

    async execute(client: Client<boolean>, interaction: CommandInteraction<CacheType>): Promise<InteractionResponse<boolean>> {
        const mjApi = new MojangApi
        const hpApi = new HypixelApi
        const ign = interaction.options.get('username')!.value! as string
        const logo = new AttachmentBuilder(
            './src/utils/Hypixel.jpg',
            {name: 'hypixel.jpg'}
        );
        let embed = null

        mjApi.getUUUID(ign, (data: any) => {
            if(data.succes !== true) {
                hpApi.getUser(data.id, (userData: any) => {
                    const duelStats = userData.player.stats.Duels;
                    embed = new EmbedBuilder()
                        .setAuthor(
                            {name: `${
                                userData.player.displayname
                            } | LVL: ${this.getNetworkLevel(
                                userData.player.networkExp
                            )} | Rank: [${Utils.getRank(userData)}]`
                            }
                        )
                        .setDescription('Stats on Hypixel')
                        .setColor('#00e0dc')
                        .setThumbnail('attachment://hypixel.jpg')
                        .addFields({name: '**Bewars Wins**', value: `**${Utils.noUndef(
                            userData.player.stats.Bedwars.wins_bedwars
                        )}**`, inline: true}, 
                        {name: '**Bedwars Total Kills**',value: `**${Utils.noUndef(
                            userData.player.stats.Bedwars.kills_bedwars,
                            userData.player.stats.Bedwars.final_kills_bedwars
                        )}**`,inline: true},
                        {name: '**Skywars Wins**',value: `**${Utils.noUndef(userData.player.stats.SkyWars.wins)}**`,inline: true},
                        {name: '**Skywars Kills**',value: `**${Utils.noUndef(userData.player.stats.SkyWars.kills)}**`,inline: true},
                        {name: '**Bridge Wins**',value: `**${Utils.noUndef(
                            duelStats.bridge_duel_wins,
                            duelStats.bridge_doubles_wins,
                            duelStats.bridge_2v2v2v2_wins,
                            duelStats.bridge_3v3v3v3_wins,
                            duelStats.bridge_four_wins
                        )}**`,inline: true},
                        {name: '**Bridge Kills**',value: `**${Utils.noUndef(duelStats.bridge_kills)}**`,inline: true},
                        {name: '**Arcade Wins**',value: `**${Utils.noUndef(
                            userData.player.stats.Arcade.wins_simon_says,
                            userData.player.stats.Arcade.sw_game_wins,
                            userData.player.stats.Arcade.wins_mini_walls,
                            userData.player.stats.Arcade.wins_soccer,
                            userData.player.stats.Arcade.wins_grinch,
                            userData.player.stats.Arcade.wins_party,
                            userData.player.stats.Arcade.wins_party_2,
                            userData.player.stats.Arcade.wins_party_3,
                            userData.player.stats.Arcade.wins_dayone,
                            userData.player.stats.Arcade.wins_ender,
                            userData.player.stats.Arcade.wins_buildbattle,
                            userData.player.stats.Arcade.wins_buildbattle_teams,
                            userData.player.stats.Arcade.wins_hole_in_the_wall,
                            userData.player.stats.Arcade.wins_oneinthequiver,
                            userData.player.stats.Arcade.wins_farm_hunt,
                            userData.player.stats.Arcade.wins_throw_out,
                            userData.player.stats.Arcade.wins_dragonwars2
                        )}**`,inline: true},
                        )
                })
            }
        })
        return interaction.reply({content: '', embeds: embed, files: [logo], ephemeral: true});
    }

    getNetworkLevel(networkExp: number) {
        const BASE = 10000;
        const GROWTH = 2500;
        const REVERSE_PQ_PREFIX = -(BASE - 0.5 * GROWTH) / GROWTH;
        const REVERSE_CONST = REVERSE_PQ_PREFIX ^ 2;
        const GROWTH_DIVIDES_2 = 2 / GROWTH;
        return networkExp < 0
            ? 1
            : Math.floor(
                1 +
                REVERSE_PQ_PREFIX +
                Math.sqrt(REVERSE_CONST + GROWTH_DIVIDES_2 * networkExp)
            );
    }
};