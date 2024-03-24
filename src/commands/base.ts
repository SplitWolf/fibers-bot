import { PermissionResolvable, CommandInteraction, Client, SlashCommandBuilder, InteractionResponse, PermissionsBitField, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from "discord.js";

// Command Base Class
/**
 * Base class for all the bot's commands
 */
export abstract class Command {
  data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> | Omit<SlashCommandBuilder, "addBooleanOption" | "addUserOption" | "addChannelOption" | "addRoleOption" | "addAttachmentOption" | "addMentionableOption" | "addStringOption" | "addIntegerOption" | "addNumberOption"> //SlashCommanderBuilderTypes
  userPermissions?: PermissionResolvable[]

  /**
   * 
   * @param data The slash command builder for the command implementing this class.
   * @param userPermissions Permissions needed to use the command.
   */
  constructor(data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> | Omit<SlashCommandBuilder, "addBooleanOption" | "addUserOption" | "addChannelOption" | "addRoleOption" | "addAttachmentOption" | "addMentionableOption" | "addStringOption" | "addIntegerOption" | "addNumberOption">, userPermissions?: PermissionResolvable[]) {
    this.data = data;
    this.userPermissions = userPermissions ? userPermissions : undefined;
  }

  /**
   *
   * @param interaction Interaction to check permissions for.
   */
  hasPermission(interaction: CommandInteraction): boolean {
    if (this.userPermissions != null) {
      const hasPerms = (interaction.member!
        .permissions as PermissionsBitField).has(this.userPermissions) 
      if (hasPerms) {
        return true;
      }
      return false;
    } else {
      return true;
    }
  }
  /**
   * What to do when command is called.
   *
   * @param client the client for the bot
   * @param interaction the Command Interaction Event
   */

  abstract execute(
    client: Client,
    interaction: CommandInteraction
  ): Promise<InteractionResponse<boolean> | null> | null;
}

export abstract class Subcommand {
  public static data: SlashCommandSubcommandBuilder | SlashCommandSubcommandGroupBuilder
}