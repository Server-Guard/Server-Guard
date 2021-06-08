import { DiscordClient } from "./client";
import { env } from "./utils/dotenv";
import discordButtons from "discord-buttons"

export const client = new DiscordClient({ partials: ["MESSAGE", "CHANNEL", "REACTION"] })

discordButtons(client)

client.login(env.BOT_TOKEN)