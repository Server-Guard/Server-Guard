import { SlashCommand } from "../models/slashCommands.model";

const ping: SlashCommand = {
	name: "ping",
	description: "ping the bot",
	execute: (interaction) => {
		interaction.reply(":ping_pong: Pong")
	}
}

export default ping