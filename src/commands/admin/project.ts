import { CategoryChannel, ChannelType, ChatInputCommandInteraction, Client, CommandInteraction, Guild, InteractionResponse, OverwriteType, PermissionFlagsBits, Role, SlashCommandBuilder, User } from "discord.js";
import { Command } from "../base";


export class project extends Command {
    constructor() {
        const data = new SlashCommandBuilder()
        .setName('project')
        .setDescription('Sets up channels for development projects.')
        .addSubcommand(createSub =>  createSub
            .setName('create')
            .setDescription('Creates the channels')
            .addStringOption(option => option.setName('project_name').setDescription('The name of the project').setRequired(true))
            .addRoleOption(option => option.setName('project_role').setDescription('The role for users of the project').setRequired(false))
        )
        .addSubcommand(deleteSub =>
            deleteSub
            .setName('remove')
            .setDescription('Removes the channels')
            .addStringOption(option => option.setName('project_name').setDescription('The name of the project').setRequired(true))
        )

        super(data, [
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageRoles,
        ])
    }
    async execute(client: Client, interaction: CommandInteraction): Promise<InteractionResponse<boolean> | null> {
        if(!interaction.isChatInputCommand) return null;
        const interactionCmd = interaction as ChatInputCommandInteraction;
        //@ts-ignore
        switch(interactionCmd.options.getSubcommand()) {
            case 'create':
                return this.createChannels(interactionCmd);
            case 'remove':
                return this.deleteChannels(interactionCmd);
            default:
                // Should never be reached
                return null;
        }
       //interaction.deferReply();
    }
    //TODO: Permission checks
    //TODO: Delete custom role


    async createChannels(interaction: ChatInputCommandInteraction) {
        const name = interaction.options.getString('project_name')!;
        const role = interaction.options.getRole('project_role');
        const guild = interaction.guild!;
    
        
        if(role == undefined) {
            guild.roles.fetch().then(roles => {
                let existingRole = roles.find(role => role.name == name)
                if(existingRole != undefined) {
                    console.log('Role found: '+ existingRole.name + ": " + existingRole.id)
                    this.buildChannels(guild,name,existingRole);
                } else {
                    guild.roles.create({name: name}).then(role => this.buildChannels(guild, name, role))
                }
            })
        } else {
            this.buildChannels(guild,name,role as Role);
        }
        
       return interaction.reply({content: `Setting up channels for project: ${name}`, ephemeral: true});
    }
    

    async buildChannels(guild: Guild, name: string,  role: Role) {
        let everyonePerms =  {
            id: guild.roles.everyone.id,
            deny: [
                PermissionFlagsBits.ViewChannel, 
                PermissionFlagsBits.SendMessages, 
                PermissionFlagsBits.SendMessagesInThreads,
                PermissionFlagsBits.CreatePublicThreads,
                PermissionFlagsBits.CreatePrivateThreads,
                PermissionFlagsBits.MentionEveryone,
                PermissionFlagsBits.UseEmbeddedActivities,     
                PermissionFlagsBits.Connect,
                PermissionFlagsBits.Speak,
                PermissionFlagsBits.Stream,
            ]
        };
        guild.channels.create({name: name, type: ChannelType.GuildCategory, permissionOverwrites: [
            everyonePerms,
            {
                id: role.id,
                allow: [
                    PermissionFlagsBits.ViewChannel
                ],
                type: OverwriteType.Role
            }
        ]}).then(category => {
            category.children.create({name: 'project-info', type: ChannelType.GuildText, permissionOverwrites: [
                everyonePerms,
                {
                    id: role.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessagesInThreads,
                    ],
                    type: OverwriteType.Role
                }
            ]});
            category.children.create({name: 'project-discussion', type: ChannelType.GuildText, permissionOverwrites: [
                everyonePerms,
                {
                    id: role.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.SendMessagesInThreads,
                        PermissionFlagsBits.CreatePublicThreads,
                        PermissionFlagsBits.MentionEveryone,
                    ],
                    type: OverwriteType.Role
                }
            ]});
            category.children.create({name: 'git-updates', type: ChannelType.GuildText, permissionOverwrites: [
                everyonePerms,
                {
                    id: role.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessagesInThreads,
                        PermissionFlagsBits.CreatePublicThreads,
                    ],
                    type: OverwriteType.Role
                }
            ]});
            category.children.create({name: 'Project Talk', type: ChannelType.GuildVoice, permissionOverwrites: [
                everyonePerms,
                {
                    id: role.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.SendMessagesInThreads,
                        PermissionFlagsBits.CreatePublicThreads,
                        PermissionFlagsBits.MentionEveryone,
                        PermissionFlagsBits.Connect,
                        PermissionFlagsBits.Speak,
                        PermissionFlagsBits.Stream
                    ],
                    type: OverwriteType.Role
                }
            ]})
        })
    }

    async deleteChannels(interaction: ChatInputCommandInteraction) {
        const name = interaction.options.getString('project_name');
        const guild = interaction.guild!;

        guild.roles.fetch().then(roles => {
            let role = roles.find(role => role.name == name)
            if(role != undefined) {
                role.delete();
            } else {
                //TODO: Fix wording
                interaction.channel!.send({ content: 'Custom role was used manually deletion required if wanted.'})
            }
        })

        guild.channels.fetch().then(channels => {
            let namedChannels = channels.filter(channel =>  channel!.name == name);
                //console.log(channel.name + ": " + channel.id + "\nName: " + name + "\nDebug info: " + (channel.name == name));
                
            let category: CategoryChannel;
            namedChannels.forEach(channel => {
                if(channel!.type == ChannelType.GuildCategory) {
                    category = channel!;
                }
            });
            if(category! != undefined) {
                let toDelete = channels.filter(channel => channel!.parentId == category.id)
                toDelete.forEach(channel => channel!.delete());
                category.delete();
            }
            
        })

        return interaction.reply({content: `Removed project: ${name}`, ephemeral: true});
    }
}

