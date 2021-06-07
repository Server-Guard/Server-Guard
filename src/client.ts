import { Client, ClientOptions } from 'discord.js';

import { Object } from './models/shared.model';
import { slashCommandCallback, SlashCommandInteraction, SlashCommandOptions } from './models/slashCommands.model';
import { log } from './utils/functions/logging';

export class DiscordClient extends Client {
  slashCommands: Object<slashCommandCallback>;
  commands: Object<any>;
  prefix: string;
  settings: any;
  leveling: any;
  logging: any;
  listeners: any;
  constructor(options?: ClientOptions) {
    super(options);
    this.slashCommands = {};
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
      const interactionObject = new SlashCommandInteraction(interaction, this);

      this.slashCommands[interactionObject.name](interactionObject, this);
    });
  }
}
