import { PermissionResolvable, CommandInteraction, Client, SlashCommandBuilder, InteractionResponse, PermissionsBitField } from "discord.js";

// Command Base Class
export abstract class Command {
  data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> //SlashCommanderBuilderTypes
  userPermissions?: PermissionResolvable[]

  constructor(data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">, userPermissions?: PermissionResolvable[]) {
    this.data = data;
    this.userPermissions = userPermissions ? userPermissions : null;
  }

  /**
   *
   * @param interaction Interaction to check permissions for.
   */
  hasPermission(interaction: CommandInteraction): boolean {
    if (this.userPermissions != null) {
      const hasPerms = (interaction.member
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
  ): Promise<InteractionResponse<boolean>>;
}
