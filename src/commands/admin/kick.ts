import { ChatInputCommandInteraction, Client, CommandInteraction, InteractionResponse, PermissionFlagsBits, SlashCommandBuilder, User } from "discord.js";
import { Command } from "../base";


export class kick extends Command {
    constructor() {
        const data = new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks the user from the server.')
        .addUserOption(option => option.setName('target').setDescription('The user to kick').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason the user was kicked'))
        super(data, [
            PermissionFlagsBits.KickMembers
        ])
    }
    execute(client: Client, interaction: CommandInteraction): Promise<InteractionResponse<boolean>> | null {
        if(!interaction.isChatInputCommand) return null;
        //TODO: Check bot permissions
        const interactionCmd = interaction as ChatInputCommandInteraction;
        //@ts-ignore
        const user: User = interactionCmd.options.getUser('target');
        const reason = interactionCmd.options.get('reason')?.toString();
        if(reason != '') {
            interactionCmd.guild?.members.kick(user);
        } else {
            interactionCmd.guild?.members.kick(user, reason);
        }
        return interactionCmd.reply({content: `${user.username} has been kicked.`, ephemeral: true});
    }
}
