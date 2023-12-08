import { APIEmbedField, Client, CommandInteraction, EmbedBuilder, InteractionResponse, SlashCommandBuilder } from "discord.js";
import { Command } from "../base";

export class clash extends Command {
    constructor() {
        const data = new SlashCommandBuilder()
        .setName('clash')
        .setDescription('Allows you to search for a clash team and give op.gg multi-link')
        .addStringOption(option =>
            option.setName('summoner_name')
            .setDescription('The summoners clash team to search for.')
            .setRequired(true)
        )
        super(data)
    }
    private api_key= process.env.RIOT_API_KEY
    private api_header = "X-Riot-Token"
    private api_base_url = "https://na1.api.riotgames.com/lol/"
    async execute(client: Client, interaction: CommandInteraction): Promise<InteractionResponse<boolean>> {




        const summonerName: string = interaction.options.get('summoner_name')!.value! as string;

        let clashTeam: clashTeam 
        = (await this.getClashTeam((
            await this.getClashPlayer((
                await this.getSummonerInfoByName(summonerName))
                .id)
                ).teamId)
            );

        const clashPlayers: clashPlayer[] = clashTeam.players;

        let summoners: summonerInfo[] = new Array(5);
        let summonerNames: string[] = new Array(5);
        for (let i = 0; i < clashPlayers.length; i++) {
            const clashPlayer = clashPlayers[i];
            if(clashPlayer.position == "UTILITY") {
                clashPlayer.position = "SUPPORT"
            }
            summoners[i] = await this.getSummonerInfoById(clashPlayer.summonerId);
            summonerNames[i] = summoners[i].name;
        }
        let opgg = "https://na.op.gg/multisearch/na?summoners="
        let names = ""
        summonerNames.forEach(summonerName => {
            opgg += summonerName + "%2C"
            names += summonerName + ", "
        });
        opgg = opgg.replace(" ", '%20')

        let fields: APIEmbedField[] = [];
        for (let index = 0; index < clashPlayers.length; index++) {
            const element = clashPlayers[index];
                fields.push({name: `Player ${index+1}: ` + element.position, value: summonerNames[index]})           

        }

        const embedTosend = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("[" + clashTeam.abbreviation.toUpperCase() + "] " + clashTeam.name.toUpperCase())
        .setURL(opgg)
        .addFields(
            fields
            )


            //content: names + "\n" +opgg, 
        return interaction.reply({embeds:[embedTosend]})
        
    }
    async getSummonerInfoByName(name: string): Promise<summonerInfo>{
        const headers: Headers = new Headers()
        headers.set('Content-Type','application/json')
        headers.set(this.api_header,this.api_key)

        const request: RequestInfo = new Request(this.api_base_url + `summoner/v4/summoners/by-name/${name}`,{
            method: 'GET',
            headers: headers
        })

        const res = await fetch(request);
        const res_1 = await res.json();
        return res_1 as summonerInfo;
    }
    async getSummonerInfoById(id: string): Promise<summonerInfo>{
        const headers: Headers = new Headers()
        headers.set('Content-Type','application/json')
        headers.set(this.api_header,this.api_key)

        const request: RequestInfo = new Request(this.api_base_url + `summoner/v4/summoners/${id}`,{
            method: 'GET',
            headers: headers
        })

        const res = await fetch(request);
        const res_1 = await res.json();
        return res_1 as summonerInfo;
    }
    async getClashPlayer(summonerId: string): Promise<clashPlayer>{
        const headers: Headers = new Headers()
        headers.set('Content-Type','application/json')
        headers.set(this.api_header,this.api_key)

        const request: RequestInfo = new Request(this.api_base_url + `clash/v1/players/by-summoner/${summonerId}`,{
            method: 'GET',
            headers: headers
        })

        const res = await fetch(request);
        const res_1 = await res.json();
        return res_1[0] as clashPlayer;
    }
    async getClashTeam(teamId: string): Promise<clashTeam>{
        const headers: Headers = new Headers()
        headers.set('Content-Type','application/json')
        headers.set(this.api_header,this.api_key)
        

        const request: RequestInfo = new Request(this.api_base_url + `clash/v1/teams/${teamId}`,{
            method: 'GET',
            headers: headers
        })

        const res = await fetch(request);
        const res_1 = await res.json();
        return res_1 as clashTeam;
    }
    

}

interface summonerInfo {
    id: string
    accountId: string
    puuid: string
    name: string
    profileIconId: Number
    revisionDate: Number
    summonerLevel: Number
}

interface clashPlayer {
    summonerId: string
    teamId: string
    position: string
    role: string
}

interface clashTeam {
    id: string
    tournamentId: Number
    name: string
    iconId: Number
    tier: Number
    captain: string
    abbreviation: string
    players: clashPlayer[]
}