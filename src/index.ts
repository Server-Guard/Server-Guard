import { client } from "./initClient";
import { DiscordEvent } from "./models/event.enum";
import path from "path";
import { SlashCommand } from "./models/slashCommands.model";
import fs from "fs";
import { walkSync } from "./utils/functions/walk";
import { log } from "./utils/functions/logging";
import admin from "firebase-admin";
const serviceAccount = require("../key.json");

const eventPath = path.join(__dirname, "events");
const eventFiles = walkSync(fs.readdirSync(eventPath), eventPath).filter(
    (file) => file.name.endsWith(".js")
);
const events = {};

for (const eventFile of eventFiles) {
    const handler = require(eventFile.path).default;
    events[eventFile.name.replace(".js", "")] = handler;
}

const slashCommandPath = path.join(__dirname, "commands");

const slashCommandFiles = walkSync(
    fs.readdirSync(slashCommandPath),
    slashCommandPath
).filter((file) => file.name.endsWith(".js"));

const slashCommands: SlashCommand[] = slashCommandFiles.map(
    (command) => require(command.path).default
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

client.on(DiscordEvent.READY, () => {
    log("Bot Ready", { writeToConsole: true });
    for (const { execute, ...command } of slashCommands) {
        client.registerSlashCommand(command, execute);
    }
    client.slashCommandHandler();
    for (const [event, handler] of Object.entries(events)) {
        client.on(event as any, handler as any);
    }
});
