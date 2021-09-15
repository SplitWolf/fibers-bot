import { SlashCommandBuilder } from "@discordjs/builders";
import { PermissionResolvable, CommandInteraction, Permissions } from "discord.js";

// Command Base Class
export abstract class Command {
  data: SlashCommandBuilder
  userPermissions?: PermissionResolvable[]

  constructor(data: SlashCommandBuilder, userPermissions?: PermissionResolvable[]) {
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
        .permissions as Permissions).has(this.userPermissions) 
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
   * @param interaction the Command Interaction Event
   */

  abstract execute(
    interaction: CommandInteraction
  ): Promise<void>;
}
