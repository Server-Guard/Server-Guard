import { DiscordClient } from "./client";
import { env } from "./utils/dotenv";

export const client = new DiscordClient({ partials: ["MESSAGE", "CHANNEL", "REACTION"] })

client.login(env.BOT_TOKEN)