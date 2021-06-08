import { Client, ClientOptions } from "discord.js";

import { Object } from "./models/shared.model";
import {
    slashCommandCallback,
    SlashCommandInteraction,
    SlashCommandOptions,
} from "./models/slashCommands.model";
import { log } from "./utils/functions/logging";
import admin from "firebase-admin";
import { RootCollection } from "./models/collection.model";
import { Settings, settingsFactory } from "./models/settings.model";

export class DiscordClient extends Client {
    slashCommands: Object<slashCommandCallback>;
    commands: Object<any>;
    prefix: string;
    settings: Object<Settings & { rules: string }>;
    leveling: any;
    logging: any;
    listeners: any;

    constructor(options?: ClientOptions) {
        super(options);
        this.slashCommands = {};

        this.once("ready", () => {
            this.settings = {};
            for (const guild of this.guilds.cache.array()) {
                admin
                    .firestore()
                    .collection(RootCollection.GUILDS)
                    .doc(guild.id)
                    .onSnapshot((snapshot) => {
                        const data = snapshot.data();
						if(!data) return;
                        this.settings[guild.id] = {
                            ...data.settings,
                            rules: data.rules,
                        };
                    });
            }
        });

        this.on("guildCreate", (guild) => {
            const { owner } = guild;
            admin
                .firestore()
                .collection(RootCollection.GUILDS)
                .doc(guild.id)
                .set({
                    owner: owner
                        ? {
                              discordId: owner.id,
                              name: owner.user.username,
                              avatar: owner.user.displayAvatarURL(),
                              nickname: owner.nickname,
                              roles: owner.roles.cache
                                  .array()
                                  .map((role) => role?.id),
                          }
                        : {},
                    rules: "No Rules",
                    settings: settingsFactory(),
                });

            admin
                .firestore()
                .collection(RootCollection.GUILDS)
                .doc(guild.id)
                .onSnapshot((snapshot) => {
                    const data = snapshot.data();
                    this.settings[guild.id] = {
                        ...data.settings,
                        rules: data.rules,
                    };
                });
        });
    }

    get servers() {
        return this.guilds.cache.array().map((guild) => guild.id);
    }

    getSettings(serverId: string) {
        if (this.settings[serverId]) return this.settings[serverId];
        admin
            .firestore()
            .collection(RootCollection.GUILDS)
            .doc(serverId)
            .onSnapshot((snapshot) => {
                const data = snapshot.data();
                this.settings[serverId] = {
                    ...data.settings,
                    rules: data.rules,
                };
            });
        return this.settings[serverId];
    }

    get _api() {
        // @ts-ignore
        return this.api as any;
    }

    get application() {
        return this._api.applications(this.user.id);
    }

    getApp(guildId: string) {
        let app = this.application;
        if (guildId) {
            app = app.guilds(guildId);
        }
        return app;
    }

    async getSlashCommands(guildId: string) {
        return this.getApp(guildId).commands.get();
    }

    async registerSlashCommand(
        details: SlashCommandOptions,
        callback: slashCommandCallback
    ) {
        const guilds = this.guilds.cache.array();
        this.slashCommands[details.name] = callback;
        for (const guild of guilds) {
            try {
                await this.getApp(guild.id).commands.post({ data: details });
            } catch (err) {
                log(err, { error: true, writeToConsole: true });
            }
        }
    }

    slashCommandHandler() {
        this.ws.on("INTERACTION_CREATE" as any, async (interaction) => {
            if (interaction.type !== 2) return;
            const interactionObject = new SlashCommandInteraction(
                interaction,
                this
            );

            this.slashCommands[interactionObject.name](interactionObject, this);
        });
    }
}
