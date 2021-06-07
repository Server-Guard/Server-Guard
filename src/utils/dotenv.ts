import { Environment } from "../models/dotenv.model";
import dotenv from "dotenv";
dotenv.config();

export const env: Environment = {
  BOT_TOKEN: process.env.BOT_TOKEN,
};
