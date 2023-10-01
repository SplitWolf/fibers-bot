//@ts-nocheck
import { ChatInputCommandInteraction, Client, CommandInteraction, InteractionResponse, SlashCommandBuilder, User } from "discord.js";
import { Command } from "../base";


export class ban extends Command {
    constructor() {
        const data = new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans the user from the server.')
        .addUserOption(option => option.setName('user').setDescription('The user to kick').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason the user was banned'))
        super(data)
    }
    execute(client: Client, interaction: CommandInteraction): Promise<InteractionResponse<boolean>> {
        if(!interaction.isChatInputCommand) return;
        const interactionCmd = interaction as ChatInputCommandInteraction;
        const user: User = interactionCmd.options.getUser('user');
        const reason = interactionCmd.options.get('reason').toString();
        if(reason != '') {
            interactionCmd.guild.members.ban(user);
        } else {
            interactionCmd.guild.members.ban(user, {reason: reason});
        }
        return interactionCmd.reply({content: `${user.username} has been banned.`, ephemeral: true});
    }
}
