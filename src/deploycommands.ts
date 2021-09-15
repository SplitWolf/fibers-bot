import * as REST from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import * as glob from "glob";
import { Command } from "./commands/base";
require("dotenv").config();
const commands: Object[] | any = [];

let toDelete = new Map<String, { commandId: string; guildId?: string }>();
let commandFiles: string[];

glob(__dirname + "/commands/**/*", async (err, res) => {
  if (err) {
    console.log(err);
  } else {
    commandFiles = res.filter((file) => file.endsWith(".ts"));
    commandFiles = commandFiles.filter((file) => !file.includes("base"));
	for (let index = 0; index < commandFiles.length; index++) {
		const cmdImp = await import(commandFiles[index]);
		if (Object.keys(cmdImp).length !== 0) {
			const cmd: Command = new cmdImp[Object.keys(cmdImp)[0].toString()]();
			commands.push(cmd.data.toJSON());
		}
	}
	deleteCommands("250357147903328257");
	commandsToAPI("250357147903328257");
  }
});

const rest = new REST.REST({ version: "9" }).setToken(process.env.BOT_TOKEN);

async function commandsToAPI(guildId: string) {
  try {
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        guildId
      ),
      { body: commands }
    );

    console.log("Successfully registered application commands.");
  } catch (error) {
    console.error(error);
  }
}

//TODO: Delete not exisiting commands __

async function getCommands(guildId?: string): Promise<
  {
    id: string;
    application_id: string;
    name: string;
    description: string;
    version: string;
    default_permission: Boolean;
    type: number;
    guild_id: string;
  }[]
> {
  //	return console.log(await client.application.commands.fetch("", { guildId: "250357147903328257" }))
  let commandList;

  if (guildId != null) {
    commandList = (await rest.get(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId)
    )) as {
      id: string;
      application_id: string;
      name: string;
      description: string;
      version: string;
      default_permission: Boolean;
      type: number;
      guild_id: string;
    }[];
    //return;
  } else {
    commandList = (await rest.get(
      Routes.applicationCommands(process.env.CLIENT_ID)
    )) as {
      id: string;
      application_id: string;
      name: string;
      description: string;
      version: string;
      default_permission: Boolean;
      type: number;
      guild_id: string;
    }[];
  }
  return commandList;
}

async function deleteCommands(guildId?: string) {
  const commandList = await getCommands("250357147903328257");

  for (let i = 0; i < commandList.length; i++) {
    let del = true;
    for (let j = 0; j < commands.length; j++) {
      if (commands[j].name == commandList[i].name) {
        del = false;
      }
    }
    if (del == true) {
      !toDelete.has(commandList[i].id)
        ? toDelete.set(commandList[i].name, {
            commandId: commandList[i].id,
            guildId: commandList[i].guild_id,
          })
        : null;
    }
  }
  if(guildId != null) {
	toDelete.forEach(async command => {
		try {
			await rest.delete(
			  Routes.applicationGuildCommand(
				"579482898063687681",
				guildId,
				command.commandId
			  )
			);
			console.log("Successfully deleted application guild command.");
		  } catch (error) {
			console.error(error);
		  }
	});
  } else {
	toDelete.forEach(async command => {
		try {
			await rest.delete(
			  Routes.applicationCommand(
				"579482898063687681",
				command.commandId
			  )
			);
			console.log("Successfully deleted application command.");
		  } catch (error) {
			console.error(error);
		  }
	});
  }
}

async function pushOneCommand(guildId: string) {
	let cmdImp = await import(__dirname + "/commands/ping")
	let cmd = new cmdImp[Object.keys(cmdImp)[0].toString()]()
	let commands2 = [ cmd.data.toJSON() ];
	try {
		await rest.put(
		  Routes.applicationGuildCommands(
			process.env.CLIENT_ID,
			guildId
		  ),
		  { body: commands2 }
		);
	
		console.log("Successfully registered application guild command.");
	  } catch (error) {
		console.error(error);
	  }
}

//pushOneCommand("581681451213520926");
