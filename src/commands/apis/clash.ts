import { APIEmbedField, Client, CommandInteraction, EmbedBuilder, InteractionResponse, SlashCommandBuilder } from "discord.js";
import { Command } from "../base";

export class clash extends Command {
    constructor() {
        const data = new SlashCommandBuilder()
        .setName('clash')
        .setDescription('Allows you to search for a clash team and give op.gg multi-link')
        .addStringOption(option =>
            option.setName('game_name')
            .setDescription('The summoners clash team to search for.')
            .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('tag_line')
            .setDescription('Riot ID tag')
            .setRequired(true)
        )
        super(data)
    }
    private api_key= process.env.RIOT_API_KEY!
    private api_header = "X-Riot-Token"
    private api_base_url = "https://na1.api.riotgames.com/lol/"
    private americas_api_url = "https://americas.api.riotgames.com/riot/"

    async execute(client: Client, interaction: CommandInteraction): Promise<InteractionResponse<boolean>> {

        const gameName: string = interaction.options.get('game_name')!.value! as string;
        const tagLine: string = interaction.options.get('tag_line')!.value! as string;

        let account = await this.accountInfoByRiotID(gameName,tagLine);
        let summoner = await this.getSummonerInfoByPUUID(account.puuid);
        let clashPlayer = await this.getClashPlayer(summoner.id);
        let clashTeam: clashTeam = await this.getClashTeam(clashPlayer.teamId);

        const clashPlayers: clashPlayer[] = clashTeam.players;

        let players: string[] = new Array(5);

        for (let i = 0; i < clashPlayers.length; i++) {
            const clashPlayer = clashPlayers[i];
            if(clashPlayer.position == "UTILITY") {
                clashPlayer.position = "SUPPORT"
            }
            let summoner = await this.getSummonerInfoById(clashPlayer.summonerId);
            let account = await this.accountInfoByPUUID(summoner.puuid);
            players[i] = account.gameName+"#"+account.tagLine;
        }
        let opgg = "https://na.op.gg/multisearch/na?summoners="
        players.forEach(player => {
            opgg += player + "%2C"
        });
        console.log(opgg);
        opgg = opgg.replaceAll(" ", '%20');
        opgg = opgg.replaceAll("#", '%23');
        console.log(opgg);


        let fields: APIEmbedField[] = [];
        for (let index = 0; index < clashPlayers.length; index++) {
            const element = clashPlayers[index];
                fields.push({name: `Player ${index+1}: ` + element.position, value: players[index]})           

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
    async accountInfoByRiotID(gameName: string, tagLine: string): Promise<riotAccountData> {
        const headers: Headers = new Headers()
        headers.set('Content-Type','application/json')
        headers.set(this.api_header,this.api_key)
     
        const request: RequestInfo = new Request(this.americas_api_url + `account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,{
            method: 'GET',
            headers: headers
        })

        const res = await fetch(request);
        const response_json = await res.json();
        return response_json as riotAccountData;
    }
    async accountInfoByPUUID(puuid: string): Promise<riotAccountData> {
        const headers: Headers = new Headers()
        headers.set('Content-Type','application/json')
        headers.set(this.api_header,this.api_key)
     
        const request: RequestInfo = new Request(this.americas_api_url + `account/v1/accounts/by-puuid/${puuid}`,{
            method: 'GET',
            headers: headers
        })

        const res = await fetch(request);
        const response_json = await res.json();
        return response_json as riotAccountData;
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

    async getSummonerInfoByPUUID(puuid: string): Promise<summonerInfo> {
        const headers: Headers = new Headers()
        headers.set('Content-Type','application/json')
        headers.set(this.api_header,this.api_key)

        const request: RequestInfo = new Request(this.api_base_url + `summoner/v4/summoners/by-puuid/${puuid}`,{
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


interface riotAccountData {
    puuid: string,
    gameName: string,
    tagLine: string
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