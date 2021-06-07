import { Role } from "discord.js";

export interface User {
	uid: string,
	displayName: string,
	username: string,
	avatar: string,
}

export interface DiscordUser {
	discordId: string,
	avatar: string,
	roles: Role[],
	name: string,
	nickname: string,
}

export interface GuildUser {
	name: string,
	nickname: string,
	verified: boolean,
	id: string,
}