import { client } from "./initClient";
import { DiscordEvent } from "./models/event.enum";
import path from "path";
import { SlashCommand } from "./models/slashCommands.model";
import fs from "fs";
import { walkSync } from "./utils/functions/walk";

const slashCommandPath = path.join(__dirname, "slashCommands");
const slashCommandFiles = walkSync(
    fs.readdirSync(slashCommandPath),
    slashCommandPath
).filter((file) => file.name.endsWith(".js"));
const slashCommands: SlashCommand[] = slashCommandFiles.map(
    (command) => require(command.path).default
);

client.on(DiscordEvent.READY, () => {
    for (const { execute, ...command } of slashCommands) {
        client.registerSlashCommand(command, execute);
    }
    client.slashCommandHandler();
});
