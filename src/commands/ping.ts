import { SlashCommand } from "../models/slashCommands.model";

const ping: SlashCommand = {
	name: "ping",
	description: "ping the bot",
	execute: (interaction) => {
		interaction.reply(":pong: Pong")
	}
}