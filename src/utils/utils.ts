import { Snowflake } from "discord.js";
import { MusicSubscription } from "./music/subscription";


export class Utils {
  constructor() {}

  public static subscriptions: Map<Snowflake, MusicSubscription>;
  

  public static noUndef(...args: any[]) {
    let final = 0;
    for(let i =0; i < args.length; i++) {
      if(args[i] !== undefined) {
        final += args[i];
      }
    }
    return final;
  }

  public static getRank(data: any) {
    if(data.player.monthlyPackageRank === undefined) {
      if (data.player.newPackageRank === undefined) {
        return 'Default';
      }
      return this.translateRank(data.player.newPackageRank);
    }
    return this.translateRank(data.player.monthlyPackageRank);
  }

  private static translateRank(key: String) {
    switch(key) {
      case 'VIP':
        return 'VIP';
      case 'VIP_PLUS':
        return 'VIP+';
      case 'MVP':
        return 'MVP';
      case 'MVP_PLUS':
        return 'MVP+';
      case 'SUPERSTAR':
        return 'MVP++';
    }
  }

 
  
}