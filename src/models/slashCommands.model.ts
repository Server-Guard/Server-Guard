import { Channel, Guild, GuildMember, User } from "discord.js";
import { DiscordClient } from "../client";
import { Object } from "./shared.model";

export interface SlashCommandOptions {
  name: string;
  description: string;
  options?: any[];
}

export interface SlashCommandResponse {
  ephemeral?: boolean;
  content?: string;
  embed?: any;
  embeds?: any[];
  component?: any;
  components?: any[];
  attachments?: any[];
}

export interface SlashCommand {
	name: string,
	description: string,
	options?: any[],
	execute: slashCommandCallback
}

export class SlashCommandInteraction {
  arguments: Object<string>;

  channel: Channel;
  guild: Guild;
  member: GuildMember;
  user: User;
  id: string;
  token: string;
  name: string;
  createdAt: number;
  author: User;
  private ephemeralMessage: boolean;
  constructor(interaction, public client: DiscordClient) {
    this.createdAt = new Date().getTime();
    this.guild = this.client.guilds.resolve(interaction.guild_id);
    this.channel = this.guild.channels.resolve(interaction.channel_id);
    this.user = this.client.users.resolve(interaction.member.user.id);
    this.member = this.guild.members.resolve(interaction.member.id);
    this.token = interaction.token;
    this.id = interaction.id;
    this.arguments = interaction.data.options?.reduce(
      (acc, cur) => ({ ...acc, [cur.name]: cur.value }),
      {}
    );
    this.name = interaction.data.name;
    this.author = this.user;
  }

  async reply(data: SlashCommandResponse | string) {
    if (typeof data === "string") data = { content: data };

    const newData = {
      embeds:
        data.embeds || data.embed ? [...(data.embeds || []), data.embed] : null,
      // components: [...(data.components || []), data.component],
      flags: this.ephemeralMessage || data.ephemeral ? 64 : null,
      content: data.content,
      attachments: data.attachments,
    };
    await this.client._api.interactions(this.id, this.token).callback.post({
      data: {
        type: 4,
        data: newData,
      },
    });
  }

  ephemeral() {
    this.ephemeralMessage = true;
    return this;
  }
}

export type slashCommandCallback = (
  interaction: SlashCommandInteraction,
  client: DiscordClient
) => Promise<void> | void;
